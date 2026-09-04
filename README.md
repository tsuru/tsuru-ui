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
hides those features when the entry is missing.

[`public/config.js.example`](public/config.js.example) documents every option
with a worked value; copy it to `public/config.js` and delete what you don't
need. `src/types/config.ts` has the exact types.

## Build

```sh
make build   # build/ with nginx.conf, ready to be deployed as a tsuru app
make test        # jest, single run
make lint        # eslint
make typecheck   # tsc --noEmit
make prettier    # format src/ in place
```

Every push to `main` and every pull request runs
[`.github/workflows/ci.yml`](.github/workflows/ci.yml): tests with a coverage
report in the job summary (and the full lcov/HTML report as an artifact),
plus eslint (no errors and no warnings allowed), `prettier --check` and
`tsc --noEmit`.

The app is served under `/ui`. `PUBLIC_URL` is inlined at build time, so
serving it under a different prefix requires a rebuild.

## Published artifact

Once the checks pass, pushes to `main` and git tags publish `build/` to Docker
Hub as an OCI artifact via [ORAS](https://oras.land) — `main` keeps `latest`
current, a tag publishes under its own name:

```sh
oras pull docker.io/tsuru/tsuru-ui:latest   # unpacks build/ into the cwd
```

It is an artifact, not a runnable image: the layer is the `build/` tree
(`nginx.conf` included) as `application/vnd.tsuru.ui.static.v1`, annotated with
the source revision and the `/ui` prefix it was built for.

Publishing needs two repository secrets, `DOCKERHUB_USERNAME` and
`DOCKERHUB_TOKEN` (a Docker Hub access token with write access to
`tsuru/tsuru-ui`). Until they are set the publish job fails at its login step,
which runs before the build so it costs seconds; test and lint are unaffected.

## License

BSD 3-Clause. See [LICENSE](LICENSE).
