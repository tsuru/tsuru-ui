type DeployLogLine = {
  content: string;
  type: "arrow" | "text";
  timestamp?: string;
};

type DeployLogSection = {
  title: string;
  lines: DeployLogLine[];
  hasError: boolean;
};

type ParsedDeployLog = {
  sections: DeployLogSection[];
  prelude: string[];
};

export type { DeployLogLine, DeployLogSection, ParsedDeployLog };
