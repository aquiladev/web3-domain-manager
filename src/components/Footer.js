import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Link from "@material-ui/core/Link";
import Chip from "@material-ui/core/Chip";
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
        This open source project uses the Ethereum blockchain as a datasource.
        It does not collect any user data or analytics.
      </Typography>
      <Typography color="textSecondary" variant="subtitle2">
        The best way to leave a feedback are star the project or create an issue
        on{" "}
        <Link
          href="//github.com/aquiladev/web3-domain-manager"
          target="_blank"
          rel="noopener"
        >
          GitHub
        </Link>
        .
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
          <Chip
            label={process.env.REACT_APP_GITHUB_REF_SHA}
            variant="outlined"
          />
        )}
      </Toolbar>
    </AppBar>
  );
}
