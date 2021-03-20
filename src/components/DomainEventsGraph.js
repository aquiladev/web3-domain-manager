import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Gitgraph,
  templateExtend,
  Orientation,
  TemplateName
} from "@gitgraph/react";

const useStyles = makeStyles(() => ({
  header: {
    paddingTop: 30
  },
}));

const DomainEventsGraph = ({events}) => {
  const classes = useStyles();

  const _template = templateExtend(TemplateName.Metro, {
    branch: {
      lineWidth: 3
    },
    commit: {
      spacing: 40,
      message: {
        displayHash: false,
        displayAuthor: false,
      },
      dot: {
        size: 5,
      }
    },
    tag: {
      pointerWidth: 6,
    },
  });

  return (
    <>
      <Gitgraph options={{
        template: _template,
        orientation: Orientation.VerticalReverse,
      }}>
        {(gitgraph) => {
          const master = gitgraph.branch("Registry");
          if(events) {
            events.events.map(e => {
              // master.commit({
              //   subject: e.event,
              //   tag: e.blockNumber.toString()
              // });
              master.commit(e.event);
              master.tag(e.blockNumber.toString());
            })
          }
        }}
      </Gitgraph>
    </>
  );
};

export default DomainEventsGraph;
