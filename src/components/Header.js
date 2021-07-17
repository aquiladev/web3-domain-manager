import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import ListIcon from '@material-ui/icons/List';

import ConnectButton from './ConnectButton';

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: '1rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '1.5rem',
    },
  },
  grow: {
    flexGrow: 1,
    paddingLeft: 30,
  },
  navButton: {
    color: 'white',
  },
}));

export default function Header({active, isLookup, setIsLookup}) {
  const classes = useStyles();

  return (
    <header>
      <AppBar position='fixed'>
        <Toolbar>
          <Typography className={classes.title} variant='h5' noWrap>
            Web3 Domain Manager
          </Typography>
          <div className={classes.grow}></div>
          {active && (
            <Tooltip title={isLookup ? 'My Domains' : 'Lookup'}>
              <IconButton color='inherit' onClick={() => { setIsLookup(!isLookup) }}>
                {isLookup ? <ListIcon /> : <SearchIcon />}
              </IconButton>
            </Tooltip>
          )}
          <ConnectButton />
        </Toolbar>
      </AppBar>
    </header>
  );
}
