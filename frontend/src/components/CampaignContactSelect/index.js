import React, { useEffect, useState } from "react";
import {
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  chips: {
    display: "flex",
    flexWrap: "wrap",
  },
  chip: {
    margin: 2,
  },
}));

const CampaignContactSelect = ({ selectedContactIds = [], onChange }) => {
  const classes = useStyles();
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/contacts/all");
        setContacts(data);
      } catch (err) {
        toastError(err);
      }
    })();
  }, []);

  const handleChange = e => {
    onChange(e.target.value);
  };

  return (
    <FormControl fullWidth margin="dense">
      <InputLabel>{i18n.t("campaigns.fields.specificContacts")}</InputLabel>
      <Select
        multiple
        value={selectedContactIds}
        onChange={handleChange}
        renderValue={selected => (
          <div className={classes.chips}>
            {selected.map(id => {
              const contact = contacts.find(item => item.id === id);
              return contact ? (
                <Chip
                  key={id}
                  label={`${contact.name} (${contact.number})`}
                  className={classes.chip}
                />
              ) : null;
            })}
          </div>
        )}
      >
        {contacts.map(contact => (
          <MenuItem key={contact.id} value={contact.id}>
            <ListItemText
              primary={contact.name}
              secondary={contact.number}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default CampaignContactSelect;
