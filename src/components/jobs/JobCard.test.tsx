import React from "react";
import { render, screen } from "@testing-library/react";
import JobCard from "./JobCard";
import { BrowserRouter } from "react-router-dom";

test("renders", () => {
  render(
    <BrowserRouter>
      <JobCard jobName="blah" schedule="* * * * * " />
    </BrowserRouter>
  );
  const linkElement = screen.getByText("Every minute");
  expect(linkElement).toBeInTheDocument();
});
