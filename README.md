# tsuru-ui

A web UI for [tsuru](https://github.com/tsuru/tsuru), talking directly to the
tsuru API from the browser. React 19 + TypeScript + MUI.

## What it covers

- **Apps** — create wizard, units, deploys, logs, env vars, scale, start/stop/restart, CNAMEs, service and volume binds
- **Jobs**, **volumes**, **events** and deploy history
- **Service instances** — generic ones plus dedicated views for `rpaas` and `acl` engines
- **Provisioner** — clusters, pools and platforms
- **Auth** — tokens, teams and user info

## Running

```sh
make setup   # npm install
make run     # dev server on http://localhost:3000/ui
```

The UI needs a reachable tsuru API. It defaults to `http://localhost:8080` and
discovers how to authenticate from the API itself (`/1.18/auth/schemes`), the
same way the CLI does — native, oauth2 and oidc are supported.

## Configuration

Defaults live in `src/configDefaults.ts`. A deployment overrides them with a
`config.js` served next to `index.html` (`public/config.js` in development),
loaded at boot as a native ES module and merged over the defaults:

```js
export default {
  server: "https://tsuru.example.com",
  services: [
    { name: "rpaasv2", title: "Ingress", engine: "rpaas", icon: "nginx" },
  ],
};
```

Everything deployment-specific — the service catalog, Grafana and cloud
provider log links, pool groups, certificate issuers — is optional; the UI
hides those features when the entry is missing. See `src/types/config.ts` for
the full shape.

## Build

```sh
make build   # build/ with nginx.conf, ready to be deployed as a tsuru app
make test
make prettier
```

The app is served under `/ui`. `PUBLIC_URL` is inlined at build time, so
serving it under a different prefix requires a rebuild.

## License

BSD 3-Clause. See [LICENSE](LICENSE).
