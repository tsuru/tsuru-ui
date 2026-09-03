import { renderHook, act } from "@testing-library/react";
import { useAddCName, useSetCertIssuer } from "./app";
import { useFetch } from "../contexts/auth";

jest.mock("../contexts/auth", () => ({
  useFetch: jest.fn(),
}));

const mockUseFetch = useFetch as jest.MockedFunction<typeof useFetch>;

describe("CNAME Hooks", () => {
  const mockFetch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFetch.mockReturnValue(mockFetch as any);
  });

  describe("useAddCName", () => {
    test("calls POST /1.0/apps/{app}/cname with correct payload", async () => {
      mockFetch.mockResolvedValue({ status: 200, text: jest.fn() });

      const { result } = renderHook(() => useAddCName("my-app"));

      await act(async () => {
        await result.current("myapp.example.com");
      });

      expect(mockFetch).toHaveBeenCalledWith("/1.0/apps/my-app/cname", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cname: ["myapp.example.com"] }),
      });
    });

    test("throws on API error", async () => {
      mockFetch.mockResolvedValue({
        status: 400,
        text: jest.fn().mockResolvedValue("invalid cname"),
        statusText: "Bad Request",
      });

      const { result } = renderHook(() => useAddCName("my-app"));

      await expect(
        act(async () => {
          await result.current("bad");
        })
      ).rejects.toThrow("invalid cname");
    });
  });

  describe("useSetCertIssuer", () => {
    test("calls PUT /1.24/apps/{app}/certissuer with correct payload", async () => {
      mockFetch.mockResolvedValue({ status: 200, text: jest.fn() });

      const { result } = renderHook(() => useSetCertIssuer("my-app"));

      await act(async () => {
        await result.current(
          "myapp.example.com",
          "lets-encrypt.example-issuer"
        );
      });

      expect(mockFetch).toHaveBeenCalledWith("/1.24/apps/my-app/certissuer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cname: "myapp.example.com",
          issuer: "lets-encrypt.example-issuer",
        }),
      });
    });

    test("throws on API error", async () => {
      mockFetch.mockResolvedValue({
        status: 500,
        text: jest.fn().mockResolvedValue("internal error"),
        statusText: "Internal Server Error",
      });

      const { result } = renderHook(() => useSetCertIssuer("my-app"));

      await expect(
        act(async () => {
          await result.current("myapp.example.com", "some-issuer");
        })
      ).rejects.toThrow("internal error");
    });
  });
});
