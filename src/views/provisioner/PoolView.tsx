import {
  Breadcrumbs,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { FunctionComponent } from "react";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import {
  Folder,
  Http,
  Memory,
  MiscellaneousServices,
  People,
} from "@mui/icons-material";
import Subtitle from "../../components/base/Subtitle";
import DisplayError from "../../components/base/DisplayError";
import { useParams } from "react-router-dom";
import { usePool } from "../../hooks/provisioner";
import { useTitle } from "react-use";

const PoolView: FunctionComponent = () => {
  const params = useParams();
  useTitle(`Pool: ${params.id}`);

  const { value, loading, error } = usePool(params.id as string);
  if (error) {
    return <DisplayError error={error} />;
  }

  if (loading || !value) {
    return <Loading />;
  }
  const teamElems = (value.allowed.team || []).map((team) => (
    <ListItemButton href={`/admin/teams/${team}`} key={team}>
      <ListItemIcon>
        <People />
      </ListItemIcon>
      <ListItemText primary={team} />
    </ListItemButton>
  ));

  const planElems = (value.allowed.plan || []).map((plan) => (
    <ListItemButton href={`/admin/plans/${plan}`} key={plan}>
      <ListItemIcon>
        <Memory />
      </ListItemIcon>
      <ListItemText primary={plan} />
    </ListItemButton>
  ));

  const serviceElems = (value.allowed.service || []).map((service) => (
    <ListItemButton href={`/admin/services/${service}`} key={service}>
      <ListItemIcon>
        <MiscellaneousServices />
      </ListItemIcon>
      <ListItemText primary={service} />
    </ListItemButton>
  ));

  const routerElems = (value.allowed.router || []).map((router) => (
    <ListItemButton href={`/admin/routers/${router}`} key={router}>
      <ListItemIcon>
        <Http />
      </ListItemIcon>
      <ListItemText primary={router} />
    </ListItemButton>
  ));

  const volumePlanElems = (value.allowed["volume-plan"] || []).map(
    (volumePlan) => (
      <ListItemButton
        href={`/admin/volume-plans/${volumePlan}`}
        key={volumePlan}
      >
        <ListItemIcon>
          <Folder />
        </ListItemIcon>
        <ListItemText primary={volumePlan} />
      </ListItemButton>
    )
  );

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href="/admin/pools">
          Pools
        </Link>
        <Typography>{params.id}</Typography>
      </Breadcrumbs>

      <Subtitle>Provisioner</Subtitle>
      <span>{value.Provisioner}</span>

      <Subtitle>Allowed teams</Subtitle>
      <List>{teamElems}</List>

      <Subtitle>Allowed plans</Subtitle>
      <List>{planElems}</List>

      <Subtitle>Allowed services</Subtitle>
      <List>{serviceElems}</List>

      <Subtitle>Allowed routers</Subtitle>
      <List>{routerElems}</List>

      <Subtitle>Allowed volume plans</Subtitle>
      <List>{volumePlanElems}</List>
    </>
  );
};

export default PoolView;
