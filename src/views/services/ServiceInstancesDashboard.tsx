import { ChangeEvent, FunctionComponent, ReactNode, useState } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import debounce from "lodash.debounce";

import Loading from "../Loading";
import { ServiceInstance } from "../../types/serviceInstance";
import { hrefForInstance } from "../../utils/services";

import ServiceInstanceCard from "../../components/services/ServiceInstanceCard";
import TableServiceInstanceList from "../../components/services/TableServiceInstanceList";
import DisplayError from "../../components/base/DisplayError";
import { useServiceInstances } from "../../hooks/serviceInstance";
import { useTitle } from "react-use";
import { Button, ButtonGroup } from "@mui/material";
import { Add, Apps, List } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

type ServiceInstancesDashboardProps = {
  services?: Array<string>;
  excludeServices?: Array<string>;
  label: string;
  showServiceName?: boolean;
  showCreateButton?: boolean;
  showPool?: boolean;

  iconForInstance?: (serviceInstance: ServiceInstance) => ReactNode;
};

const ServiceInstancesDashboard: FunctionComponent<
  ServiceInstancesDashboardProps
> = (props) => {
  const initialParams = new URLSearchParams(window.location.search);
  const [searchText, setSearchText] = useState<string>(
    initialParams.get("search") || ""
  );
  const [visualization, setVisualization] = useState<string>(
    initialParams.get("visualization") ||
      window.localStorage.tsuruServiceInstancesVisualization ||
      "list"
  );

  useTitle(props.label);
  const navigate = useNavigate();

  const { value, loading, error } = useServiceInstances();

  if (error) {
    return <DisplayError error={error} />;
  }

  if (loading) {
    return <Loading />;
  }

  let allowedServices: Record<string, boolean> | null = null;
  let excludeServices: Record<string, boolean> | null = null;

  if (props.services) {
    allowedServices = {};
    for (const allowedService of props.services) {
      allowedServices[allowedService] = true;
    }
  }

  if (props.excludeServices) {
    excludeServices = {};
    for (const excludedService of props.excludeServices) {
      excludeServices[excludedService] = true;
    }
  }

  let instances: Array<ServiceInstance> = [];

  for (const service of value) {
    if (allowedServices && !allowedServices[service.service]) {
      continue;
    }

    if (excludeServices && excludeServices[service.service]) {
      continue;
    }

    if (service.service_instances) {
      instances = instances.concat(service.service_instances);
    }
  }

  instances.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (b.name < a.name) {
      return 1;
    }

    return 0;
  });

  const replaceHistory = (newSearchText: string, newVisualization: string) => {
    window.history.replaceState(
      null,
      "",
      `?search=${newSearchText}&visualization=${newVisualization}`
    );
  };

  let iconForInstance = (instance: ServiceInstance): ReactNode => null;
  if (props.iconForInstance) {
    iconForInstance = props.iconForInstance;
  }

  if (searchText !== "") {
    instances = instances.filter((instance) =>
      instance.name.includes(searchText)
    );
  }

  let displayElem: ReactNode = null;

  if (visualization === "cards") {
    const elems = instances.map((instance) => {
      const [href, target] = hrefForInstance(
        instance.service_name,
        instance.name
      );
      return (
        <ServiceInstanceCard
          key={instance.service_name + "/" + instance.name}
          name={instance.name}
          service={instance.service_name}
          description={instance.description || ""}
          href={href}
          target={target}
          icon={iconForInstance(instance)}
          showServiceName={props.showServiceName}
        />
      );
    });
    displayElem = (
      <Stack direction="row" useFlexGap flexWrap="wrap" spacing={2}>
        {elems}
      </Stack>
    );
  } else {
    displayElem = (
      <TableServiceInstanceList
        rows={instances}
        showServiceName={props.showServiceName}
        iconForInstance={props.iconForInstance}
        showPool={props.showPool}
      />
    );
  }

  const onSearchChanged = (v: ChangeEvent<HTMLInputElement>) => {
    setSearchText(v.target.value);
    replaceHistory(v.target.value, visualization);
  };

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Typography>{props.label}</Typography>
      </Breadcrumbs>

      <Stack
        direction="row"
        useFlexGap
        spacing={2}
        sx={{ paddingBottom: "10px" }}
      >
        {props.showCreateButton && (
          <Button
            href="#"
            size="small"
            variant="contained"
            onClick={(e) => {
              e.preventDefault();
              navigate("_create");
            }}
          >
            <Add /> Create
          </Button>
        )}

        <TextField
          id="outlined-search"
          type="search"
          placeholder="Search"
          defaultValue={searchText}
          fullWidth
          size="small"
          autoFocus
          sx={{ flex: 1 }}
          onChange={debounce(onSearchChanged, 500)}
        />

        <ButtonGroup variant="contained" aria-label="visualization">
          <Button
            variant={visualization === "cards" ? "contained" : "outlined"}
            size="small"
            onClick={() => {
              setVisualization("cards");
              window.localStorage.tsuruServiceInstancesVisualization = "cards";
              replaceHistory(searchText, "cards");
            }}
          >
            <Apps />
          </Button>
          <Button
            variant={visualization === "list" ? "contained" : "outlined"}
            size="small"
            onClick={() => {
              setVisualization("list");
              window.localStorage.tsuruServiceInstancesVisualization = "list";
              replaceHistory(searchText, "list");
            }}
          >
            <List />
          </Button>
        </ButtonGroup>
      </Stack>

      {displayElem}
    </>
  );
};

export default ServiceInstancesDashboard;
