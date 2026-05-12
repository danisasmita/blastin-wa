import * as Yup from "yup";
import { Request, Response } from "express";
import Campaign from "../models/Campaign";
import CampaignTemplate from "../models/CampaignTemplate";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import {
  dispatchCampaign,
  parseSegmentFilters,
  serializeCampaign,
  syncCampaignRecipients
} from "../services/CampaignService/helpers";

const baseInclude = [
  { model: CampaignTemplate, attributes: ["id", "name"] },
  { model: Whatsapp, attributes: ["id", "name"] }
];

const campaignSchema = Yup.object().shape({
  name: Yup.string().required(),
  whatsappId: Yup.number().required(),
  templateId: Yup.number().nullable(),
  body: Yup.string().nullable(),
  scheduledAt: Yup.date().nullable(),
  sendDelayMs: Yup.number().min(0).nullable(),
  segmentFilters: Yup.object().nullable()
});

export const index = async (_req: Request, res: Response): Promise<Response> => {
  const campaigns = await Campaign.findAll({
    include: baseInclude,
    order: [["createdAt", "DESC"]]
  });

  const serializedCampaigns = await Promise.all(
    campaigns.map(campaign => serializeCampaign(campaign))
  );

  return res.json(serializedCampaigns);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const campaign = await Campaign.findByPk(req.params.campaignId, {
    include: baseInclude
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  return res.json(await serializeCampaign(campaign));
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  try {
    await campaignSchema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
  const status =
    scheduledAt && scheduledAt.getTime() > Date.now() ? "scheduled" : "draft";

  const campaign = await Campaign.create({
    name: req.body.name,
    whatsappId: req.body.whatsappId,
    templateId: req.body.templateId || null,
    body: req.body.body || null,
    scheduledAt,
    sendDelayMs: req.body.sendDelayMs || 1500,
    status,
    segmentFilters: JSON.stringify(parseSegmentFilters(req.body.segmentFilters)),
    createdById: Number(req.user.id)
  });

  await syncCampaignRecipients(campaign);

  return res.status(201).json(await serializeCampaign(campaign));
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const campaign = await Campaign.findByPk(req.params.campaignId, {
    include: baseInclude
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  try {
    await campaignSchema.validate(req.body);
  } catch (err) {
    throw new AppError(err.message);
  }

  const scheduledAt = req.body.scheduledAt ? new Date(req.body.scheduledAt) : null;
  const status =
    campaign.status === "completed" || campaign.status === "processing"
      ? campaign.status
      : scheduledAt && scheduledAt.getTime() > Date.now()
      ? "scheduled"
      : "draft";

  await campaign.update({
    name: req.body.name,
    whatsappId: req.body.whatsappId,
    templateId: req.body.templateId || null,
    body: req.body.body || null,
    scheduledAt,
    sendDelayMs: req.body.sendDelayMs || 1500,
    status,
    segmentFilters: JSON.stringify(parseSegmentFilters(req.body.segmentFilters))
  });

  if (campaign.status !== "processing") {
    await syncCampaignRecipients(campaign);
  }

  return res.json(await serializeCampaign(campaign));
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const campaign = await Campaign.findByPk(req.params.campaignId);

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  await campaign.destroy();

  return res.status(200).json({ message: "Campaign deleted" });
};

export const syncRecipients = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const campaign = await Campaign.findByPk(req.params.campaignId, {
    include: baseInclude
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  await syncCampaignRecipients(campaign);

  return res.json(await serializeCampaign(campaign));
};

export const dispatch = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const campaign = await Campaign.findByPk(req.params.campaignId, {
    include: baseInclude
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  dispatchCampaign(campaign.id);

  return res.status(202).json({
    message: "Campaign dispatch started"
  });
};

export const pause = async (req: Request, res: Response): Promise<Response> => {
  const campaign = await Campaign.findByPk(req.params.campaignId, {
    include: baseInclude
  });

  if (!campaign) {
    throw new AppError("ERR_NO_CAMPAIGN_FOUND", 404);
  }

  await campaign.update({ status: "paused" });

  return res.json(await serializeCampaign(campaign));
};
