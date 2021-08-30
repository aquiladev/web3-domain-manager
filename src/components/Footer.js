import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import GitHubIcon from '@material-ui/icons/GitHub';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles(() => ({
  footer: {
    alignItems: 'center',
    background: 'transparent',
    boxShadow: 'none'
  },
  info: {
    marginTop: 20
  }
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <AppBar position='static' className={classes.footer}>
      <Typography color='textSecondary' variant='subtitle2' className={classes.info}>
        This open source project uses the Ethereum blockchain as a datasource. It does not collect any user data or analytics.
      </Typography>
      <Typography color='textSecondary' variant='subtitle2'>
        The best way to leave a feedback are star the project or create an issue on <Link href='//github.com/aquiladev/web3-domain-manager' target='_blank' rel='noopener'>GitHub</Link>.
      </Typography>
      <Toolbar>
        <Link href='//github.com/aquiladev/web3-domain-manager' target='_blank' rel='noopener'>
          <IconButton color='default' aria-label='GitHub repo' component='span'>
            <GitHubIcon fontSize='default' />
          </IconButton>
          {process.env.REACT_APP_GITHUB_REF_SHA &&
            <Chip label={process.env.REACT_APP_GITHUB_REF_SHA} variant='outlined' />
          }
        </Link>
      </Toolbar>
    </AppBar>
  );
}
