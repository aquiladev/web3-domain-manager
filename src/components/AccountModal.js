import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useWeb3React } from '@web3-react/core';
import Popover from '@material-ui/core/Popover';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import Identicon from './Identicon';

const useStyles = makeStyles(() => ({
  modal: {
    padding: 20
  },
  box: {
    display: 'flex'
  },
  account: {
    paddingLeft: 8
  },
  btn: {
    padding: 0,
    marginLeft: 20
  }
}));

export default function AccountModal({anchorEl, onClose}) {
  const classes = useStyles();

  const { account, deactivate } = useWeb3React();

  const open = Boolean(anchorEl);

  const handleClose = () => {
    onClose && onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      <Container className={classes.modal}>
        <Box className={classes.box}>
          <Identicon account={account} />
          <Typography className={classes.account}>
            {account &&
              `${account.slice(0, 6)}...${account.slice(
                account.length - 4,
                account.length
              )}`}
          </Typography>
          <Button size='small'
            className={classes.btn}
            onClick={() => {
              deactivate();
              handleClose();
            }}
          >
            Disconnect
          </Button>
        </Box>
      </Container>
    </Popover>
  )
}
