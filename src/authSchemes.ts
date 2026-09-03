import { AuthScheme } from "./types/authScheme";
import { getConfig } from "./configRuntime";

let current: AuthScheme | null = null;

// Reads the auth scheme discovered at boot. Throws instead of guessing, so a
// module that reads it at import time fails loudly here -- same contract as
// getConfig().
const getAuthScheme = (): AuthScheme => {
  if (!current) {
    throw new Error(
      "auth scheme read before loadAuthScheme() resolved: some module reads " +
        "the auth scheme at import time. Modules that read it must only be " +
        "reachable from the dynamic import of App in src/index.tsx."
    );
  }

  return current;
};

// Discovers how to authenticate from the tsuru API itself, the same way the
// tsuru CLI does on login. The endpoint is public (no token) and always
// returns an array, with one scheme marked as the default.
const loadAuthScheme = async (): Promise<AuthScheme> => {
  const url = `${getConfig().server}/1.18/auth/schemes`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `could not load auth schemes from ${url}, status code: ${response.status}`
    );
  }

  const schemes: AuthScheme[] = await response.json();
  if (!Array.isArray(schemes) || schemes.length === 0) {
    throw new Error(`the tsuru API at ${url} returned no auth schemes`);
  }

  current = schemes.find((scheme) => scheme.default) ?? schemes[0];

  return current;
};

const setAuthSchemeForTests = (scheme: AuthScheme) => {
  current = scheme;
};

export { getAuthScheme, loadAuthScheme, setAuthSchemeForTests };
