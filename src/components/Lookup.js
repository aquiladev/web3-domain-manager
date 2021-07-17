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
import unsRegistryJson from 'uns/artifacts/UNSRegistry.json';
import proxyReaderJson from 'uns/artifacts/ProxyReader.json';

import DomainList from './DomainList';
import namehash from '../utils/namehash';
import supportedKeys from '../utils/supported-keys.json';
import { createContract } from '../utils/contract';
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
  const cnsRegistry = createContract(library, chainId, cnsRegistryJson.abi, contracts.CNSRegistry);
  const unsRegistry = createContract(library, chainId, unsRegistryJson.abi, contracts.UNSRegistry);
  const proxyReader = createContract(library, chainId, proxyReaderJson.abi, contracts.ProxyReader);

  const _keys = Object.keys(supportedKeys.keys);

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

    const _domain = {
      id: tokenId,
      name,
      registry: data.resolver === unsRegistry._address
        ? unsRegistry._address
        : cnsRegistry._address,
      owner: data.owner,
      resolver: data.resolver,
      records
    }

    console.debug('Update state', _domain);
    setFetched(true);
    setDomain(_domain);
  }

  const loadDomainEvents = (domain) => {
    console.debug('Loading DOMAIN events...');

    const registry = unsRegistry._address === domain.registry ? unsRegistry : cnsRegistry;
    return fetchDomainEvents(library, registry, domain.id)
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
          placeholder="Search domain (.crypto, .coin, .wallet, .bitcoin, .x, .888, .nft, .dao, .blockchain)"
          inputProps={{ 'aria-label': 'search domain (.crypto, .coin, .wallet, .bitcoin, .x, .888, .nft, .dao, .blockchain)' }}
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
