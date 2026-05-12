import React, { useEffect, useState } from "react";
import { Chip, TextField, CircularProgress } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
  chip: {
    margin: 2,
    maxWidth: 200,
  },
  listbox: {
    maxHeight: 300,
    overflow: "auto",
    "& .MuiAutocomplete-option": {
      padding: "8px 16px",
      borderBottom: `1px solid ${theme.palette.divider}`,
      "&:last-child": {
        borderBottom: "none",
      },
    },
  },
  contactName: {
    fontWeight: 500,
    fontSize: "0.95rem",
  },
  contactNumber: {
    color: theme.palette.text.secondary,
    fontSize: "0.8rem",
    marginLeft: 8,
  },
}));

const CampaignContactSelect = ({ selectedContactIds = [], onChange }) => {
  const classes = useStyles();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/contacts/all");
        setContacts(data);
      } catch (err) {
        toastError(err);
      }
      setLoading(false);
    })();
  }, []);

  const selectedContacts = contacts.filter(c =>
    selectedContactIds.includes(c.id)
  );

  const handleChange = (_event, newValue) => {
    onChange(newValue.map(contact => contact.id));
  };

  return (
    <Autocomplete
      multiple
      loading={loading}
      options={contacts}
      value={selectedContacts}
      onChange={handleChange}
      getOptionLabel={option => `${option.name} (${option.number})`}
      getOptionSelected={(option, value) => option.id === value.id}
      filterOptions={(options, { inputValue }) => {
        const query = inputValue.toLowerCase();
        if (!query) return options;
        return options.filter(
          option =>
            option.name.toLowerCase().includes(query) ||
            option.number.includes(query)
        );
      }}
      classes={{ listbox: classes.listbox }}
      renderTags={(value, getTagProps) =>
        value.map((option, index) => (
          <Chip
            key={option.id}
            label={`${option.name} (${option.number})`}
            className={classes.chip}
            size="small"
            {...getTagProps({ index })}
          />
        ))
      }
      renderOption={option => (
        <div>
          <span className={classes.contactName}>{option.name}</span>
          <span className={classes.contactNumber}>{option.number}</span>
        </div>
      )}
      renderInput={params => (
        <TextField
          {...params}
          label={i18n.t("campaigns.fields.specificContacts")}
          placeholder={i18n.t("campaigns.fields.searchContacts") || "Cari kontak..."}
          margin="dense"
          fullWidth
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};

export default CampaignContactSelect;
