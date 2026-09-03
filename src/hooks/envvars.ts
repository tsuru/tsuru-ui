import { useState, useCallback } from "react";
import { useFetch } from "../contexts/auth";
import { EnvironmentVar } from "../types/provisioner";
import { truncateStream } from "./truncate";

export type EnvVarInput = {
  name: string;
  value: string;
  isPrivate: boolean;
};

export type StreamState = {
  stream: string;
  loading: boolean;
  error: Error | null;
  success: boolean;
};

const initialStreamState: StreamState = {
  stream: "",
  loading: false,
  error: null,
  success: false,
};

/**
 * Hook to fetch environment variables for an app
 */
export const useAppEnvVars = (appName: string) => {
  const fetch = useFetch();
  const [envVars, setEnvVars] = useState<EnvironmentVar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEnvVars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/apps/${appName}/env`);
      if (response.status > 299) {
        throw new Error(
          `Could not fetch environment variables: ${response.statusText} (${response.status})`
        );
      }
      const data = (await response.json()) as EnvironmentVar[];
      setEnvVars(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [appName, fetch]);

  return { envVars, loading, error, refetch: fetchEnvVars };
};

/**
 * Process streaming response from API
 */
const processStream = async (
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

/**
 * Hook for setting (add/edit) environment variables
 */
export const useSetEnvVar = (appName: string) => {
  const fetch = useFetch();
  const [streamState, setStreamState] =
    useState<StreamState>(initialStreamState);
  const [simpleLoading, setSimpleLoading] = useState(false);
  const [simpleError, setSimpleError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setStreamState(initialStreamState);
    setSimpleLoading(false);
    setSimpleError(null);
  }, []);

  const setEnvVar = useCallback(
    async (
      envVar: EnvVarInput,
      norestart: boolean,
      abortSignal?: AbortSignal
    ): Promise<boolean> => {
      if (norestart) {
        // Without restart - simple request
        setSimpleLoading(true);
        setSimpleError(null);
        try {
          const response = await fetch(`/apps/${appName}/env`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              envs: [
                {
                  name: envVar.name,
                  value: envVar.value,
                  private: envVar.isPrivate,
                  managedBy: "dashboard",
                },
              ],
              norestart: true,
              managedBy: "dashboard",
            }),
            signal: abortSignal,
          });

          if (response.status > 299) {
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
          }

          return true;
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            setSimpleError(
              err instanceof Error ? err : new Error("Unknown error")
            );
          }
          return false;
        } finally {
          setSimpleLoading(false);
        }
      } else {
        // With restart - streaming request
        setStreamState({
          stream: "",
          loading: true,
          error: null,
          success: false,
        });

        try {
          const response = await fetch(`/apps/${appName}/env`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              envs: [
                {
                  name: envVar.name,
                  value: envVar.value,
                  private: envVar.isPrivate,
                  managedBy: "dashboard",
                },
              ],
              norestart: false,
              managedBy: "dashboard",
            }),
            signal: abortSignal,
          });

          if (response.status > 299) {
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
          }

          await processStream(response, (message) => {
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
      }
    },
    [appName, fetch]
  );

  return {
    setEnvVar,
    streamState,
    simpleLoading,
    simpleError,
    reset,
  };
};

/**
 * Hook for deleting environment variables
 */
export const useDeleteEnvVar = (appName: string) => {
  const fetch = useFetch();
  const [streamState, setStreamState] =
    useState<StreamState>(initialStreamState);
  const [simpleLoading, setSimpleLoading] = useState(false);
  const [simpleError, setSimpleError] = useState<Error | null>(null);

  const reset = useCallback(() => {
    setStreamState(initialStreamState);
    setSimpleLoading(false);
    setSimpleError(null);
  }, []);

  const deleteEnvVar = useCallback(
    async (
      envName: string,
      norestart: boolean,
      abortSignal?: AbortSignal
    ): Promise<boolean> => {
      const queryParams = new URLSearchParams();
      queryParams.append("env", envName);
      queryParams.append("norestart", String(norestart));

      if (norestart) {
        // Without restart - simple request
        setSimpleLoading(true);
        setSimpleError(null);
        try {
          const response = await fetch(
            `/apps/${appName}/env?${queryParams.toString()}`,
            {
              method: "DELETE",
              signal: abortSignal,
            }
          );

          if (response.status > 299) {
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
          }

          return true;
        } catch (err) {
          if ((err as Error).name !== "AbortError") {
            setSimpleError(
              err instanceof Error ? err : new Error("Unknown error")
            );
          }
          return false;
        } finally {
          setSimpleLoading(false);
        }
      } else {
        // With restart - streaming request
        setStreamState({
          stream: "",
          loading: true,
          error: null,
          success: false,
        });

        try {
          const response = await fetch(
            `/apps/${appName}/env?${queryParams.toString()}`,
            {
              method: "DELETE",
              signal: abortSignal,
            }
          );

          if (response.status > 299) {
            const errorText = await response.text();
            throw new Error(errorText || response.statusText);
          }

          await processStream(response, (message) => {
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
      }
    },
    [appName, fetch]
  );

  return {
    deleteEnvVar,
    streamState,
    simpleLoading,
    simpleError,
    reset,
  };
};
