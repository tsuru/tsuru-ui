import React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import RouteIcon from "@mui/icons-material/Route";
import { RPaasBind } from "../../types/rpaas";
import Link from "../base/MuiLink";
import { Chip } from "@mui/material";

type RPaasBindListProps = {
  binds: Array<RPaasBind>;
};
const RPaasBindList = (props: RPaasBindListProps) => {
  props.binds.sort((a, b) => {
    if (a.name === b.name) {
      if (a.host < b.host) {
        return -1;
      } else if (b.host < a.host) {
        return 1;
      } else {
        return 0;
      }
    }

    if (a.host < b.host) {
      return -1;
    } else if (b.host < a.host) {
      return 1;
    } else {
      return 0;
    }
  });
  const bindElems = props.binds.map((bind) => {
    const upstreamsElem = (bind.upstreams || []).map((upstream) => {
      return (
        <Chip
          label={`upstream: ${upstream}`}
          variant="outlined"
          color="success"
          key={upstream}
        />
      );
    });
    return (
      <ListItemButton
        href={`/apps/${bind.name}`}
        key={bind.name}
        LinkComponent={Link}
      >
        <ListItemIcon>
          <RouteIcon />
        </ListItemIcon>
        <ListItemText primary={bind.name} secondary={bind.host} />
        {upstreamsElem}
      </ListItemButton>
    );
  });
  return <List>{bindElems}</List>;
};

export default RPaasBindList;
