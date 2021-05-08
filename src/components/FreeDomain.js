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
    [theme.breakpoints.down('sm')]: {
      minWidth: 'initial',
    }
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

const FreeDomain = ({ claiming, error, onClaim, onCancel }) => {
  const classes = useStyles();

  const [domainName, setDomainName] = useState('');

  const claim = () => {
    onClaim && onClaim(domainName);
  }

  return (
    <>
      <Grid className={classes.form}>
        <Grid container item xs={12}>
          <Grid item sm={3} xs={12}>
            <TextField
              disabled
              label='Prefix'
              defaultValue='udtestdev-'
              variant='outlined'
              size='small'
              className={classes.prefix}
            />
          </Grid>
          <Grid item sm={9} xs={12} className={classes.domainName}>
            <TextField variant='outlined'
              label='Domain name'
              size='small'
              className={classes.grow}
              onChange={(event) => { setDomainName(event.target.value); }} />
          </Grid>
        </Grid>
        <Grid>
          {error &&
            <Alert severity='error' style={{ marginTop: 10 }}>
              {error}
            </Alert>
          }
        </Grid>
        <Grid className={classes.actions}>
          <Button color='primary' onClick={() => { onCancel && onCancel() }}>
            Cancel
          </Button>
          <Button
            color='primary'
            variant='contained'
            disabled={!domainName}
            onClick={claim}>
            Claim
          </Button>
          <div className={classes.grow}></div>
        </Grid>
      </Grid>
      {
        <Backdrop className={classes.backdrop} open={claiming}>
          <CircularProgress color='inherit' />
        </Backdrop>
      }
    </>
  );
}

export default FreeDomain;