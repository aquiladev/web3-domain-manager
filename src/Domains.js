import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';

import registryContract from './contracts/Registry.json';
import resolverContract from './contracts/Resolver.json';
import proxyReaderContract from './contracts/ProxyReader.json';
import keys from './utils/standardKeys';

const registryAddress = '0xD1E5b0FF1287aA9f9A268759062E4Ab08b9Dacbe';
const resolverAddress = '0xb66DcE2DA6afAAa98F2013446dBCB0f4B0ab2842';
const proxyReaderAddress = '0xa6E7cEf2EDDEA66352Fd68E5915b60BDbb7309f5';

const useStyles = makeStyles((theme) => ({
  header: {
    paddingTop: 30
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
}));

function getDomain(uri) {
  return uri.replace('https://metadata.unstoppabledomains.com/metadata/', '')
}

const Domains = ({library, account}) => {
  const classes = useStyles();

  const registry = new library.eth.Contract(registryContract.abi, registryAddress);
  const proxyReader = new library.eth.Contract(proxyReaderContract.abi, proxyReaderAddress);

  const [domains, setDomains] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [open, setOpen] = useState(false);
  const [domain, setDomain] = useState({});

  const handleOpen = (domain) => {
    setDomain(domain);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const _keys = Object.values(keys);

  const getPastEvents = () => {
    registry.getPastEvents('Transfer', {
      filter: { to: account },
      fromBlock: 9082251,
    }, async (error, events) => {
      if (error) {
        return console.error(error);
      }
      
      const _domains = []
      const _tokens = [];

      events.forEach(async (e) => {
        _tokens.push(e.returnValues.tokenId);
      });
      
      const data = await proxyReader.methods.getDataForMany(_keys, _tokens).call();
      for (let index = 0; index < _tokens.length; index++) {
        if(data.owners[index] !== account) {
          return;
        }

        const token = _tokens[index];
        const uri = await registry.methods.tokenURI(token).call();

        const records = {};
        _keys.forEach((k, i) => records[k] = data.values[index][i]);

        _domains.push({
          id: token,
          name: getDomain(uri),
          owner: data.owners[index],
          resolver: data.resolvers[index],
          records
        });
      }
      
      setDomains(() => _domains);
      setFetched(() => true);
    })
  }

  useEffect(() => {
    getPastEvents()
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
        {fetched && !!domains.length &&
          <>
            <List component="nav">
              {domains.map(domain => (
                <>
                  <ListItem button onClick={() => { handleOpen(domain); }}>
                    <ListItemText primary={domain.name} />
                  </ListItem>
                  <Divider />
                </>
              ))}
            </List>
            {domain && 
              <Dialog
                open={open}
                fullWidth
                onClose={handleClose}
                maxWidth="md"
              >
                <DialogTitle>{domain.name}</DialogTitle>
                <DialogContent>
                  <Grid container>
                    <Grid container item xs={12}>
                      <Grid item xs={3}>
                        <b>ID</b>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography noWrap="wrap">
                          {domain.id}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container item xs={12}>
                      <Grid item xs={3}>
                        <b>Resolver</b>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography noWrap="wrap">
                          {domain.resolver}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container item xs={12}>
                      <Grid item xs={3}>
                        <b>Owner</b>
                      </Grid>
                      <Grid item xs={9}>
                        <Typography noWrap="wrap">
                          {domain.owner}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Grid container item xs={12}>
                      <Typography className={classes.header} variant="h6" component="h6">
                        Records
                      </Typography>
                    </Grid>
                    {
                      domain && domain.records &&
                        Object.entries(domain.records).filter(
                          ([_, val]) => !!val
                        ).map(([key, val]) => {
                          return (
                            <Grid container item xs={12}>
                              <Grid item xs={3}>
                                <b>{key}</b>
                              </Grid>
                              <Grid item xs={9}>
                                <Typography noWrap="wrap">
                                  {val}
                                </Typography>
                              </Grid>
                            </Grid>
                          )
                        })
                    }
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button autoFocus disabled color="primary">
                    Update records
                  </Button>
                  <Button disabled color="primary">
                    Transfer
                  </Button>
                </DialogActions>
              </Dialog>
            }
          </>
        }
        {fetched && !domains.length && <p>No .crypto domains found. <a href="https://unstoppabledomains.com/">Buy here</a></p>}
      </div>
    </Container>
  )
}

export default Domains