import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom";

import AppConfigurationStep from "./AppConfigurationStep";
import config from "../../../config";
import { Pool } from "../../../types/provisioner";
import * as provisionerHooks from "../../../hooks/provisioner";
import * as authHooks from "../../../hooks/auth";

jest.mock("../../../hooks/provisioner");
jest.mock("../../../hooks/auth");

// Pool groups are deployment-specific, so each test sets the fixture it needs
// on top of the bundled defaults, which ship none.
jest.mock("../../../config", () => ({
  __esModule: true,
  default: {
    ...jest.requireActual("../../../configDefaults").default,
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

const mockUsePools = provisionerHooks.usePools as jest.MockedFunction<
  typeof provisionerHooks.usePools
>;
const mockUsePlatforms = provisionerHooks.usePlatforms as jest.MockedFunction<
  typeof provisionerHooks.usePlatforms
>;
const mockUseTeams = authHooks.useTeams as jest.MockedFunction<
  typeof authHooks.useTeams
>;

const pool = (name: string, teams: Array<string>): Pool => ({
  Name: name,
  Provisioner: "kubernetes",
  Default: false,
  allowed: {
    plan: [],
    router: [],
    service: [],
    team: teams,
    "volume-plan": [],
  },
});

const pools = [pool("dev-a-dev", ["myteam"]), pool("dev-b-prod", ["other"])];

// The pool and platform selects share the same role, so the pool one is found
// through its own section.
const poolSelect = () => {
  const section = screen.getByText("Pool").closest(".MuiCard-root");
  return within(section as HTMLElement).getByRole("combobox");
};

const asyncValue = <T,>(value: T) =>
  ({ loading: false, value, error: undefined } as any);

describe("AppConfigurationStep", () => {
  beforeEach(() => {
    mockUsePools.mockReturnValue(asyncValue(pools));
    mockUsePlatforms.mockReturnValue(asyncValue([]));
    mockUseTeams.mockReturnValue(asyncValue([{ name: "myteam" } as any]));
  });

  afterEach(() => {
    delete config.appPoolGroups;
    jest.clearAllMocks();
  });

  it("offers the pools of the team directly when no pool groups are configured", () => {
    render(
      <AppConfigurationStep
        formData={{ team: "myteam" }}
        onChange={jest.fn()}
      />
    );

    expect(
      screen.queryByText("Deployment Environment")
    ).not.toBeInTheDocument();
    expect(screen.getByText("Pool")).toBeVisible();

    fireEvent.mouseDown(poolSelect());

    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["dev-a-dev"]);
  });

  it("requires a pool group first when pool groups are configured", () => {
    config.appPoolGroups = [
      { name: "Development", description: "dev pools", regex: /-dev$/ },
    ];

    const { rerender } = render(
      <AppConfigurationStep
        formData={{ team: "myteam" }}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText("Deployment Environment")).toBeInTheDocument();
    expect(screen.getByText("Pool")).not.toBeVisible();

    rerender(
      <AppConfigurationStep
        formData={{ team: "myteam", poolGroup: "Development" }}
        onChange={jest.fn()}
      />
    );

    expect(screen.getByText("Pool")).toBeVisible();

    fireEvent.mouseDown(poolSelect());

    expect(
      screen.getAllByRole("option").map((option) => option.textContent)
    ).toEqual(["dev-a-dev"]);
  });
});
