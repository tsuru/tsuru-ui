export type CreateMethod = "cli" | "terraform" | "web";

export type WizardStep = "method" | "configure" | "instructions" | "success";

export type MethodOption = {
  id: CreateMethod;
  title: string;
  subtitle: string;
  description: string;
  recommended?: boolean;
  features: string[];
};

export type MethodMessages = {
  cli: string;
  terraform: string;
  web: string;
};

export type WizardStepConfig = {
  label: string;
  icon: React.ComponentType<{ sx?: any }>;
};
