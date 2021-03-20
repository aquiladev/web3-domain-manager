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
  header: {
    paddingTop: 30
  },
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
      role="tabpanel"
      hidden={!display}
      {...other}
    >
      {display && (
        <Box pl={3}>
          {children}
        </Box>
      )}
    </div>
  );
}

const DomainList = ({isFetching, domains, onEventsLoad, onDomainSelect, actions}) => {
  const classes = useStyles();

  const [expanded, setExpanded] = useState(false);
  const [domainTab, setDomainTab] = useState(undefined);
  const [events, setEvents] = useState({});

  const selectDomain = (domain) => (_, isExpanded) => {
    setExpanded(isExpanded ? domain.id : false);
    setDomainTab(domain.id);
    onDomainSelect && onDomainSelect(domain);
  };

  const selectDomainEvents = (domainId) => async (_, tab) => {
    const events = await onEventsLoad(domainId);
    setEvents(events);
    setDomainTab(tab);
  };

  return (
    <>
      {
        <Backdrop className={classes.backdrop} open={isFetching}>
          <CircularProgress color="inherit" />
        </Backdrop>
      }
      {domains && domains.length &&
        <>
          <Typography className={classes.header} variant="h5" component="h6">
            Domains
          </Typography>
          <div>
            {domains.map(domain => (
              <Accordion expanded={expanded === domain.id} onChange={selectDomain(domain)} key={domain.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography className={classes.heading}>{domain.name}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {domainTab && domainTab.startsWith(domain.id) &&
                    <div className={classes.tabs}>
                      <Tabs value={domainTab} onChange={selectDomainEvents(domain.id)}>
                        <Tab label="Info" value={domain.id} />
                        <Tab label="Events" value={`${domain.id}_e`} />
                      </Tabs>
                      <TabPanel display={domain.id === domainTab}>
                        <DomainInfo domain={domain} />
                      </TabPanel>
                      <TabPanel display={`${domain.id}_e` === domainTab}>
                        <DomainEventsTable events={events} />
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
          </div>
        </>
      }
    </>
  )
}

export default DomainList;