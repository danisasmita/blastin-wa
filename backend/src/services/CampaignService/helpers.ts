import { Op, Sequelize } from "sequelize";
import Contact from "../../models/Contact";
import Campaign from "../../models/Campaign";
import CampaignRecipient from "../../models/CampaignRecipient";
import CampaignTemplate from "../../models/CampaignTemplate";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { whatsappProvider } from "../../providers/WhatsApp";
import formatBody from "../../helpers/Mustache";
import { sleep } from "../../utils/sleep";
import { logger } from "../../utils/logger";

export interface CampaignSegmentFilters {
  searchParam?: string;
  includeGroups?: boolean;
  onlyWithEmail?: boolean;
  queueIds?: number[];
  contactIds?: number[];
}

const dispatchLocks = new Set<number>();

export const parseSegmentFilters = (
  raw: string | CampaignSegmentFilters | undefined | null
): CampaignSegmentFilters => {
  if (!raw) return {};
  if (typeof raw !== "string") return raw;

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
};

export const resolveCampaignContacts = async (
  filters: CampaignSegmentFilters
): Promise<Contact[]> => {
  const queueIds = (filters.queueIds || []).map(Number).filter(Boolean);
  const contactIds = (filters.contactIds || []).map(Number).filter(Boolean);
  const includeGroups = Boolean(filters.includeGroups);
  const onlyWithEmail = Boolean(filters.onlyWithEmail);
  const searchParam = filters.searchParam?.trim().toLowerCase() || "";

  const whereCondition: any = {};

  if (!includeGroups) {
    whereCondition.isGroup = false;
  }

  if (onlyWithEmail) {
    whereCondition.email = {
      [Op.and]: [{ [Op.ne]: "" }, { [Op.ne]: null }]
    };
  }

  if (contactIds.length > 0) {
    whereCondition.id = contactIds;
  }

  if (searchParam) {
    whereCondition[Op.or] = [
      Sequelize.where(
        Sequelize.fn("LOWER", Sequelize.col("Contact.name")),
        "LIKE",
        `%${searchParam}%`
      ),
      {
        number: {
          [Op.like]: `%${searchParam}%`
        }
      }
    ];
  }

  const include = [];
  if (queueIds.length > 0) {
    include.push({
      model: Ticket,
      attributes: [],
      required: true,
      where: {
        queueId: queueIds
      }
    });
  }

  const contacts = await Contact.findAll({
    where: whereCondition,
    include,
    order: [["name", "ASC"]]
  });

  return contacts;
};

export const refreshCampaignCounters = async (
  campaign: Campaign
): Promise<Campaign> => {
  const recipients = await CampaignRecipient.findAll({
    where: { campaignId: campaign.id },
    attributes: ["status"]
  });

  let sentCount = 0;
  let failedCount = 0;
  let pendingCount = 0;

  recipients.forEach(recipient => {
    if (recipient.status === "sent") {
      sentCount += 1;
      return;
    }

    if (recipient.status === "failed") {
      failedCount += 1;
      return;
    }

    pendingCount += 1;
  });

  await campaign.update({
    sentCount,
    failedCount,
    pendingCount
  });

  return campaign;
};

export const syncCampaignRecipients = async (
  campaign: Campaign
): Promise<Campaign> => {
  const filters = parseSegmentFilters(campaign.segmentFilters);
  const contacts = await resolveCampaignContacts(filters);

  await CampaignRecipient.destroy({
    where: { campaignId: campaign.id }
  });

  if (contacts.length > 0) {
    await CampaignRecipient.bulkCreate(
      contacts.map(contact => ({
        campaignId: campaign.id,
        contactId: contact.id,
        status: "pending"
      }))
    );
  }

  await refreshCampaignCounters(campaign);

  return campaign;
};

export const serializeCampaign = async (campaign: Campaign) => {
  const recipients = await CampaignRecipient.findAll({
    where: { campaignId: campaign.id },
    include: [{ model: Contact, attributes: ["id", "name", "number", "email"] }],
    order: [["id", "ASC"]]
  });

  await refreshCampaignCounters(campaign);
  await campaign.reload({
    include: [
      { model: CampaignTemplate, attributes: ["id", "name"] },
      { model: Whatsapp, attributes: ["id", "name"] }
    ]
  });

  return {
    ...campaign.toJSON(),
    segmentFilters: parseSegmentFilters(campaign.segmentFilters),
    recipients
  };
};

export const dispatchCampaign = async (campaignId: number): Promise<void> => {
  if (dispatchLocks.has(campaignId)) {
    return;
  }

  dispatchLocks.add(campaignId);

  try {
    const campaign = await Campaign.findByPk(campaignId, {
      include: [
        { model: CampaignTemplate, attributes: ["id", "name", "body"] }
      ]
    });

    if (!campaign) {
      return;
    }

    await syncCampaignRecipients(campaign);

    const recipients = await CampaignRecipient.findAll({
      where: {
        campaignId,
        status: {
          [Op.in]: ["pending", "failed", "scheduled"]
        }
      },
      include: [{ model: Contact }]
    });

    const templateBody = campaign.template?.body || "";
    const body = campaign.body || templateBody;

    if (!body) {
      await campaign.update({ status: "failed" });
      return;
    }

    await campaign.update({
      status: "processing",
      startedAt: new Date(),
      completedAt: null
    });

    for (const recipient of recipients) {
      await campaign.reload();

      if (campaign.status === "paused") {
        break;
      }

      const contact = recipient.contact;
      const chatId = `${contact.number}@${contact.isGroup ? "g" : "c"}.us`;
      const personalizedBody = formatBody(body, contact);

      try {
        await recipient.update({
          status: "processing",
          personalizedBody,
          lastError: null
        });

        await whatsappProvider.sendMessage(
          campaign.whatsappId,
          chatId,
          personalizedBody,
          { linkPreview: false }
        );

        await recipient.update({
          status: "sent",
          sentAt: new Date()
        });
      } catch (error) {
        logger.error({
          info: "Error dispatching campaign recipient",
          campaignId,
          recipientId: recipient.id,
          error
        });

        await recipient.update({
          status: "failed",
          lastError: error instanceof Error ? error.message : String(error)
        });
      }

      await refreshCampaignCounters(campaign);
      await sleep(campaign.sendDelayMs || 1500);
    }

    await campaign.reload();
    await campaign.update({
      status: campaign.status === "paused" ? "paused" : "completed",
      completedAt: campaign.status === "paused" ? null : new Date()
    });
    await refreshCampaignCounters(campaign);
  } finally {
    dispatchLocks.delete(campaignId);
  }
};

export const runDueCampaigns = async (): Promise<void> => {
  const campaigns = await Campaign.findAll({
    where: {
      status: "scheduled",
      scheduledAt: {
        [Op.lte]: new Date()
      }
    }
  });

  for (const campaign of campaigns) {
    await dispatchCampaign(campaign.id);
  }
};
