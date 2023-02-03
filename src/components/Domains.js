import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Slide from "@material-ui/core/Slide";
import TextField from "@material-ui/core/TextField";
import Grid from "@material-ui/core/Grid";
import Backdrop from "@material-ui/core/Backdrop";
import CircularProgress from "@material-ui/core/CircularProgress";
import Alert from "@material-ui/lab/Alert";
import Typography from "@material-ui/core/Typography";
import RefreshIcon from "@material-ui/icons/Refresh";

import NetworkConfig from "uns/uns-config.json";
import cnsRegistryJson from "uns/artifacts/CNSRegistry.json";
import unsRegistryJson from "uns/artifacts/UNSRegistry.json";
import resolverJson from "uns/artifacts/Resolver.json";
import mintingManagerJson from "uns/artifacts/MintingManager.json";

import DomainList from "./DomainList";
import { createContract } from "../utils/contract";
import { isAddress } from "../utils/address";
import RecordsForm from "./RecordsForm";
import MintDomainForm from "./MintDomainForm";
import { ZERO_ADDRESS } from "./../utils/constants";
import { getAccount, getDomain } from "../sources/thegraph";

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const useStyles = makeStyles((theme) => ({
  header: {
    display: "flex",
    padding: "10px 0",
  },
  form: {
    minWidth: 600,
    display: "flex",
    [theme.breakpoints.down("sm")]: {
      minWidth: "initial",
    },
  },
  grow: {
    flexGrow: 1,
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: "#fff",
  },
  tabs: {
    width: "100%",
  },
  btn: {
    margin: "0 10px",
  },
  noDomains: {
    textAlign: "center",
  },
}));

// NOTE: It is not possible to use `useWeb3React` context here, because Gnosis Safe provider
const Domains = ({ library, account, chainId }) => {
  const classes = useStyles();
  const stateKey = `${account}_${chainId}`;

  const [data, setData] = useState({
    [stateKey]: {
      isFetched: false,
      domains: [],
    },
  });
  const [fetched, setFetched] = useState(true);
  const [domainTab, setDomainTab] = React.useState(undefined);
  const [domain, setDomain] = useState(undefined);

  const [defaultResolverError, setDefaultResolverError] =
    React.useState(undefined);
  const [defaultResolving, setDefaultResolving] = React.useState(false);

  const [receiver, setReceiver] = React.useState();
  const [transferError, setTransferError] = React.useState(undefined);
  const [transferring, setTransferring] = React.useState(false);

  const [records, setRecords] = useState(undefined);
  const [updateError, setUpdateError] = React.useState(undefined);
  const [updating, setUpdating] = React.useState(false);

  const [allowMinting, setAllowMinting] = useState(false);
  const [domainToMint, setDomainToMint] = useState(false);
  const [mintError, setMintError] = React.useState(undefined);
  const [minting, setMinting] = React.useState(false);

  const { contracts } = NetworkConfig.networks[chainId];
  const cnsRegistry = createContract(
    library,
    chainId,
    cnsRegistryJson.abi,
    contracts.CNSRegistry
  );
  const unsRegistry = createContract(
    library,
    chainId,
    unsRegistryJson.abi,
    contracts.UNSRegistry
  );
  const mintingManager = createContract(
    library,
    chainId,
    mintingManagerJson.abi,
    contracts.MintingManager
  );

  const handleTransferOpen = (_domain) => () => {
    setDomain(_domain);
  };

  const handleRecordsOpen = (_domain) => () => {
    setRecords(_domain);
    setUpdateError();
  };

  const handleTransferClose = () => {
    if (transferring) {
      return;
    }

    setDomain();
    setReceiver();
    setTransferError();
  };

  const handleTransfer = async (_domain, receiver) => {
    console.debug(account, receiver, _domain.id);

    setTransferError();
    if (!isAddress(receiver)) {
      setTransferError("Recipient address is invalid");
      return;
    }

    try {
      setTransferring(true);

      const registry =
        unsRegistry.address === _domain.registry ? unsRegistry : cnsRegistry;
      await registry["safeTransferFrom(address,address,uint256)"](
        account,
        receiver,
        _domain.id
      );

      setDomain();
      await updateDomainState(_domain);
    } catch (error) {
      console.error(error);
      setTransferError(error && error.message);
      return;
    } finally {
      setTransferring(false);
    }
  };

  const setDefaultResolver = (_domain) => async () => {
    console.debug("DEFAULT RESOLVER", _domain.id);
    setDefaultResolverError();

    try {
      setDefaultResolving(true);
      await cnsRegistry.resolveTo(contracts.Resolver.address, _domain.id);

      await updateDomainState(_domain);
    } catch (error) {
      console.error(error);
      setDefaultResolverError(error && error.message);
      return;
    } finally {
      setDefaultResolving(false);
    }
  };

  const handleUpdate = async (_domain, records) => {
    console.debug("UPDATE", _domain, records);
    setUpdateError();

    try {
      setUpdating(true);
      const provider = new ethers.providers.Web3Provider(library.provider);
      const resolver = new ethers.Contract(
        _domain.resolver,
        resolverJson.abi,
        provider.getSigner()
      );
      const keysToUpdate = records.map((r) => r.key);
      const valuesToUpdate = records.map((r) => r.newValue || "");
      await resolver.setMany(keysToUpdate, valuesToUpdate, _domain.id);

      setRecords();
      await updateDomainState(_domain);
    } catch (error) {
      console.error(error);
      setUpdateError(error && error.message);
      return;
    } finally {
      setUpdating(false);
    }
  };

  const handleMint = async (tld, domainName) => {
    console.debug("MINT", tld, domainName);
    setMintError();

    try {
      setMinting(true);
      await mintingManager.claim(tld, domainName);
      setDomainToMint(false);
      await loadTokens();
    } catch (error) {
      console.error(error);
      setMintError(error && error.message);
      return;
    } finally {
      setMinting(false);
    }
  };

  const handleRefresh = (_domain) => async () => {
    await updateDomainState(_domain);
  };

  const initMinting = async () => {
    console.debug("Initiating minting...");
    const paused = await mintingManager.paused();
    setAllowMinting(!paused);
  };

  const loadTokens = async () => {
    setFetched(false);

    const _account = await getAccount(chainId, account);
    const _data = {
      ...data,
      [stateKey]: {
        isFetched: true,
        domains: (_account.domains || []).sort((a, b) => {
          return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
        }),
      },
    };
    console.debug("Update state", _data);
    setData(_data);
    setFetched(true);
  };

  const updateDomainState = async (domain) => {
    const _domain = await getDomain(chainId, domain.id, true);
    const domains = data[stateKey].domains
      .map((d) => (_domain && d.id === _domain.id ? { ...d, ..._domain } : d))
      .filter((d) => _domain || d.id !== domain.id);

    const _data = {
      ...data,
      [stateKey]: {
        isFetched: true,
        domains,
      },
    };

    console.debug("Update domain state", _data);
    setData(_data);
    setDomainTab(_domain);
  };

  const loadDomainEvents = (domain) => {
    console.debug("Loading DOMAIN events...");

    const registry =
      unsRegistry.address.toLowerCase() === domain.registry
        ? unsRegistry
        : cnsRegistry;
    return registry.source.fetchEvents(domain).then((domainEvents) => {
      console.debug("Loaded DOMAIN events", domainEvents);

      return {
        isFetched: true,
        events: domainEvents || [],
      };
    });
  };

  useEffect(() => {
    if (!data[stateKey] || !data[stateKey].isFetched) {
      initMinting();
      loadTokens();
    }
  }, [data, stateKey]);

  const _domains = data && (data[stateKey] || {}).domains;
  return (
    <Container>
      {_domains && _domains.length ? (
        <div className={classes.header}>
          <Typography variant="h5" component="h6" className={classes.grow}>
            Domains ({_domains.length})
          </Typography>
          <Button
            color="primary"
            variant="contained"
            disabled={!allowMinting}
            onClick={() => {
              setDomainToMint(true);
            }}
          >
            Mint free domain
          </Button>
        </div>
      ) : (
        <></>
      )}
      <DomainList
        chainId={chainId}
        isFetching={!fetched}
        domains={_domains}
        onEventsLoad={loadDomainEvents}
        onDomainSelect={(domain) => {
          setDomainTab(domain);
          setDefaultResolverError();
        }}
        actions={
          <>
            {domainTab && domainTab.resolver === ZERO_ADDRESS ? (
              <Button
                size="small"
                color="primary"
                onClick={setDefaultResolver(domainTab)}
              >
                Set default resolver
              </Button>
            ) : (
              <Button
                size="small"
                color="primary"
                onClick={handleRecordsOpen(domainTab)}
              >
                Update records
              </Button>
            )}
            <Button
              size="small"
              color="primary"
              onClick={handleTransferOpen(domainTab)}
            >
              Transfer
            </Button>
            <div className={classes.grow}>
              {defaultResolverError && (
                <Alert severity="error">{defaultResolverError}</Alert>
              )}
            </div>
            <Button
              size="small"
              color="primary"
              onClick={handleRefresh(domainTab)}
            >
              <RefreshIcon />
            </Button>
          </>
        }
      />
      <Dialog
        open={!!domain}
        TransitionComponent={Transition}
        maxWidth="lg"
        keepMounted
        onClose={handleTransferClose}
      >
        {!!domain && (
          <>
            <DialogTitle>Transfer {domain.name}</DialogTitle>
            <DialogContent>
              <Grid className={classes.form}>
                <TextField
                  label="Receiver"
                  variant="outlined"
                  size="small"
                  defaultValue={receiver}
                  className={classes.grow}
                  onChange={(event) => {
                    setReceiver(event.target.value);
                  }}
                />
              </Grid>
              {transferError && (
                <Alert severity="error" style={{ marginTop: 10 }}>
                  {transferError}
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={handleTransferClose}>
                Cancel
              </Button>
              <Button
                color="primary"
                variant="contained"
                onClick={() => {
                  handleTransfer(domain, receiver);
                }}
              >
                Transfer
              </Button>
            </DialogActions>
            {
              <Backdrop className={classes.backdrop} open={transferring}>
                <CircularProgress color="inherit" />
              </Backdrop>
            }
          </>
        )}
      </Dialog>
      <Dialog
        open={!!records}
        TransitionComponent={Transition}
        maxWidth="lg"
        keepMounted
      >
        {!!records && (
          <>
            <DialogTitle>Records [{records.name}]</DialogTitle>
            <DialogContent>
              <RecordsForm
                records={records.records}
                updating={updating}
                error={updateError}
                onUpdate={(_records) => {
                  handleUpdate(records, _records);
                }}
                onCancel={() => {
                  setRecords();
                }}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
      <Dialog
        open={!!domainToMint}
        TransitionComponent={Transition}
        maxWidth="lg"
        keepMounted
      >
        <DialogTitle>Mint free domain</DialogTitle>
        <DialogContent>
          <MintDomainForm
            minting={minting}
            onMint={(tld, domainName) => {
              handleMint(tld, domainName);
            }}
            onCancel={() => {
              setDomainToMint(false);
            }}
            error={mintError}
          />
        </DialogContent>
      </Dialog>
      {fetched &&
        data[stateKey] &&
        data[stateKey].domains &&
        !data[stateKey].domains.length && (
          <p className={classes.noDomains}>
            No domains found.
            <Button
              color="primary"
              variant="contained"
              className={classes.btn}
              disabled={!allowMinting}
              onClick={() => {
                setDomainToMint(true);
              }}
            >
              Mint free domain
            </Button>
            OR <a href="https://unstoppabledomains.com/">Buy here</a>
          </p>
        )}
      {
        <Backdrop className={classes.backdrop} open={defaultResolving}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
    </Container>
  );
};

export default Domains;
