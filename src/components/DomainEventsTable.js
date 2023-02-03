import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import CircularProgress from '@material-ui/core/CircularProgress';

import { ZERO_ADDRESS } from './../utils/constants';
import EtherscanAddress from './EtherscanAddress';
import EtherscanBlock from './EtherscanBlock';
import EtherscanTransaction from './EtherscanTransaction';

const useStyles = makeStyles(() => ({
  header: {
    paddingTop: 30
  },
  loader: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const renderEventType = (event) => {
  switch (event.event) {
    case 'Transfer':
      return <>{
        event.args.from === ZERO_ADDRESS ?
          'Mint' :
          event.args.to === ZERO_ADDRESS ?
            'Burn' :
            'Transfer'
      }</>;
    default:
      return <>{event.event}</>;
  }
}

const renderEvent = (event, chainId) => {
  const data = Object.keys(event.args)
    .filter(key => !(+key) && key !== '0')
    .reduce((obj, key) => {
      obj[key] = event.args[key];
      return obj;
    }, {});

  switch (event.event) {
    case 'Approval':
      return <>Approved operator {event.args.approved} for token {event.args.tokenId.toHexString()}</>;
    case 'ApprovalForAll':
      return <>{event.args.approved ? 'Approved' : 'Disapproved'} operator {event.args.operator}</>;
    case 'NewURI':
      return <>{event.args.uri}</>;
    case 'Resolve':
      return <>Set resolver {
        <EtherscanAddress address={event.args.to} chainId={chainId}></EtherscanAddress>
      }</>;
    case 'Sync':
      return <>Set record with key hash {event.args.updateId.toHexString()} <div>(Resolver: {
        <EtherscanAddress address={event.args.resolver} chainId={chainId}></EtherscanAddress>
      })</div></>;
    case 'Transfer':
      return <>
        Transfer to {
          <EtherscanAddress address={event.args.to} chainId={chainId}></EtherscanAddress>
        }
        {event.args.from !== ZERO_ADDRESS &&
          <div>(From: {<EtherscanAddress address={event.args.from} chainId={chainId}></EtherscanAddress>})</div>
        }
      </>;
    default:
      return <>{JSON.stringify(data, null, '  ')}</>;
  }
}

const DomainEventsTable = ({ events, chainId }) => {
  const classes = useStyles();

  return (
    <>
      {events && events.isFetched &&
        <TableContainer>
          <Table className={classes.table} size="small" aria-label="a dense table">
            <TableHead>
              <TableRow>
                <TableCell>Block</TableCell>
                <TableCell>Tx</TableCell>
                <TableCell align="left">Event</TableCell>
                <TableCell align="left">Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events && events.events.map((event, i) =>
                <TableRow key={i}>
                  <TableCell component="th" scope="row">
                    <EtherscanBlock blockNumber={event.blockNumber} chainId={chainId}></EtherscanBlock>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <EtherscanTransaction transactionHash={event.transactionHash} chainId={chainId}></EtherscanTransaction>
                  </TableCell>
                  <TableCell align="left">{renderEventType(event, chainId)}</TableCell>
                  <TableCell align="left">{renderEvent(event, chainId)}</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      }
      {events && !events.isFetched &&
        <div className={classes.loader}>
          <CircularProgress color="inherit" />
        </div>
      }
    </>
  );
};

export default DomainEventsTable;
