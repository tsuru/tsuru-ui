import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PrometheusMetricForm from "./PrometheusMetricForm";
import { AppAutoscalePrometheus } from "../../types/app";

describe("PrometheusMetricForm", () => {
  const mockOnMetricsChange = jest.fn();

  beforeEach(() => {
    mockOnMetricsChange.mockClear();
  });

  test("renders empty state", () => {
    render(
      <PrometheusMetricForm
        metrics={[]}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    expect(screen.getByText("Prometheus Metrics")).toBeInTheDocument();
    expect(screen.getByText(/0 metrics/i)).toBeInTheDocument();
    expect(
      screen.getByText(/No custom metrics configured/i)
    ).toBeInTheDocument();
  });

  test("shows add metric button", () => {
    render(
      <PrometheusMetricForm
        metrics={[]}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    const addButton = screen.getByRole("button", { name: /add metric/i });
    expect(addButton).toBeInTheDocument();
  });

  test("adds a new metric with default values", () => {
    render(
      <PrometheusMetricForm
        metrics={[]}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    const addButton = screen.getByRole("button", { name: /add metric/i });
    fireEvent.click(addButton);

    expect(mockOnMetricsChange).toHaveBeenCalledWith([
      {
        name: "",
        threshold: 100,
        query: "",
        prometheusAddress: "",
      },
    ]);
  });

  test("renders existing metrics", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "request_rate",
        threshold: 1000,
        query: 'sum(rate(http_requests_total{app="myapp"}[5m]))',
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    expect(screen.getByText("request_rate")).toBeInTheDocument();
    expect(screen.getByText(/Threshold: 1000/i)).toBeInTheDocument();
  });

  test("displays metric count correctly", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "request_rate",
        threshold: 1000,
        query: 'sum(rate(http_requests_total{app="myapp"}[5m]))',
        prometheusAddress: "https://prometheus.example.com",
      },
      {
        name: "queue_length",
        threshold: 50,
        query: 'avg(queue_length{app="myapp"})',
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    expect(screen.getByText(/2 metrics/i)).toBeInTheDocument();
  });

  test("displays default name when metric has no name", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "",
        threshold: 100,
        query: "some_query",
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    expect(screen.getByText("Metric 1")).toBeInTheDocument();
  });

  test("expands and collapses metric cards", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "test_metric",
        threshold: 100,
        query: "test_query",
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    // Initially expanded (default state)
    expect(screen.getByLabelText(/metric name/i)).toBeVisible();
    expect(screen.getByTestId("ExpandLessIcon")).toBeInTheDocument();

    // The whole header row toggles the card, so a click on the title bubbles up
    fireEvent.click(screen.getByText("test_metric"));

    expect(screen.getByTestId("ExpandMoreIcon")).toBeInTheDocument();
  });

  test("removes metric when delete button is clicked", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "metric_to_remove",
        threshold: 100,
        query: "query1",
        prometheusAddress: "https://prometheus.example.com",
      },
      {
        name: "metric_to_keep",
        threshold: 200,
        query: "query2",
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    const deleteButtons = screen.getAllByRole("button", {
      name: /remove metric/i,
    });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnMetricsChange).toHaveBeenCalledWith([metrics[1]]);
  });

  test("updates metric name", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "old_name",
        threshold: 100,
        query: "test_query",
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    const nameInput = screen.getByLabelText(/metric name/i);
    fireEvent.change(nameInput, { target: { value: "new_name" } });

    expect(mockOnMetricsChange).toHaveBeenCalledWith([
      {
        ...metrics[0],
        name: "new_name",
      },
    ]);
  });

  test("updates threshold value", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "test_metric",
        threshold: 100,
        query: "test_query",
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    const thresholdInput = screen.getByLabelText(/threshold/i);
    fireEvent.change(thresholdInput, { target: { value: "500" } });

    expect(mockOnMetricsChange).toHaveBeenCalledWith([
      {
        ...metrics[0],
        threshold: 500,
      },
    ]);
  });

  test("updates query", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "test_metric",
        threshold: 100,
        query: "old_query",
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    const queryInput = screen.getByPlaceholderText(/http_requests_total/);

    fireEvent.change(queryInput, { target: { value: "new_query" } });

    expect(mockOnMetricsChange).toHaveBeenCalledWith([
      {
        ...metrics[0],
        query: "new_query",
      },
    ]);
  });

  test("updates prometheus address", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "test_metric",
        threshold: 100,
        query: "test_query",
        prometheusAddress: "https://old.prometheus.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    const addressInput = screen.getByLabelText(/prometheus server url/i);
    fireEvent.change(addressInput, {
      target: { value: "https://new.prometheus.com" },
    });

    expect(mockOnMetricsChange).toHaveBeenCalledWith([
      {
        ...metrics[0],
        prometheusAddress: "https://new.prometheus.com",
      },
    ]);
  });

  test("shows sample queries when button is clicked", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "test_metric",
        threshold: 100,
        query: "",
        prometheusAddress: "",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    const showExamplesButton = screen.getByRole("button", {
      name: /show examples/i,
    });
    fireEvent.click(showExamplesButton);

    // Should show sample queries
    expect(screen.getByText(/Request Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/Queue Length/i)).toBeInTheDocument();
  });

  test("applies sample query when clicked", async () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "",
        threshold: 100,
        query: "",
        prometheusAddress: "",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    // Show examples
    const showExamplesButton = screen.getByRole("button", {
      name: /show examples/i,
    });
    fireEvent.click(showExamplesButton);

    // The whole sample box is clickable, so a click on its title bubbles up
    fireEvent.click(screen.getByText("Request Rate"));

    // Should have been called with the sample query
    await waitFor(() => expect(mockOnMetricsChange).toHaveBeenCalled());

    const firstCall = mockOnMetricsChange.mock.calls[0][0];
    expect(firstCall[0].query).toContain("http_requests_total");
  });

  test("displays threshold > 0 in chip", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "test_metric",
        threshold: 250,
        query: "test_query",
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    expect(screen.getByText(/Threshold: 250/i)).toBeInTheDocument();
  });

  test("does not display threshold chip when threshold is 0", () => {
    const metrics: AppAutoscalePrometheus[] = [
      {
        name: "test_metric",
        threshold: 0,
        query: "test_query",
        prometheusAddress: "https://prometheus.example.com",
      },
    ];

    render(
      <PrometheusMetricForm
        metrics={metrics}
        onMetricsChange={mockOnMetricsChange}
      />
    );

    expect(screen.queryByText(/Threshold: 0/i)).not.toBeInTheDocument();
  });
});
