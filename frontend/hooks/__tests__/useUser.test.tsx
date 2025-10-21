import { renderHook, waitFor, act } from "@testing-library/react";
import axios from "axios";

// Mock axios first
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Import the hook after mocking
import { useUser } from "../useUser";

describe("useUser", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear any cached data
    localStorage.clear();
    // Clear the module cache to reset the userCache variable
    jest.resetModules();
  });

  it("should fetch user data successfully", async () => {
    const mockUser = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      isVerified: true,
    };

    mockedAxios.get.mockResolvedValue({
      data: { user: mockUser },
    });

    const { result } = renderHook(() => useUser());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBe(null);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      "http://localhost:4000/auth/me",
      { withCredentials: true }
    );
  });

  it("should handle authentication error", async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 401 },
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.error).toBe(null); // Auth errors don't set error state
  });

  it("should handle rate limiting", async () => {
    mockedAxios.get.mockRejectedValue({
      response: { status: 429 },
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.error).toBe(
        "We're experiencing high traffic. Please wait a moment and try again."
      );
    });
  });

  it("should clear user data", async () => {
    const mockUser = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      isVerified: true,
    };

    mockedAxios.get.mockResolvedValue({
      data: { user: mockUser },
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.user).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it("should refresh user data", async () => {
    const mockUser = {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "user",
      isVerified: true,
    };

    mockedAxios.get.mockResolvedValue({
      data: { user: mockUser },
    });

    const { result } = renderHook(() => useUser());

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    // Clear the mock to test refresh
    mockedAxios.get.mockClear();
    mockedAxios.get.mockResolvedValue({
      data: { user: { ...mockUser, name: "Jane Doe" } },
    });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user?.name).toBe("Jane Doe");
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});
