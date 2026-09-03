type ACLRules = {
  ServiceInstance: ACLServiceInstance;
  ExpandedRules: Array<ACLRule>;
  RulesSync: Array<ACLRuleSyncInfo>;
};

type ACLServiceInstance = {
  InstanceName: string;
  Creator: string;
  EventID: string;
  BindApps: Array<string>;
  BindJobs: Array<string>;
  BaseRules: Array<ACLServiceRule>;
};

type ACLServiceRule = ACLRule & {
  Creator: string;
  EventID: string;
};

type ACLRule = {
  RuleID: string;
  RuleName: string;
  Source: ACLRuleType;
  Destination: ACLRuleType;
  Removed: boolean;
  Metadata: Record<string, string>;
  Created: string;
  Creator: string;
};

type ACLRuleType = {
  TsuruApp?: {
    AppName: string;
    PoolName?: string;
  };
  TsuruJob?: {
    JobName: string;
  };
  KubernetesService?: {
    Namespace: string;
    ServiceName: string;
    ClusterName: string;
  };
  ExternalDNS?: {
    Name: string;
    Ports: Array<ACLProtoPort>;
  };
  ExternalIP?: {
    IP: string;
    Ports: Array<ACLProtoPort>;
  };
  RpaasInstance?: {
    ServiceName: string;
    Instance: string;
  };
};

type ACLProtoPort = {
  Protocol: string;
  Port: number;
};

type ACLRuleSyncInfo = {
  SyncID: string;
  RuleID: string;
  Engine: string;
  StartTime: string;
  EndTime: string;
  PingTime: string;
  Running: boolean;
  Syncs: Array<RuleSyncData>;
};

type RuleSyncData = {
  StartTime: string;
  EndTime: string;
  Successful: boolean;
  Removed: boolean;
  Error: string;
  SyncResult: string;
};

export type {
  ACLRules,
  ACLServiceInstance,
  ACLRule,
  ACLRuleSyncInfo,
  ACLRuleType,
  ACLProtoPort,
};
