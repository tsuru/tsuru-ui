import { useAsync } from "react-use";
import { Cluster, Platform, Pool } from "../types/provisioner";
import { useFetch } from "../contexts/auth";

const usePlatforms = () => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/platforms`);
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch platforms, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Array<Platform>;
  }, [fetch]);
};

const usePools = () => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/pools`);
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch pools, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Array<Pool>;
  }, [fetch]);
};

const usePool = (poolID: string) => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/pools/${poolID}`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch pool, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Pool;
  }, [fetch, poolID]);
};

const useClusters = () => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch("/provisioner/clusters");
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch clusters, ${response.statusText} (${response.status})`
      );
    }
    const result: Array<Cluster> = await response.json();
    return result;
  }, [fetch]);
};

const useCluster = (clusterID: string) => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/provisioner/clusters/${clusterID}`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch cluster, ${response.statusText} (${response.status})`
      );
    }
    const result: Cluster = await response.json();
    return result;
  }, [fetch, clusterID]);
};

export { usePlatforms, usePools, usePool, useClusters, useCluster };
