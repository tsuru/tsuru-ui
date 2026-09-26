import { useContext } from "react";
import { render, screen, fireEvent } from "@testing-library/react";

import NativeAuthContextProvider from "./native";
import { AuthContext } from "./base";

// DisplayError pulls in Console, whose syntax highlighter ships ESM that jest
// cannot parse -- the same stub the other view tests use.
jest.mock("../../components/base/Console", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <pre>{children}</pre>,
}));

// CRA's jest transform stubs an svg import with an element shape React 19 no
// longer accepts, so the logo is stubbed here as well.
jest.mock("../../components/base/logo.svg", () => ({
  __esModule: true,
  ReactComponent: () => <svg />,
}));

// The provider is the only thing under test, so the app behind it is reduced to
// what a session exposes: the user it resolved, and a way to drop it.
const Authenticated = () => {
  const { userInfo, logoff } = useContext(AuthContext);

  return (
    <>
      <span>signed in as {userInfo?.Email}</span>
      <button onClick={() => logoff && logoff()}>Logout</button>
    </>
  );
};

const renderProvider = () =>
  render(
    <NativeAuthContextProvider>
      <Authenticated />
    </NativeAuthContextProvider>
  );

const userInfo = { Email: "me@tsuru.io", Roles: [], Permissions: [] };

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response);

const textResponse = (status: number, body: string) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: async () => JSON.parse(body),
    text: async () => body,
  } as Response);

// fetchFromAuthToken calls fetch with a Request, while the token exchange
// calls it with a url and an init -- this normalizes both.
type Call = { url: string; method: string; token: string | null; body: string };

const callOf = (args: any[]): Call => {
  const [input, init] = args;

  if (typeof input === "string") {
    return {
      url: input,
      method: init?.method ?? "GET",
      token: init?.headers?.Authorization ?? null,
      body: init?.body ? String(init.body) : "",
    };
  }

  return {
    url: input.url,
    method: input.method,
    token: input.headers.get("Authorization"),
    body: "",
  };
};

const calls = (): Call[] => (global.fetch as jest.Mock).mock.calls.map(callOf);

const tokenKeyStorage = "native-tsuru-token";
const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
  localStorage.clear();
});

const signIn = (email: string, password: string) => {
  fireEvent.change(screen.getByLabelText(/email/i), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/password/i), {
    target: { value: password },
  });
  fireEvent.click(screen.getByRole("button", { name: /sign in/i }));
};

it("asks for the credentials when no token is stored", async () => {
  global.fetch = jest.fn();

  renderProvider();

  expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});

it("trades the credentials for a token and boots the session", async () => {
  global.fetch = jest.fn(async (input: any) => {
    if (callOf([input]).url.endsWith("/tokens")) {
      return jsonResponse(200, { token: "sometoken" });
    }
    return jsonResponse(200, userInfo);
  }) as jest.Mock;

  renderProvider();
  signIn("me@tsuru.io", "chico");

  expect(await screen.findByText(/signed in as me@tsuru.io/)).toBeVisible();

  // Same request the tsuru CLI makes for the native scheme.
  expect(calls()[0]).toEqual({
    url: "http://localhost:8080/1.0/users/me%40tsuru.io/tokens",
    method: "POST",
    token: null,
    body: "password=chico",
  });
  expect(calls()[1]).toEqual({
    url: "http://localhost:8080/users/info",
    method: "GET",
    token: "Bearer sometoken",
    body: "",
  });
  expect(localStorage.getItem(tokenKeyStorage)).toBe("sometoken");
});

it("shows the reason the API gave for a rejected login", async () => {
  global.fetch = jest
    .fn()
    .mockResolvedValue(
      textResponse(401, "Authentication failed, wrong password.\n")
    );

  renderProvider();
  signIn("me@tsuru.io", "wrong");

  expect(
    await screen.findByText(
      /Failed to authenticate: Authentication failed, wrong password\./
    )
  ).toBeVisible();
  expect(localStorage.getItem(tokenKeyStorage)).toBeNull();
  // The form stays usable for another attempt.
  expect(screen.getByRole("button", { name: /sign in/i })).toBeEnabled();
});

it("boots straight from a stored token", async () => {
  localStorage.setItem(tokenKeyStorage, "storedtoken");
  global.fetch = jest.fn().mockResolvedValue(jsonResponse(200, userInfo));

  renderProvider();

  expect(await screen.findByText(/signed in as me@tsuru.io/)).toBeVisible();
  expect(calls()).toEqual([
    {
      url: "http://localhost:8080/users/info",
      method: "GET",
      token: "Bearer storedtoken",
      body: "",
    },
  ]);
});

it("asks for the credentials again when the stored token is rejected", async () => {
  localStorage.setItem(tokenKeyStorage, "expiredtoken");
  global.fetch = jest.fn().mockResolvedValue(textResponse(401, ""));

  renderProvider();

  expect(await screen.findByText(/session has expired/i)).toBeVisible();
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  expect(localStorage.getItem(tokenKeyStorage)).toBeNull();
});

it("surfaces an unexpected failure while loading the user", async () => {
  localStorage.setItem(tokenKeyStorage, "storedtoken");
  global.fetch = jest.fn().mockResolvedValue(textResponse(500, "boom"));

  renderProvider();

  expect(await screen.findByText(/Something went wrong/)).toBeVisible();
});

it("terminates the session on the server when logging off", async () => {
  localStorage.setItem(tokenKeyStorage, "storedtoken");
  global.fetch = jest.fn().mockResolvedValue(jsonResponse(200, userInfo));

  renderProvider();
  fireEvent.click(await screen.findByRole("button", { name: /logout/i }));

  expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();

  expect(calls()).toContainEqual({
    url: "http://localhost:8080/users/tokens",
    method: "DELETE",
    token: "Bearer storedtoken",
    body: "",
  });
  expect(localStorage.getItem(tokenKeyStorage)).toBeNull();
});
