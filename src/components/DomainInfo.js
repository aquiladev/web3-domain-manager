import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(() => ({
  header: {
    paddingTop: 30
  },
}));

const DomainInfo = ({domain}) => {
  const classes = useStyles();

  return (
    <Grid>
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
  );
};

export default DomainInfo;