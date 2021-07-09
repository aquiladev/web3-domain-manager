import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';

import NetworkConfig from 'uns/uns-config.json';

import cnsRegistryJson from 'uns/artifacts/CNSRegistry.json';
import proxyReaderJson from 'uns/artifacts/ProxyReader.json';

import DomainList from './DomainList';
import namehash from '../utils/namehash';
import keys from '../utils/standardKeys';
import { fetchDomainEvents } from '../utils/events';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 40,
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  loader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const Lookup = ({ library, chainId }) => {
  const classes = useStyles();

  const [domainName, setDomainName] = useState(undefined);
  const [domain, setDomain] = useState(undefined);
  const [fetched, setFetched] = useState(true);
  const [error, setError] = useState(undefined);

  const { contracts } = NetworkConfig.networks[chainId];
  const cnsRegistry = new library.eth.Contract(cnsRegistryJson.abi, contracts.CNSRegistry.address);
  const proxyReader = new library.eth.Contract(proxyReaderJson.abi, contracts.ProxyReader.address);

  const _keys = Object.values(keys);

  const search = async () => {
    try {
      setError(undefined);
      if (domain && domainName === domain.name) {
        return;
      }

      setDomain(undefined);
      const tokenId = namehash(domainName);
      console.debug(domainName, tokenId);
      await loadData(tokenId, domainName);
    } catch (error) {
      setError(error.message);
    }
  };

  const loadData = async (tokenId, name) => {
    setFetched(false);

    console.debug('Fetching state...');
    const data = await proxyReader.methods.getData(_keys, tokenId).call();
    console.debug('Fetched state', data);

    const records = {};
    _keys.forEach((k, i) => records[k] = data.values[i]);

    // let uri = name;
    // try {
    //   uri = await cnsRegistry.methods.tokenURI(tokenId).call();
    // } catch { }

    const _domain = {
      id: tokenId,
      name,
      owner: data.owner,
      resolver: data.resolver,
      records
    }

    console.debug('Update state', _domain);
    setFetched(true);
    setDomain(_domain);
  }

  const loadDomainEvents = (domainId) => {
    console.debug('Loading DOMAIN events...');

    return fetchDomainEvents(library, cnsRegistry, domainId)
      .then((domainEvents) => {
        console.debug('Loaded DOMAIN events', domainEvents);

        return {
          isFetched: true,
          events: domainEvents || []
        };
      });
  }

  const handleChange = (e) => {
    setDomainName(e.target.value);
  }

  const keyPress = (e) => {
    if (e.charCode === 13) {
      search();
    }
  }

  return (
    <Container style={{ paddingTop: '3rem' }}>
      <Paper className={classes.root}>
        <InputBase
          error={!!error}
          className={classes.input}
          onKeyPress={keyPress}
          onChange={handleChange}
          placeholder="Search .crypto domain"
          inputProps={{ 'aria-label': 'search .crypto domain' }}
        />
        <IconButton
          className={classes.iconButton}
          onClick={search}
          aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
      {error && <Alert severity="error">{error}</Alert>}
      {!fetched &&
        <div className={classes.loader}>
          <CircularProgress color="inherit" />
        </div>
      }
      {fetched && domain &&
        <div style={{ marginTop: 20 }}>
          <DomainList
            isFetching={!fetched}
            domains={[domain]}
            onEventsLoad={loadDomainEvents} />
        </div>
      }
    </Container>
  );
};

export default Lookup;
