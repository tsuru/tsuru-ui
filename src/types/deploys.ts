type Deploy = {
  ID: string;
  App: string;
  Timestamp: string;
  Duration: number;
  Commit: string;
  Error: string;
  Image: string;
  Version: number;
  Log: string;
  User: string;
  Origin: string;
  CanRollback: boolean;
  Diff: string;
  Message: string;
};

export type { Deploy };
