import React from "react";
import { render, screen, act, within } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import AppAutoscaleList from "./AppAutoscaleList";
import { AppAutoscaleSchedule, AppAutoscalePrometheus } from "../../types/app";

const web_schedules: AppAutoscaleSchedule[] = [
  {
    minReplicas: 2,
    start: "15 7 * * *",
    end: "0 17 * * *",
    timezone: "America/Sao_Paulo",
  },
  {
    minReplicas: 3,
    start: "0 5 * * *",
    end: "30 5 * * *",
    timezone: "UTC",
  },
];

const web_prometheus: AppAutoscalePrometheus[] = [
  {
    name: "my_prometheus_metric1",
    threshold: 1,
    query: "my_query{app='my_app'}",
    prometheusAddress: "my-custom-prometheus.exemple.com",
  },
  {
    name: "my_prometheus_metric2",
    threshold: 5,
    query: "my_query{app='my_app'}",
    prometheusAddress: "my-default-prometheus.exemple.com",
  },
];

const worker_schedules: AppAutoscaleSchedule[] = [
  {
    minReplicas: 4,
    start: "0 6 * * *",
    end: "0 18 * * *",
    timezone: "America/Sao_Paulo",
  },
];

// The process row renders the expand toggle as a plain cell and the remaining
// columns as row headers (`component="th"`), so they are queried separately.
const expectProcessRow = (
  process: string,
  minUnits: string,
  maxUnits: string
) => {
  const row = screen
    .getAllByRole("row")
    .find((candidate) =>
      within(candidate).queryByRole("rowheader", { name: process })
    );
  expect(row).toBeDefined();
  expect(within(row!).getByRole("cell")).toHaveTextContent("");
  expect(
    within(row!)
      .getAllByRole("rowheader")
      .map((cell) => cell.textContent)
  ).toEqual([process, minUnits, maxUnits, "Edit"]);
};

test("render autoscales", () => {
  render(
    <BrowserRouter>
      <AppAutoscaleList
        app="test"
        autoscale={[
          {
            process: "web",
            minUnits: 1,
            maxUnits: 3,
            averageCPU: "500m",
            schedules: web_schedules,
            prometheus: web_prometheus,
            version: 10,
          },
          {
            process: "worker",
            minUnits: 2,
            maxUnits: 5,
            averageCPU: "750m",
            schedules: worker_schedules,
            version: 15,
          },
        ]}
      />
    </BrowserRouter>
  );
  expectProcessRow("web", "1", "3");
  expectProcessRow("worker", "2", "5");

  var schedule = screen.queryByLabelText("process scalers");
  expect(schedule).toBeNull(); //process scalers details is hidden

  var buttons = screen.getAllByLabelText("open process scalers details");
  act(() => {
    buttons[0].click(); //open autoscale details for 1st process on list
  });

  var scalers = screen.getAllByLabelText("process scalers");
  var triggers = scalers[0].childNodes[1]; //get list of triggers 1st process
  expect(triggers.childNodes[0].childNodes[0].textContent).toEqual("CPU");
  expect(triggers.childNodes[0].childNodes[1].textContent).toEqual(
    "Target: 50%"
  );
  expect(triggers.childNodes[1].childNodes[0].textContent).toEqual("Schedule");
  expect(triggers.childNodes[1].childNodes[1].textContent).toEqual(
    "Start: At 07:15 AM (15 7 * * *)End: At 05:00 PM (0 17 * * *)Units: 2Timezone: America/Sao_Paulo"
  );
  expect(triggers.childNodes[2].childNodes[0].textContent).toEqual("Schedule");
  expect(triggers.childNodes[2].childNodes[1].textContent).toEqual(
    "Start: At 05:00 AM (0 5 * * *)End: At 05:30 AM (30 5 * * *)Units: 3Timezone: UTC"
  );
  expect(triggers.childNodes[3].childNodes[0].textContent).toEqual(
    "Prometheus"
  );
  expect(triggers.childNodes[3].childNodes[1].textContent).toEqual(
    "Name: my_prometheus_metric1Threshold: 1Query: my_query{app='my_app'}PrometheusAddress: my-custom-prometheus.exemple.com"
  );

  act(() => {
    buttons[1].click(); //open autoscale details for 2nd process on list
  });

  scalers = screen.getAllByLabelText("process scalers"); //get new scalers list with both details open
  triggers = scalers[1].childNodes[1]; //get list of triggers 2nd process

  expect(triggers.childNodes[0].childNodes[0].textContent).toEqual("CPU");
  expect(triggers.childNodes[0].childNodes[1].textContent).toEqual(
    "Target: 75%"
  );
  expect(triggers.childNodes[1].childNodes[0].textContent).toEqual("Schedule");
  expect(triggers.childNodes[1].childNodes[1].textContent).toEqual(
    "Start: At 06:00 AM (0 6 * * *)End: At 06:00 PM (0 18 * * *)Units: 4Timezone: America/Sao_Paulo"
  );
});

test("render autoscale without schedule", () => {
  render(
    <BrowserRouter>
      <AppAutoscaleList
        app="test"
        autoscale={[
          {
            process: "web",
            minUnits: 1,
            maxUnits: 3,
            averageCPU: "750m",
            version: 10,
          },
        ]}
      />
    </BrowserRouter>
  );
  expectProcessRow("web", "1", "3");

  var schedule = screen.queryByLabelText("process scalers");
  expect(schedule).toBeNull(); //process scalers details is hidden

  var buttons = screen.getAllByLabelText("open process scalers details");
  act(() => {
    buttons[0].click(); //open autoscale details for 1st process on list
  });

  schedule = screen.getByLabelText("process scalers");
  var triggers = schedule.childNodes[1]; //get list of triggers
  expect(triggers.childNodes[0].childNodes[0].textContent).toEqual("CPU");
  expect(triggers.childNodes[0].childNodes[1].textContent).toEqual(
    "Target: 75%"
  );
});

test("render autoscale without cpu", () => {
  render(
    <BrowserRouter>
      <AppAutoscaleList
        app="test"
        autoscale={[
          {
            process: "web",
            minUnits: 1,
            maxUnits: 3,
            schedules: worker_schedules,
            version: 10,
          },
        ]}
      />
    </BrowserRouter>
  );
  expectProcessRow("web", "1", "3");

  var schedule = screen.queryByLabelText("process scalers");
  expect(schedule).toBeNull(); //process scalers details is hidden

  var buttons = screen.getAllByLabelText("open process scalers details");
  act(() => {
    buttons[0].click(); //open autoscale details for 1st process on list
  });

  schedule = screen.getByLabelText("process scalers");
  var triggers = schedule.childNodes[1]; //get list of triggers
  expect(triggers.childNodes[0].childNodes[0].textContent).toEqual("Schedule");
  expect(triggers.childNodes[0].childNodes[1].textContent).toEqual(
    "Start: At 06:00 AM (0 6 * * *)End: At 06:00 PM (0 18 * * *)Units: 4Timezone: America/Sao_Paulo"
  );
});
