import { useAsync } from "react-use";
import { useFetch } from "../contexts/auth";
import { Job, JobInfo } from "../types/jobs";
import { EnvironmentVar } from "../types/provisioner";

const useJobs = () => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/jobs`);

    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch jobs, ${response.statusText} (${response.status})`
      );
    }
    const jobs: Array<Job> = await response.json();
    jobs.sort((a: Job, b: Job) => {
      if (a.name < b.name) {
        return -1;
      }
      if (b.name < a.name) {
        return 1;
      }

      return 0;
    });

    return jobs;
  }, [fetch]);
};

const useJobInfo = (jobID: string) => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch(`/jobs/${jobID}`);

    if (response.status !== 200) {
      throw new Error(
        `could not fetch job: ${jobID}, ${response.statusText} (${response.status})`
      );
    }
    const job: JobInfo = await response.json();

    return job;
  }, [fetch]);
};

const useJobEnvironmentVars = (job: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/jobs/${job}/env`);
    if (response.status > 299) {
      throw new Error(
        `could not fetch deploy, ${response.statusText} (${response.status})`
      );
    }

    return (await response.json()) as Array<EnvironmentVar>;
  }, [fetch, job]);
};

export { useJobInfo, useJobs, useJobEnvironmentVars };
