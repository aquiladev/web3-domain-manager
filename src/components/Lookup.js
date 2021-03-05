import React, { useEffect, useState } from 'react';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import Alert from '@material-ui/lab/Alert';

import namehash from '../namehash';

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: 40,
    padding: '2px 4px',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
  },
  iconButton: {
    padding: 10,
  }
}));

const Lookup = ({library}) => {
  const classes = useStyles();

  const [domainName, setDomainName] = useState(undefined);
  const [error, setError] = useState(undefined);
  
  const search = () => {
    try {
      setError(undefined);
      const tokenId = namehash(domainName);
      console.log(domainName, tokenId);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleChange = (e) => {
    setDomainName(e.target.value);
  }

  const keyPress = (e) => {
    if(e.charCode == 13) {
      search();
    }
  }

  return (
    <Container style={{ paddingTop: '3rem' }}>
      <Paper className={classes.root}>
        <InputBase
          error={!!error}
          className={classes.input}
          onKeyPress={keyPress}
          onChange={handleChange}
          placeholder="Search .crypto domain"
          inputProps={{ 'aria-label': 'search .crypto domain' }}
        />
        <IconButton
          className={classes.iconButton}
          onClick={search}
          aria-label="search">
          <SearchIcon />
        </IconButton>
      </Paper>
      {error && <Alert severity="error">{error}</Alert>}
    </Container>
  );
};

export default Lookup;