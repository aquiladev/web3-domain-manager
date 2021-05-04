import React, { useMemo } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from 'styled-components';
import { theme, Loader, Title } from '@gnosis.pm/safe-react-components';
import SafeProvider, { useSafeAppsSDK } from '@gnosis.pm/safe-apps-react-sdk';
import { SafeAppProvider } from '@gnosis.pm/safe-apps-provider';
import Web3 from 'web3';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

import GlobalStyle from './components/GlobalStyle';
import Domains from './components/Domains';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'block',
    },
  },
  card: {
    width: 230,
    textAlign: 'center',
  },
  cardMedia: {
    width: 'auto',
    maxWidth: '100%',
    maxHeight: 140,
    margin: '0 auto',
    paddingTop: 26,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  grow: {
    flexGrow: 1,
    paddingLeft: 30,
  },
  navButton: {
    color: 'white',
  },
}));

const NETWORK_CHAIN_ID = {
  MAINNET: 1,
  RINKEBY: 4,
};

function GnosisSafeApp() {
  const classes = useStyles();

  const { sdk, safe } = useSafeAppsSDK();
  const web3Provider = useMemo(() => new Web3(new SafeAppProvider(safe, sdk)), [sdk, safe]);
  const chainId = NETWORK_CHAIN_ID[safe.network];

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography className={classes.title} variant="h5" noWrap>
            .crypto Domain Manager
          </Typography>
          <div className={classes.grow}></div>
          <Typography variant="subtitle1">
            {safe.safeAddress}
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg">
        <Domains library={web3Provider} account={safe.safeAddress} chainId={chainId} />
      </Container>
    </div>
  );
}

export default function () {
  return (
    <ThemeProvider theme={theme}>
      <SafeProvider
        loader={
          <>
            <Title size="md">Waiting for Gnosis Safe...</Title>
            <Loader size="md" />
          </>
        }>
        <GlobalStyle />
        <GnosisSafeApp />
      </SafeProvider>
    </ThemeProvider>
  );
}