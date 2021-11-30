import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { ethers } from 'ethers';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';

import NetworkConfig from 'uns/uns-config.json';
import supportedKeys from 'uns/resolver-keys.json';

import cnsRegistryJson from 'uns/artifacts/CNSRegistry.json';
import unsRegistryJson from 'uns/artifacts/UNSRegistry.json';
import proxyReaderJson from 'uns/artifacts/ProxyReader.json';

import DomainList from './DomainList';
import { createContract } from '../utils/contract';

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
  const { domain: domainParam } = useParams();

  const [domainName, setDomainName] = useState(domainParam);
  const [domain, setDomain] = useState(undefined);
  const [fetched, setFetched] = useState(true);
  const [error, setError] = useState(undefined);

  const { contracts } = NetworkConfig.networks[chainId];
  const cnsRegistry = createContract(library, chainId, cnsRegistryJson.abi, contracts.CNSRegistry);
  const unsRegistry = createContract(library, chainId, unsRegistryJson.abi, contracts.UNSRegistry);
  const proxyReader = createContract(library, chainId, proxyReaderJson.abi, contracts.ProxyReader);

  const _keys = Object.keys(supportedKeys.keys);

  useEffect(() => {
    if(domainName) {
      search();
    }
  }, [domainName]);

  const search = async () => {
    try {
      setError(undefined);
      if (domain && domainName === domain.name) {
        return;
      }

      if(ethers.utils.isHexString(domainName) && domainName.length === 66) {
        setDomainName(await fetchName(domainName));
        return;
      }

      setDomain(undefined);
      const tokenId = ethers.utils.namehash(domainName);
      console.debug(domainName, tokenId);
      await loadData(tokenId, domainName);
    } catch (error) {
      setError(error.message);
    }
  };

  const fetchName = async (token) => {
    const registry = await unsRegistry.exists(token) ? unsRegistry : cnsRegistry;
    const events = await registry.source.fetchNewURIEvents([token]);
    if(!events.length) {
      throw new Error("Token not found");
    }
    return events.find(e => e.args.tokenId.toHexString() === token).args.uri;
  }

  const loadData = async (tokenId, name) => {
    setFetched(false);

    console.debug('Fetching state...');
    const data = await proxyReader.callStatic.getData(_keys, tokenId);
    console.debug('Fetched state', data);

    const records = {};
    _keys.forEach((k, i) => records[k] = data[2][i]);

    const _domain = {
      id: tokenId,
      name,
      registry: data.resolver === unsRegistry.address
        ? unsRegistry.address
        : cnsRegistry.address,
      type: data.resolver === unsRegistry.address ? 'uns' : 'cns',
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

    const registry = unsRegistry.address === domain.registry ? unsRegistry : cnsRegistry;
    return registry.source.fetchEvents(domain)
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
          placeholder='Search domain (.crypto, .coin, .wallet, .bitcoin, .x, .888, .nft, .dao, .blockchain)'
          inputProps={{ 'aria-label': 'search domain (.crypto, .coin, .wallet, .bitcoin, .x, .888, .nft, .dao, .blockchain)' }}
          defaultValue={domainName}
          value={domainName}
        />
        <IconButton
          className={classes.iconButton}
          onClick={search}
          aria-label='search'>
          <SearchIcon />
        </IconButton>
      </Paper>
      {error && <Alert severity='error'>{error}</Alert>}
      {!fetched &&
        <div className={classes.loader}>
          <CircularProgress color='inherit' />
        </div>
      }
      {fetched && domain &&
        <div style={{ marginTop: 20 }}>
          <DomainList
            chainId={chainId}
            isFetching={!fetched}
            domains={[domain]}
            onEventsLoad={loadDomainEvents} />
        </div>
      }
    </Container>
  );
};

export default Lookup;
