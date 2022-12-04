import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { Typography } from '@material-ui/core';
import { useWeb3React } from '@web3-react/core';
import { formatEther } from "@ethersproject/units";

import Identicon from './Identicon';
import AccountModal from './AccountModal';
import ConnectModal from './ConnectModal';
import { CHAIN_ID_NETWORK } from './../utils/constants';

const useStyles = makeStyles((theme) => ({
  box_net: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.grey[200],
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
  box_acc: {
    display: 'flex',
    alignItems: 'center',
    background: theme.palette.grey[300],
    borderRadius: 6,
    paddingLeft: 8,
  },
  info_btn: {
    margin: '2px 2px 2px 6px',
    background: theme.palette.grey[500],
    color: 'white',
    textTransform: 'none',
  },
  info_btn_text: {
    paddingRight: 6,
  },
  connect_btn: {
    background: theme.palette.grey[400],
  }
}));

export default function ConnectButton() {
  const classes = useStyles();

  const { account, library, chainId } = useWeb3React();

  const [balance, setBalance] = React.useState();
  const [modalEl, setModalEl] = React.useState(null);
  const [connect, setConnect] = React.useState();

  React.useEffect(() => {
    if (!!account && !!library) {
      let stale = false

      library
        .getBalance(account)
        .then((balance) => {
          if (!stale) {
            setBalance(balance)
          }
        })
        .catch(() => {
          if (!stale) {
            setBalance(null)
          }
        })

      return () => {
        stale = true
        setBalance(undefined)
      }
    }
  }, [account, library, chainId])

  return account ? (
    <>
      <Box className={classes.box_net}>
        <Typography>
          {CHAIN_ID_NETWORK[chainId] || chainId}
        </Typography>
      </Box>
      <Box className={classes.box_acc}>
        {balance && parseFloat(formatEther(balance)).toFixed(3)} ETH
        <Button className={classes.info_btn} onClick={(event) => setModalEl(event.currentTarget)}>
          <Typography className={classes.info_btn_text}>
            {account &&
              `${account.slice(0, 6)}...${account.slice(
                account.length - 4,
                account.length
              )}`}
          </Typography>
          <Identicon account={account} />
        </Button>
        <AccountModal anchorEl={modalEl} onClose={() => setModalEl(null)}/>
      </Box>
    </>
  ) : (
    <>
      <Button
        className={classes.connect_btn}
        onClick={() => setConnect(true)}
      >
        Connect to a wallet
      </Button>
      <ConnectModal isOpen={connect} onClose={() => setConnect(false) } />
    </>
  );
}
