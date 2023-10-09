import { ethers } from "ethers";
import React, { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { Chip } from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Button from "@material-ui/core/Button";
import Alert from "@material-ui/lab/Alert";

import { getPurchaseParams } from "../services/udRegistry";

const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
    paddingLeft: 30,
  },
  buy: {
    marginLeft: 16,
    fontWeight: "bold",
  },
  acc: {
    marginBottom: 16,
  },
  accSum: {
    "& > .Mui-expanded": {
      margin: "initial",
    },
  },
}));

const BuyDomain = ({ library, name, status, price }) => {
  const classes = useStyles();
  const { account } = useWeb3React();

  const [fetched, setFetched] = useState(true);
  const [error, setError] = useState(undefined);

  const handleBuy = async () => {
    try {
      setError(undefined);
      setFetched(false);
      const res = await getPurchaseParams(name, account);
      console.log("RES", res);

      const { params: txParams } = res.tx;
      const provider = new ethers.providers.Web3Provider(library.provider);
      const params = {
        to: txParams.to,
        data: txParams.data,
        value: txParams.value,
      };

      const signer = provider.getSigner();
      await signer.sendTransaction(params);
    } catch (error) {
      console.error(error);
      setError(error.message);
    } finally {
      setFetched(true);
    }
  };

  return (
    <>
      <Accordion className={classes.acc}>
        <AccordionSummary className={classes.accSum}>
          <Typography style={{ fontWeight: "bold", fontSize: 20 }} noWrap>
            {name}
          </Typography>
          <Chip
            color="primary"
            style={{ backgroundColor: "green", marginLeft: 16 }}
            label={status}
          />
          <div className={classes.grow}></div>
          <Typography style={{ fontWeight: "bold", fontSize: 20 }} noWrap>
            USD {(price / 100).toFixed(2)}
          </Typography>
          <Button
            onClick={handleBuy}
            className={classes.buy}
            variant="contained"
            color="primary"
            disabled={!fetched}
          >
            Buy
          </Button>
        </AccordionSummary>
      </Accordion>
      {error && <Alert severity="error">{error}</Alert>}
    </>
  );
};

export default BuyDomain;
