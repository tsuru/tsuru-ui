import { Config } from "./types/config";
import { AuthScheme } from "./types/authScheme";

// setupTests.ts seeds the shared module instance, so each test builds fresh
// copies of authSchemes and configRuntime in an isolated module registry.
const freshModules = () => {
  let authSchemes: typeof import("./authSchemes");
  let configRuntime: typeof import("./configRuntime");

  jest.isolateModules(() => {
    authSchemes = require("./authSchemes");
    configRuntime = require("./configRuntime");
  });

  return { authSchemes: authSchemes!, configRuntime: configRuntime! };
};

const config = { server: "http://tsuru.example.com", prefix: "/ui" } as Config;

const mockFetchResponse = (response: Partial<Response>) => {
  global.fetch = jest.fn().mockResolvedValue(response);
};

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

it("throws when read before loadAuthScheme resolves", () => {
  const { authSchemes } = freshModules();

  expect(() => authSchemes.getAuthScheme()).toThrow(
    /auth scheme read before loadAuthScheme/
  );
});

it("loads the schemes from the API and picks the default one", async () => {
  const { authSchemes, configRuntime } = freshModules();
  configRuntime.setConfigForTests(config);

  const schemes: AuthScheme[] = [
    { name: "native", data: {} },
    { name: "oidc", default: true, data: { clientID: "tsuru" } },
  ];
  mockFetchResponse({ ok: true, json: async () => schemes });

  const scheme = await authSchemes.loadAuthScheme();

  expect(global.fetch).toHaveBeenCalledWith(
    "http://tsuru.example.com/1.18/auth/schemes"
  );
  expect(scheme.name).toBe("oidc");
  expect(authSchemes.getAuthScheme()).toBe(scheme);
});

it("falls back to the first scheme when none is marked default", async () => {
  const { authSchemes, configRuntime } = freshModules();
  configRuntime.setConfigForTests(config);

  const schemes: AuthScheme[] = [
    { name: "oauth", data: { authorizeUrl: "http://idp/authorize" } },
    { name: "native", data: {} },
  ];
  mockFetchResponse({ ok: true, json: async () => schemes });

  const scheme = await authSchemes.loadAuthScheme();

  expect(scheme.name).toBe("oauth");
});

it("throws when the API returns no schemes", async () => {
  const { authSchemes, configRuntime } = freshModules();
  configRuntime.setConfigForTests(config);

  mockFetchResponse({ ok: true, json: async () => [] });

  await expect(authSchemes.loadAuthScheme()).rejects.toThrow(
    /returned no auth schemes/
  );
});

it("throws on a non-ok response", async () => {
  const { authSchemes, configRuntime } = freshModules();
  configRuntime.setConfigForTests(config);

  mockFetchResponse({ ok: false, status: 404 });

  await expect(authSchemes.loadAuthScheme()).rejects.toThrow(
    /status code: 404/
  );
});

it("propagates network errors", async () => {
  const { authSchemes, configRuntime } = freshModules();
  configRuntime.setConfigForTests(config);

  global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

  await expect(authSchemes.loadAuthScheme()).rejects.toThrow("network down");
});
