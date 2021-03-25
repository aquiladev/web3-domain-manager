import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';

import keys from '../utils/standardKeys';

const useStyles = makeStyles((theme) => ({
  record: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  add: {
    float: 'right',
  },
  delete: {
    float: 'right',
  },
  fControl: {
    minWidth: 500,
    paddingRight: 12,
  },
  fInput: {
    width: '100%',
  },
  formControl: {
    width: '90%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

const RecordsForm = ({records, updating, error, onUpdate, onCancel}) => {
  const classes = useStyles();

  const [recordKey, setRecordKey] = useState('');
  const [recordValue, setRecordValue] = useState('');
  const [form, setForm] = useState({
    records: [],
    displayable: [],
    fillableKeys: [],
  });

  useEffect(() => {
    const filledRecords = Object.entries(records).filter(
      ([_, val]) => !!val
    ).map(([key, value]) => {
      return {key, value, newValue: value};
    });
    const filledKeys = filledRecords.map(x => x.key);
    const fillableKeys = Object.values(keys).filter(x => !filledKeys.includes(x));

    console.log('FORM EFFECT')
    setForm({
      records: filledRecords,
      displayable: filledRecords,
      fillableKeys: fillableKeys,
    });
  }, [records]);

  const deleteRecord = (_record) => () => {
    const _records = form.records.map((r) => {
      if(r.key === _record) {
        r.newValue = undefined;
        r.muted = r.value !== undefined;
      }
      return r;
    });
    const filledKeys = _records.map(x => x[0]);
    const fillableKeys = Object.values(keys).filter(x => !filledKeys.includes(x));
    
    setForm({
      records: _records,
      displayable: _records.filter(r => !!r.newValue),
      fillableKeys: fillableKeys,
      muted: _records.some(r => r.muted),
    });
  };

  const addRecord = () => {
    const _records = [
      ...form.records,
      {
        key: recordKey,
        value: undefined,
        newValue: recordValue,
        muted: recordValue !== undefined,
      }
    ];
    const filledKeys = _records.map(x => x[0]);
    const fillableKeys = Object.values(keys).filter(x => !filledKeys.includes(x));
    
    console.log(_records)
    setForm({
      records: _records,
      displayable: _records.filter(r => !!r.newValue),
      fillableKeys: fillableKeys,
      muted: _records.some(r => r.muted),
    });
    setRecordValue('');
    setRecordKey('');
  };

  const update = () => {
    onUpdate && onUpdate(form.records.filter(r => r.muted));
  }

  return (
    <>
      <Grid>
        {
            form.displayable.map(({key, newValue}) => {
              return (
                <Grid container item xs={12} key={`${key}`} className={classes.record}>
                  <Grid item xs={3}>
                    <b>{key}</b>
                  </Grid>
                  <Grid item xs={8}>
                    <FormControl variant="filled" className={classes.fControl}>
                      <TextField variant="filled" defaultValue={newValue} className={classes.fInput}/>
                    </FormControl>
                  </Grid>
                  <Grid item xs={1}>
                    <IconButton aria-label="delete" className={classes.delete} onClick={deleteRecord(key)}>
                      <DeleteIcon fontSize="small"/>
                    </IconButton>
                  </Grid>
                </Grid>
              )
            })
        }
        <Grid container item xs={12} className={classes.record}>
          <Grid item xs={3}>
            <FormControl variant="filled" className={classes.formControl}>
              <Select value={recordKey}
                displayEmpty
                onChange={(event) => { setRecordKey(event.target.value) }}>
                <MenuItem value=''>Select record key</MenuItem>
                {
                  form.fillableKeys.map((k) => {
                    return (
                      <MenuItem value={k} key={k}>{k}</MenuItem>
                    );
                  })
                }
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={8}>
            <FormControl variant="filled" className={classes.fControl}>
              <TextField variant="filled"
                className={classes.fInput}
                defaultValue={recordValue}
                value={recordValue}
                onChange={(event) => { setRecordValue(event.target.value); }}/>
            </FormControl>
          </Grid>
          <Grid item xs={1}>
            <IconButton aria-label="add" className={classes.add} disabled={!recordKey} onClick={addRecord}>
              <AddIcon fontSize="small"/>
            </IconButton>
          </Grid>
        </Grid>
        <Grid>
          {error &&
            <Alert severity="error" style={{ marginTop: 10 }}>
              {error}
            </Alert>
          }
        </Grid>
        <Grid>
          <Button color="primary" onClick={() => {onCancel && onCancel()}}>
            Cancel
          </Button>
          <Button size="small" color="primary" disabled={!form.muted} onClick={update}>
            Update
          </Button>
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