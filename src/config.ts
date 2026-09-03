import { Config } from "./types/config";
import { getConfig } from "./configRuntime";

// The app imports the config as a value (`import config from "../config"`) in
// ~30 places. The config is now resolved at boot instead of at build time, so
// this proxy forwards every read to whatever loadConfig() produced, keeping
// those imports untouched. Reading before the config is loaded throws -- see
// getConfig.
const config = new Proxy({} as Config, {
  get: (_target, prop) => (getConfig() as any)[prop],
  // Without this, a write would land on the empty proxy target while reads kept
  // coming from the loaded config, silently dropping the assignment.
  set: (_target, prop, value) => {
    (getConfig() as any)[prop] = value;
    return true;
  },
  deleteProperty: (_target, prop) => delete (getConfig() as any)[prop],
  has: (_target, prop) => prop in getConfig(),
  ownKeys: () => Reflect.ownKeys(getConfig()),
  getOwnPropertyDescriptor: (_target, prop) =>
    Object.getOwnPropertyDescriptor(getConfig(), prop),
});

export default config;
