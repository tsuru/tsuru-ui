import {
  Breadcrumbs,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Fragment, FunctionComponent } from "react";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import WorkspacesIcon from "@mui/icons-material/Workspaces";
import { Https } from "@mui/icons-material";
import Subtitle from "../../components/base/Subtitle";
import Title from "../../components/base/Title";
import DisplayError from "../../components/base/DisplayError";
import { useParams } from "react-router-dom";
import { useCluster } from "../../hooks/provisioner";
import { useTitle } from "react-use";

const ClusterView: FunctionComponent = () => {
  const params = useParams();
  useTitle(`Cluster: ${params.id}`);

  const { value, loading, error } = useCluster(params.id as string);

  if (error) {
    return <DisplayError error={error} />;
  }

  if (loading || !value) {
    return <Loading />;
  }

  const poolsElems = (value.pools || []).map((pool) => (
    <ListItemButton href={`/admin/pools/${pool}`} key={pool}>
      <ListItemIcon>
        <WorkspacesIcon />
      </ListItemIcon>
      <ListItemText primary={pool} />
    </ListItemButton>
  ));

  const addressesElems = (value.addresses || []).map((address) => (
    <ListItemButton href={address} key={address}>
      <ListItemIcon>
        <Https />
      </ListItemIcon>
      <ListItemText primary={address} />
    </ListItemButton>
  ));

  const customDataElems = Object.keys(value.custom_data).map((key) => (
    <Fragment key={key}>
      <Subtitle>{key}</Subtitle>
      <pre>{value.custom_data[key]}</pre>
    </Fragment>
  ));

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href="/admin/clusters">
          Clusters
        </Link>
        <Typography>{params.id}</Typography>
      </Breadcrumbs>

      <Subtitle>Provisioner</Subtitle>
      <span>{value.provisioner}</span>

      <Subtitle>Addresses</Subtitle>
      <List>{addressesElems}</List>

      <Subtitle>Pools</Subtitle>
      <List>{poolsElems}</List>

      <Title>Options (custom data)</Title>
      {customDataElems}
    </>
  );
};

export default ClusterView;
