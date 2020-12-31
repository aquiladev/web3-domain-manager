import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionActions from '@material-ui/core/AccordionActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Slide from '@material-ui/core/Slide';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';

import registryJson from 'dot-crypto/truffle-artifacts/Registry.json';
import resolverJson from 'dot-crypto/truffle-artifacts/Resolver.json';
import proxyReaderJson from 'dot-crypto/truffle-artifacts/ProxyReader.json';
import NetworkConfig from 'dot-crypto/src/network-config/network-config.json';

import keys from './utils/standardKeys';

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
}));

const create_blocks = {
  1: 9082251,
  4: 7484092,
}

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
  const [expanded, setExpanded] = React.useState(false);
  const [domain, setDomain] = useState(undefined);
  const [receiver, setReceiver] = React.useState('0x0000000000000000000000000000000000000000');

  const {contracts} = NetworkConfig.networks[chainId];
  const registry = new library.eth.Contract(registryJson.abi, contracts.Registry.address);
  const proxyReader = new library.eth.Contract(proxyReaderJson.abi, contracts.ProxyReader.address);

  const handleChange = (panel) => (_, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const handleTransferOpen = (_domain) => () => {
    setDomain(_domain)
  };

  const handleTransferClose = () => {
    setDomain();
  }

  const handleTransfer = async (domain, receiver) => {
    console.log(account, receiver, domain.id);
    await registry.methods['0x42842e0e'](account, receiver, domain.id)
      .send({from: account});
    setDomain();
  }

  const _keys = Object.values(keys);

  const loadPastEvents = () => {
    setFetched(false);

    console.debug('Loading events...');
    registry.getPastEvents('Transfer', {
      filter: { to: account },
      fromBlock: create_blocks[chainId],
    }, async (error, events) => {
      if (error) {
        return console.error(error);
      }
      
      console.debug('Loaded events', events);

      const _domains = [];
      const _tokens = [];

      events.forEach(async (e) => {
        _tokens.push(e.returnValues.tokenId);
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
    })
  }

  useEffect(() => {
    if(!data[stateKey] || !data[stateKey].isFetched) {
      loadPastEvents();
    }
  })

  return (
    <Container style={{ paddingTop: '3rem' }}>
      <Typography className={classes.header} variant="h5" component="h6">
        Domains
      </Typography>
      <div>
        {
          <Backdrop className={classes.backdrop} open={!fetched}>
            <CircularProgress color="inherit" />
          </Backdrop>
        }
        {fetched && data[stateKey] && !!data[stateKey].domains.length &&
          <>
            {data[stateKey].domains.map(domain => (
              <Accordion expanded={expanded === domain.id} onChange={handleChange(domain.id)} key={domain.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography className={classes.heading}>{domain.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container>
                    <Grid container item xs={12}>
                      <Grid item xs={3}>
                        <b>ID</b>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography noWrap>
                          {domain.id}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container item xs={12}>
                      <Grid item xs={3}>
                        <b>Resolver</b>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography noWrap>
                          {domain.resolver}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container item xs={12}>
                      <Grid item xs={3}>
                        <b>Owner</b>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography noWrap>
                          {domain.owner}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container item xs={12}>
                      <Typography className={classes.header} variant="subtitle1">
                        Records
                      </Typography>
                    </Grid>
                    {
                      domain && domain.records &&
                        Object.entries(domain.records).filter(
                          ([_, val]) => !!val
                        ).map(([key, val]) => {
                          return (
                            <Grid container item xs={12} key={`${domain.id}_${key}`}>
                              <Grid item xs={3}>
                                <b>{key}</b>
                              </Grid>
                              <Grid item xs={9}>
                                <Typography noWrap>
                                  {val}
                                </Typography>
                              </Grid>
                            </Grid>
                          )
                        })
                    }
                  </Grid>
                </AccordionDetails>
                <Divider />
                <AccordionActions>
                  <Button size="small" disabled color="primary">
                    Update records
                  </Button>
                  <Button size="small" color="primary" onClick={handleTransferOpen(domain)}>
                    Transfer
                  </Button>
                </AccordionActions>
              </Accordion>
            ))}
            <Dialog
              open={!!domain}
              TransitionComponent={Transition}
              keepMounted
              onClose={handleTransferClose}
            >
              {!!domain &&
                <>
                  <DialogTitle>Transfer {domain.name}</DialogTitle>
                  <DialogContent>
                    <FormControl fullWidth className={classes.margin} variant="outlined">
                      <TextField
                        label="Receiver"
                        variant="outlined"
                        defaultValue={receiver}
                        onChange={event => {
                          const { value } = event.target;
                          setReceiver(value);
                        }}/>
                    </FormControl>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={handleTransferClose} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={() => { handleTransfer(domain, receiver) }} color="primary">
                      Transfer
                    </Button>
                  </DialogActions>
                </>
              }
            </Dialog>
          </>
        }
        {
          fetched && data[stateKey] && !data[stateKey].domains.length &&
          <p>No .crypto domains found. <a href="https://unstoppabledomains.com/">Buy here</a></p>
        }
      </div>
    </Container>
  )
}

export default Domains