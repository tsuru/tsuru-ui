type RPaasInfo = {
  name: string;
  description?: string;
  image?: string;
  team: string;
  tags: Array<string>;
  service: string;
  replicas?: number;
  pods?: Array<RPaasPod>;
  plan?: string;
  events?: Array<RPaasEvent>;
  dashboard: string;
  cluster?: string;
  pool?: string;
  certificates?: Array<RPaasCertificate>;
  binds?: Array<RPaasBind>;
  addresses?: Array<RPaasAddress>;
  autoscale?: RPaasAutoscale;
  blocks: Array<RPaasBlock>;
  routes: Array<RPaasRoute>;
  acls?: Array<RPaasAllowedUpstream>;
  flavors?: Array<string>;
  planOverride?: Record<string, any>;
  extraFiles?: Array<RPaasFile>;
};

type RPaasBlock = {
  server_name?: string;
  block_name: string;
  content: string;
  extend?: boolean;
};

type RPaasRoute = {
  server_name?: string;
  path: string;
  destination?: string;
  https_only?: boolean;
  content?: string;
};

type RPaasPod = {
  name: string;
  ip: string;
  host: string;
  status: string;
  createdAt: string;
  terminatedAt: string;

  restarts: number;
  ready: boolean;

  errors: Array<RPaasPodError>;
  metrics?: {
    cpu: string;
    memory: string;
  };
};

type RPaasPodError = {
  first: string;
  last: string;
  message: string;
  count: number;
};

type RPaasEvent = {
  first: string;
  last: string;
  type: string;
  reason: string;
  message: string;
  count: number;
};

type RPaasCertificate = {
  Name: string;
  ValidFrom: string;
  ValidUntil: string;
  DNSNames: Array<string>;
  PublicKeyAlgorithm: string;
  PublicKeyBitSize: number;

  IsManagedByCertManager: boolean;
  CertManagerIssuer?: string;
};

type RPaasBind = {
  name: string;
  host: string;
  upstreams?: Array<string>;
};

type RPaasAllowedUpstream = {
  host: string;
  port: number;
};

type RPaasAddressType = "cluster-internal" | "cluster-external";
type RPaasAddress = {
  type: RPaasAddressType;
  serviceName?: string;
  ingressName?: string;
  hostname?: string;
  ip?: string;
  status: string;
};

type RPaasAutoscale = {
  minReplicas?: number;
  maxReplicas?: number;
  schedules?: Array<RPaasAutoscaleSchedule>;
  cpu?: number;
  memory?: number;
  rps?: number;
};

type RPaasAutoscaleSchedule = {
  start: string;
  end: string;
  minReplicas: number;
};

type RPaasFile = {
  name: string;
  content: string;
};

type RPaasLogFilter = {
  pod?: string;
  container?: string;
};

type RPaasLogLine = {
  id?: number; // just for internal use
  date: string;
  message: string;
  pod: string;
  container: string;
};

export type {
  RPaasInfo,
  RPaasPod,
  RPaasEvent,
  RPaasCertificate,
  RPaasBind,
  RPaasAddress,
  RPaasAutoscale,
  RPaasAutoscaleSchedule,
  RPaasAllowedUpstream,
  RPaasBlock,
  RPaasRoute,
  RPaasFile,
  RPaasLogFilter,
  RPaasLogLine,
};
