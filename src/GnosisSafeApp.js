import React, { useMemo } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { ThemeProvider } from "styled-components";
import { theme, Loader, Title } from "@gnosis.pm/safe-react-components";
import SafeProvider, { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { SafeAppProvider } from "@gnosis.pm/safe-apps-provider";
import { ethers } from "ethers";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import GlobalStyle from "./components/GlobalStyle";
import Domains from "./components/Domains";
import DeprecatedNetwork from "./components/DeprecatedNetwork";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: "hidden",
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  content: {
    paddingTop: 64,
    minHeight: 100,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  grow: {
    flexGrow: 1,
    paddingLeft: 30,
  },
  navButton: {
    color: "white",
  },
}));

const NETWORK_CHAIN_ID = {
  mainnet: 1,
  rinkeby: 4,
  goerli: 5,
};

function GnosisSafeApp() {
  const classes = useStyles();

  const { sdk, safe } = useSafeAppsSDK();
  const chainId = NETWORK_CHAIN_ID[safe.network.toLowerCase()];
  const web3Provider = useMemo(() => {
    return new ethers.providers.Web3Provider(
      new SafeAppProvider(safe, sdk),
      chainId
    );
  }, [sdk, safe, chainId]);

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography className={classes.title} variant="h5" noWrap>
            Web3 Domain Manager (beta)
          </Typography>
          <div className={classes.grow}></div>
          <Typography variant="subtitle1">{safe.safeAddress}</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" className={classes.content}>
        <DeprecatedNetwork chainId={chainId} />
        <Domains
          library={web3Provider}
          account={safe.safeAddress}
          chainId={chainId}
        />
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
        }
      >
        <GlobalStyle />
        <GnosisSafeApp />
      </SafeProvider>
    </ThemeProvider>
  );
}
