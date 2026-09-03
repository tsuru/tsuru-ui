import { FunctionComponent } from "react";
import { Timeline, Info, Link, History } from "@mui/icons-material";
import ResourceTabs, { TabConfig } from "../base/ResourceTabs";

export type DBaaSTabValue = "resources" | "info" | "binds" | "events";

const tabConfigs: TabConfig<DBaaSTabValue>[] = [
  { value: "resources", label: "Resources", icon: <Timeline /> },
  { value: "info", label: "Info", icon: <Info /> },
  { value: "binds", label: "Binds", icon: <Link /> },
  { value: "events", label: "Events", icon: <History /> },
];

type DBaaSTabsProps = {
  value: DBaaSTabValue;
  onChange: (value: DBaaSTabValue) => void;
  bindCount?: number;
};

const DBaaSTabs: FunctionComponent<DBaaSTabsProps> = ({
  value,
  onChange,
  bindCount,
}) => {
  const badgeCounts: Partial<Record<DBaaSTabValue, number>> = {};
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

export const dbaasViewTabs: Record<string, DBaaSTabValue> = {
  resources: "resources",
  info: "info",
  binds: "binds",
  events: "events",
};

export const tabToIndex: Record<DBaaSTabValue, number> = {
  resources: 0,
  info: 1,
  binds: 2,
  events: 3,
};

export const indexToTab: Record<number, DBaaSTabValue> = {
  0: "resources",
  1: "info",
  2: "binds",
  3: "events",
};

export default DBaaSTabs;
