import { useCallback, useState } from "react";
import { useAsync } from "react-use";
import { useFetch } from "../contexts/auth";
import {
  TsuruEvent,
  TsuruEventInfo,
  TsuruEventKind,
  eventsPerPage,
} from "../types/events";
import { DependencyList } from "react";

type eventsFilter = {
  job?: string;
  app?: string;
  service?: string;
  kind?: string;
  genericTarget: string;
  owner?: string;
};

const useTsuruEventsPage = (
  page: number,
  orderColumn: string,
  orderDirection: string,
  filter: eventsFilter,
  deps?: DependencyList
) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const skip = (page - 1) * eventsPerPage;

    let sort: string = orderColumn;
    if (orderDirection === "desc") {
      sort = `-${sort}`;
    }

    const params: Record<string, any> = {
      skip,
      sort,
      limit: eventsPerPage,
    };

    if (filter.app) {
      params["target.type"] = "app";
      params["target.value"] = filter.app;
    }

    if (filter.job) {
      params["target.type"] = "job";
      params["target.value"] = filter.job;
    }

    if (filter.service) {
      params["target.type"] = "service-instance";
      params["target.value"] = filter.service;
    }

    if (filter.genericTarget) {
      params["target.value"] = filter.genericTarget;
    }

    if (filter.owner) {
      params["ownerName"] = filter.owner;
    }

    if (filter.kind) {
      params["kindname"] = filter.kind;
    }

    const response = await fetch(
      `/events?${new URLSearchParams(params).toString()}`
    );
    if (response.status === 204) {
      return [];
    }
    if (response.status > 299) {
      throw new Error(
        `could not fetch events, ${response.statusText} (${response.status})`
      );
    }

    return (await response.json()) as Array<TsuruEvent>;
  }, [
    fetch,
    page,
    orderColumn,
    orderDirection,
    filter.app,
    filter.kind,
    filter.service,
    ...(deps || []),
  ]);
};

const useTsuruEvent = (eventID: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/events/${eventID}`);
    if (response.status > 299) {
      throw new Error(
        `could not fetch event, ${response.statusText} (${response.status})`
      );
    }

    const event: TsuruEventInfo = await response.json();
    return event;
  }, [fetch, eventID]);
};

const useTsuruEventKinds = () => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/events/kinds`);
    if (response.status > 299) {
      throw new Error(
        `could not fetch event, ${response.statusText} (${response.status})`
      );
    }

    const kinds: Array<TsuruEventKind> = await response.json();
    return kinds;
  }, [fetch]);
};

const useCancelEvent = () => {
  const fetch = useFetch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);

  const cancelEvent = useCallback(
    async (eventID: string, reason: string): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setSuccess(false);

      try {
        const response = await fetch(`/events/${eventID}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        });

        if (response.status > 299) {
          throw new Error(
            `could not cancel event, ${response.statusText} (${response.status})`
          );
        }

        setSuccess(true);
        return true;
      } catch (err) {
        setError(err as Error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [fetch]
  );

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { cancelEvent, loading, error, success, reset };
};

export {
  useTsuruEventsPage,
  useTsuruEvent,
  useTsuruEventKinds,
  useCancelEvent,
};
