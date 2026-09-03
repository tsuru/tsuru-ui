// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

import defaults from "./configDefaults";
import { setConfigForTests } from "./configRuntime";
import { setAuthSchemeForTests } from "./authSchemes";

// Tests never run the boot sequence, so seed the config with the built-in
// defaults and the auth scheme with a plausible oidc one. A test that needs
// different values calls setConfigForTests/setAuthSchemeForTests itself.
setConfigForTests(defaults);
setAuthSchemeForTests({
  name: "oidc",
  default: true,
  data: {
    clientID: "tsuru",
    scopes: ["openid", "email"],
    authURL: "http://localhost:8080/auth",
    tokenURL: "http://localhost:8080/token",
  },
});
