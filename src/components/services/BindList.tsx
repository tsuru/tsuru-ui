import { useState } from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import List from "@mui/material/List";
import { IconButton, Tooltip, useTheme } from "@mui/material";
import { DeleteOutline } from "@mui/icons-material";
import ServiceIcon from "../base/ServiceIcon";
import { hrefForInstance } from "../../utils/services";
import { VolumeBind } from "../../types/volumes";
import FolderIcon from "@mui/icons-material/Folder";
import Link from "../base/MuiLink";
import { ServiceBind } from "../../types/serviceInstance";
import UnbindDialog, { UnbindTarget } from "./UnbindDialog";

type AppBindListProps = {
  serviceInstanceBinds: Array<ServiceBind>;
  volumeBinds?: Array<VolumeBind>;
  appName?: string;
  onUnbind?: () => void;
};

const BindList = (props: AppBindListProps) => {
  const theme = useTheme();
  const [unbindTarget, setUnbindTarget] = useState<UnbindTarget | null>(null);

  props.serviceInstanceBinds.sort((a, b) => {
    if (a.service === b.service) {
      if (a.instance < b.instance) {
        return -1;
      } else if (b.instance < a.instance) {
        return 1;
      } else {
        return 0;
      }
    }

    if (a.service < b.service) {
      return -1;
    } else if (b.service < a.service) {
      return 1;
    } else {
      return 0;
    }
  });

  const bindElems = props.serviceInstanceBinds.map((bind) => {
    const [href, target] = hrefForInstance(bind.service, bind.instance);
    return (
      <ListItemButton
        href={href}
        target={target}
        LinkComponent={Link}
        key={`${bind.service}/${bind.instance}`}
      >
        <ListItemIcon>
          <ServiceIcon service={bind.service} />
        </ListItemIcon>
        <ListItemText primary={bind.instance} secondary={bind.service} />
        {props.appName && (
          <Tooltip title="Unbind service">
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUnbindTarget({
                  type: "service",
                  service: bind.service,
                  instance: bind.instance,
                });
              }}
              sx={{
                opacity: 0.5,
                "&:hover": {
                  opacity: 1,
                  color: theme.palette.error.main,
                },
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </ListItemButton>
    );
  });

  const volumeElems = (props.volumeBinds || []).map((bind) => {
    return (
      <ListItemButton
        href={`/volumes/${bind.ID.Volume}`}
        LinkComponent={Link}
        key={`volume/${bind.ID.Volume}/${bind.ID.MountPoint}`}
      >
        <ListItemIcon>
          <FolderIcon />
        </ListItemIcon>
        <ListItemText
          primary={bind.ID.Volume}
          secondary={`volume mounted on: ${bind.ID.MountPoint}${
            bind.ReadOnly ? " readonly" : ""
          }`}
        />
        {props.appName && (
          <Tooltip title="Unbind volume">
            <IconButton
              size="small"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setUnbindTarget({
                  type: "volume",
                  volume: bind.ID.Volume,
                  app: bind.ID.App,
                  mountPoint: bind.ID.MountPoint,
                });
              }}
              sx={{
                opacity: 0.5,
                "&:hover": {
                  opacity: 1,
                  color: theme.palette.error.main,
                },
              }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </ListItemButton>
    );
  });

  return (
    <>
      <List>
        {bindElems}
        {volumeElems}
      </List>

      {props.appName && (
        <UnbindDialog
          target={unbindTarget}
          appName={props.appName}
          onClose={() => setUnbindTarget(null)}
          onSuccess={() => {
            setUnbindTarget(null);
            props.onUnbind?.();
          }}
        />
      )}
    </>
  );
};

export default BindList;
