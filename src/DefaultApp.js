import React, { useEffect, useState } from 'react';
import { makeStyles, createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { Web3ReactProvider, useWeb3React, UnsupportedChainIdError } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected
} from '@web3-react/injected-connector';
import Web3 from 'web3';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';

import GlobalStyle from './components/GlobalStyle';
import mmLogo from './images/mm.png';
import { injected, useEagerConnect, useInactiveListener } from './hooks';
import Domains from './components/Domains';
import Lookup from './components/Lookup';
import Header from './components/Header';
import Footer from './components/Footer';

const theme = createMuiTheme({
  overrides: {
    MuiFilledInput: {
      input: {
        paddingTop: '13px',
      },
    },
    MuiDialogActions: {
      root: {
        display: 'block'
      }
    }
  },
});

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    overflow: 'hidden',
    minHeight: '100%'
  },
  title: {
    fontSize: '1rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.5rem',
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

function getErrorMessage(error) {
  console.error(error)
  if (error instanceof NoEthereumProviderError) {
    return 'No Ethereum browser extension detected, install MetaMask on desktop or visit from a dApp browser on mobile.'
  } else if (error instanceof UnsupportedChainIdError) {
    return 'You\'re connected to an unsupported network.'
  } else if (error instanceof UserRejectedRequestErrorInjected) {
    return 'Please authorize this website to access your Ethereum account.'
  } else {
    return 'An unknown error occurred. Check the console for more details.'
  }
}

function getLibrary(provider) {
  const library = new Web3(provider)
  library.pollingInterval = 12000
  return library
}

function DefaultApp() {
  const classes = useStyles();
  const context = useWeb3React();
  const { connector, library, account, chainId, activate, deactivate, active, error } = context;

  const [activatingConnector, setActivatingConnector] = useState();
  const [isLookup, setIsLookup] = useState();

  useEffect(() => {
    if (activatingConnector && activatingConnector === connector) {
      setActivatingConnector(undefined)
    }
  }, [activatingConnector, connector]);

  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager || !!activatingConnector);

  const currentConnector = injected
  const activating = currentConnector === activatingConnector
  const connected = currentConnector === connector

  return (
    <ThemeProvider theme={theme}>
      <div className={classes.root}>
        <Header 
          active={active}
          account={account}
          deactivate={deactivate}
          isLookup={isLookup}
          setIsLookup={setIsLookup} />
        <Container maxWidth='lg'>
          {
            !!error &&
            <Alert
              variant='filled'
              severity='error'
              style={{ position: 'fixed', zIndex: 1200, bottom: 10, left: 10 }}
            >
              {getErrorMessage(error)}
            </Alert>
          }
          {
            (!connected || !account) &&
            <>
              <Grid
                container
                spacing={0}
                direction='column'
                alignItems='center'
                justify='center'
                style={{ minHeight: '100vh' }}
              >
                <Card className={classes.card}>
                  <CardActionArea onClick={() => {
                    setActivatingConnector(currentConnector)
                    activate(injected)
                  }}>
                    <CardMedia component='img' image={mmLogo} className={classes.cardMedia} />
                    <CardContent>
                      <Typography variant='h5' component='h2'>
                        MetaMask
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
              <Backdrop className={classes.backdrop} open={activating}>
                <CircularProgress color='inherit' />
              </Backdrop>
            </>
          }
          {connected && account && !isLookup && <Domains library={library} account={account} chainId={chainId} />}
          {connected && isLookup && <Lookup library={library} chainId={chainId} />}
        </Container>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

export default function () {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <GlobalStyle />
      <DefaultApp />
    </Web3ReactProvider>
  )
}
