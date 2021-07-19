import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useWeb3React } from '@web3-react/core';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import { Typography, Button } from '@material-ui/core';

import mmLogo from './../images/mm.png';
import wcLogo from './../images/wc.svg';
import cwLogo from './../images/cw.svg';

import { injected, walletconnect, walletlink } from './../connectors';

const connectorsByName = {
  MetaMask: injected,
  WalletConnect: walletconnect,
  'Coinbase Wallet': walletlink,
}

const connectorsLogo = {
  MetaMask: mmLogo,
  WalletConnect: wcLogo,
  'Coinbase Wallet': cwLogo,
}

const useStyles = makeStyles((theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
  btn: {
    minWidth: 300,
    padding: 16,
    justifyContent: 'flex-start',
    textTransform: 'none',
  },
  grow: {
    flexGrow: 1,
  },
  img: {
    width: 'auto',
    maxWidth: 26,
    maxHeight: 24,
    margin: '0 auto',
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction='up' ref={ref} {...props} />;
});

const DialogTitle = ((props) => {
  const classes = useStyles();
  const { children, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant='h6'>{children}</Typography>
      {onClose ? (
        <IconButton aria-label='close' className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

export default function ConnectModal({isOpen, onClose}) {
  const classes = useStyles();

  const { activate } = useWeb3React();

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      TransitionComponent={Transition}
      maxWidth='lg'
      keepMounted
    >
      <DialogTitle onClose={handleClose}>Connect to a wallet</DialogTitle>
      <DialogContent>
        {Object.keys(connectorsByName).map(name => {
          return (
            <div>
              <Button
                key={name}
                onClick={() => { activate(connectorsByName[name]); }}
                className={classes.btn}
              >
                <Typography variant='body1'>{name}</Typography>
                <div className={classes.grow}></div>
                <img src={connectorsLogo[name]} alt={name} className={classes.img} />
              </Button>
            </div>
          );
        })}
      </DialogContent>
    </Dialog>
  );
}
