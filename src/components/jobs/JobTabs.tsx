import { FunctionComponent } from "react";
import {
  Timeline,
  Info,
  Link,
  ViewModule,
  History,
  Terminal,
} from "@mui/icons-material";
import ResourceTabs, { TabConfig } from "../base/ResourceTabs";

export type JobTabValue =
  | "resources"
  | "info"
  | "binds"
  | "units"
  | "events"
  | "log";

const tabConfigs: TabConfig<JobTabValue>[] = [
  { value: "resources", label: "Resources", icon: <Timeline /> },
  { value: "info", label: "Info", icon: <Info /> },
  { value: "binds", label: "Binds", icon: <Link /> },
  { value: "units", label: "Runs", icon: <ViewModule /> },
  { value: "events", label: "Events", icon: <History /> },
  { value: "log", label: "Logs", icon: <Terminal /> },
];

type JobTabsProps = {
  value: JobTabValue;
  onChange: (value: JobTabValue) => void;
  unitCount?: number;
  bindCount?: number;
};

const JobTabs: FunctionComponent<JobTabsProps> = ({
  value,
  onChange,
  unitCount,
  bindCount,
}) => {
  const badgeCounts: Partial<Record<JobTabValue, number>> = {};
  if (unitCount !== undefined) badgeCounts.units = unitCount;
  if (bindCount !== undefined) badgeCounts.binds = bindCount;

  return (
    <ResourceTabs
      value={value}
      onChange={onChange}
      tabs={tabConfigs}
      badgeCounts={badgeCounts}
    />
  );
};

export const jobViewTabs: Record<string, JobTabValue> = {
  resources: "resources",
  info: "info",
  binds: "binds",
  units: "units",
  events: "events",
  log: "log",
};

export default JobTabs;
