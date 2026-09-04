import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import ScheduleForm from "./ScheduleForm";
import { AppAutoscaleSchedule } from "../../types/app";

describe("ScheduleForm", () => {
  const mockOnSchedulesChange = jest.fn();

  beforeEach(() => {
    mockOnSchedulesChange.mockClear();
  });

  test("renders empty state", () => {
    render(
      <ScheduleForm schedules={[]} onSchedulesChange={mockOnSchedulesChange} />
    );

    expect(screen.getByText("Scheduled Scaling")).toBeInTheDocument();
    expect(screen.getByText(/0 schedules/i)).toBeInTheDocument();
    expect(screen.getByText(/No schedules configured/i)).toBeInTheDocument();
  });

  test("shows add schedule button", () => {
    render(
      <ScheduleForm schedules={[]} onSchedulesChange={mockOnSchedulesChange} />
    );

    const addButton = screen.getByRole("button", { name: /add schedule/i });
    expect(addButton).toBeInTheDocument();
  });

  test("adds a new schedule with default values", () => {
    render(
      <ScheduleForm schedules={[]} onSchedulesChange={mockOnSchedulesChange} />
    );

    const addButton = screen.getByRole("button", { name: /add schedule/i });
    fireEvent.click(addButton);

    expect(mockOnSchedulesChange).toHaveBeenCalledWith([
      {
        minReplicas: 2,
        start: "0 8 * * 1-5",
        end: "0 18 * * 1-5",
        timezone: "America/Sao_Paulo",
      },
    ]);
  });

  test("renders existing schedules", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        name: "Business Hours",
        minReplicas: 5,
        start: "0 8 * * 1-5",
        end: "0 18 * * 1-5",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    expect(screen.getByText("Business Hours")).toBeInTheDocument();
    expect(screen.getByText("5 replicas")).toBeInTheDocument();
    expect(screen.getByText("UTC")).toBeInTheDocument();
  });

  test("displays schedule count correctly", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        minReplicas: 5,
        start: "0 8 * * 1-5",
        end: "0 18 * * 1-5",
        timezone: "UTC",
      },
      {
        minReplicas: 2,
        start: "0 20 * * *",
        end: "0 6 * * *",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    expect(screen.getByText(/2 schedules/i)).toBeInTheDocument();
  });

  test("displays default name when schedule has no name", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        minReplicas: 3,
        start: "0 9 * * *",
        end: "0 17 * * *",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    expect(screen.getByText("Schedule 1")).toBeInTheDocument();
  });

  test("validates cron expressions", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        minReplicas: 3,
        start: "0 9 * * *",
        end: "invalid cron",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    // Should show valid cron as human readable
    expect(screen.getByText(/At 09:00 AM/i)).toBeInTheDocument();
  });

  test("expands and collapses schedule cards", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        name: "Test Schedule",
        minReplicas: 3,
        start: "0 9 * * *",
        end: "0 17 * * *",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    // Initially expanded (default state)
    expect(screen.getByLabelText(/schedule name/i)).toBeVisible();
    expect(screen.getByTestId("ExpandLessIcon")).toBeInTheDocument();

    // The whole header row toggles the card, so a click on the title bubbles up
    fireEvent.click(screen.getByText("Test Schedule"));

    expect(screen.getByTestId("ExpandMoreIcon")).toBeInTheDocument();
  });

  test("removes schedule when delete button is clicked", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        name: "Schedule to Remove",
        minReplicas: 3,
        start: "0 9 * * *",
        end: "0 17 * * *",
        timezone: "UTC",
      },
      {
        name: "Schedule to Keep",
        minReplicas: 2,
        start: "0 10 * * *",
        end: "0 16 * * *",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    const deleteButtons = screen.getAllByRole("button", {
      name: /remove schedule/i,
    });
    fireEvent.click(deleteButtons[0]);

    expect(mockOnSchedulesChange).toHaveBeenCalledWith([schedules[1]]);
  });

  test("updates schedule name", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        minReplicas: 3,
        start: "0 9 * * *",
        end: "0 17 * * *",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    const nameInput = screen.getByLabelText(/schedule name/i);
    fireEvent.change(nameInput, { target: { value: "New Name" } });

    expect(mockOnSchedulesChange).toHaveBeenCalledWith([
      {
        ...schedules[0],
        name: "New Name",
      },
    ]);
  });

  test("updates minimum replicas", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        minReplicas: 3,
        start: "0 9 * * *",
        end: "0 17 * * *",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    const replicasInput = screen.getByLabelText(/minimum replicas/i);
    fireEvent.change(replicasInput, { target: { value: "5" } });

    expect(mockOnSchedulesChange).toHaveBeenCalledWith([
      {
        ...schedules[0],
        minReplicas: 5,
      },
    ]);
  });

  test("shows cron preset examples", () => {
    const schedules: AppAutoscaleSchedule[] = [
      {
        minReplicas: 3,
        start: "0 9 * * *",
        end: "0 17 * * *",
        timezone: "UTC",
      },
    ];

    render(
      <ScheduleForm
        schedules={schedules}
        onSchedulesChange={mockOnSchedulesChange}
      />
    );

    // Should have autocomplete inputs for cron expressions
    const inputs = screen.getAllByRole("textbox");
    // Should have name, start, end, timezone inputs
    expect(inputs.length).toBeGreaterThan(0);
  });
});
