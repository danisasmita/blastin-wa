import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
} from "@material-ui/core";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";

const initialState = {
  name: "",
  body: "",
  isActive: true,
};

const CampaignTemplateModal = ({ open, onClose, template }) => {
  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    setFormData(
      template
        ? {
            name: template.name || "",
            body: template.body || "",
            isActive: template.isActive !== false,
          }
        : initialState
    );
  }, [open, template]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      if (template?.id) {
        await api.put(`/campaignTemplates/${template.id}`, formData);
      } else {
        await api.post("/campaignTemplates", formData);
      }
      onClose(true);
    } catch (err) {
      toastError(err);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>
        {template?.id
          ? i18n.t("campaignTemplates.modal.editTitle")
          : i18n.t("campaignTemplates.modal.addTitle")}
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          margin="dense"
          label={i18n.t("campaignTemplates.fields.name")}
          name="name"
          value={formData.name}
          onChange={handleChange}
          fullWidth
        />
        <TextField
          margin="dense"
          label={i18n.t("campaignTemplates.fields.body")}
          name="body"
          value={formData.body}
          onChange={handleChange}
          fullWidth
          multiline
          rowsMin={5}
          helperText={i18n.t("campaignTemplates.fields.bodyHelp")}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.isActive}
              onChange={handleChange}
              name="isActive"
              color="primary"
            />
          }
          label={i18n.t("campaignTemplates.fields.isActive")}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>
          {i18n.t("campaignTemplates.buttons.cancel")}
        </Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          {i18n.t("campaignTemplates.buttons.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CampaignTemplateModal;
