import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import AddIcon from "@material-ui/icons/Add";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";

import supportedKeys from "uns/resolver-keys.json";

const useStyles = makeStyles((theme) => ({
  form: {
    minWidth: 600,
    [theme.breakpoints.down("sm")]: {
      minWidth: "initial",
    },
  },
  record: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  recordKey: {
    fontWeight: "bold",
  },
  recordKeySelectContainer: {
    marginRight: 10,
  },
  recordKeySelect: {
    width: "100%",
  },
  recordValue: {
    display: "flex",
  },
  grow: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  actions: {
    display: "flex",
    paddingTop: 20,
    paddingBottom: 8,
  },
}));

const RecordsForm = ({ records, updating, error, onUpdate, onCancel }) => {
  const classes = useStyles();

  const [recordKey, setRecordKey] = useState("");
  const [recordValue, setRecordValue] = useState("");
  const [form, setForm] = useState({
    records: [],
    displayable: [],
    fillableKeys: [],
  });

  useEffect(() => {
    const filledRecords = Object.entries(records)
      .filter(([_, val]) => !!val)
      .map(([key, value]) => {
        return { key, value, newValue: value };
      });
    const filledKeys = filledRecords.map((x) => x.key);
    const fillableKeys = Object.keys(supportedKeys.keys).filter(
      (x) => !filledKeys.includes(x)
    );

    setForm({
      records: filledRecords,
      displayable: filledRecords,
      fillableKeys: fillableKeys,
    });
  }, [records]);

  const updateRecord = (_record) => (event) => {
    const value = event.target.value;
    const _records = form.records.map((r) => {
      if (r.key === _record) {
        r.newValue = value;
        r.muted = r.value !== value;
      }
      return r;
    });

    const filledKeys = _records.map((x) => x.key);
    const fillableKeys = Object.keys(supportedKeys.keys).filter(
      (x) => !filledKeys.includes(x)
    );

    setForm({
      records: _records,
      displayable: _records.filter((r) => !!r.newValue),
      fillableKeys: fillableKeys,
      muted: _records.some((r) => r.muted),
    });
  };

  const deleteRecord = (_record) => () => {
    const _records = form.records.map((r) => {
      if (r.key === _record) {
        r.newValue = undefined;
        r.muted = r.value !== undefined;
      }
      return r;
    });
    const filledKeys = _records.map((x) => x.key);
    const fillableKeys = Object.keys(supportedKeys.keys).filter(
      (x) => !filledKeys.includes(x)
    );

    setForm({
      records: _records,
      displayable: _records.filter((r) => !!r.newValue),
      fillableKeys: fillableKeys,
      muted: _records.some((r) => r.muted),
    });
  };

  const addRecord = () => {
    if (!recordKey || !recordValue) {
      return;
    }

    const _records = [
      ...form.records,
      {
        key: recordKey,
        value: undefined,
        newValue: recordValue,
        muted: recordValue !== undefined,
      },
    ];
    const filledKeys = _records.map((x) => x.key);
    const fillableKeys = Object.keys(supportedKeys.keys).filter(
      (x) => !filledKeys.includes(x)
    );

    setForm({
      records: _records,
      displayable: _records.filter((r) => !!r.newValue),
      fillableKeys: fillableKeys,
      muted: _records.some((r) => r.muted),
    });
    setRecordValue("");
    setRecordKey("");
  };

  const update = () => {
    onUpdate && onUpdate(form.records.filter((r) => r.muted));
  };

  return (
    <>
      <Grid className={classes.form} id="records-form">
        {form.displayable.map(({ key, newValue }) => {
          return (
            <Grid
              container
              item
              xs={12}
              key={`${key}`}
              className={classes.record}
            >
              <Grid item xs={12} className={classes.recordKey}>
                {key}
              </Grid>
              <Grid item xs={12} className={classes.recordValue}>
                <TextField
                  variant="filled"
                  defaultValue={newValue}
                  size="small"
                  className={classes.grow}
                  onChange={updateRecord(key)}
                />
                <IconButton aria-label="delete" onClick={deleteRecord(key)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>
          );
        })}
        <Grid container item xs={12} className={classes.record}>
          <Grid item sm={4} xs={12}>
            <div className={classes.recordKeySelectContainer}>
              <Autocomplete
                value={recordKey}
                className={classes.recordKeySelect}
                options={form.fillableKeys}
                onChange={(_, value) => {
                  setRecordKey(value);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Key" size="small" />
                )}
              />
            </div>
          </Grid>
          <Grid item sm={8} xs={12} className={classes.recordValue}>
            <TextField
              label="Value"
              size="small"
              className={classes.grow}
              defaultValue={recordValue}
              value={recordValue}
              onChange={(event) => {
                setRecordValue(event.target.value);
              }}
            />
            <IconButton
              aria-label="add"
              disabled={!recordKey}
              onClick={addRecord}
            >
              <AddIcon fontSize="small" />
            </IconButton>
          </Grid>
        </Grid>
        <Grid>
          {error && (
            <Alert severity="error" style={{ marginTop: 10 }}>
              {error}
            </Alert>
          )}
        </Grid>
        <Grid className={classes.actions}>
          <Button
            color="primary"
            onClick={() => {
              onCancel && onCancel();
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={!form.muted}
            onClick={update}
          >
            Update
          </Button>
          <div className={classes.grow}></div>
        </Grid>
      </Grid>
      {
        <Backdrop className={classes.backdrop} open={updating}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </>
  );
};

export default RecordsForm;
