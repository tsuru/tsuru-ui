import { Metadata } from "./metadata";
import { Unit } from "./provisioner";
import { ServiceBind } from "./serviceInstance";
import { VolumeBind } from "./volumes";

type App = {
  name: string;
  cluster?: string;
  pool: string;
  platform: string;
  description: string;
  owner: string;
  teamowner: string;
  teams: Array<string>;
  tags?: Array<string>;
  plan: {
    name: string;
  };
  quota: {
    limit: number;
    inuse: number;
  };
  deploys: number;
  routers: Array<AppRouter>;
  internalAddresses?: Array<AppInternalAddress>;
  autoscale?: Array<AppAutoscale>;
  units: Array<Unit>;
  unitsMetrics: Array<UnitMetric>;
  cname: Array<string>;
  serviceInstanceBinds: Array<ServiceBind>;
  metadata: Metadata;
  volumeBinds?: Array<VolumeBind>;
  processes?: Array<AppProcess>;
};

type AppProcess = {
  name: string;
  plan: string;
};

type AppInternalAddress = {
  Domain: string;
  Protocol: string;
  Port: number;
  TargetPort?: number;
  Version: string;
  Process: string;
};

type UnitMetric = {
  ID: string;
  CPU: string;
  Memory: string;
};

type AppRouter = {
  name: string;
  addresses: Array<string>;
  status: string;
  "status-detail": string;
};

type AppAutoscale = {
  process: string;
  minUnits: number;
  maxUnits: number;
  averageCPU?: string;
  schedules?: Array<AppAutoscaleSchedule>;
  prometheus?: Array<AppAutoscalePrometheus>;
  version: number;
  behavior?: Behavior;
};

type Behavior = {
  scaleDown?: ScaleDown;
};

type ScaleDown = {
  percentagePolicyValue?: number;
  unitsPolicyValue?: number;
  stabilizationWindow?: number;
};

type AppAutoscaleSchedule = {
  name?: string;
  minReplicas: number;
  start: string;
  end: string;
  timezone: string;
};

type AppAutoscalePrometheus = {
  name: string;
  threshold: number;
  query: string;
  prometheusAddress: string;
};

type AppLogLine = {
  id: number; // just for internal use
  Date: string;
  Message: string;
  Name: string;
  Source: string;
  Type: string;
  Unit: string;
};

type AppLogFilter = {
  unit?: string;
  source?: string;
};

type UnitsResume = {
  ready: number;
  created: number;
  started: number;
  starting: number;
  stopped: number;
  error: number;
  total: number;
};
type AppResume = {
  name: string;
  platform: string;
  teamowner: string;
  pool: string;
  units: UnitsResume;
  plan: {
    name: string;
  };
  tags: Array<string>;
};

type AppCertificates = {
  routers: Record<string, AppRouterCertificates>;
};

type AppRouterCertificates = {
  cnames: Record<string, AppRouterCertificateCNAME>;
};

type AppRouterCertificateCNAME = {
  certificate: string;
  issuer: string;
};

export type {
  App,
  AppCertificates,
  AppRouterCertificateCNAME,
  Unit,
  UnitMetric,
  AppRouter,
  AppInternalAddress,
  AppAutoscale,
  AppAutoscaleSchedule,
  AppAutoscalePrometheus,
  AppLogLine,
  AppLogFilter,
  AppResume,
  UnitsResume,
};
