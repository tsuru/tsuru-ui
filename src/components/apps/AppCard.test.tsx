import React from "react";
import { render, screen } from "@testing-library/react";

import AppCard from "./AppCard";
import { BrowserRouter, Route, Routes } from "react-router-dom";

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
  const result = render(
    <BrowserRouter>
      <AppCard appName="blah" units={{ ready: 0, total: 0, error: 0 }} />
    </BrowserRouter>
  );
  const linkElement = screen.queryByText("units");
  expect(
    result.container.getElementsByClassName("MuiPaper-elevation1")
  ).toHaveLength(1);
  expect(linkElement).toBeNull();
});
