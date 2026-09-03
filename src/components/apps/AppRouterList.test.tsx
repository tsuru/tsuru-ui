import React from "react";
import { render, screen } from "@testing-library/react";
import AppRouterList from "./AppRouterList";

test("renders ready router", () => {
  render(
    <AppRouterList
      routers={[
        {
          name: "my-router",
          addresses: ["https://my-app.my-router.com"],
          status: "ready",
          "status-detail": "",
        },
      ]}
    />
  );
  const span = screen.getByText("https://my-app.my-router.com");
  expect(span).toBeInTheDocument();

  const icon = screen.getByTestId("BeenhereIcon");

  expect(icon).toBeInTheDocument();
  expect(icon.getAttribute("aria-label")).toEqual("router my-router is ready");
});

test("renders not ready router", () => {
  render(
    <AppRouterList
      routers={[
        {
          name: "my-router",
          addresses: ["https://my-app.my-router.com"],
          status: "not-ready",
          "status-detail": "working",
        },
      ]}
    />
  );
  const span = screen.getByText("https://my-app.my-router.com");
  expect(span).toBeInTheDocument();

  const icon = screen.getByTestId("CancelIcon");

  expect(icon).toBeInTheDocument();
  expect(icon.getAttribute("aria-label")).toEqual(
    "router my-router is not-ready: working"
  );
});

test("renders many routers", () => {
  render(
    <AppRouterList
      routers={[
        {
          name: "my-router",
          addresses: [
            "https://my-app.my-router.com",
            "https://my-app2.my-router.com",
          ],
          status: "ready",
          "status-detail": "",
        },
        {
          name: "my-router2",
          addresses: [
            "https://my-app.my-router2.com",
            "https://my-app2.my-router2.com",
          ],
          status: "ready",
          "status-detail": "",
        },
      ]}
    />
  );
  let span = screen.getByText("https://my-app.my-router.com");
  expect(span).toBeInTheDocument();
  span = screen.getByText("https://my-app2.my-router.com");
  expect(span).toBeInTheDocument();
  span = screen.getByText("https://my-app.my-router2.com");
  expect(span).toBeInTheDocument();
  span = screen.getByText("https://my-app2.my-router2.com");
  expect(span).toBeInTheDocument();

  const icons = screen.getAllByTestId("BeenhereIcon");

  expect(icons).toHaveLength(4);
  expect(icons[0].getAttribute("aria-label")).toEqual(
    "router my-router is ready"
  );
  expect(icons[1].getAttribute("aria-label")).toEqual(
    "router my-router is ready"
  );
  expect(icons[2].getAttribute("aria-label")).toEqual(
    "router my-router2 is ready"
  );
  expect(icons[3].getAttribute("aria-label")).toEqual(
    "router my-router2 is ready"
  );
});
