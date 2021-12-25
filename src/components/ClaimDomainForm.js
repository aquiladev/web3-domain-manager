import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
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
    marginLeft: 8,
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  prefix: {
  },
  actions: {
    display: 'flex',
    paddingTop: 20,
    paddingBottom: 8,
  },
}));

const ClaimDomainForm = ({ claiming, error, onClaim, onCancel }) => {
  const classes = useStyles();

  const [domainName, setDomainName] = useState('');
  const [tld, setTLD] = useState('0x0f4a10a4f46c288cea365fcf45cccf0e9d901b945b9829ccdb54c10dc3cb7a6f');

  const claim = () => {
    onClaim && onClaim(tld, domainName);
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
          <Grid item sm={7} xs={12} className={classes.domainName}>
            <TextField variant='outlined'
              label='Domain name'
              size='small'
              className={classes.grow}
              onChange={(event) => { setDomainName(event.target.value); }} />
          </Grid>
          <Grid item sm={2} xs={12}>
            <TextField
              label='TLD'
              size='small'
              variant='outlined'
              defaultValue={tld}
              onChange={(event) => { setTLD(event.target.value) }}
              className={classes.grow} select>
              <MenuItem value='0x0f4a10a4f46c288cea365fcf45cccf0e9d901b945b9829ccdb54c10dc3cb7a6f'>.crypto</MenuItem>
              <MenuItem value='0x7674e7282552c15f203b9c4a6025aeaf28176ef7f5451b280f9bada3f8bc98e2'>.coin</MenuItem>
              <MenuItem value='0x1e3f482b3363eb4710dae2cb2183128e272eafbe137f686851c1caea32502230'>.wallet</MenuItem>
              <MenuItem value='0x042fb01c1e43fb4a32f85b41c821e17d2faeac58cfc5fb23f80bc00c940f85e3'>.bitcoin</MenuItem>
              <MenuItem value='0x241e7e2b7fd7333b3c0c049b326316b811af0c01cfc0c7a90b466fda3a70fc2d'>.x</MenuItem>
              <MenuItem value='0x5c828ec285c0bf152a30a325b3963661a80cb87641d60920344caf04d4a0f31e'>.888</MenuItem>
              <MenuItem value='0xb75cf4f3d8bc3deb317ed5216d898899d5cc6a783f65f6768eb9bcb89428670d'>.nft</MenuItem>
              <MenuItem value='0xb5f2bbf81da581299d4ff7af60560c0ac854196f5227328d2d0c2bb0df33e553'>.dao</MenuItem>
              <MenuItem value='0x4118ebbd893ecbb9f5d7a817c7d8039c1bd991b56ea243e2ae84d0a1b2c950a7'>.blockchain</MenuItem>
            </TextField>
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
            Mint
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

export default ClaimDomainForm;
