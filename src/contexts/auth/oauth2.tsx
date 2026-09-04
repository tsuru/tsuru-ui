import { FunctionComponent } from "react";
import config from "../../config";
import { getAuthScheme } from "../../authSchemes";
import {
  AuthContext,
  AuthContextProviderProps,
  fetchFromAuthToken,
} from "./base";
import { UserInfo } from "../../types/auth";

import { useAsync } from "react-use";
import DisplayError from "../../components/base/DisplayError";

type Provider = FunctionComponent<AuthContextProviderProps>;

const tokenKeyStorage = "oauth2-tsuru-token";

// The server builds the authorize URL with this literal placeholder where the
// redirect URI goes, since only the client knows its own callback address.
const redirectURLPlaceholder = "__redirect_url__";

// Built on first render rather than at import time, for the same reason as the
// OIDC provider: the auth scheme is only discovered once the app has booted.
let provider: Provider | null = null;

const createProvider = (): Provider => {
  const { data } = getAuthScheme();

  if (!data.authorizeUrl) {
    return () => (
      <DisplayError
        error={
          new Error("oauth auth scheme is missing required data: authorizeUrl")
        }
      />
    );
  }

  const authorizeUrl = data.authorizeUrl;
  const redirectURI = `${window.location.origin}${config.prefix}/auth/callback`;

  const signin = () => {
    const uri = authorizeUrl.replace(
      redirectURLPlaceholder,
      encodeURIComponent(redirectURI)
    );
    window.location.replace(uri);
  };

  const logoff = () => {
    localStorage.removeItem(tokenKeyStorage);
    window.location.replace(config.prefix);
  };

  // Authorization code flow with the exchange done by the tsuru API, which
  // holds the client secret: POST /auth/login with the code yields the tsuru
  // token.
  const exchangeCode = async (code: string): Promise<string> => {
    const response = await fetch(`${config.server}/1.0/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, redirectUrl: redirectURI }),
    });

    if (!response.ok) {
      throw new Error(
        `could not exchange the authorization code for a token, ` +
          `${response.statusText} (${response.status})`
      );
    }

    const { token } = await response.json();
    if (!token) {
      throw new Error(
        "the tsuru API returned no token for the authorization code"
      );
    }

    return token;
  };

  const doBootAuthProvider = async () => {
    if (window.location.pathname.startsWith(`${config.prefix}/auth/callback`)) {
      const code = new URLSearchParams(window.location.search).get("code");
      if (!code) {
        throw new Error("no authorization code in the callback URL");
      }

      const token = await exchangeCode(code);
      localStorage.setItem(tokenKeyStorage, token);
      window.location.replace(config.prefix);
      return;
    }

    const token = localStorage.getItem(tokenKeyStorage);
    if (!token) {
      signin();
      return;
    }

    const fetch = fetchFromAuthToken(token);
    const response = await fetch(`/users/info`);

    if (response.status !== 200) {
      throw new Error(
        `could not fetch user info, ${response.statusText} (${response.status})`
      );
    }

    const tsuruUser: UserInfo = await response.json();

    return {
      token,
      tsuruUser,
    };
  };

  // Memoized: StrictMode mounts the provider twice in development, and a
  // second run on the callback page would redeem the authorization code again.
  let boot: ReturnType<typeof doBootAuthProvider> | null = null;
  const bootAuthProvider = () => {
    if (!boot) {
      boot = doBootAuthProvider();
    }
    return boot;
  };

  return (props) => {
    const { value, error, loading } = useAsync(bootAuthProvider);

    if (error) return <DisplayError error={error} />;
    if (loading || !value) return <>Loading...</>;

    return (
      <AuthContext.Provider
        value={{
          userInfo: value.tsuruUser,
          fetch: fetchFromAuthToken(value.token, {
            async onUnauthorized() {
              localStorage.removeItem(tokenKeyStorage);
              signin();
            },
          }),
          logoff,
        }}
      >
        {props.children}
      </AuthContext.Provider>
    );
  };
};

const AuthContextProvider: Provider = (props) => {
  if (!provider) {
    provider = createProvider();
  }

  const Provider = provider;

  return <Provider {...props} />;
};

export default AuthContextProvider;
