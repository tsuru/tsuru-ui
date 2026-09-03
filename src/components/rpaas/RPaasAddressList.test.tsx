import { render, screen } from "@testing-library/react";
import RPaasAddressList from "./RPaasAddressList";

test("renders ready router", () => {
  render(
    <RPaasAddressList
      addresses={[
        {
          type: "cluster-external",
          hostname: "https://my-app.my-router.com",
          status: "ready",
        },
      ]}
    />
  );
  const span = screen.getByText("https://my-app.my-router.com");
  expect(span).toBeInTheDocument();

  const icon = screen.getByTestId("BeenhereIcon");

  expect(icon).toBeInTheDocument();
  expect(icon.getAttribute("aria-label")).toEqual(
    "is a ready cluster-external address"
  );
});

test("renders not ready router", () => {
  render(
    <RPaasAddressList
      addresses={[
        {
          type: "cluster-external",
          hostname: "https://my-app.my-router.com",
          status: "not ready yet",
        },
      ]}
    />
  );
  const span = screen.getByText("https://my-app.my-router.com");
  expect(span).toBeInTheDocument();

  const icon = screen.getByTestId("CancelIcon");

  expect(icon).toBeInTheDocument();
  expect(icon.getAttribute("aria-label")).toEqual("is not ready yet");
});

test("renders no addresses", () => {
  render(<RPaasAddressList />);
  const alert1 = screen.getByText("Addresses not available yet");
  expect(alert1).toBeInTheDocument();

  const alert2 = screen.getByText(
    "If this takes too long, you might not have quota to create more RPaaS"
  );
  expect(alert2).toBeInTheDocument();
});
