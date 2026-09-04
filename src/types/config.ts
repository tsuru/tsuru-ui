import { App } from "./app";
import { Job, JobInfo } from "./jobs";

type Config = {
  server: string;
  docsURL?: string;
  prefix: string;
  services?: Array<ConfigService>;
  appPoolGroups?: Array<PoolGroup>;
  grafanaURLForApp?: (app: App, iframe: boolean) => string;
  grafanaURLForRPaaS?: (
    cluster: string,
    service: string,
    instance: string,
    iframe: boolean
  ) => string;
  grafanaURLForJob?: (jobInfo: JobInfo, iframe: boolean) => string;
  grafanaLongTermURLForApp?: (app: App) => string;
  cloudProviderLogsForAppUnit?: (app: App, unit?: string) => string;
  cloudProviderLogsForRPaaS?(
    pool: string,
    service: string,
    instance: string,
    pod?: string,
    container?: string
  ): string;
  cloudProviderLogsForJob?(job?: Job): string;
  grafanaLongTermURLForRPaaS?(
    cluster: string,
    service: string,
    instance: string
  ): string;
  groupURL?: (group: string) => string;

  // Pools whose apps count as production on the apps dashboard, which splits
  // unhealthy apps into production and non-production. Pool naming is a
  // per-deployment convention, so without this the dashboard shows a single
  // unhealthy group rather than guessing.
  productionPoolRegex?: RegExp;

  supportMessage?: string;
  feedbackLink?: string;
  platformGuides?: Record<string, string>;
  internalDomains?: Array<string>;
  outBoundIPs?(cluster: string): Promise<string>;
  certificateIssuers?: Array<IssuerOption>;
  cnameReverseProxyDisclaimer?: ReverseProxyDisclaimer;
  cnameDnsDocs?: DocReference;
  cnameCertDocs?: DocReference;
  cnameDnsPortalURL?: string;
};

type ReverseProxyDisclaimer = {
  title: string;
  conditions: Array<string>;
  note: string;
};

type DocReference = {
  title: string;
  description: string;
  url: string;
  checkboxLabel: string;
};

type IssuerOption = {
  value: string;
  label: string;
  description: string;
  cost: string;
  recommended?: boolean;
};

type ConfigService = {
  name: string;
  title: string;
  engine: "generic" | "rpaas" | "acl";
  icon: string;
  additionalServices?: Array<string>;
  hrefForInstance?: (service: string, instance: string) => string;
};

type PoolGroup = {
  name: string;
  description: string;
  regex: RegExp;
  ignoreRegex?: RegExp;
  suggestedSuffix?: string;
};

export type {
  Config,
  ConfigService,
  IssuerOption,
  ReverseProxyDisclaimer,
  DocReference,
};
