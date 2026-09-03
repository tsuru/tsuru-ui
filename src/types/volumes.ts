type Volume = {
  Name: string;
  Pool: string;
  Plan: {
    Name: string;
    Opts: Record<string, string>;
  };
  TeamOwner: string;
  Status: string;
  Binds?: Array<VolumeBind>;
  Opts: Record<string, string>;
};

type VolumeBind = {
  ID: {
    App: string;
    MountPoint: string;
    Volume: string;
  };
  ReadOnly: boolean;
};

export type { Volume, VolumeBind };
