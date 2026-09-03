import { FunctionComponent } from "react";
import Loading from "../../views/Loading";
import DisplayError from "../base/DisplayError";
import { useJobEnvironmentVars } from "../../hooks/jobs";
import EnvironmentVariablesTable from "../provisioner/EnvironmentVariablesTable";

type JobEnvironmentVariablesProps = {
  job: string;
};

const JobEnvironmentVariables: FunctionComponent<
  JobEnvironmentVariablesProps
> = ({ job }) => {
  const envs = useJobEnvironmentVars(job);

  if (envs.error) {
    return <DisplayError error={envs.error} />;
  }

  if (envs.loading || !envs.value) {
    return <Loading />;
  }
  return <EnvironmentVariablesTable envs={envs.value} />;
};

export default JobEnvironmentVariables;
