import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  Chip,
  IconButton,
  makeStyles,
  Paper,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from "@material-ui/core";
import { DeleteOutline, Edit, Pause, Refresh, Send } from "@material-ui/icons";
import { toast } from "react-toastify";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import ConfirmationModal from "../../components/ConfirmationModal";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import CampaignTemplateModal from "../../components/CampaignTemplateModal";
import CampaignModal from "../../components/CampaignModal";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const useStyles = makeStyles(theme => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "auto",
    ...theme.scrollbarStyles,
  },
}));

const Campaigns = () => {
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);

  const [tab, setTab] = useState("campaigns");
  const [loading, setLoading] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleteConfig, setDeleteConfig] = useState(null);

  const loadData = async () => {
    setLoading(true);

    try {
      const [{ data: campaignsData }, { data: templatesData }] = await Promise.all([
        api.get("/campaigns"),
        api.get("/campaignTemplates"),
      ]);
      setCampaigns(campaignsData);
      setTemplates(templatesData);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCloseCampaignModal = refresh => {
    setCampaignModalOpen(false);
    setSelectedCampaign(null);
    if (refresh) {
      loadData();
    }
  };

  const handleCloseTemplateModal = refresh => {
    setTemplateModalOpen(false);
    setSelectedTemplate(null);
    if (refresh) {
      loadData();
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteConfig.type === "campaign") {
        await api.delete(`/campaigns/${deleteConfig.item.id}`);
      } else {
        await api.delete(`/campaignTemplates/${deleteConfig.item.id}`);
      }
      toast.success(i18n.t("campaigns.toasts.deleted"));
      setDeleteConfig(null);
      loadData();
    } catch (err) {
      toastError(err);
    }
  };

  const handleDispatch = async campaignId => {
    try {
      await api.post(`/campaigns/${campaignId}/dispatch`);
      toast.success(i18n.t("campaigns.toasts.dispatchStarted"));
      loadData();
    } catch (err) {
      toastError(err);
    }
  };

  const handlePause = async campaignId => {
    try {
      await api.post(`/campaigns/${campaignId}/pause`);
      toast.success(i18n.t("campaigns.toasts.paused"));
      loadData();
    } catch (err) {
      toastError(err);
    }
  };

  const handleSyncRecipients = async campaignId => {
    try {
      await api.post(`/campaigns/${campaignId}/sync-recipients`);
      toast.success(i18n.t("campaigns.toasts.synced"));
      loadData();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.title")}
        open={Boolean(deleteConfig)}
        onClose={setDeleteConfig}
        onConfirm={handleDelete}
      >
        {i18n.t("campaigns.confirmationModal.message")}
      </ConfirmationModal>

      <CampaignModal
        open={campaignModalOpen}
        onClose={handleCloseCampaignModal}
        campaign={selectedCampaign}
        whatsApps={whatsApps}
      />

      <CampaignTemplateModal
        open={templateModalOpen}
        onClose={handleCloseTemplateModal}
        template={selectedTemplate}
      />

      <MainHeader>
        <Title>{i18n.t("campaigns.title")}</Title>
        <MainHeaderButtonsWrapper>
          {tab === "campaigns" ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setCampaignModalOpen(true)}
            >
              {i18n.t("campaigns.buttons.addCampaign")}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setTemplateModalOpen(true)}
            >
              {i18n.t("campaignTemplates.buttons.add")}
            </Button>
          )}
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper square elevation={0}>
        <Tabs
          value={tab}
          onChange={(_e, value) => setTab(value)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab value="campaigns" label={i18n.t("campaigns.tabs.campaigns")} />
          <Tab value="templates" label={i18n.t("campaigns.tabs.templates")} />
        </Tabs>
      </Paper>

      <Paper className={classes.mainPaper} variant="outlined">
        {loading ? (
          <TableRowSkeleton columns={5} />
        ) : tab === "campaigns" ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{i18n.t("campaigns.table.name")}</TableCell>
                <TableCell>{i18n.t("campaigns.table.connection")}</TableCell>
                <TableCell>{i18n.t("campaigns.table.status")}</TableCell>
                <TableCell>{i18n.t("campaigns.table.schedule")}</TableCell>
                <TableCell>{i18n.t("campaigns.table.progress")}</TableCell>
                <TableCell align="center">
                  {i18n.t("campaigns.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {campaigns.map(campaign => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div>{campaign.name}</div>
                    <small>
                      {campaign.template?.name || i18n.t("campaigns.table.noTemplate")}
                    </small>
                  </TableCell>
                  <TableCell>{campaign.whatsapp?.name || "-"}</TableCell>
                  <TableCell>
                    <Chip label={campaign.status} size="small" color="primary" />
                  </TableCell>
                  <TableCell>
                    {campaign.scheduledAt
                      ? new Date(campaign.scheduledAt).toLocaleString()
                      : i18n.t("campaigns.table.sendNow")}
                  </TableCell>
                  <TableCell>
                    {campaign.sentCount}/{campaign.sentCount +
                      campaign.failedCount +
                      campaign.pendingCount}
                    {" "}
                    ({i18n.t("campaigns.table.failed")} {campaign.failedCount})
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title={i18n.t("campaigns.tooltips.syncRecipients")}>
                      <IconButton
                        size="small"
                        onClick={() => handleSyncRecipients(campaign.id)}
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={i18n.t("campaigns.tooltips.dispatch")}>
                      <IconButton
                        size="small"
                        onClick={() => handleDispatch(campaign.id)}
                      >
                        <Send fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={i18n.t("campaigns.tooltips.pause")}>
                      <IconButton
                        size="small"
                        onClick={() => handlePause(campaign.id)}
                      >
                        <Pause fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setCampaignModalOpen(true);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setDeleteConfig({ type: "campaign", item: campaign })
                      }
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{i18n.t("campaignTemplates.table.name")}</TableCell>
                <TableCell>{i18n.t("campaignTemplates.table.body")}</TableCell>
                <TableCell>{i18n.t("campaignTemplates.table.status")}</TableCell>
                <TableCell align="center">
                  {i18n.t("campaignTemplates.table.actions")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map(template => (
                <TableRow key={template.id}>
                  <TableCell>{template.name}</TableCell>
                  <TableCell>{template.body}</TableCell>
                  <TableCell>
                    <Chip
                      label={template.isActive ? "active" : "inactive"}
                      size="small"
                      color={template.isActive ? "primary" : "default"}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setTemplateModalOpen(true);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        setDeleteConfig({ type: "template", item: template })
                      }
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </MainContainer>
  );
};

export default Campaigns;
