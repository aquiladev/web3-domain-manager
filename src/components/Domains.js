import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';
import Typography from '@material-ui/core/Typography';

import registryJson from 'dot-crypto/truffle-artifacts/Registry.json';
import resolverJson from 'dot-crypto/truffle-artifacts/Resolver.json';
import proxyReaderJson from 'dot-crypto/truffle-artifacts/ProxyReader.json';
import freeMinterJson from 'dot-crypto/truffle-artifacts/FreeMinter.json';
import NetworkConfig from 'dot-crypto/src/network-config/network-config.json';

import DomainList from './DomainList';
import keys from '../utils/standardKeys';
import {
  fetchTransferEvents,
  fetchDomainEvents
} from '../utils/events';
import {isAddress} from '../utils/address';
import RecordsForm from './RecordsForm';
import FreeDomain from './FreeDomain';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  header: {
    display: 'flex',
    padding: '10px 0',
  },
  form: {
    minWidth: 600,
    display: 'flex',
  },
  grow: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  tabs: {
    width: '100%',
  },
}));

function getDomain(uri) {
  return uri.replace('https://metadata.unstoppabledomains.com/metadata/', '')
}

const Domains = ({library, account, chainId}) => {
  const classes = useStyles();
  const stateKey = `${account}_${chainId}`;

  const [data, setData] = useState({
    [stateKey]: {
      isFetched: false,
      domains: []
    }
  });
  const [fetched, setFetched] = useState(true);
  const [domainTab, setDomainTab] = React.useState(undefined);
  const [domain, setDomain] = useState(undefined);

  const [defaultResolverError, setDefaultResolverError] = React.useState(undefined);
  const [defaultResolving, setDefaultResolving] = React.useState(false);

  const [receiver, setReceiver] = React.useState();
  const [transferError, setTransferError] = React.useState(undefined);
  const [transferring, setTransferring] = React.useState(false);

  const [records, setRecords] = useState(undefined);
  const [updateError, setUpdateError] = React.useState(undefined);
  const [updating, setUpdating] = React.useState(false);

  const [freeDomain, setFreeDomain] = useState(false);
  const [mintError, setMintError] = React.useState(undefined);
  const [minting, setMinting] = React.useState(false);

  const {contracts} = NetworkConfig.networks[chainId];
  const registry = new library.eth.Contract(registryJson.abi, contracts.Registry.address);
  const proxyReader = new library.eth.Contract(proxyReaderJson.abi, contracts.ProxyReader.address);
  const freeMinter = new library.eth.Contract(freeMinterJson.abi, contracts.FreeMinter.address);

  const handleTransferOpen = (_domain) => () => {
    setDomain(_domain)
  };

  const handleRecordsOpen = (_domain) => () => {
    setRecords(_domain);
    setUpdateError();
  };

  const handleTransferClose = () => {
    if(transferring) {
      return;
    }

    setDomain();
    setReceiver();
    setTransferError();
  }

  const handleTransfer = async (_domain, receiver) => {
    console.debug(account, receiver, _domain.id);

    setTransferError();
    if(!isAddress(receiver)) {
      setTransferError('Recipient address is invalid');
      return;
    }

    try {
      setTransferring(true);
      await registry.methods['0x42842e0e'](account, receiver, _domain.id)
        .send({from: account});
      
      // TODO: update domain list
      setDomain();
    } catch (error) {
      setTransferError(error && error.message);
      return;
    } finally {
      setTransferring(false);
    }
  }

  const setDefaultResolver = (_domain) => async () => {
    console.debug('DEFAULT RESOLVER', _domain.id);
    setDefaultResolverError();

    try {
      setDefaultResolving(true);
      await registry.methods.resolveTo(contracts.Resolver.address, _domain.id)
        .send({from: account});
      
      // TODO: update domain list
    } catch (error) {
      setDefaultResolverError(error && error.message);
      return;
    } finally {
      setDefaultResolving(false);
    }
  }

  const handleUpdate = async (_domain, records) => {
    console.debug('UPDATE', domain, records);
    setUpdateError();

    try {
      setUpdating(true);
      const resolver = new library.eth.Contract(resolverJson.abi, _domain.resolver);
      const keysToUpdate = records.map(r => r.key);
      const valuesToUpdate = records.map(r => r.newValue || '');
      await resolver.methods.setMany(keysToUpdate, valuesToUpdate, _domain.id)
        .send({from: account});

      // TODO: update domain
      setRecords();
    } catch (error) {
      setUpdateError(error && error.message);
      return;
    } finally {
      setUpdating(false);
    }
  }

  const handleMint = async (domainName) => {
    console.debug('MINT', domainName);
    setMintError();

    try {
      setMinting(true);
      
      await freeMinter.methods.claim(domainName)
        .send({from: account});

      // TODO: update domain list
      setFreeDomain(false);
    } catch (error) {
      setMintError(error && error.message);
      return;
    } finally {
      setMinting(false);
    }
  }

  const _keys = Object.values(keys);

  const loadPastEvents = () => {
    setFetched(false);
    console.debug('Loading events...');

    fetchTransferEvents(library, registry, account)
      .then(async (events) => {
        console.debug('Loaded events', events);

        const _domains = [];
        const _tokens = [];

        events.forEach(async (e) => {
          if(!_tokens.includes(e.returnValues.tokenId)) {
            _tokens.push(e.returnValues.tokenId);
          }
        });

        console.debug('Fetching state...');      
        const domainData = await proxyReader.methods.getDataForMany(_keys, _tokens).call();
        console.debug('Fetched state', domainData);

        for (let index = 0; index < _tokens.length; index++) {
          if(domainData.owners[index] !== account) {
            continue;
          }

          const token = _tokens[index];
          const uri = await registry.methods.tokenURI(token).call();

          const records = {};
          _keys.forEach((k, i) => records[k] = domainData.values[index][i]);

          _domains.push({
            id: token,
            name: getDomain(uri),
            owner: domainData.owners[index],
            resolver: domainData.resolvers[index],
            records
          });
        }
        
        const _data = {
          ...data,
          [stateKey]: {
            isFetched: true,
            domains: _domains || []
          }
        };

        console.debug('Update state', _data);
        setData(() => _data);
        setFetched(() => true);
      });
  }

  const loadDomainEvents = (domainId) => {
    console.debug('Loading DOMAIN events...');

    return fetchDomainEvents(library, registry, domainId)
      .then((domainEvents) => {
        console.debug('Loaded DOMAIN events', domainEvents);

        return  {
          isFetched: true,
          events: domainEvents || []
        }
      });
  }

  useEffect(() => {
    if(!data[stateKey] || !data[stateKey].isFetched) {
      loadPastEvents();
    }
  }, [data])

  const _domains = data && (data[stateKey] || {}).domains;
  return (
    <Container style={{ paddingTop: '4rem' }}>
      {_domains && _domains.length ?
        <div className={classes.header}>
          <Typography variant="h5" component="h6" className={classes.grow}>
            Domains
          </Typography>
          <Button color="primary"
            variant="contained"
            onClick={() => {setFreeDomain(true)}}>
            Mint free domain
          </Button>
        </div> :
        <></>
      }
      <DomainList
        isFetching={!fetched}
        domains={_domains}
        onEventsLoad={loadDomainEvents}
        onDomainSelect={(domain) => {
          setDomainTab(domain);
          setDefaultResolverError();
        }}
        actions={(
          <>
            <div className={classes.grow}>
              {defaultResolverError &&
                <Alert severity="error">
                  {defaultResolverError}
                </Alert>
              }
            </div>            
            <Button size="small" color="primary" 
              disabled={domainTab && domainTab.resolver !== '0x0000000000000000000000000000000000000000'}
              onClick={setDefaultResolver(domainTab)}>
              Set default resolver
            </Button>
            <Button size="small" color="primary"
              disabled={domainTab && domainTab.resolver === '0x0000000000000000000000000000000000000000'}
              onClick={handleRecordsOpen(domainTab)}>
              Update records
            </Button>
            <Button size="small" color="primary" onClick={handleTransferOpen(domainTab)}>
              Transfer
            </Button>
          </>
        )} />
      <Dialog
        open={!!domain}
        TransitionComponent={Transition}
        maxWidth='lg'
        keepMounted
        onClose={handleTransferClose}
      >
        {!!domain &&
          <>
            <DialogTitle>Transfer {domain.name}</DialogTitle>
            <DialogContent>
              <Grid className={classes.form}>
                <TextField
                  label="Receiver"
                  variant="outlined"
                  defaultValue={receiver}
                  className={classes.grow}
                  onChange={event => {
                    setReceiver(event.target.value);
                  }}/>
              </Grid>
              {transferError &&
                <Alert severity="error" style={{ marginTop: 10 }}>
                  {transferError}
                </Alert>
              }
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={handleTransferClose}>
                Cancel
              </Button>
              <Button 
                color="primary"
                variant="contained"
                onClick={() => { handleTransfer(domain, receiver) }}>
                Transfer
              </Button>
            </DialogActions>
            {
              <Backdrop className={classes.backdrop} open={transferring}>
                <CircularProgress color="inherit" />
              </Backdrop>
            }
          </>
        }
      </Dialog>
      <Dialog
        open={!!records}
        TransitionComponent={Transition}
        maxWidth='lg'
        keepMounted
      >
        {!!records &&
          <>
            <DialogTitle>Records [{records.name}]</DialogTitle>
            <DialogContent>
              <RecordsForm records={records.records}
                updating={updating}
                error={updateError}
                onUpdate={(_records) => { handleUpdate(records, _records); }}
                onCancel={() => { setRecords() }}/>
            </DialogContent>
          </>
        }
      </Dialog>
      <Dialog
        open={!!freeDomain}
        TransitionComponent={Transition}
        maxWidth='lg'
        keepMounted
      >
        <DialogTitle>Mint Free domain</DialogTitle>
        <DialogContent>
          <FreeDomain
            minting={minting}
            error={mintError}
            onMint={(domainName) => { handleMint(domainName); }}
            onCancel={() => { setFreeDomain(false) }}/>
        </DialogContent>
      </Dialog>
      {
        fetched && data[stateKey] && !data[stateKey].domains.length &&
        <p>No .crypto domains found. 
          <Button color="primary"
            variant="contained"
            className={classes.mintFreeDomain}
            onClick={() => {setFreeDomain(true)}}>
            Mint free domain
          </Button>
          OR <a href="https://unstoppabledomains.com/">Buy here</a></p>
      }
      {
        <Backdrop className={classes.backdrop} open={defaultResolving}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </Container>
  )
}

export default Domains;
