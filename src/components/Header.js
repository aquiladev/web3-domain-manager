import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';

import ConnectButton from './ConnectButton';

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: '1rem',
    color: 'white',
    textDecoration: 'none',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.5rem',
    },
  },
  grow: {
    flexGrow: 1,
    paddingLeft: 30,
  },
  lookup: {
    color: 'white',
    padding: 8,
  },
}));

export default function Header({active}) {
  const classes = useStyles();
  const location = useLocation();

  return (
    <header>
      <AppBar position='fixed'>
        <Toolbar>
          <Link to='/' className={classes.title}>
            <Typography variant='h5' noWrap>
              Web3 Domain Manager
            </Typography>
          </Link>
          <div className={classes.grow}></div>
          {active && !location.pathname.endsWith('/lookup') && (
            <Link to='/lookup' className={classes.lookup}><SearchIcon /></Link>
          )}
          <ConnectButton />
        </Toolbar>
      </AppBar>
    </header>
  );
}
