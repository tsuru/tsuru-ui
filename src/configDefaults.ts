import { Config } from "./types/config";

// Built-in defaults, bundled with the app. They are deliberately generic: a
// deployment ships its own /ui/config.js, which is loaded at boot and merged
// over these (see configRuntime.ts).
//
// Everything deployment-specific -- observability links, cloud provider log
// URLs, pool groups, certificate issuers, the service catalog -- is left unset
// here. The UI hides those features when the corresponding entry is missing, so
// a plain checkout runs without them rather than pointing at someone else's
// infrastructure.
const config: Config = {
  server: "http://localhost:8080",
  prefix: "/ui",
  docsURL: "https://docs.tsuru.io",

  // Suffixes treated as internal when suggesting ACL rules. Only the generic
  // Kubernetes ones; a deployment adds its own domains.
  internalDomains: [".cluster.local", ".svc"],

  // Upstream tsuru guides. Platforms without an entry simply show no guide
  // link.
  platformGuides: {
    java: "https://docs.tsuru.io/latest/using/java.html",
    php: "https://docs.tsuru.io/latest/using/php.html",
    ruby: "https://docs.tsuru.io/latest/using/ruby.html",
    static: "https://github.com/tsuru/platforms/tree/master/static",
    perl: "https://github.com/tsuru/platforms/tree/master/perl",
    scratch: "https://github.com/tsuru/platforms/tree/master/scratch",
  },
};

export default config;
