import { Config } from "./types/config";
import defaults from "./configDefaults";

let current: Config | null = null;

// Where the deployment-specific config is expected. PUBLIC_URL is inlined at
// build time, so the path is baked into the artifact -- a deployment served
// under a different prefix still needs a rebuild. Resolving this at runtime is
// tracked as a follow-up.
const configURL = `${process.env.PUBLIC_URL}/config.js`;

// Reads the config loaded at boot. Throws instead of falling back to the
// defaults, so a module that reads the config at import time fails loudly here
// rather than silently shipping the built-in values.
const getConfig = (): Config => {
  if (!current) {
    throw new Error(
      "config read before loadConfig() resolved: some module reads the config " +
        "at import time. Modules that read config must only be reachable from " +
        "the dynamic import of App in src/index.tsx."
    );
  }

  return current;
};

// Loads ${PUBLIC_URL}/config.js, a native ES module served next to index.html
// and outside the bundle, and merges it over the built-in defaults. The file is
// optional: without it the app boots on the defaults alone.
const loadConfig = async (): Promise<Config> => {
  let override: Partial<Config> = {};

  try {
    const mod = await import(/* webpackIgnore: true */ configURL);
    override = mod.default || {};
  } catch (e) {
    // Also hit when the file is simply absent, which is the expected case for a
    // plain checkout. A malformed config.js lands here too and currently falls
    // back to the defaults -- validating it is a follow-up.
    console.warn(`could not load runtime config from ${configURL}`, e);
  }

  current = { ...defaults, ...override };

  return current;
};

const setConfigForTests = (config: Config) => {
  current = config;
};

export { getConfig, loadConfig, setConfigForTests, configURL };
