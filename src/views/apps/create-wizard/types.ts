import type {
  CreateMethod,
  WizardStep,
} from "../../../components/wizard/types";

export type { CreateMethod, WizardStep };

export type AppFormData = {
  createMethod: CreateMethod;
  appName: string;
  team: string;
  pool: string;
  poolGroup: string;
  platform: string;
  tags: string[];
  suggestedSuffix?: string;
};
