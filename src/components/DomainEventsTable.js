import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

const useStyles = makeStyles(() => ({
  header: {
    paddingTop: 30
  },
}));

const DomainEventsTable = ({ events }) => {
  const classes = useStyles();

  return (
    <TableContainer>
      <Table className={classes.table} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Block Number</TableCell>
            <TableCell align="left">Event</TableCell>
            <TableCell align="left">Data</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events && events.events.map((event, i) => {
            const data = Object.keys(event.returnValues)
              .filter(key => !(+key) && key !== '0')
              .reduce((obj, key) => {
                obj[key] = event.returnValues[key];
                return obj;
              }, {});

            return (
              <TableRow key={i}>
                <TableCell component="th" scope="row">
                  {event.blockNumber}
                </TableCell>
                <TableCell align="left">{event.event}</TableCell>
                <TableCell align="left">{JSON.stringify(data, null, '  ')}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default DomainEventsTable;