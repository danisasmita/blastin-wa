import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  TextField,
} from "@material-ui/core";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import CampaignContactSelect from "../CampaignContactSelect";

const initialState = {
  name: "",
  whatsappId: "",
  templateId: "",
  body: "",
  scheduledAt: "",
  sendDelayMs: 1500,
    segmentFilters: {
      searchParam: "",
      includeGroups: false,
      onlyWithEmail: false,
      queueIds: [],
      contactIds: [],
    },
  };

const formatDateTimeLocal = value => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 16);
};

const CampaignModal = ({ open, onClose, campaign, whatsApps = [] }) => {
  const [formData, setFormData] = useState(initialState);
  const [templates, setTemplates] = useState([]);
  const [queues, setQueues] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadDependencies = async () => {
      try {
        const [{ data: templatesData }, { data: queuesData }] = await Promise.all(
          [api.get("/campaignTemplates"), api.get("/queue")]
        );
        setTemplates(templatesData);
        setQueues(queuesData);
      } catch (err) {
        toastError(err);
      }
    };

    loadDependencies();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setFormData(
      campaign
        ? {
            name: campaign.name || "",
            whatsappId: campaign.whatsappId || "",
            templateId: campaign.templateId || "",
            body: campaign.body || "",
            scheduledAt: formatDateTimeLocal(campaign.scheduledAt),
            sendDelayMs: campaign.sendDelayMs || 1500,
            segmentFilters: {
              searchParam: campaign.segmentFilters?.searchParam || "",
              includeGroups: Boolean(campaign.segmentFilters?.includeGroups),
              onlyWithEmail: Boolean(campaign.segmentFilters?.onlyWithEmail),
              queueIds: campaign.segmentFilters?.queueIds || [],
              contactIds: campaign.segmentFilters?.contactIds || [],
            },
          }
        : initialState
    );
  }, [campaign, open]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSegmentChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      segmentFilters: {
        ...prevState.segmentFilters,
        [name]: type === "checkbox" ? checked : value,
      },
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload = {
      ...formData,
      whatsappId: Number(formData.whatsappId),
      templateId: formData.templateId ? Number(formData.templateId) : null,
      sendDelayMs: Number(formData.sendDelayMs || 0),
      scheduledAt: formData.scheduledAt || null,
      segmentFilters: {
        ...formData.segmentFilters,
        queueIds: (formData.segmentFilters.queueIds || []).map(Number),
        contactIds: (formData.segmentFilters.contactIds || []).map(Number),
      },
    };

    try {
      if (campaign?.id) {
        await api.put(`/campaigns/${campaign.id}`, payload);
      } else {
        await api.post("/campaigns", payload);
      }
      onClose(true);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="md">
      <DialogTitle>
        {campaign?.id
          ? i18n.t("campaigns.modal.editTitle")
          : i18n.t("campaigns.modal.addTitle")}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="dense"
          label={i18n.t("campaigns.fields.name")}
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>{i18n.t("campaigns.fields.whatsapp")}</InputLabel>
          <Select
            value={formData.whatsappId}
            onChange={handleChange}
            name="whatsappId"
          >
            {whatsApps.map(whatsapp => (
              <MenuItem key={whatsapp.id} value={whatsapp.id}>
                {whatsapp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="dense">
          <InputLabel>{i18n.t("campaigns.fields.template")}</InputLabel>
          <Select
            value={formData.templateId}
            onChange={handleChange}
            name="templateId"
          >
            <MenuItem value="">
              <em>{i18n.t("campaigns.fields.templateOptional")}</em>
            </MenuItem>
            {templates.map(template => (
              <MenuItem key={template.id} value={template.id}>
                {template.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          margin="dense"
          label={i18n.t("campaigns.fields.body")}
          name="body"
          value={formData.body}
          onChange={handleChange}
          fullWidth
          multiline
          rowsMin={5}
          helperText={i18n.t("campaigns.fields.bodyHelp")}
        />

        <TextField
          margin="dense"
          label={i18n.t("campaigns.fields.scheduledAt")}
          name="scheduledAt"
          type="datetime-local"
          value={formData.scheduledAt}
          onChange={handleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          margin="dense"
          label={i18n.t("campaigns.fields.sendDelayMs")}
          name="sendDelayMs"
          type="number"
          value={formData.sendDelayMs}
          onChange={handleChange}
          fullWidth
        />

        <TextField
          margin="dense"
          label={i18n.t("campaigns.fields.searchParam")}
          name="searchParam"
          value={formData.segmentFilters.searchParam}
          onChange={handleSegmentChange}
          fullWidth
          helperText={i18n.t("campaigns.fields.searchHelp")}
        />

        <CampaignContactSelect
          selectedContactIds={formData.segmentFilters.contactIds}
          onChange={value =>
            setFormData(prevState => ({
              ...prevState,
              segmentFilters: {
                ...prevState.segmentFilters,
                contactIds: value,
              },
            }))
          }
        />

        <FormControl fullWidth margin="dense">
          <InputLabel>{i18n.t("campaigns.fields.queueFilter")}</InputLabel>
          <Select
            multiple
            value={formData.segmentFilters.queueIds}
            onChange={handleSegmentChange}
            name="queueIds"
            renderValue={selected =>
              queues
                .filter(queue => selected.indexOf(queue.id) > -1)
                .map(queue => queue.name)
                .join(", ")
            }
          >
            {queues.map(queue => (
              <MenuItem key={queue.id} value={queue.id}>
                <Checkbox
                  color="primary"
                  checked={formData.segmentFilters.queueIds.indexOf(queue.id) > -1}
                />
                <ListItemText primary={queue.name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.segmentFilters.includeGroups}
              onChange={handleSegmentChange}
              name="includeGroups"
              color="primary"
            />
          }
          label={i18n.t("campaigns.fields.includeGroups")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.segmentFilters.onlyWithEmail}
              onChange={handleSegmentChange}
              name="onlyWithEmail"
              color="primary"
            />
          }
          label={i18n.t("campaigns.fields.onlyWithEmail")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>
          {i18n.t("campaigns.buttons.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {i18n.t("campaigns.buttons.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignModal;
