import { FunctionComponent } from "react";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Typography from "@mui/material/Typography";
import Link from "../../components/base/MuiLink";
import Chip from "@mui/material/Chip";

import Loading from "../Loading";
import Console from "../../components/base/Console";
import DeployLogViewer from "../../components/deploys/DeployLogViewer";
import time from "../../utils/time";
import Subtitle from "../../components/base/Subtitle";
import Title from "../../components/base/Title";
import { useParams } from "react-router-dom";
import DisplayError from "../../components/base/DisplayError";
import { useAppDeploy } from "../../hooks/app";
import { useTitle } from "react-use";

const AppDeployInfo: FunctionComponent = () => {
  const params = useParams();
  const deploy = useAppDeploy(params.deployID as string);
  useTitle(`Deploy: ${params.deployID}`);

  if (deploy.error) {
    return <DisplayError error={deploy.error} />;
  }

  if (deploy.loading || !deploy.value) {
    return <Loading />;
  }

  const primaryText = time.humanDateWithWeek(deploy.value.Timestamp);
  const secondaryText = `by ${
    deploy.value.User
  }, duration: ${time.humanDuration(
    deploy.value.Duration / 1000000000 // deploy.Duration is a nanosecond
  )}, using ${deploy.value.Origin}`;
  const chip = (
    <Chip
      label={deploy.value.Error === "" ? `V${deploy.value.Version}` : "Error"}
      size="small"
      variant="outlined"
      color={deploy.value.Error === "" ? "success" : "error"}
    />
  );

  return (
    <>
      <Breadcrumbs aria-label="breadcrumb" sx={{ marginBottom: "10px" }}>
        <Link underline="hover" color="inherit" href="/apps">
          Apps
        </Link>
        <Link underline="hover" color="inherit" href={`/apps/${params.app}`}>
          {params.app}
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href={`/apps/${params.app}/deploys`}
        >
          Deploys
        </Link>
        {primaryText && (
          <Typography color="text.primary">{primaryText}</Typography>
        )}
      </Breadcrumbs>

      <Title>
        {deploy.value.Message
          ? deploy.value.Message
          : `Deploy ${deploy.value.ID}`}
      </Title>
      <Subtitle>
        {secondaryText} {chip}
      </Subtitle>

      <Subtitle>App</Subtitle>
      <span>{deploy.value.App}</span>

      {deploy.value.Image !== "" && (
        <>
          <Subtitle>Generated image</Subtitle>
          <span>{deploy.value.Image}</span>
        </>
      )}

      {deploy.value.Error && (
        <>
          <Subtitle>Error</Subtitle>
          <Console>{deploy.value.Error}</Console>
        </>
      )}
      <Subtitle>Logs</Subtitle>
      <DeployLogViewer log={deploy.value.Log} />
    </>
  );
};

export default AppDeployInfo;
