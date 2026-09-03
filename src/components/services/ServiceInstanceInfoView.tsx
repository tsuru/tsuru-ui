import React, { FunctionComponent } from "react";
import { ServiceInstanceInfo } from "../../types/serviceInstance";
import Link from "../../components/base/MuiLink";
import { Chip } from "@mui/material";
import Title from "../base/Title";
import Subtitle from "../base/Subtitle";

type ServiceInstanceInfoViewProps = {
  serviceInstance: ServiceInstanceInfo;
};

const ServiceInstanceInfoView: FunctionComponent<
  ServiceInstanceInfoViewProps
> = ({ serviceInstance }) => {
  return (
    <>
      {serviceInstance.Description && (
        <>
          <Title>Description</Title>
          {serviceInstance.Description}
        </>
      )}
      {serviceInstance.PlanName && (
        <>
          <Title>Plan</Title>
          {serviceInstance.PlanName} ({serviceInstance.PlanDescription})
        </>
      )}
      <Title>Ownership</Title>
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
          <Title>Tags</Title>
          {serviceInstance.Tags.map((t) => (
            <Chip label={t} variant="outlined" />
          ))}
        </>
      )}
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

export default ServiceInstanceInfoView;
