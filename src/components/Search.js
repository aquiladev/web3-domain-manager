import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";

import NetworkConfig from "uns/uns-config.json";

import cnsRegistryJson from "uns/artifacts/CNSRegistry.json";
import unsRegistryJson from "uns/artifacts/UNSRegistry.json";

import DomainList from "./DomainList";
import BuyDomain from "./BuyDomain";
import { createContract } from "../utils/contract";
import { getDomain } from "../sources/thegraph";
import { getAvailability } from "../services/udRegistry";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 40,
    marginBottom: 16,
    padding: "2px 4px",
    display: "flex",
    alignItems: "center",
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  loader: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
}));

const Search = ({ library, chainId }) => {
  const classes = useStyles();
  const history = useHistory();
  const { domain: domainParam } = useParams();

  const [domainName, setDomainName] = useState(domainParam);
  const [domain, setDomain] = useState(undefined);
  const [availability, setAvailability] = useState(undefined);
  const [fetched, setFetched] = useState(true);
  const [error, setError] = useState(undefined);

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

  useEffect(() => {
    if (domainParam) {
      search();
    }
  }, [domainParam]);

  const search = async () => {
    try {
      setError(undefined);
      if (domain && domainName === domain.name) {
        return;
      }
      setDomain(undefined);
      setAvailability(undefined);
      setFetched(false);
      const tokenId = ethers.utils.namehash(domainName);
      console.debug(domainName, tokenId);

      // It is possyble to buy domain on Polygon directly from the dapp
      if (chainId === 137) {
        const [_domain, _availabilityResp] = await Promise.all([
          getDomain(chainId, tokenId, true),
          getAvailability(domainName),
        ]);

        console.debug("DOMAIN", _domain);
        const _availabilityStatus = _availabilityResp?.availability?.status;
        if (_availabilityStatus === "AVAILABLE") {
          setAvailability(_availabilityResp);
        } else if (_domain?.name) {
          setDomain(_domain);
        }
      } else {
        const _domain = await getDomain(chainId, tokenId, true);
        setDomain(_domain);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setFetched(true);
    }
  };

  const loadDomainEvents = (domain) => {
    console.debug("Loading DOMAIN events...");

    const registry =
      unsRegistry.address === domain.registry ? unsRegistry : cnsRegistry;
    return registry.source.fetchEvents(domain).then((domainEvents) => {
      console.debug("Loaded DOMAIN events", domainEvents);

      return {
        isFetched: true,
        events: domainEvents || [],
      };
    });
  };

  const handleChange = (e) => {
    setDomainName(e.target.value);
  };

  const keyPress = (e) => {
    if (e.charCode === 13) {
      history.push(`/search/${domainName}`);
    }
  };

  return (
    <Container style={{ paddingTop: "3rem" }}>
      <Paper className={classes.root}>
        <InputBase
          error={!!error}
          className={classes.input}
          onKeyPress={keyPress}
          onChange={handleChange}
          placeholder="Search domain"
          inputProps={{
            "aria-label": "search domain",
          }}
          defaultValue={domainName}
          value={domainName}
        />
        <IconButton
          className={classes.iconButton}
          onClick={search}
          aria-label="search"
        >
          <SearchIcon />
        </IconButton>
      </Paper>
      {error && <Alert severity="error">{error}</Alert>}
      {!fetched && (
        <div className={classes.loader}>
          <CircularProgress color="inherit" />
        </div>
      )}
      {fetched && availability && (
        <div style={{ marginTop: 20 }}>
          <BuyDomain
            library={library}
            name={availability?.name}
            status={availability?.availability?.status}
            price={availability?.availability?.price?.listPrice?.usdCents}
          ></BuyDomain>
        </div>
      )}
      {fetched && domain && (
        <div style={{ marginTop: 20 }}>
          <DomainList
            chainId={chainId}
            isFetching={!fetched}
            domains={[domain]}
            onEventsLoad={loadDomainEvents}
          />
        </div>
      )}
    </Container>
  );
};

export default Search;
