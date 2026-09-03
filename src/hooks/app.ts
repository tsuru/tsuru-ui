import { useAsync } from "react-use";
import { useFetch } from "../contexts/auth";
import {
  App,
  AppCertificates,
  AppResume,
  Unit,
  UnitsResume,
  AppAutoscaleSchedule,
  AppAutoscalePrometheus,
} from "../types/app";
import { Deploy } from "../types/deploys";
import { useState, useCallback } from "react";
import { truncateStream } from "./truncate";

type appForm = {
  app: string;
  team: string;
  pool: string;
  platform: string;
  tags: string[];
};

const useCreateApp = (app: appForm, onFinish: () => void) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/apps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: app.app,
        teamowner: app.team,
        pool: app.pool,
        platform: app.platform,
        tags: app.tags,
      }),
    });

    if (response.status > 299) {
      throw new Error(
        `could not create app, ${response.statusText} (${response.status})`
      );
    }

    const result = await response.json();
    onFinish();
    return result;
  }, [fetch, app]);
};

const useAppStreamAction = (
  path: string,
  requestOptions: RequestInit,
  dryRun: boolean,
  args: Array<any> = []
) => {
  const fetch = useFetch();
  const [stream, setStream] = useState<string>("");

  const action = useAsync(async () => {
    if (dryRun) {
      return;
    }

    const response = await fetch(path, requestOptions);

    if (response.status > 299) {
      throw new Error(
        `could not perform action, ${response.statusText} (${response.status})`
      );
    }
    if (!response.body) {
      throw new Error("response body is null");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer: string = "";

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        if (buffer) {
          const message = JSON.parse(buffer);
          setStream((prev) => truncateStream(prev + message["Message"]));
        }
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.trim()) {
          const message = JSON.parse(line);
          setStream((prev) => truncateStream(prev + message["Message"]));
        }
      }
    }

    return true;
  }, [fetch, path, dryRun, ...args]);

  return { action, stream };
};

const useAppDeploys = (app: string) => {
  const fetch = useFetch();
  const [deploys, setDeploys] = useState<Deploy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refetch = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useAsync(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/deploys?app=${app}`);
      if (response.status === 204) {
        setDeploys([]);
        return;
      }
      if (response.status > 299) {
        throw new Error(
          `could not fetch deploys, ${response.statusText} (${response.status})`
        );
      }
      const data = (await response.json()) as Deploy[];
      setDeploys(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [fetch, app, refreshKey]);

  return { value: deploys, loading, error, refetch };
};

const useAppDeploy = (deployID: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/deploys/${deployID}`);
    if (response.status > 299) {
      throw new Error(
        `could not fetch deploy, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Deploy;
  }, [fetch, deployID]);
};

const useAppsSimplified = () => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/apps?simplified=true`);
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch apps, ${response.statusText} (${response.status})`
      );
    }
    const apps: Array<App> = await response.json();
    return apps;
  });
};

const useAppsResume = () => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/apps?extended=true`);
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch apps, ${response.statusText} (${response.status})`
      );
    }
    const fullApps: Array<App> = await response.json();
    fullApps.sort((a: App, b: App) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }

      return 0;
    });
    const apps: Array<AppResume> = fullApps.map((fullApp) => ({
      name: fullApp.name,
      platform: fullApp.platform,
      teamowner: fullApp.teamowner,
      pool: fullApp.pool,
      plan: fullApp.plan,
      tags: fullApp.tags || [],
      units: minififyUnits(fullApp.units),
    }));

    return apps;
  }, [fetch]);
};

const useAppsUnits = () => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/apps?extended=true`);
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch apps, ${response.statusText} (${response.status})`
      );
    }

    const fullApps: Array<App> = await response.json();

    let units: Array<Unit> = [];
    for (const app of fullApps) {
      units = units.concat(app.units);
    }

    return units;
  }, [fetch]);
};

const useApp = (appName: string, refreshKey?: number) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/apps/${appName}`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch app, ${response.statusText} (${response.status})`
      );
    }

    const data: App = await response.json();
    return data;
  }, [fetch, appName, refreshKey]);
};

const useAppCertificates = (appName: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/1.24/apps/${appName}/certificate`, {
      disableErrorOnValidation: true,
    });
    if (response.status === 404) {
      return null;
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch app, ${response.statusText} (${response.status})`
      );
    }

    const data: AppCertificates = await response.json();
    return data;
  }, [fetch, appName]);
};

function minififyUnits(units: Array<Unit>): UnitsResume {
  return {
    total: units.length,
    ready: units.filter((unit) => unit.Ready).length,
    error: units.filter((unit) => unit.Status === "error").length,
    created: units.filter((unit) => unit.Status === "created").length,
    starting: units.filter((unit) => unit.Status === "starting").length,
    started: units.filter((unit) => unit.Status === "started").length,
    stopped: units.filter((unit) => unit.Status === "stopped").length,
  };
}

// Scale hooks and types
export interface AutoscaleConfig {
  process: string;
  minUnits: number;
  maxUnits: number;
  cpuTarget: number;
  schedules?: AppAutoscaleSchedule[];
  prometheusMetrics?: AppAutoscalePrometheus[];
}

const useAppScaleManual = (
  appName: string,
  process: string,
  units: number,
  dryRun: boolean
) => {
  const action = units > 0 ? "add" : "remove";
  const absUnits = Math.abs(units);

  return useAppStreamAction(
    `/apps/${appName}/units`,
    {
      method: action === "add" ? "PUT" : "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        process,
        units: absUnits,
      }),
    },
    dryRun,
    [appName, process, units]
  );
};

const useAppScaleAutoscale = (
  appName: string,
  config: AutoscaleConfig,
  dryRun: boolean
) => {
  return useAppStreamAction(
    `/apps/${appName}/units/autoscale`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        process: config.process,
        minUnits: config.minUnits,
        maxUnits: config.maxUnits,
        averageCPU: `${config.cpuTarget}%`,
        schedules:
          config.schedules && config.schedules.length > 0
            ? config.schedules
            : undefined,
        prometheus:
          config.prometheusMetrics && config.prometheusMetrics.length > 0
            ? config.prometheusMetrics
            : undefined,
      }),
    },
    dryRun,
    [
      appName,
      config.process,
      config.minUnits,
      config.maxUnits,
      config.cpuTarget,
      config.schedules,
      config.prometheusMetrics,
    ]
  );
};

const useAppDeleteAutoscale = (
  appName: string,
  process: string,
  dryRun: boolean
) => {
  return useAppStreamAction(
    `/apps/${appName}/units/autoscale?process=${encodeURIComponent(process)}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
    dryRun,
    [appName, process]
  );
};

export interface ProcessPlanUpdate {
  name: string;
  plan: string;
}

const useAppUpdateProcessPlan = (
  appName: string,
  processes: ProcessPlanUpdate[],
  noRestart: boolean,
  dryRun: boolean
) => {
  return useAppStreamAction(
    `/apps/${appName}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        noRestart,
        processes: processes.map((p) => ({
          name: p.name,
          plan: p.plan,
        })),
      }),
    },
    dryRun,
    [appName, JSON.stringify(processes), noRestart]
  );
};

// Kill unit hook
const useKillUnit = (appName: string) => {
  const fetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const killUnit = useCallback(
    async (unitName: string, force: boolean = false): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const url = force
          ? `/apps/${appName}/units/${unitName}?force=true`
          : `/apps/${appName}/units/${unitName}`;

        const response = await fetch(url, {
          method: "DELETE",
        });

        if (response.status > 299) {
          const errorText = await response.text();
          throw new Error(
            errorText || `could not kill unit: ${response.status}`
          );
        }

        return true;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [appName, fetch]
  );
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { killUnit, loading, error, reset };
};

// Rollback hook with streaming support
export type RollbackStreamState = {
  stream: string;
  loading: boolean;
  error: Error | null;
  success: boolean;
};

const initialRollbackState: RollbackStreamState = {
  stream: "",
  loading: false,
  error: null,
  success: false,
};

const processRollbackStream = async (
  response: Response,
  onMessage: (message: string) => void
) => {
  if (!response.body) {
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      if (buffer) {
        try {
          const message = JSON.parse(buffer);
          if (message.Message) {
            onMessage(message.Message);
          }
        } catch {
          // Not JSON, ignore
        }
      }
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim()) {
        try {
          const message = JSON.parse(line);
          if (message.Message) {
            onMessage(message.Message);
          }
        } catch {
          // Not JSON, ignore
        }
      }
    }
  }
};

const useAppRollback = (appName: string) => {
  const fetch = useFetch();
  const [streamState, setStreamState] =
    useState<RollbackStreamState>(initialRollbackState);

  const reset = () => {
    setStreamState(initialRollbackState);
  };

  const rollback = useCallback(
    async (image: string, abortSignal?: AbortSignal): Promise<boolean> => {
      setStreamState({
        stream: "",
        loading: true,
        error: null,
        success: false,
      });

      try {
        const formData = new FormData();
        formData.append("origin", "rollback");
        formData.append("image", image);

        const response = await fetch(`/apps/${appName}/deploy/rollback`, {
          method: "POST",
          body: formData,
          signal: abortSignal,
        });

        if (response.status > 299) {
          const errorText = await response.text();
          throw new Error(errorText || response.statusText);
        }

        await processRollbackStream(response, (message) => {
          setStreamState((prev) => ({
            ...prev,
            stream: truncateStream(prev.stream + message),
          }));
        });

        setStreamState((prev) => ({
          ...prev,
          loading: false,
          success: true,
        }));

        return true;
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setStreamState((prev) => ({
            ...prev,
            loading: false,
            error: err instanceof Error ? err : new Error("Unknown error"),
          }));
        }
        return false;
      }
    },
    [appName, fetch]
  );

  return {
    rollback,
    streamState,
    reset,
  };
};

// Disable rollback hook
export type DisableRollbackState = {
  loading: boolean;
  error: Error | null;
  success: boolean;
};

const initialDisableRollbackState: DisableRollbackState = {
  loading: false,
  error: null,
  success: false,
};

const useAppDisableRollback = (appName: string) => {
  const fetch = useFetch();
  const [state, setState] = useState<DisableRollbackState>(
    initialDisableRollbackState
  );

  const reset = useCallback(() => {
    setState(initialDisableRollbackState);
  }, []);

  const disableRollback = useCallback(
    async (image: string, reason: string): Promise<boolean> => {
      setState({
        loading: true,
        error: null,
        success: false,
      });

      try {
        const params = new URLSearchParams();
        params.append("image", image);
        params.append("reason", reason);
        params.append("origin", "rollback");
        params.append("disable", "true");

        const response = await fetch(
          `/1.4/apps/${appName}/deploy/rollback/update`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
          }
        );

        if (response.status > 299) {
          const errorText = await response.text();
          throw new Error(errorText || response.statusText);
        }

        setState({
          loading: false,
          error: null,
          success: true,
        });

        return true;
      } catch (err) {
        setState({
          loading: false,
          error: err instanceof Error ? err : new Error("Unknown error"),
          success: false,
        });
        return false;
      }
    },
    [appName, fetch]
  );

  return {
    disableRollback,
    state,
    reset,
  };
};

const useAddCName = (appName: string) => {
  const fetch = useFetch();

  return useCallback(
    async (cname: string): Promise<void> => {
      const response = await fetch(`/1.0/apps/${appName}/cname`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cname: [cname] }),
      });

      if (response.status > 299) {
        const errorText = await response.text();
        throw new Error(
          errorText ||
            `could not add CNAME: ${response.statusText} (${response.status})`
        );
      }
    },
    [appName, fetch]
  );
};

const useSetCertIssuer = (appName: string) => {
  const fetch = useFetch();

  return useCallback(
    async (cname: string, issuer: string): Promise<void> => {
      const response = await fetch(`/1.24/apps/${appName}/certissuer`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cname, issuer }),
      });

      if (response.status > 299) {
        const errorText = await response.text();
        throw new Error(
          errorText ||
            `could not set certificate issuer: ${response.statusText} (${response.status})`
        );
      }
    },
    [appName, fetch]
  );
};

export {
  useAppDeploys,
  useAppDeploy,
  useAppsResume,
  useAppsSimplified,
  useAppsUnits,
  useApp,
  useAppCertificates,

  // Write operations
  useCreateApp,
  useAppStreamAction,
  useAppScaleManual,
  useAppScaleAutoscale,
  useAppDeleteAutoscale,
  useAppUpdateProcessPlan,
  useKillUnit,
  useAppRollback,
  useAppDisableRollback,
  useAddCName,
  useSetCertIssuer,
};
