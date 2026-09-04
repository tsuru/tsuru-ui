import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";

import AppsDashboard, { groupAppsByRelevance } from "./AppsDashboard";
import config from "../../config";
import { AppResume, UnitsResume } from "../../types/app";
import * as appHooks from "../../hooks/app";

jest.mock("../../hooks/app");

// Which pools count as production is deployment-specific, so the view is
// exercised against a fixture the test controls rather than whatever the
// bundled config happens to ship.
jest.mock("../../config", () => ({
  __esModule: true,
  default: {
    ...jest.requireActual("../../configDefaults").default,
  },
}));

// Reached through DisplayError -> Console. Prism ships untranspiled ESM, which
// the CRA jest transform does not pick up from node_modules.
jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}));
jest.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  materialDark: {},
}));

const mockUseAppsResume = appHooks.useAppsResume as jest.MockedFunction<
  typeof appHooks.useAppsResume
>;

const units = (overrides: Partial<UnitsResume>): UnitsResume => ({
  ready: 1,
  created: 0,
  started: 1,
  starting: 0,
  stopped: 0,
  error: 0,
  total: 1,
  ...overrides,
});

const app = (name: string, pool: string, u: UnitsResume): AppResume => ({
  name,
  platform: "go",
  teamowner: "some-team",
  pool,
  units: u,
  plan: { name: "c1m1" },
  tags: [],
});

const failing = units({ ready: 0, started: 0, error: 1 });

const apps = [
  app("api", "prod-pool", failing),
  app("worker", "dev-pool", failing),
  app("web", "prod-pool", units({})),
  app("cleaner", "dev-pool", units({ ready: 0, started: 0, total: 0 })),
];

const names = (group: Array<AppResume>) => group.map((a) => a.name);

afterEach(() => {
  delete config.productionPoolRegex;
});

describe("groupAppsByRelevance", () => {
  test("puts every unhealthy app in one bucket when no production pool is configured", () => {
    const relevance = groupAppsByRelevance(apps);

    expect(names(relevance.unhealthy)).toEqual(["api", "worker"]);
    expect(names(relevance.unhealthyProduction)).toEqual([]);
    expect(names(relevance.healthy)).toEqual(["web"]);
    expect(names(relevance.stopped)).toEqual(["cleaner"]);
  });

  test("separates unhealthy apps in production pools when a regex is configured", () => {
    config.productionPoolRegex = /^prod-/;

    const relevance = groupAppsByRelevance(apps);

    expect(names(relevance.unhealthyProduction)).toEqual(["api"]);
    expect(names(relevance.unhealthy)).toEqual(["worker"]);
  });

  test("treats a stopped app as stopped even in a production pool", () => {
    config.productionPoolRegex = /^prod-/;

    const relevance = groupAppsByRelevance([
      app("idle", "prod-pool", units({ ready: 0, started: 0, total: 0 })),
    ]);

    expect(names(relevance.stopped)).toEqual(["idle"]);
    expect(names(relevance.unhealthyProduction)).toEqual([]);
  });
});

describe("AppsDashboard", () => {
  const renderDashboard = () =>
    render(
      <BrowserRouter>
        <AppsDashboard />
      </BrowserRouter>
    );

  beforeEach(() => {
    // The group headings only render in the card visualization; the default is
    // the table, which does not show them.
    window.localStorage.tsuruAppsVisualization = "cards";

    mockUseAppsResume.mockReturnValue({
      loading: false,
      error: undefined,
      value: apps,
    });
  });

  afterEach(() => {
    window.localStorage.clear();
    jest.clearAllMocks();
  });

  test("labels the unhealthy group generically when no production pool is configured", () => {
    renderDashboard();

    expect(screen.getAllByText("Unhealthy").length).toBeGreaterThan(0);
    expect(screen.queryByText("Unhealthy PROD")).toBeNull();
    expect(screen.queryByText("Unhealthy DEV")).toBeNull();
  });

  test("labels the unhealthy groups by environment when a production pool is configured", () => {
    config.productionPoolRegex = /^prod-/;

    renderDashboard();

    expect(screen.getAllByText("Unhealthy PROD").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unhealthy DEV").length).toBeGreaterThan(0);
    expect(screen.queryByText("Unhealthy")).toBeNull();
  });
});
