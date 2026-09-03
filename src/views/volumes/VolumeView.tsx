import { Fragment, FunctionComponent } from "react";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";

import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { Volume } from "../../types/volumes";
import { Folder } from "@mui/icons-material";
import Title from "../../components/base/Title";
import Subtitle from "../../components/base/Subtitle";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";
import DisplayError from "../../components/base/DisplayError";
import { useVolume } from "../../hooks/volumes";

type VolumeInfoProps = {
  volume: Volume;
};

const VolumeInfo: FunctionComponent<VolumeInfoProps> = ({ volume }) => {
  const bindElems = (volume.Binds || []).map((bind) => {
    return (
      <ListItemButton
        href={`/apps/${bind.ID.App}`}
        key={`apps/${bind.ID.App}`}
        LinkComponent={Link}
      >
        <ListItemIcon>
          <Folder />
        </ListItemIcon>
        <ListItemText
          primary={`App: ${bind.ID.App}`}
          secondary={`volume mounted on: ${bind.ID.MountPoint}${
            bind.ReadOnly ? " readonly" : ""
          }`}
        />
      </ListItemButton>
    );
  });
  return (
    <>
      <Title>Volume information</Title>
      <Typography variant="subtitle1">Plan</Typography>
      <span>{volume.Plan.Name}</span>
      <Subtitle>Deployed at</Subtitle>
      <Tooltip title="Pool" placement="top">
        <span>{volume.Pool}</span>
      </Tooltip>

      {bindElems.length > 0 && (
        <>
          <Title>Binds</Title>
          <List>{bindElems}</List>
        </>
      )}

      <Title>Ownership</Title>
      <Typography variant="subtitle1">Teams</Typography>
      <Link href={`/teams/${volume.TeamOwner}`}>
        {volume.TeamOwner} (owner)
      </Link>

      <Title>Options</Title>

      {Object.keys(volume.Opts)
        .sort()
        .map((key) => (
          <Fragment key={key}>
            <Typography variant="subtitle1">{key}</Typography>
            <span>{volume.Opts[key]}</span>
          </Fragment>
        ))}
    </>
  );
};

const VolumeView: FunctionComponent = () => {
  const params = useParams();
  const volume = useVolume(params.volumeID as string);
  useTitle(`Volume: ${params.volumeID}`);

  if (volume.error) {
    return <DisplayError error={volume.error} />;
  }

  if (volume.loading || !volume.value) {
    return <Loading />;
  }

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href="/volumes">
          Volumes
        </Link>
        <Typography color="text.primary">{params.volumeID}</Typography>
      </Breadcrumbs>

      <VolumeInfo volume={volume.value} />
    </>
  );
};

export default VolumeView;
