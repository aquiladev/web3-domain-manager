import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Backdrop from '@material-ui/core/Backdrop';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionActions from '@material-ui/core/AccordionActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import DomainInfo from './DomainInfo';
import DomainEventsTable from './DomainEventsTable';

const useStyles = makeStyles((theme) => ({
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
    color: '#fff',
  },
  tabs: {
    width: '100%',
  }
}));

const TabPanel = (props) => {
  const { children, display, index, ...other } = props;

  return (
    <div
      role='tabpanel'
      hidden={!display}
      {...other}
    >
      {display && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

const DomainList = ({ chainId, isFetching, domains, onEventsLoad, onDomainSelect, actions }) => {
  const classes = useStyles();

  const [expanded, setExpanded] = useState(false);
  const [domainTab, setDomainTab] = useState(undefined);
  const [events, setEvents] = useState({});

  const selectDomain = (domain) => (_, isExpanded) => {
    setExpanded(isExpanded ? domain.id : false);
    setDomainTab(domain.id);
    onDomainSelect && onDomainSelect(domain);
  };

  const selectDomainEvents = (domain) => async (_, tab) => {
    const events = await onEventsLoad(domain);
    setEvents(events);
    setDomainTab(tab);
  };

  return (
    <>
      {
        <Backdrop className={classes.backdrop} open={isFetching}>
          <CircularProgress color='inherit' />
        </Backdrop>
      }
      {domains && domains.length ?
        <div>
          {domains.map(domain => (
            <Accordion
              expanded={expanded === domain.id}
              onChange={selectDomain(domain)}
              disabled={domain.loading}
              key={domain.id}>
              <AccordionSummary expandIcon={
                domain.loading
                  ? <CircularProgress size={18} thickness={5} />
                  : <ExpandMoreIcon />
                }>
                <Typography noWrap>{domain.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {domainTab && domainTab.startsWith(domain.id) &&
                  <div className={classes.tabs}>
                    <Tabs value={domainTab} onChange={selectDomainEvents(domain)} style={{ marginBottom: 20 }}>
                      <Tab label='Info' value={domain.id} />
                      <Tab label='Events' value={`${domain.id}_e`} />
                    </Tabs>
                    <TabPanel display={domain.id === domainTab}>
                      <DomainInfo domain={domain} chainId={chainId} />
                    </TabPanel>
                    <TabPanel display={`${domain.id}_e` === domainTab}>
                      <DomainEventsTable events={events} chainId={chainId} />
                    </TabPanel>
                  </div>
                }
              </AccordionDetails>
              <Divider />
              {actions &&
                <AccordionActions>
                  {actions}
                </AccordionActions>
              }
            </Accordion>
          ))}
        </div> :
        <></>
      }
    </>
  )
}

export default DomainList;
