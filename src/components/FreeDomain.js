import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';

const useStyles = makeStyles((theme) => ({
  form: {
    minWidth: 600,
  },
  domainName: {
    display: 'flex',
  },
  grow: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  prefix: {
    marginRight: 8,
  },
  actions: {
    display: 'flex',
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
      <Grid className={classes.form}>
        <Grid container item xs={12}>
          <Grid item xs={3}>
            <TextField
              disabled
              label="Prefix"
              defaultValue="udtestdev-"
              variant="outlined"
              className={classes.prefix}
            />
          </Grid>
          <Grid item xs={9} className={classes.domainName}>
            <TextField variant="outlined"
              label="Domain name"
              className={classes.grow}
              onChange={(event) => { setDomainName(event.target.value); }}/>
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
          <div className={classes.grow}></div>
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