import { useAsync } from "react-use";
import { useState, useCallback } from "react";
import {
  ServiceInstanceInfo,
  ServiceItem,
  ServicePlan,
} from "../types/serviceInstance";
import { useFetch } from "../contexts/auth";
import { useAppStreamAction } from "./app";
import { truncateStream } from "./truncate";

const useServiceInstance = (service: string, instance: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/services/${service}/instances/${instance}`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch service instance, ${response.statusText} (${response.status})`
      );
    }

    return (await response.json()) as ServiceInstanceInfo;
  }, [fetch, service, instance]);
};

const useServiceInstanceStatus = (service: string, instance: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(
      `/services/${service}/instances/${instance}/status`
    );
    if (response.status !== 200) {
      throw new Error(
        `could not fetch service instance, ${response.statusText} (${response.status})`
      );
    }

    return await response.text();
  }, [fetch, service, instance]);
};

const useServiceInstances = (service?: string) => {
  const fetch = useFetch();

  return useAsync(async () => {
    const params: Record<string, string> = {};
    if (service) {
      params.service = service;
    }
    const queryString = new URLSearchParams(params).toString();
    const url =
      queryString.length > 0
        ? `/services/instances?${queryString}`
        : "/services/instances";
    const response = await fetch(url);
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch service instances, ${response.statusText} (${response.status})`
      );
    }
    return await response.json();
  }, [fetch]);
};

const useServices = () => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch("/services");
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch services, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Array<ServiceItem>;
  }, [fetch]);
};

const useServicePlans = (name: string) => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/services/${name}/plans`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch service plans, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Array<ServicePlan>;
  }, [fetch]);
};

const useServiceInstanceBind = (
  service: string,
  instance: string,
  app: string,
  noRestart: boolean,
  dryRun: boolean
) => {
  return useAppStreamAction(
    `/1.13/services/${service}/instances/${instance}/apps/${app}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noRestart }),
    },
    dryRun,
    [service, instance, app, noRestart]
  );
};

const useServiceInstanceUnbind = () => {
  const fetch = useFetch();
  const [stream, setStream] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(() => {
    setStream("");
    setLoading(false);
    setError(null);
    setSuccess(false);
  }, []);

  const unbind = useCallback(
    async (
      service: string,
      instance: string,
      app: string,
      noRestart: boolean
    ): Promise<boolean> => {
      setStream("");
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await fetch(
          `/1.13/services/${service}/instances/${instance}/apps/${app}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noRestart }),
          }
        );

        if (response.status > 299) {
          const errorText = await response.text();
          throw new Error(
            errorText || `Failed to unbind: ${response.statusText}`
          );
        }

        if (response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              if (buffer.trim()) {
                try {
                  const msg = JSON.parse(buffer);
                  if (msg.Message) {
                    setStream((prev) => truncateStream(prev + msg.Message));
                  }
                } catch {
                  // ignore
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
                  const msg = JSON.parse(line);
                  if (msg.Message) {
                    setStream((prev) => truncateStream(prev + msg.Message));
                  }
                } catch {
                  // ignore
                }
              }
            }
          }
        }

        setLoading(false);
        setSuccess(true);
        return true;
      } catch (err) {
        setLoading(false);
        setError(err instanceof Error ? err : new Error("Unknown error"));
        return false;
      }
    },
    [fetch]
  );

  return { unbind, stream, loading, error, success, reset };
};

export {
  useServiceInstance,
  useServiceInstanceStatus,
  useServiceInstances,
  useServicePlans,
  useServices,
  useServiceInstanceBind,
  useServiceInstanceUnbind,
};
