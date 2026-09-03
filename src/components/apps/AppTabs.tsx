import { FunctionComponent } from "react";
import {
  Timeline,
  Info,
  Link,
  ViewModule,
  CloudUpload,
  History,
  Terminal,
  Security,
} from "@mui/icons-material";
import ResourceTabs, { TabConfig } from "../base/ResourceTabs";

export type AppTabValue =
  | "resources"
  | "info"
  | "binds"
  | "acl"
  | "units"
  | "deploys"
  | "events"
  | "log";

const tabConfigs: TabConfig<AppTabValue>[] = [
  { value: "resources", label: "Resources", icon: <Timeline /> },
  { value: "info", label: "Info", icon: <Info /> },
  { value: "binds", label: "Binds", icon: <Link /> },
  { value: "units", label: "Units", icon: <ViewModule /> },
  { value: "deploys", label: "Deploys", icon: <CloudUpload /> },
  { value: "events", label: "Events", icon: <History /> },
  { value: "log", label: "Logs", icon: <Terminal /> },
];

type AppTabsProps = {
  value: AppTabValue;
  onChange: (value: AppTabValue) => void;
  unitCount?: number;
  bindCount?: number;
  containsACLTab?: boolean;
};

const AppTabs: FunctionComponent<AppTabsProps> = ({
  value,
  onChange,
  unitCount,
  bindCount,
  containsACLTab,
}) => {
  const badgeCounts: Partial<Record<AppTabValue, number>> = {};
  if (unitCount !== undefined) badgeCounts.units = unitCount;
  if (bindCount !== undefined) badgeCounts.binds = bindCount;

  const tabs: TabConfig<AppTabValue>[] = [...tabConfigs];
  if (containsACLTab) {
    tabs.splice(3, 0, {
      value: "acl",
      label: "ACLs",
      icon: <Security />,
    });
  }

  return (
    <ResourceTabs
      value={value}
      onChange={onChange}
      tabs={tabs}
      badgeCounts={badgeCounts}
    />
  );
};

export const appViewTabs: Record<string, AppTabValue> = {
  resources: "resources",
  info: "info",
  binds: "binds",
  units: "units",
  deploys: "deploys",
  events: "events",
  log: "log",
};

export const tabToIndex: Record<AppTabValue, number> = {
  resources: 0,
  info: 1,
  binds: 2,
  acl: 3,
  units: 4,
  deploys: 5,
  events: 6,
  log: 7,
};

export const indexToTab = Object.entries(tabToIndex).reduce(
  (obj, [key, value]) => {
    obj[value] = key as AppTabValue;
    return obj;
  },
  {} as Record<number, AppTabValue>
);

export default AppTabs;
