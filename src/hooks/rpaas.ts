import { useAsync } from "react-use";
import { useFetch } from "../contexts/auth";
import { RPaasInfo } from "../types/rpaas";

const useRPaaSInfo = (service: string, instance: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(
      `/1.20/services/${service}/resources/${instance}/info`
    );
    if (response.status !== 200) {
      throw new Error(
        `could not fetch rpaas instance, ${response.statusText} (${response.status})`
      );
    }

    const rpaasInfo: RPaasInfo = await response.json();
    return rpaasInfo;
  }, [fetch, service, instance]);
};

export { useRPaaSInfo };
