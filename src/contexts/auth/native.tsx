import { FunctionComponent, useCallback, useState } from "react";
import { useAsync } from "react-use";

import config from "../../config";
import { UserInfo } from "../../types/auth";
import {
  AuthContext,
  AuthContextProviderProps,
  fetchFromAuthToken,
} from "./base";
import DisplayError from "../../components/base/DisplayError";
import NativeLoginForm from "../../components/auth/NativeLoginForm";

type Provider = FunctionComponent<AuthContextProviderProps>;

const tokenKeyStorage = "native-tsuru-token";

// Native auth has no IdP to bounce off: the tsuru API holds the credentials
// itself, so this provider asks for them and trades them for a tsuru token --
// the same exchange `tsuru login` does with the native scheme.
const requestToken = async (
  email: string,
  password: string
): Promise<string> => {
  const url = `${config.server}/1.0/users/${encodeURIComponent(email)}/tokens`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password }),
  });

  if (!response.ok) {
    throw new Error(`Failed to authenticate: ${await reason(response)}`);
  }

  const { token } = await response.json();
  if (!token) {
    throw new Error("the tsuru API returned no token for these credentials");
  }

  return token;
};

// The API answers a rejected login with a plain text explanation ("wrong
// password", "user not found"), which is what the user needs to read; the
// status is only a fallback for an empty body.
const reason = async (response: Response): Promise<string> => {
  let body = "";
  try {
    body = (await response.text()).trim();
  } catch (e) {}

  return body || `${response.statusText} (${response.status})`;
};

type Session = { token: string; userInfo: UserInfo } | { expired: true };

// Not built lazily like the OIDC and OAuth2 providers: there is no client to
// construct at import time, and the session lives in component state so a
// remount picks the stored token back up.
const AuthContextProvider: Provider = (props) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(tokenKeyStorage)
  );

  const forgetToken = useCallback(() => {
    localStorage.removeItem(tokenKeyStorage);
    setToken(null);
  }, []);

  const signin = useCallback(async (email: string, password: string) => {
    const token = await requestToken(email, password);
    localStorage.setItem(tokenKeyStorage, token);
    setToken(token);
  }, []);

  // Native tokens are sessions on the server, so drop it there too instead of
  // only locally -- best-effort, as in `tsuru logout`.
  const logoff = useCallback(async () => {
    if (token) {
      try {
        await fetchFromAuthToken(token)("/users/tokens", { method: "DELETE" });
      } catch (e) {
        console.info("failed to terminate the session on the server", e);
      }
    }
    forgetToken();
  }, [token, forgetToken]);

  const session = useAsync(async (): Promise<Session | null> => {
    if (!token) {
      return null;
    }

    const response = await fetchFromAuthToken(token)(`/users/info`);

    // A stored token the API no longer accepts: expired, or revoked by a
    // logout elsewhere. Ask for the credentials again rather than erroring.
    if (response.status === 401) {
      localStorage.removeItem(tokenKeyStorage);
      return { expired: true };
    }

    if (response.status !== 200) {
      throw new Error(
        `could not fetch user info, ${response.statusText} (${response.status})`
      );
    }

    return { token, userInfo: await response.json() };
  }, [token]);

  // Checked before the async state so the first paint is the form itself, not
  // the loading placeholder useAsync starts on.
  if (!token) {
    return <NativeLoginForm onSubmit={signin} />;
  }

  if (session.loading) return <>Loading...</>;
  if (session.error) return <DisplayError error={session.error} />;
  if (!session.value) return null;

  if ("expired" in session.value) {
    return (
      <NativeLoginForm
        onSubmit={signin}
        notice="Your session has expired, sign in again."
      />
    );
  }

  return (
    <AuthContext.Provider
      value={{
        userInfo: session.value.userInfo,
        fetch: fetchFromAuthToken(session.value.token, {
          async onUnauthorized() {
            forgetToken();
          },
        }),
        logoff,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default AuthContextProvider;
