import { useAsync } from "react-use";
import { useFetch } from "../contexts/auth";
import { Team, TeamGroup, TeamUser, Token } from "../types/auth";

const useTokens = () => {
  const fetch = useFetch();

  return useAsync(async () => {
    const response = await fetch("/tokens");
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch tokens, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Array<Token>;
  }, [fetch]);
};

const useToken = (tokenID: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/tokens/${tokenID}`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch token, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Token;
  }, [fetch, tokenID]);
};

const useTeams = () => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/teams`);
    if (response.status === 204) {
      return [];
    }
    if (response.status !== 200) {
      throw new Error(
        `could not fetch teams, ${response.statusText} (${response.status})`
      );
    }
    return (await response.json()) as Array<Team>;
  }, [fetch]);
};

const useTeamUsers = (teamID: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/teams/${teamID}/users`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch token, ${response.statusText} (${response.status})`
      );
    }
    const users = (await response.json()) as Array<TeamUser>;
    return users.sort((a, b) => {
      return a.email.localeCompare(b.email);
    });
  }, [fetch, teamID]);
};

const useTeamGroups = (teamID: string) => {
  const fetch = useFetch();
  return useAsync(async () => {
    const response = await fetch(`/teams/${teamID}/groups`);
    if (response.status !== 200) {
      throw new Error(
        `could not fetch token, ${response.statusText} (${response.status})`
      );
    }
    const groups = (await response.json()) as Array<TeamGroup>;

    return groups.sort((a, b) => {
      return a.group.localeCompare(b.group);
    });
  }, [fetch, teamID]);
};

export { useTokens, useToken, useTeams, useTeamUsers, useTeamGroups };
