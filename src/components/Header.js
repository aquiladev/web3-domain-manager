import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { alpha, makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import SearchIcon from "@material-ui/icons/Search";
import Button from "@material-ui/core/Button";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import BarChartIcon from "@material-ui/icons/BarChart";
import CodeIcon from "@material-ui/icons/Code";
import InputBase from "@material-ui/core/InputBase";

import ConnectButton from "./ConnectButton";

const useStyles = makeStyles((theme) => ({
  title: {
    fontSize: "1rem",
    color: theme.palette.grey[800],
    textDecoration: "none",
    [theme.breakpoints.up("sm")]: {
      fontSize: "1.5rem",
    },
  },
  grow: {
    flexGrow: 1,
    paddingLeft: 30,
  },
  navBtn: {
    color: theme.palette.grey[800],
    marginLeft: 6,
    padding: "6px 0",
    minWidth: "inherit",
    textDecoration: "none",
  },
  menuLink: {
    color: "inherit",
    textDecoration: "none",
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.black, 0.15),
    "&:hover": {
      backgroundColor: alpha(theme.palette.common.black, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function Header({ active }) {
  const classes = useStyles();
  const history = useHistory();

  const [anchorEl, setAnchorEl] = useState(null);
  const [domainName, setDomainName] = useState();
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleChange = (e) => {
    setDomainName(e.target.value);
  };

  const keyPress = (e) => {
    if (e.charCode === 13) {
      setDomainName("");
      history.push(`/search/${domainName}`);
    }
  };

  return (
    <header>
      <AppBar position="fixed" color="inherit">
        <Toolbar>
          <Link to="/" className={classes.title}>
            <Typography variant="h5" noWrap>
              Web3 Domain Manager (beta)
            </Typography>
          </Link>
          <div className={classes.grow}></div>
          <div className={classes.search}>
            <div className={classes.searchIcon}>
              <SearchIcon />
            </div>
            <InputBase
              placeholder="Search…"
              classes={{
                root: classes.inputRoot,
                input: classes.inputInput,
              }}
              inputProps={{ "aria-label": "search" }}
              onKeyPress={keyPress}
              onChange={handleChange}
              defaultValue={domainName}
              value={domainName}
            />
          </div>
          <ConnectButton />
          <Button
            aria-label="more"
            id="long-button"
            aria-controls="long-menu"
            aria-expanded={open ? "true" : undefined}
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
                transform: "translateX(10px) translateY(50px)",
                width: 180,
              },
            }}
          >
            {/* <MenuItem component={Link} to="/lookup" disabled={!active}>
              <div style={{ flexGrow: 1 }}>Lookup</div>
              <SearchIcon />
            </MenuItem> */}
            <a
              href="//dune.xyz/aquiladev/uns"
              target="_blank"
              rel="noreferrer"
              className={classes.menuLink}
            >
              <MenuItem>
                <div style={{ flexGrow: 1 }}>UNS stats</div>
                <BarChartIcon />
              </MenuItem>
            </a>
            <a
              href="//github.com/aquiladev/web3-domain-manager"
              target="_blank"
              rel="noreferrer"
              className={classes.menuLink}
            >
              <MenuItem>
                <div style={{ flexGrow: 1 }}>Code</div>
                <CodeIcon />
              </MenuItem>
            </a>
          </Menu>
        </Toolbar>
      </AppBar>
    </header>
  );
}
