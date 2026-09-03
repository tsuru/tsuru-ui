type Cluster = {
  name: string;
  addresses: Array<string>;
  provisioner: string;
  pools: Array<string>;
  custom_data: Record<string, string>;
  local: boolean;
  default: boolean;
  kubeConfig?: {
    cluster: object;
    user: object;
  };
  httpProxy?: string;

  cacert: string;
  clientcert: string;
  clientkey: string;
};

type Pool = {
  Name: string;
  Provisioner: string;
  Default: boolean;
  allowed: {
    plan: Array<string>;
    router: Array<string>;
    service: Array<string>;
    team: Array<string>;
    "volume-plan": Array<string>;
  };
};

type Platform = {
  Name: string;
  Disabled: boolean;
};

type Unit = {
  Name: string;
  Type: string;
  AppName: string;
  ProcessName: string;
  IP: string;
  InternalIP: string;
  Ready: boolean;
  Status: string;
  StatusReason: string;
  Restarts: number;
  CreatedAt: string;
  Version: number;
};

type EnvironmentVar = {
  name: string;
  value: string;
  public: boolean;
  managedBy?: string;
};

export type { Cluster, Pool, Platform, Unit, EnvironmentVar };
