import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { MemoryRouter, Route, Routes, Link } from "react-router-dom";
import userEvent from "@testing-library/user-event";

import ErrorBoundary, { RouteErrorBoundary } from "./ErrorBoundary";

// Reached through DisplayError -> Console. Prism ships untranspiled ESM, which
// the CRA jest transform does not pick up from node_modules.
jest.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}));
jest.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  materialDark: {},
}));

const Boom = () => {
  throw new Error("the view exploded");
};

// React logs every caught error to console.error. That is noise here, not a
// signal, so it is silenced per test rather than left to pollute the run.
let consoleError: jest.SpyInstance;

beforeEach(() => {
  consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  consoleError.mockRestore();
});

test("renders its children when they do not throw", () => {
  render(
    <ErrorBoundary>
      <p>the app</p>
    </ErrorBoundary>
  );

  expect(screen.getByText("the app")).toBeInTheDocument();
});

test("shows the error instead of a blank page when a child throws", () => {
  render(
    <ErrorBoundary>
      <Boom />
    </ErrorBoundary>
  );

  expect(
    screen.getByText("Something went wrong: the view exploded")
  ).toBeInTheDocument();
});

test("renders the new children once the reset key changes", () => {
  const { rerender } = render(
    <ErrorBoundary resetKey="/apps/broken">
      <Boom />
    </ErrorBoundary>
  );

  // The user navigates somewhere else. Without a reset they would stay stuck
  // on the error screen for the rest of the session.
  rerender(
    <ErrorBoundary resetKey="/apps">
      <p>the apps list</p>
    </ErrorBoundary>
  );

  expect(screen.getByText("the apps list")).toBeInTheDocument();
});

test("keeps showing the error while the reset key is unchanged", () => {
  const { rerender } = render(
    <ErrorBoundary resetKey="/apps/broken">
      <Boom />
    </ErrorBoundary>
  );

  rerender(
    <ErrorBoundary resetKey="/apps/broken">
      <p>the apps list</p>
    </ErrorBoundary>
  );

  expect(screen.queryByText("the apps list")).toBeNull();
});

describe("RouteErrorBoundary", () => {
  test("recovers when the user navigates to another route", async () => {
    render(
      <MemoryRouter initialEntries={["/broken"]}>
        <RouteErrorBoundary>
          <nav>
            <Link to="/">Apps</Link>
          </nav>
          <Routes>
            <Route path="/broken" element={<Boom />} />
            <Route path="/" element={<p>the apps list</p>} />
          </Routes>
        </RouteErrorBoundary>
      </MemoryRouter>
    );

    expect(
      screen.getByText("Something went wrong: the view exploded")
    ).toBeInTheDocument();

    // The chrome is inside the boundary in this fixture, so the link is gone.
    // Navigation is what a user still has, via the sidebar rendered outside it.
    await userEvent.click(screen.getByText("Back to safety"));

    expect(screen.getByText("the apps list")).toBeInTheDocument();
  });
});
