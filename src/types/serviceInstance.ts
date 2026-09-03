type ServiceInstance = {
  name: string;
  description: string;
  jobs: Array<string> | null;
  parameters: Record<string, any>;
  plan_name: string;
  pool: string;
  service_name: string;
  tags: Array<string>;
  team_owner: string;
  teams: Array<string>;
};

type ServiceItem = {
  service: string;
  service_instances: Array<ServiceInstance>;
};

type ServiceInstanceInfo = {
  Apps?: Array<string>;
  Jobs?: Array<string>;
  Teams: Array<string>;
  TeamOwner: string;
  Description: string;
  PlanName: string;
  PlanDescription: string;
  Pool: string;
  CustomInfo: Record<string, string>;
  Tags: Array<string>;
  Parameters: Record<string, any>;
};

type ServiceBind = {
  instance: string;
  plan: string;
  service: string;
};

type ServicePlan = {
  Name: string;
  Description: string;
};

export type {
  ServiceInstance,
  ServiceInstanceInfo,
  ServiceBind,
  ServicePlan,
  ServiceItem,
};
