import React, { FunctionComponent, useState } from "react";

import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "../../components/base/MuiLink";
import Loading from "../Loading";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";

import EventList from "../../components/events/EventList";
import { ACLServiceInstance } from "../../types/acl";
import ACLListRules from "../../components/acls/ACLListRules";
import ACLRulesPanel from "../../components/acls/ACLRulesPanel";
import { ServiceInstanceInfo } from "../../types/serviceInstance";
import { Chip } from "@mui/material";
import ACLBindList from "../../components/acls/ACLBindList";
import config from "../../config";
import Title from "../../components/base/Title";
import Subtitle from "../../components/base/Subtitle";
import { useTitle } from "react-use";
import DisplayError from "../../components/base/DisplayError";
import { useParams } from "react-router-dom";
import { useACLRules } from "../../hooks/acl";
import { useServiceInstance } from "../../hooks/serviceInstance";

type ACLViewProps = {
  service: string;
};

type ACLInfoProps = {
  aclInfo: ACLServiceInstance;
  serviceInstance: ServiceInstanceInfo;
};

const ACLInfo: FunctionComponent<ACLInfoProps> = ({
  aclInfo,
  serviceInstance,
}) => {
  return (
    <>
      <Title>Ownership</Title>
      <Subtitle>Created by</Subtitle>
      <span>{aclInfo.Creator}</span>
      <Subtitle>Teams</Subtitle>
      {joinElems(
        serviceInstance.Teams.map((team) => (
          <Link href={`/teams/${team}`} key={team}>
            {team === serviceInstance.TeamOwner ? team + " (owner)" : team}
          </Link>
        ))
      )}
      {serviceInstance.Tags && serviceInstance.Tags.length > 0 && (
        <>
          <Typography variant="subtitle1">Tags</Typography>
          {serviceInstance.Tags.map((t) => (
            <Chip label={t} variant="outlined" />
          ))}
        </>
      )}
    </>
  );
};

const ACLViewTabs: Record<string, number> = {
  rules: 0,
  info: 1,
  binds: 2,
  expandedRules: 3,
  events: 4,
};

const indexTabs: Record<number, string> = {};
for (const k in ACLViewTabs) {
  const newK: number = ACLViewTabs[k];
  indexTabs[newK] = k;
}

const ACLView: FunctionComponent<ACLViewProps> = (props) => {
  const params = useParams();
  const [tabIndex, setTabIndex] = useState<number>(
    params.tab ? ACLViewTabs[params.tab] : 0
  );

  const aclRules = useACLRules(props.service, params.instanceName as string, 0);
  const serviceInstance = useServiceInstance(
    props.service,
    params.instanceName as string
  );

  useTitle(`ACL: ${params.instanceName}`);

  const setIndex = (i: number) => {
    const subPath = indexTabs[i];
    /*eslint no-restricted-globals: ["error", "event"]*/
    window.history.replaceState(
      null,
      "",
      `${config.prefix}/services/${props.service}/${params.instanceName}/${subPath}`
    );
    setTabIndex(i);
  };

  if (aclRules.error) {
    return <DisplayError error={aclRules.error} />;
  }

  if (serviceInstance.error) {
    return <DisplayError error={serviceInstance.error} />;
  }

  if (
    aclRules.loading ||
    serviceInstance.loading ||
    !aclRules.value ||
    !serviceInstance.value
  ) {
    return <Loading />;
  }

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link
          underline="hover"
          color="inherit"
          href={`/services/${props.service}`}
        >
          ACLs
        </Link>
        <Typography color="text.primary">{params.instanceName}</Typography>
      </Breadcrumbs>

      <Tabs
        value={tabIndex}
        onChange={(event, value) => setIndex(value as number)}
        sx={{ borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Rules" />
        <Tab label="Info" />
        <Tab label="Binds" />
        <Tab label="Expanded rules" />
        <Tab label="Events" />
      </Tabs>

      <Box sx={{ p: 2 }}>
        {tabIndex === 0 && (
          <ACLRulesPanel
            service={props.service}
            instanceName={params.instanceName as string}
          />
        )}
        {tabIndex === 1 && (
          <ACLInfo
            aclInfo={aclRules.value.ServiceInstance}
            serviceInstance={serviceInstance.value}
          />
        )}
        {tabIndex === 2 && (
          <ACLBindList
            apps={aclRules.value.ServiceInstance.BindApps}
            jobs={aclRules.value.ServiceInstance.BindJobs}
          />
        )}
        {tabIndex === 3 && (
          <ACLListRules rules={aclRules.value.ExpandedRules} showSource />
        )}
        {tabIndex === 4 && (
          <EventList service={props.service + "/" + params.instanceName} />
        )}
      </Box>
    </>
  );
};

const joinElems = (elems: Array<React.JSX.Element>) => {
  const result = [];

  for (let i = 0; i < elems.length; i++) {
    result.push(elems[i]);
    if (i + 1 < elems.length) {
      result.push(<span key={"separator" + i}>, </span>);
    }
  }

  return result;
};

export default ACLView;
