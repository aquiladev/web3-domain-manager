import React, { useState } from 'react';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Alert from '@material-ui/lab/Alert';
import CircularProgress from '@material-ui/core/CircularProgress';

import registryJson from 'dot-crypto/truffle-artifacts/Registry.json';
import proxyReaderJson from 'dot-crypto/truffle-artifacts/ProxyReader.json';
import NetworkConfig from 'dot-crypto/src/network-config/network-config.json';

import DomainInfo from './DomainInfo';
import namehash from '../namehash';
import keys from '../utils/standardKeys';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 40,
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  domain: {
    marginTop: 20,
    padding: 8,
    display: 'flex',
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

function getDomain(uri) {
  return uri.replace('https://metadata.unstoppabledomains.com/metadata/', '')
}

const Lookup = ({library, chainId}) => {
  const classes = useStyles();

  const [domainName, setDomainName] = useState(undefined);
  const [domain, setDomain] = useState(undefined);
  const [fetched, setFetched] = useState(true);
  const [error, setError] = useState(undefined);
  
  const {contracts} = NetworkConfig.networks[chainId];
  const registry = new library.eth.Contract(registryJson.abi, contracts.Registry.address);
  const proxyReader = new library.eth.Contract(proxyReaderJson.abi, contracts.ProxyReader.address);

  const _keys = Object.values(keys);

  const search = async () => {
    try {
      setError(undefined);
      if(domain && domainName === domain.name) {
        return;
      }

      setDomain(undefined);
      const tokenId = namehash(domainName);
      console.log(domainName, tokenId);
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

    let uri = name;
    try {
      uri = await registry.methods.tokenURI(tokenId).call();
    } catch { }

    const _domain = {
      id: tokenId,
      name: getDomain(uri),
      owner: data.owner,
      resolver: data.resolver,
      records
    }

    console.debug('Update state', _domain);
    setFetched(true);
    setDomain(_domain);
  }

  const handleChange = (e) => {
    setDomainName(e.target.value);
  }

  const keyPress = (e) => {
    if(e.charCode === 13) {
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
        <Paper className={classes.domain}>
          <DomainInfo domain={domain} />
        </Paper>
      }
    </Container>
  );
};

export default Lookup;