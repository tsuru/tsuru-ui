import { ReactNode, createContext } from "react";
import { UserInfo } from "../../types/auth";
import config from "../../config";

type AuthState = {
  userInfo: UserInfo | null;
  fetch: Fetcher | null;
  logoff: Function | null;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

type Fetcher = (url: string, init?: ExtendedRequestInit) => Promise<Response>;

const AuthContext = createContext<AuthState>({
  userInfo: null,
  fetch: null,
  logoff: null,
});

type fetchFromAuthTokenOptions = {
  onUnauthorized?: () => Promise<void>;
};

interface ExtendedRequestInit extends RequestInit {
  disableErrorOnValidation?: boolean;
}

const fetchFromAuthToken = (
  authToken: string,
  options?: fetchFromAuthTokenOptions
): Fetcher => {
  return async (path: string | Request, init?: ExtendedRequestInit) => {
    const url = `${config.server}${path}`;
    const req = new Request(url, init);
    req.headers.set("Authorization", `Bearer ${authToken}`);
    const response = await fetch(req);
    if (response.status === 401) {
      if (options && options.onUnauthorized) {
        await options.onUnauthorized();
        return response;
      }
    } else if (response.status >= 400 && response.status < 500) {
      if (init && init.disableErrorOnValidation) {
        return response;
      }
      await throwOnError(url, response);
    } else if (response.status >= 500) {
      await throwOnError(url, response);
    }
    return response;
  };
};

const throwOnError = async (url: string, response: Response) => {
  let body = "";
  try {
    body = await response.text();
  } catch (e) {}

  throw new Error(
    `Failed to fetch : ${url}, statusCode: ${response.status}, body: ${body}`
  );
};

export type { Fetcher, AuthContextProviderProps };

export { AuthContext, fetchFromAuthToken };
