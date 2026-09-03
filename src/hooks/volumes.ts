import { useAsync } from "react-use";
import { useCallback } from "react";
import { useFetch } from "../contexts/auth";
import { Volume } from "../types/volumes";

const useVolumes = () => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch("/volumes");
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch volumes, ${response.statusText} (${response.status})`
      );
    }
    const volumes: Array<Volume> = await response.json();
    volumes.sort((a: Volume, b: Volume) => {
      if (a.Name < b.Name) {
        return -1;
      }
      if (b.Name < a.Name) {
        return 1;
      }

      return 0;
    });
    return volumes;
  }, [fetch]);
};

const useVolume = (volumeID: string) => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/volumes/${volumeID}`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch volume, ${response.statusText} (${response.status})`
      );
    }

    const volume: Volume = await response.json();
    return volume;
  }, [fetch, volumeID]);
};

const useVolumeBindAdd = () => {
  const fetch = useFetch();

  return useCallback(
    async (
      volume: string,
      app: string,
      mountPoint: string,
      readOnly: boolean
    ): Promise<void> => {
      const response = await fetch(`/1.4/volumes/${volume}/bind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          App: app,
          MountPoint: mountPoint,
          ReadOnly: readOnly,
        }),
      });

      if (response.status > 299) {
        const errorText = await response.text();
        throw new Error(
          errorText ||
            `Failed to bind volume: ${response.statusText} (${response.status})`
        );
      }
    },
    [fetch]
  );
};

const useVolumeUnbind = () => {
  const fetch = useFetch();

  return useCallback(
    async (
      volume: string,
      app: string,
      mountPoint: string,
      noRestart: boolean
    ): Promise<void> => {
      const response = await fetch(`/1.4/volumes/${volume}/bind`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          App: app,
          MountPoint: mountPoint,
          NoRestart: noRestart,
        }),
      });

      if (response.status > 299) {
        const errorText = await response.text();
        throw new Error(
          errorText ||
            `Failed to unbind volume: ${response.statusText} (${response.status})`
        );
      }
    },
    [fetch]
  );
};

export { useVolume, useVolumes, useVolumeBindAdd, useVolumeUnbind };
