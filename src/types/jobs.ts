import { Metadata } from "./metadata";
import { EnvironmentVar, Unit } from "./provisioner";
import { ServiceBind } from "./serviceInstance";

type Job = {
  name: string;
  teams?: Array<string>;
  teamOwner: string;
  owner: string;
  plan: {
    name: string;
  };
  metadata: Metadata;
  pool: string;
  description: string;
  spec: {
    schedule: string;
    manual: boolean;
    backoffLimit?: number;
    activeDeadlineSeconds?: number;
    parallelism?: number;
    completions?: number;
    concurrencyPolicy?: string;

    container: {
      image: string;
      command: Array<string>;
    };

    envs: Array<EnvironmentVar>;
  };
};

type JobInfo = {
  job: Job;
  cluster?: string;
  units?: Array<Unit>;
  serviceInstanceBinds?: Array<ServiceBind>;
};

export type { Job, JobInfo };
