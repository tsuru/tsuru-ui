import { User, UserManager, WebStorageStateStore } from "oidc-client-ts";
import config from "../../config";
import { getAuthScheme } from "../../authSchemes";
import { FunctionComponent, useEffect, useState } from "react";
import { UserInfo } from "../../types/auth";
import {
  AuthContext,
  AuthContextProviderProps,
  fetchFromAuthToken,
} from "./base";
import { useAsync } from "react-use";
import DisplayError from "../../components/base/DisplayError";

type Provider = FunctionComponent<AuthContextProviderProps>;

// Built on first render rather than at import time: the config only exists once
// the app has booted. Memoized so the UserManager stays a singleton, as it was
// when this ran at module scope.
let provider: Provider | null = null;

const createProvider = (): Provider => {
  const { data } = getAuthScheme();

  if (!data.clientID || !data.authURL || !data.tokenURL) {
    const missing = ["clientID", "authURL", "tokenURL"]
      .filter((field) => !data[field as keyof typeof data])
      .join(", ");
    return () => (
      <DisplayError
        error={new Error(`oidc auth scheme is missing required data: ${missing}`)}
      />
    );
  }

  // The endpoints come straight from the auth scheme instead of OIDC discovery:
  // the API announces authURL/tokenURL but not the issuer. Passing metadata
  // skips the .well-known fetch, and oidc-client-ts never dereferences the
  // authority itself, so the authURL stands in for it.
  const oidcClient = new UserManager({
    authority: data.authURL,
    metadata: {
      authorization_endpoint: data.authURL,
      token_endpoint: data.tokenURL,
    },
    client_id: data.clientID,
    redirect_uri: `${window.location.origin}${config.prefix}/auth/callback`,
    response_type: "code",
    // The announced scopes target the CLI, which runs plain OAuth2 and may not
    // ask for "openid" -- but without it the IdP issues no ID token and
    // oidc-client-ts fails the response validation. Always request it.
    scope: Array.from(new Set(["openid", ...(data.scopes ?? [])])).join(" "),
    response_mode: "fragment",
    filterProtocolClaims: true,
    automaticSilentRenew: true,
    stateStore: new WebStorageStateStore({ prefix: "tsuru" }),
    userStore: new WebStorageStateStore({ prefix: "tsuru" }),
  });

  const signin = () => {
    return oidcClient.signinRedirect({
      state: {
        previousPath: `${window.location.pathname}${window.location.search}`,
      },
    });
  };

  // Local sign-out only: the auth scheme carries no end-session endpoint, so
  // the IdP session survives and the next visit signs back in silently.
  const logoff = async () => {
    try {
      await oidcClient.removeUser();
    } catch (e) {
      console.info("failed to signout", e);
    }
    window.location.replace(config.prefix);
  };

  const doBootAuthProvider = async () => {
    if (window.location.pathname.startsWith(`${config.prefix}/auth/callback`)) {
      const user = await oidcClient.signinCallback(window.location.href);

      if (user && user.state) {
        const state: Record<string, string> = user.state as Record<
          string,
          string
        >;
        if (state.previousPath) {
          window.location.replace(state.previousPath);
          return;
        }
      }

      window.location.replace(config.prefix);
      return;
    }

    const oidcUser = await oidcClient.getUser();

    if (oidcUser === null || oidcUser.expired) {
      await signin();
      return;
    }

    const fetch = fetchFromAuthToken(oidcUser.access_token);
    const response = await fetch(`/users/info`);

    if (response.status !== 200) {
      throw new Error(
        `could not fetch user info, ${response.statusText} (${response.status})`
      );
    }

    const tsuruUser: UserInfo = await response.json();

    return {
      oidcUser,
      tsuruUser,
    };
  };

  // Memoized: StrictMode mounts the provider twice in development, and a
  // second run on the callback page would redeem the authorization code again
  // -- the IdP rejects the replay with "Code not valid".
  let boot: ReturnType<typeof doBootAuthProvider> | null = null;
  const bootAuthProvider = () => {
    if (!boot) {
      boot = doBootAuthProvider();
    }
    return boot;
  };

  return (props) => {
    const { value, error, loading } = useAsync(bootAuthProvider);
    const [refreshedOIDCUser, setRefreshedOIDCUser] = useState<User | null>(
      null
    );

    useEffect(() => {
      oidcClient.events.addUserLoaded(function (user) {
        setRefreshedOIDCUser(user);
      });
    }, []);

    if (loading) return <>Loading...</>;
    if (error) return <DisplayError error={error} />;
    if (value) {
      const authToken = refreshedOIDCUser
        ? refreshedOIDCUser.access_token
        : value.oidcUser.access_token;

      const fetch = fetchFromAuthToken(authToken, {
        onUnauthorized: async () => {
          await signin();
        },
      });
      return (
        <AuthContext.Provider
          value={{ userInfo: value.tsuruUser, fetch, logoff }}
        >
          {props.children}
        </AuthContext.Provider>
      );
    }
    return null;
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
