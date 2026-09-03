import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import AppScaleView from "./AppScaleView";
import * as appHooks from "../../hooks/app";
import * as plansHooks from "../../hooks/plans";

// Mock the hooks and components
jest.mock("../../hooks/app");
jest.mock("../../hooks/plans");
jest.mock("../../components/base/Console", () => ({
  __esModule: true,
  default: ({ children }: { children: string }) => <pre>{children}</pre>,
}));
jest.mock("../../components/apps/ScheduleForm", () => ({
  __esModule: true,
  default: () => <div>ScheduleForm</div>,
}));
jest.mock("../../components/apps/PrometheusMetricForm", () => ({
  __esModule: true,
  default: () => <div>PrometheusMetricForm</div>,
}));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({
    name: "test-app",
    process: "web",
  }),
  useNavigate: () => jest.fn(),
}));

const mockUseApp = appHooks.useApp as jest.MockedFunction<
  typeof appHooks.useApp
>;
const mockUseAppScaleManual = appHooks.useAppScaleManual as jest.MockedFunction<
  typeof appHooks.useAppScaleManual
>;
const mockUseAppScaleAutoscale =
  appHooks.useAppScaleAutoscale as jest.MockedFunction<
    typeof appHooks.useAppScaleAutoscale
  >;
const mockUseAppDeleteAutoscale =
  appHooks.useAppDeleteAutoscale as jest.MockedFunction<
    typeof appHooks.useAppDeleteAutoscale
  >;
const mockUseAppUpdateProcessPlan =
  appHooks.useAppUpdateProcessPlan as jest.MockedFunction<
    typeof appHooks.useAppUpdateProcessPlan
  >;
const mockUsePlans = plansHooks.usePlans as jest.MockedFunction<
  typeof plansHooks.usePlans
>;

describe("AppScaleView", () => {
  const mockApp = {
    name: "test-app",
    pool: "test-pool",
    platform: "python",
    plan: { name: "c0.5m0.5" },
    units: [
      { ProcessName: "web", ID: "1", Status: "started", Ready: true },
      { ProcessName: "web", ID: "2", Status: "started", Ready: true },
    ],
    processes: [{ name: "web", plan: "$default" }],
    autoscale: [],
  };

  const mockActionSuccess = {
    action: { loading: false, error: undefined, value: true },
    stream: "Success message",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseApp.mockReturnValue({
      loading: false,
      error: undefined,
      value: mockApp as any,
    });

    mockUseAppScaleManual.mockReturnValue(mockActionSuccess as any);
    mockUseAppScaleAutoscale.mockReturnValue(mockActionSuccess as any);
    mockUseAppDeleteAutoscale.mockReturnValue(mockActionSuccess as any);
    mockUseAppUpdateProcessPlan.mockReturnValue(mockActionSuccess as any);
    mockUsePlans.mockReturnValue({
      loading: false,
      error: undefined,
      value: [],
    } as any);
  });

  test("renders loading state", () => {
    mockUseApp.mockReturnValue({
      loading: true,
      error: undefined,
      value: undefined,
    });

    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  test("renders error state", () => {
    mockUseApp.mockReturnValue({
      loading: false,
      error: new Error("Failed to load app"),
      value: undefined,
    });

    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    const errorMessages = screen.getAllByText(/Failed to load app/i);
    expect(errorMessages.length).toBeGreaterThan(0);
  });

  test("renders scale view with current units", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    expect(screen.getByText(/Scale.*web/i)).toBeInTheDocument();
    expect(screen.getByText(/Current units:/i)).toBeInTheDocument();
    const twoTexts = screen.getAllByText(/2/);
    expect(twoTexts.length).toBeGreaterThan(0);
  });

  test("shows manual scaling chip when no autoscale", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    expect(screen.getByText(/Manual Scaling/i)).toBeInTheDocument();
  });

  test("shows autoscale active chip when autoscale exists", () => {
    const appWithAutoscale = {
      ...mockApp,
      autoscale: [
        {
          process: "web",
          minUnits: 2,
          maxUnits: 10,
          averageCPU: "70%",
        },
      ],
    };

    mockUseApp.mockReturnValue({
      loading: false,
      error: undefined,
      value: appWithAutoscale as any,
    });

    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    expect(screen.getByText(/Autoscale Active/i)).toBeInTheDocument();
  });

  test("renders tabs for horizontal and vertical scale", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    const horizontalTabs = screen.getAllByText(/Horizontal Scale/i);
    expect(horizontalTabs.length).toBeGreaterThan(0);
    const verticalTabs = screen.getAllByText(/Vertical Scale/i);
    expect(verticalTabs.length).toBeGreaterThan(0);
  });

  test("renders mode selection with manual and automatic options", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    expect(screen.getByText("Manual")).toBeInTheDocument();
    expect(screen.getByText("Automatic")).toBeInTheDocument();
  });

  test("allows switching between manual and automatic modes", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole("button");
    const automaticButton = buttons.find((btn) =>
      btn.textContent?.includes("Automatic")
    );

    if (automaticButton) {
      fireEvent.click(automaticButton);
      expect(screen.getByText(/Scale based on metrics/i)).toBeInTheDocument();
    }
  });

  test("shows warning when switching from autoscale to manual", () => {
    const appWithAutoscale = {
      ...mockApp,
      autoscale: [
        {
          process: "web",
          minUnits: 2,
          maxUnits: 10,
          averageCPU: "70%",
        },
      ],
    };

    mockUseApp.mockReturnValue({
      loading: false,
      error: undefined,
      value: appWithAutoscale as any,
    });

    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    const buttons = screen.getAllByRole("button");
    const manualButton = buttons.find((btn) =>
      btn.textContent?.includes("Manual")
    );

    if (manualButton) {
      fireEvent.click(manualButton);

      expect(
        screen.getByText(/remove the existing autoscale configuration/i)
      ).toBeInTheDocument();
    }
  });

  test("shows manual scale configuration with unit input", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/Number of Units/i)).toBeInTheDocument();
    expect(screen.getByText(/Unit Configuration/i)).toBeInTheDocument();
  });

  test("shows cancel and apply buttons", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
    expect(screen.getByText(/Apply Horizontal Scale/i)).toBeInTheDocument();
  });

  test("shows autoscale configuration fields when automatic mode selected", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    // Switch to automatic
    const buttons = screen.getAllByRole("button");
    const automaticButton = buttons.find((btn) =>
      btn.textContent?.includes("Automatic")
    );
    if (automaticButton) {
      fireEvent.click(automaticButton);

      expect(screen.getByLabelText(/Minimum Units/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Maximum Units/i)).toBeInTheDocument();
      const cpuTargets = screen.getAllByText(/CPU Target/i);
      expect(cpuTargets.length).toBeGreaterThan(0);
    }
  });

  test("shows CPU slider with color indicators", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    // Switch to automatic
    const buttons = screen.getAllByRole("button");
    const automaticButton = buttons.find((btn) =>
      btn.textContent?.includes("Automatic")
    );
    if (automaticButton) {
      fireEvent.click(automaticButton);

      // Should show CPU target chip with percentage
      const chips = screen.queryAllByText(/\d+%/);
      expect(chips.length).toBeGreaterThan(0);
    }
  });

  test("shows breadcrumbs with app name", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    const appNames = screen.getAllByText(/test-app/i);
    expect(appNames.length).toBeGreaterThan(0);
    const webTexts = screen.getAllByText(/web/i);
    expect(webTexts.length).toBeGreaterThan(0);
  });

  test("disables apply button when no changes", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    const applyButton = screen
      .getByText(/Apply Horizontal Scale/i)
      .closest("button");
    expect(applyButton).toBeDisabled();
  });

  test("calculates delta correctly for manual scaling", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    // Change replicas from 2 to 5
    const unitsInput = screen.getByLabelText(/Number of Units/i);
    fireEvent.change(unitsInput, { target: { value: "5" } });

    // Should show +3 units chip
    expect(screen.getByText(/\+3 units/i)).toBeInTheDocument();
  });

  test("shows no change chip when delta is 0", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    // Current units is 2, keep it at 2
    const unitsInput = screen.getByLabelText(/Number of Units/i);
    expect(unitsInput).toHaveValue(2);

    expect(screen.getByText(/No change/i)).toBeInTheDocument();
  });

  test("validates autoscale - apply disabled when minUnits is 0", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    // Switch to automatic
    const buttons = screen.getAllByRole("button");
    const automaticButton = buttons.find((btn) =>
      btn.textContent?.includes("Automatic")
    );
    if (automaticButton) {
      fireEvent.click(automaticButton);

      const minInput = screen.getByLabelText(/Minimum Units/i);
      fireEvent.change(minInput, { target: { value: "0" } });

      const applyButton = screen
        .getByText(/Apply Horizontal Scale/i)
        .closest("button");
      expect(applyButton).toBeDisabled();
    }
  });

  test("loads existing autoscale configuration", () => {
    const appWithAutoscale = {
      ...mockApp,
      autoscale: [
        {
          process: "web",
          minUnits: 3,
          maxUnits: 15,
          averageCPU: "80%",
          schedules: [
            {
              minReplicas: 5,
              start: "0 8 * * 1-5",
              end: "0 18 * * 1-5",
              timezone: "UTC",
            },
          ],
        },
      ],
    };

    mockUseApp.mockReturnValue({
      loading: false,
      error: undefined,
      value: appWithAutoscale as any,
    });

    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    // Should have loaded the autoscale values directly (no step navigation needed)
    expect(screen.getByDisplayValue("3")).toBeInTheDocument(); // min units
    expect(screen.getByDisplayValue("15")).toBeInTheDocument(); // max units
  });

  test("can switch between horizontal and vertical tabs", () => {
    render(
      <BrowserRouter>
        <AppScaleView />
      </BrowserRouter>
    );

    // Should start on horizontal tab
    expect(screen.getByLabelText(/Number of Units/i)).toBeInTheDocument();

    // Switch to vertical tab
    const verticalTab = screen.getByText(/Vertical Scale/i).closest("button");
    if (verticalTab) {
      fireEvent.click(verticalTab);
      expect(screen.getByText(/Apply Vertical Scale/i)).toBeInTheDocument();
    }
  });
});
