import React from "react";
import { render, screen } from "@testing-library/react";
import { alpha, createTheme } from "@mui/material";

import AppCard from "./AppCard";
import config from "../../config";
import { BrowserRouter } from "react-router-dom";

// Which pools count as production is deployment-specific, so the card is
// exercised against a fixture the test controls.
jest.mock("../../config", () => ({
  __esModule: true,
  default: {
    ...jest.requireActual("../../configDefaults").default,
  },
}));

const theme = createTheme();
const danger = alpha(theme.palette.error.main, 0.08);
const warning = alpha(theme.palette.warning.main, 0.08);

// The severity only shows up as the Card's background colour, and the Card is
// the rendered root, so this reaches for it directly rather than through a
// query.
const cardFor = (
  poolName?: string,
  units = { ready: 0, total: 10, error: 1 }
) => {
  const { container } = render(
    <BrowserRouter>
      <AppCard appName="blah" units={units} poolName={poolName} />
    </BrowserRouter>
  );

  // eslint-disable-next-line testing-library/no-node-access
  return container.firstElementChild as HTMLElement;
};

afterEach(() => {
  delete config.productionPoolRegex;
});

test("renders ready units", () => {
  render(
    <BrowserRouter>
      <AppCard appName="blah" units={{ ready: 10, total: 10, error: 0 }} />
    </BrowserRouter>
  );
  const linkElement = screen.getByText("10/10 units ready");
  expect(linkElement).toBeInTheDocument();
});

test("renders error units", () => {
  render(
    <BrowserRouter>
      <AppCard appName="blah" units={{ ready: 9, total: 10, error: 1 }} />
    </BrowserRouter>
  );
  const linkElement = screen.getByText("1 units with errors");
  expect(linkElement).toBeInTheDocument();
});

test("renders zero units", async () => {
  const card = cardFor(undefined, { ready: 0, total: 0, error: 0 });

  expect(card).toHaveClass("MuiPaper-elevation1");
  expect(screen.queryByText("units")).toBeNull();
});

test("marks unit errors as danger when no production pool is configured", () => {
  const card = cardFor("some-pool");

  expect(card).toHaveStyle({ backgroundColor: danger });
});

test("softens unit errors outside production when a production pool is configured", () => {
  config.productionPoolRegex = /^prod-/;

  const card = cardFor("dev-pool");

  expect(card).toHaveStyle({ backgroundColor: warning });
});

test("keeps unit errors in a production pool as danger", () => {
  config.productionPoolRegex = /^prod-/;

  const card = cardFor("prod-pool");

  expect(card).toHaveStyle({ backgroundColor: danger });
});
