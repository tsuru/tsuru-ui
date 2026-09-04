import { renderHook, waitFor } from "@testing-library/react";
import {
  useAppScaleManual,
  useAppScaleAutoscale,
  useAppDeleteAutoscale,
  AutoscaleConfig,
} from "./app";
import { useFetch } from "../contexts/auth";

// Mock the useFetch hook
jest.mock("../contexts/auth", () => ({
  useFetch: jest.fn(),
}));

const mockUseFetch = useFetch as jest.MockedFunction<typeof useFetch>;

describe("App Scale Hooks", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFetch.mockReturnValue(mockFetch as any);
  });

  describe("useAppScaleManual", () => {
    test("calls PUT endpoint when adding units (positive delta)", async () => {
      const mockResponse = {
        status: 200,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  JSON.stringify({ Message: "Adding unit\n" })
                ),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      renderHook(() => useAppScaleManual("test-app", "web", 3, false));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/apps/test-app/units", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            process: "web",
            units: 3,
          }),
        });
      });
    });

    test("calls DELETE endpoint when removing units (negative delta)", async () => {
      const mockResponse = {
        status: 200,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  JSON.stringify({ Message: "Removing unit\n" })
                ),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      renderHook(() => useAppScaleManual("test-app", "web", -2, false));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/apps/test-app/units", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            process: "web",
            units: 2, // absolute value
          }),
        });
      });
    });

    test("does not call API when dryRun is true", () => {
      renderHook(() => useAppScaleManual("test-app", "web", 3, true));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    test("handles API errors", async () => {
      const mockResponse = {
        status: 400,
        statusText: "Bad Request",
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() =>
        useAppScaleManual("test-app", "web", 3, false)
      );

      await waitFor(() => {
        expect(result.current.action.error).toBeTruthy();
      });
    });
  });

  describe("useAppScaleAutoscale", () => {
    const mockConfig: AutoscaleConfig = {
      process: "web",
      minUnits: 2,
      maxUnits: 10,
      cpuTarget: 70,
    };

    test("calls POST endpoint with correct payload", async () => {
      const mockResponse = {
        status: 200,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  JSON.stringify({ Message: "Configuring autoscale\n" })
                ),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      renderHook(() => useAppScaleAutoscale("test-app", mockConfig, false));

      await waitFor(() =>
        expect(mockFetch).toHaveBeenCalledWith(
          "/apps/test-app/units/autoscale",
          expect.objectContaining({
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
        )
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody).toEqual({
        process: "web",
        minUnits: 2,
        maxUnits: 10,
        averageCPU: "70%",
        schedules: undefined,
        prometheus: undefined,
      });
    });

    test("includes schedules when provided", async () => {
      const mockResponse = {
        status: 200,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array() })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const configWithSchedules: AutoscaleConfig = {
        ...mockConfig,
        schedules: [
          {
            minReplicas: 5,
            start: "0 8 * * 1-5",
            end: "0 18 * * 1-5",
            timezone: "UTC",
          },
        ],
      };

      renderHook(() =>
        useAppScaleAutoscale("test-app", configWithSchedules, false)
      );

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.schedules).toBeDefined();
      expect(callBody.schedules).toHaveLength(1);
    });

    test("includes prometheus metrics when provided", async () => {
      const mockResponse = {
        status: 200,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array() })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const configWithMetrics: AutoscaleConfig = {
        ...mockConfig,
        prometheusMetrics: [
          {
            name: "request_rate",
            threshold: 1000,
            query: 'sum(rate(http_requests_total{app="test"}[5m]))',
            prometheusAddress: "https://prometheus.example.com",
          },
        ],
      };

      renderHook(() =>
        useAppScaleAutoscale("test-app", configWithMetrics, false)
      );

      await waitFor(() => expect(mockFetch).toHaveBeenCalled());

      const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
      expect(callBody.prometheus).toBeDefined();
      expect(callBody.prometheus).toHaveLength(1);
    });

    test("does not call API when dryRun is true", () => {
      renderHook(() => useAppScaleAutoscale("test-app", mockConfig, true));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    test("formats CPU target as percentage string", async () => {
      const mockResponse = {
        status: 200,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array() })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      renderHook(() => useAppScaleAutoscale("test-app", mockConfig, false));

      await waitFor(() => {
        const callBody = JSON.parse(mockFetch.mock.calls[0][1]?.body as string);
        expect(callBody.averageCPU).toBe("70%");
      });
    });
  });

  describe("useAppDeleteAutoscale", () => {
    test("calls DELETE endpoint with process query parameter", async () => {
      const mockResponse = {
        status: 200,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({
                done: false,
                value: new TextEncoder().encode(
                  JSON.stringify({ Message: "Deleting autoscale\n" })
                ),
              })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      renderHook(() => useAppDeleteAutoscale("test-app", "web", false));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/apps/test-app/units/autoscale?process=web",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      });
    });

    test("URL encodes process name", async () => {
      const mockResponse = {
        status: 200,
        body: {
          getReader: () => ({
            read: jest
              .fn()
              .mockResolvedValueOnce({ done: false, value: new Uint8Array() })
              .mockResolvedValueOnce({ done: true }),
          }),
        },
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      renderHook(() =>
        useAppDeleteAutoscale("test-app", "worker-special", false)
      );

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/apps/test-app/units/autoscale?process=worker-special",
          expect.any(Object)
        );
      });
    });

    test("does not call API when dryRun is true", () => {
      renderHook(() => useAppDeleteAutoscale("test-app", "web", true));

      expect(mockFetch).not.toHaveBeenCalled();
    });

    test("handles API errors", async () => {
      const mockResponse = {
        status: 404,
        statusText: "Not Found",
      };

      mockFetch.mockResolvedValue(mockResponse as any);

      const { result } = renderHook(() =>
        useAppDeleteAutoscale("test-app", "web", false)
      );

      await waitFor(() => {
        expect(result.current.action.error).toBeTruthy();
      });
    });
  });
});
