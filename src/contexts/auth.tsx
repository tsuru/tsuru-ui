import { FunctionComponent, useContext } from "react";
import { getAuthScheme } from "../authSchemes";
import { AuthContext, AuthContextProviderProps, Fetcher } from "./auth/base";

import { default as OIDCAuthContextProvider } from "./auth/oidc";
import { default as OAuth2AuthContextProvider } from "./auth/oauth2";
import { default as NativeAuthContextProvider } from "./auth/native";
import DisplayError from "../components/base/DisplayError";

const useFetch = (): Fetcher => {
  const { fetch } = useContext(AuthContext);
  if (!fetch) {
    return noopFech;
  }
  return fetch;
};

const noopFech: Fetcher = async () => {
  throw new Error("fetch is not ready");
};

export type { Fetcher };

type Provider = FunctionComponent<AuthContextProviderProps>;

// Resolved on first render rather than at import time, since the auth scheme
// is discovered from the API at boot.
let provider: Provider | null = null;

const pickProvider = (): Provider => {
  const scheme = getAuthScheme();

  if (scheme.name === "oidc") {
    return OIDCAuthContextProvider;
  }

  if (scheme.name === "oauth") {
    return OAuth2AuthContextProvider;
  }

  if (scheme.name === "native") {
    return NativeAuthContextProvider;
  }

  return () => (
    <DisplayError
      error={
        new Error(
          `unsupported auth scheme "${scheme.name}"; ` +
            `tsuru-ui supports "native", "oidc" and "oauth"`
        )
      }
    />
  );
};

const AuthContextProvider: Provider = (props) => {
  if (!provider) {
    provider = pickProvider();
  }

  const Provider = provider;

  return <Provider {...props} />;
};

export { AuthContext, AuthContextProvider, useFetch };
