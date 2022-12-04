import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";

import EtherscanAddress from "./EtherscanAddress";

const useStyles = makeStyles(() => ({
  header: {
    paddingTop: 30,
  },
}));

const DomainInfo = ({ domain, chainId }) => {
  const classes = useStyles();

  const records = Object.entries((domain || {}).records || []).filter(
    ([_, val]) => !!val
  );
  const recordsRaw = records.map(([key, val]) => {
    return (
      <Grid container item xs={12} key={`${domain.id}_${key}`}>
        <Grid item sm={3} xs={12}>
          <Typography style={{ fontWeight: "bold" }} noWrap>
            {key}
          </Typography>
        </Grid>
        <Grid item sm={9} xs={12}>
          <Typography noWrap>{val}</Typography>
        </Grid>
      </Grid>
    );
  });

  return (
    <>
      <Grid container item xs={12}>
        <Grid item sm={3} xs={12}>
          <b>ID</b>
        </Grid>
        <Grid item sm={9} xs={12}>
          <Typography noWrap>{domain.id}</Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12}>
        <Grid item sm={3} xs={12}>
          <b>Registry</b>
        </Grid>
        <Grid item sm={9} xs={12}>
          <Typography noWrap>
            <EtherscanAddress
              address={domain.registry}
              chainId={chainId}
              label={domain.registry}
            ></EtherscanAddress>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12}>
        <Grid item sm={3} xs={12}>
          <b>Resolver</b>
        </Grid>
        <Grid item sm={9} xs={12}>
          <Typography noWrap>
            <EtherscanAddress
              address={domain.resolver}
              chainId={chainId}
            ></EtherscanAddress>
          </Typography>
        </Grid>
      </Grid>
      <Grid container item xs={12}>
        <Grid item sm={3} xs={12}>
          <b>Owner</b>
        </Grid>
        <Grid item sm={9} xs={12}>
          <Typography noWrap>
            <EtherscanAddress
              address={domain.owner}
              chainId={chainId}
            ></EtherscanAddress>
          </Typography>
        </Grid>
      </Grid>
      {records.length ? (
        <>
          <Grid container item xs={12}>
            <Typography className={classes.header} variant="subtitle1">
              Records
            </Typography>
          </Grid>
          {recordsRaw}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default DomainInfo;
