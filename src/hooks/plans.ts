import { useAsync } from "react-use";
import { useFetch } from "../contexts/auth";

type Plan = {
  name: string;
};

const usePlans = () => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/plans`);
    if (response.status > 299) {
      throw new Error(
        `could not fetch plans, ${response.statusText} (${response.status})`
      );
    }

    return (await response.json()) as Array<Plan>;
  }, [fetch]);
};

export { usePlans };
