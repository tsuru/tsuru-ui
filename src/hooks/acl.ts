import { useState, useCallback } from "react";
import { useAsync } from "react-use";
import { useFetch } from "../contexts/auth";
import { ACLRules, ACLRuleType } from "../types/acl";

const useACLRules = (service: string, instance: string, reloadKey?: number) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(
      `/1.20/services/${service}/resources/${instance}/rule`
    );
    if (response.status !== 200) {
      throw new Error(
        `could not fetch acl instance, ${response.statusText} (${response.status})`
      );
    }

    return (await response.json()) as ACLRules;
  }, [fetch, service, instance, reloadKey]);
};

const useAddACLRule = () => {
  const fetch = useFetch();

  return async (
    service: string,
    instance: string,
    destination: ACLRuleType
  ): Promise<void> => {
    const response = await fetch(
      `/1.20/services/${service}/resources/${instance}/rule`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
        }),
      }
    );

    if (response.status !== 200 && response.status !== 201) {
      const errorText = await response.text();
      throw new Error(
        errorText ||
          `Failed to add rule: ${response.statusText} (${response.status})`
      );
    }
  };
};

const useDeleteACLRule = () => {
  const fetch = useFetch();

  return async (
    service: string,
    instance: string,
    ruleID: string
  ): Promise<void> => {
    const response = await fetch(
      `/1.20/services/${service}/resources/${instance}/rule/${ruleID}`,
      {
        method: "DELETE",
      }
    );

    if (response.status !== 200) {
      const errorText = await response.text();
      throw new Error(
        errorText ||
          `Failed to delete rule: ${response.statusText} (${response.status})`
      );
    }
  };
};

type CreateAndBindACLParams = {
  appName: string;
  teamOwner: string;
  teams: string[];
  tags?: string[];
  description?: string;
};

type CreateAndBindACLState = {
  status: "idle" | "creating" | "error";
  error: string | null;
};

const useCreateAndBindACL = () => {
  const fetch = useFetch();
  const [state, setState] = useState<CreateAndBindACLState>({
    status: "idle",
    error: null,
  });

  const execute = useCallback(
    async (params: CreateAndBindACLParams): Promise<boolean> => {
      setState({ status: "creating", error: null });

      try {
        // Step 1: Create ACL instance (idempotent)
        const createResponse = await fetch(`/1.0/services/acl/instances`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: params.appName,
            team_owner: params.teamOwner,
            teams: params.teams,
            tags: params.tags || [],
            description:
              params.description ||
              `ACL created via Dashboard for app ${params.appName}`,
          }),
        });

        if (
          createResponse.status !== 200 &&
          createResponse.status !== 201 &&
          createResponse.status !== 409
        ) {
          const errorText = await createResponse.text();
          throw new Error(
            errorText || `Failed to create ACL (${createResponse.status})`
          );
        }

        // Step 2: Bind ACL to app (idempotent)
        const bindResponse = await fetch(
          `/1.13/services/acl/instances/${params.appName}/apps/${params.appName}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noRestart: true }),
          }
        );

        if (bindResponse.status !== 200 && bindResponse.status !== 201) {
          const errorText = await bindResponse.text();
          if (
            !errorText.toLowerCase().includes("already bound") &&
            !errorText.toLowerCase().includes("already exists")
          ) {
            throw new Error(
              errorText || `Failed to bind ACL (${bindResponse.status})`
            );
          }
        }

        setState({ status: "idle", error: null });
        return true;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        setState({ status: "error", error: message });
        return false;
      }
    },
    [fetch]
  );

  const reset = useCallback(() => {
    setState({ status: "idle", error: null });
  }, []);

  return { ...state, execute, reset };
};

export { useACLRules, useAddACLRule, useDeleteACLRule, useCreateAndBindACL };
