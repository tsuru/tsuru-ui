import { FunctionComponent } from "react";
import {
  Timeline,
  Info,
  Link,
  ViewModule,
  Code,
  History,
  Terminal,
} from "@mui/icons-material";
import ResourceTabs, { TabConfig } from "../base/ResourceTabs";

export type RPaaSTabValue =
  | "resources"
  | "info"
  | "binds"
  | "pods"
  | "blocks"
  | "events"
  | "logs";

const tabConfigs: TabConfig<RPaaSTabValue>[] = [
  { value: "resources", label: "Resources", icon: <Timeline /> },
  { value: "info", label: "Info", icon: <Info /> },
  { value: "binds", label: "Binds", icon: <Link /> },
  { value: "pods", label: "Pods", icon: <ViewModule /> },
  { value: "blocks", label: "Blocks", icon: <Code /> },
  { value: "events", label: "Events", icon: <History /> },
  { value: "logs", label: "Logs", icon: <Terminal /> },
];

type RPaaSTabsProps = {
  value: RPaaSTabValue;
  onChange: (value: RPaaSTabValue) => void;
  podCount?: number;
  bindCount?: number;
};

const RPaaSTabs: FunctionComponent<RPaaSTabsProps> = ({
  value,
  onChange,
  podCount,
  bindCount,
}) => {
  const badgeCounts: Partial<Record<RPaaSTabValue, number>> = {};
  if (podCount !== undefined) badgeCounts.pods = podCount;
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

export const rpaasViewTabs: Record<string, RPaaSTabValue> = {
  resources: "resources",
  info: "info",
  binds: "binds",
  pods: "pods",
  blocks: "blocks",
  events: "events",
  logs: "logs",
};

export const tabToIndex: Record<RPaaSTabValue, number> = {
  resources: 0,
  info: 1,
  binds: 2,
  pods: 3,
  blocks: 4,
  events: 5,
  logs: 6,
};

export const indexToTab: Record<number, RPaaSTabValue> = {
  0: "resources",
  1: "info",
  2: "binds",
  3: "pods",
  4: "blocks",
  5: "events",
  6: "logs",
};

export default RPaaSTabs;
