import React from "react";
import { render, screen } from "@testing-library/react";
import VolumeCard from "./VolumeCard";
import { BrowserRouter } from "react-router-dom";

test("renders", () => {
  render(
    <BrowserRouter>
      <VolumeCard volumeName="blah" planName="gcp" />
    </BrowserRouter>
  );
  let element = screen.getByText("blah");
  expect(element).toBeInTheDocument();

  element = screen.getByText("gcp");
  expect(element).toBeInTheDocument();
});
