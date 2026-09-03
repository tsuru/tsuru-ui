import React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import SecurityIcon from "@mui/icons-material/Security";
import Link from "../base/MuiLink";

type ACLBindListProps = {
  apps?: Array<string>;
  jobs?: Array<string>;
};
const ACLBindList = (props: ACLBindListProps) => {
  const appElems = (props.apps || []).map((app) => {
    return (
      <ListItemButton
        href={`/apps/${app}`}
        key={"app-" + app}
        LinkComponent={Link}
      >
        <ListItemIcon>
          <SecurityIcon />
        </ListItemIcon>
        <ListItemText primary={app} secondary="app" />
      </ListItemButton>
    );
  });

  const jobElems = (props.jobs || []).map((job) => {
    return (
      <ListItemButton
        href={`/jobs/${job}`}
        key={"app-" + job}
        LinkComponent={Link}
      >
        <ListItemIcon>
          <SecurityIcon />
        </ListItemIcon>
        <ListItemText primary={job} secondary="job" />
      </ListItemButton>
    );
  });
  return (
    <List>
      {appElems}
      {jobElems}
    </List>
  );
};

export default ACLBindList;
