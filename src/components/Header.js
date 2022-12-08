import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import SearchIcon from '@material-ui/icons/Search';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import BarChartIcon from '@material-ui/icons/BarChart';
import CodeIcon from '@material-ui/icons/Code';

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
  navBtn: {
    color: 'white',
    marginLeft: 6,
    padding: '6px 0',
    minWidth: 'inherit',
    textDecoration: 'none',
  },
  menuLink: {
    color: 'inherit',
    textDecoration: 'none',
  },
}));

export default function Header({active}) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header>
      <AppBar position='fixed'>
        <Toolbar>
          <Link to='/' className={classes.title}>
            <Typography variant='h5' noWrap>
              Web3 Domain Manager (alpha)
            </Typography>
          </Link>
          <div className={classes.grow}></div>
          <ConnectButton />
          <Button
            aria-label="more"
            id="long-button"
            aria-controls="long-menu"
            aria-expanded={open ? 'true' : undefined}
            aria-haspopup="true"
            onClick={handleOpen}
            className={classes.navBtn}
          >
            <MoreVertIcon />
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              style: {
                transform: 'translateX(10px) translateY(50px)',
                width: 180
              }
            }}
          >
            <MenuItem component={Link} to="/lookup" disabled={!active}>
              <div style={{flexGrow: 1}}>Lookup</div>
              <SearchIcon />
            </MenuItem>
            <a href='//dune.xyz/aquiladev/uns' target='_blank' rel='noreferrer' className={classes.menuLink}>
              <MenuItem>
                <div style={{flexGrow: 1}}>UNS stats</div>
                <BarChartIcon />
              </MenuItem>
            </a>
            <a href='//github.com/aquiladev/web3-domain-manager' target='_blank' rel='noreferrer' className={classes.menuLink}>
              <MenuItem>
                <div style={{flexGrow: 1}}>Code</div>
                <CodeIcon />
              </MenuItem>
            </a>
          </Menu>
        </Toolbar>
      </AppBar>
    </header>
  );
}
