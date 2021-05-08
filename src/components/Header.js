import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import ListIcon from '@material-ui/icons/List';

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

export default function Header({active, account, deactivate, isLookup, setIsLookup}) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const renderAccount = () => {
    return `${account.substr(0, 6)}...${account.substring(account.length - 4)}`;
  }

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header>
      <AppBar position='fixed'>
        <Toolbar>
          <Typography className={classes.title} variant='h5' noWrap>
            .crypto Domain Manager
          </Typography>
          <div className={classes.grow}></div>
          <Tooltip title={isLookup ? 'My Domains' : 'Lookup'}>
            <IconButton color='inherit' onClick={() => { setIsLookup(!isLookup) }}>
              {isLookup ? <ListIcon /> : <SearchIcon />}
            </IconButton>
          </Tooltip>
          {active && (
            <>
              <Typography variant='subtitle2' onClick={handleMenu}>
                {renderAccount()}
              </Typography>
              <div>
                <Menu
                  id='menu-appbar'
                  anchorEl={anchorEl}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  open={open}
                  onClose={handleClose}
                >
                  <MenuItem onClick={() => { 
                    deactivate();
                    handleClose();
                  }}>
                    Disconnect
                  </MenuItem>
                </Menu>
              </div>
            </>
          )}
        </Toolbar>
      </AppBar>
    </header>
  );
}
