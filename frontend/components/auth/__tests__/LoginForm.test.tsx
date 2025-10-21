import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { useRouter } from "next/navigation";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock useRouter
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock toast
jest.mock("react-toastify", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Simple LoginForm component for testing
const LoginForm = () => {
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await axios.post("/auth/login", { email, password });
      if (response.status === 200) {
        router.push("/");
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} data-testid="login-form">
      <div>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
          data-testid="email-input"
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
          data-testid="password-input"
        />
      </div>
      <button type="submit" data-testid="submit-button">
        Login
      </button>
    </form>
  );
};

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders login form correctly", () => {
    render(<LoginForm />);

    expect(screen.getByTestId("login-form")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("submits form with correct data", async () => {
    const user = userEvent.setup();
    mockedAxios.post.mockResolvedValue({ status: 200 });

    render(<LoginForm />);

    await user.type(screen.getByTestId("email-input"), "test@example.com");
    await user.type(screen.getByTestId("password-input"), "password123");
    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith("/auth/login", {
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("handles login error gracefully", async () => {
    const user = userEvent.setup();
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();
    mockedAxios.post.mockRejectedValue(new Error("Login failed"));

    render(<LoginForm />);

    await user.type(screen.getByTestId("email-input"), "test@example.com");
    await user.type(screen.getByTestId("password-input"), "wrongpassword");
    await user.click(screen.getByTestId("submit-button"));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Login failed:",
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
});
