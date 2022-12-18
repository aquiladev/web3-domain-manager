import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import GitHubButton from "react-github-btn";

const useStyles = makeStyles(() => ({
  footer: {
    alignItems: "center",
    background: "transparent",
    boxShadow: "none",
  },
  info: {
    marginTop: 20,
  },
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <AppBar position="static" className={classes.footer}>
      <Typography
        color="textSecondary"
        variant="subtitle2"
        className={classes.info}
      >
        This is an open-source project for managing blockchain domains. It uses
        Ethereum/Polygon blockchain and TheGraph as data sources.
      </Typography>
      <Toolbar>
        <span style={{ marginRight: 12 }}>
          <GitHubButton
            href="https://github.com/aquiladev/web3-domain-manager"
            data-icon="octicon-star"
            data-size="large"
            aria-label="Star aquiladev/web3-domain-manager on GitHub"
          >
            Star
          </GitHubButton>
        </span>
        <span style={{ marginRight: 12 }}>
          <GitHubButton
            href="https://github.com/aquiladev/web3-domain-manager/issues"
            data-icon="octicon-issue-opened"
            data-size="large"
            aria-label="Issue aquiladev/web3-domain-manager on GitHub"
          >
            Issue
          </GitHubButton>
        </span>
        <span style={{ marginRight: 12 }}>
          <GitHubButton
            href="https://github.com/aquiladev"
            data-size="large"
            aria-label="Follow @aquiladev on GitHub"
          >
            Follow @aquiladev
          </GitHubButton>
        </span>
        {process.env.REACT_APP_GITHUB_REF_SHA && (
          <Typography color="textSecondary" variant="subtitle2">
            version: {process.env.REACT_APP_GITHUB_REF_SHA}
          </Typography>
        )}
      </Toolbar>
    </AppBar>
  );
}
