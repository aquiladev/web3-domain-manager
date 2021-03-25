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
import FormControl from '@material-ui/core/FormControl';
import CircularProgress from '@material-ui/core/CircularProgress';
import Alert from '@material-ui/lab/Alert';

import registryJson from 'dot-crypto/truffle-artifacts/Registry.json';
import resolverJson from 'dot-crypto/truffle-artifacts/Resolver.json';
import proxyReaderJson from 'dot-crypto/truffle-artifacts/ProxyReader.json';
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
    paddingTop: 30
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  tabs: {
    width: '100%',
  },
  fControl: {
    minWidth: 500,
    paddingRight: 12,
  },
  mintFreeDomain: {
    marginLeft: 8,
    marginRight: 8,
  }
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
  const [records, setRecords] = useState(undefined);
  const [receiver, setReceiver] = React.useState();
  const [transferError, setTransferError] = React.useState(undefined);
  const [transferring, setTransferring] = React.useState(false);
  const [updateError, setUpdateError] = React.useState(undefined);
  const [updating, setUpdating] = React.useState(false);
  const [freeDomain, setFreeDomain] = useState(false);
  const [mintError, setMintError] = React.useState(undefined);
  const [minting, setMinting] = React.useState(false);

  const {contracts} = NetworkConfig.networks[chainId];
  const registry = new library.eth.Contract(registryJson.abi, contracts.Registry.address);
  const proxyReader = new library.eth.Contract(proxyReaderJson.abi, contracts.ProxyReader.address);

  const handleTransferOpen = (_domain) => () => {
    setDomain(_domain)
  };

  const handleRecordsOpen = (_domain) => () => {
    console.log(_domain)
    setRecords(_domain)
  };

  const handleTransferClose = () => {
    if(transferring) {
      return;
    }

    setDomain();
  }

  const handleTransfer = async (domain, receiver) => {
    console.log(account, receiver, domain.id);

    setTransferError();
    if(!isAddress(receiver)) {
      setTransferError('Recipient address is invalid');
      return;
    }

    try {
      setTransferring(true);
      await registry.methods['0x42842e0e'](account, receiver, domain.id)
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

  const handleUpdate = async (domain, records) => {
    console.log('UPDATE', domain, records);

    try {
      setUpdating(true);
      const resolver = new library.eth.Contract(resolverJson.abi, domain.resolver);
      const keysToUpdate = records.map(r => r.key);
      const valuesToUpdate = records.map(r => r.newValue || '');
      await resolver.methods.setMany(keysToUpdate, valuesToUpdate, domain.id)
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
    console.log('MINT', domainName);
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

  return (
    <Container style={{ paddingTop: '3rem' }}>
      <DomainList
        isFetching={!fetched}
        domains={data && (data[stateKey] || {}).domains}
        onEventsLoad={loadDomainEvents}
        onDomainSelect={setDomainTab}
        actions={(
          <>
            <Button size="small" color="primary" onClick={handleRecordsOpen(domainTab)}>
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
              <FormControl fullWidth className={classes.fControl} variant="outlined">
                <TextField
                  label="Receiver"
                  variant="outlined"
                  defaultValue={receiver}
                  onChange={event => {
                    const { value } = event.target;
                    setReceiver(value);
                  }}/>
              </FormControl>
              {transferError &&
                <Alert severity="error" style={{ marginTop: 10 }}>
                  {transferError}
                </Alert>
              }
            </DialogContent>
            <DialogActions>
              <Button onClick={handleTransferClose} color="primary">
                Cancel
              </Button>
              <Button onClick={() => { handleTransfer(domain, receiver) }} color="primary">
                Transfer
              </Button>
              {transferring && <CircularProgress size={24} />}
            </DialogActions>
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
    </Container>
  )
}

export default Domains;
