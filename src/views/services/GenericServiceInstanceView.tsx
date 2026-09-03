import { FunctionComponent, useState } from "react";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import EventList from "../../components/events/EventList";
import config from "../../config";
import { useParams } from "react-router-dom";
import { useTitle } from "react-use";
import DisplayError from "../../components/base/DisplayError";
import { useServiceInstance } from "../../hooks/serviceInstance";
import ServiceInstanceInfoView from "../../components/services/ServiceInstanceInfoView";
import ServiceInstanceBindList from "../../components/services/ServiceInstanceBindList";

const GenericServiceInstanceViewTabs: Record<string, number> = {
  info: 0,
  binds: 1,
  events: 2,
};

const indexTabs: Record<number, string> = {};
for (const k in GenericServiceInstanceViewTabs) {
  const newK: number = GenericServiceInstanceViewTabs[k];
  indexTabs[newK] = k;
}

const GenericServiceInstanceView: FunctionComponent = () => {
  const params = useParams();

  const [tabIndex, setTabIndex] = useState<number>(
    params.tab ? GenericServiceInstanceViewTabs[params.tab] : 0
  );

  useTitle(`Service: ${params.service}/${params.instanceName}`);

  const serviceInstance = useServiceInstance(
    params.service as string,
    params.instanceName as string
  );

  const setIndex = (i: number) => {
    const subPath = indexTabs[i];
    /*eslint no-restricted-globals: ["error", "event"]*/
    window.history.replaceState(
      null,
      "",
      `${config.prefix}/services/${params.service}/${params.instanceName}/${subPath}`
    );
    setTabIndex(i);
  };

  if (serviceInstance.error) {
    return <DisplayError error={serviceInstance.error} />;
  }

  if (serviceInstance.loading || !serviceInstance.value) {
    return <Loading />;
  }

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href={`/services`}>
          Services
        </Link>
        <Typography color="text.primary">{params.service}</Typography>
        <Typography color="text.primary">{params.instanceName}</Typography>
      </Breadcrumbs>

      <Tabs
        value={tabIndex}
        onChange={(event, value) => setIndex(value as number)}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Info" />
        <Tab label="Binds" />
        <Tab label="Events" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {tabIndex === 0 && (
          <ServiceInstanceInfoView serviceInstance={serviceInstance.value} />
        )}
        {tabIndex === 1 && (
          <ServiceInstanceBindList
            apps={serviceInstance.value.Apps}
            jobs={serviceInstance.value.Jobs}
          />
        )}
        {tabIndex === 2 && (
          <EventList service={params.service + "/" + params.instanceName} />
        )}
      </Box>
    </>
  );
};

export default GenericServiceInstanceView;
