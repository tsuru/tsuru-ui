import { FunctionComponent } from "react";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import { MiscellaneousServices, Schedule } from "@mui/icons-material";
import Link from "../../components/base/MuiLink";

type ServiceInstanceBindListProps = {
  apps?: Array<string>;
  jobs?: Array<string>;
};

const ServiceInstanceBindList: FunctionComponent<
  ServiceInstanceBindListProps
> = ({ apps, jobs }) => {
  const appBindElems = (apps || []).map((app) => {
    return (
      <ListItemButton
        href={`/apps/${app}`}
        key={`apps/${app}`}
        LinkComponent={Link}
      >
        <ListItemIcon>
          <MiscellaneousServices />
        </ListItemIcon>
        <ListItemText primary={`App: ${app}`} />
      </ListItemButton>
    );
  });

  const jobBindElems = (jobs || []).map((job) => {
    return (
      <ListItemButton
        href={`/jobs/${job}`}
        key={`apps/${job}`}
        LinkComponent={Link}
      >
        <ListItemIcon>
          <Schedule />
        </ListItemIcon>
        <ListItemText primary={`Job: ${job}`} />
      </ListItemButton>
    );
  });

  return (
    <List>
      {appBindElems}
      {jobBindElems}
    </List>
  );
};

export default ServiceInstanceBindList;
