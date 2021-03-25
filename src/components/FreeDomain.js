import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  fControl: {
    minWidth: 500,
  },
  fInput: {
    width: '100%',
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  prefix: {
    marginRight: 8,
  },
  actions: {
    paddingTop: 20,
    paddingBottom: 8,
  },
}));

const FreeDomain = ({minting, error, onMint, onCancel}) => {
  const classes = useStyles();

  const [domainName, setDomainName] = useState('');

  const mint = () => {
    onMint && onMint(domainName);
  }

  return (
    <>
      <Grid>
        <Grid container item xs={12}>
          <Grid item xs={3}>
            <TextField
              disabled
              label="Prefix"
              defaultValue="udtestdev-"
              variant="filled"
              className={classes.prefix}
            />
          </Grid>
          <Grid item xs={9}>
            <FormControl variant="filled" className={classes.fControl}>
              <TextField variant="filled"
                label="Domain name"
                className={classes.fInput}
                onChange={(event) => { setDomainName(event.target.value); }}/>
            </FormControl>
          </Grid>
        </Grid>
        <Grid>
          {error &&
            <Alert severity="error" style={{ marginTop: 10 }}>
              {error}
            </Alert>
          }
        </Grid>
        <Grid className={classes.actions}>
          <Button color="primary" onClick={() => {onCancel && onCancel()}}>
            Cancel
          </Button>
          <Button
            color="primary"
            variant="contained"
            disabled={!domainName}
            onClick={mint}>
            Mint
          </Button>
        </Grid>
      </Grid>
      {
        <Backdrop className={classes.backdrop} open={minting}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </>
  );
}

export default FreeDomain;