import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import GitHubIcon from '@material-ui/icons/GitHub';

const useStyles = makeStyles(() => ({
  footer: {
    alignItems: 'center',
    background: 'transparent',
    boxShadow: 'none'
  }
}));

export default function Footer() {
  const classes = useStyles();

  return (
    <AppBar position='static' className={classes.footer}>
      <Toolbar>
        <Link href='//github.com/aquiladev/web3-domain-manager' target='_blank' rel='noopener'>
          <IconButton color='default' aria-label='GitHub repo' component='span'>
            <GitHubIcon fontSize='large' />
          </IconButton>
        </Link>
      </Toolbar>
    </AppBar>
  );
}
