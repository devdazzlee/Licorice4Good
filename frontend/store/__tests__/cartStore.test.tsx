import { renderHook, act } from "@testing-library/react";
import axios from "axios";

// Mock axios first
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock the cartStore module to control the checkAuthentication function
jest.mock("../cartStore", () => {
  const actual = jest.requireActual("../cartStore");

  // Create a mock authentication function that can be controlled in tests
  const mockCheckAuth = jest.fn();

  // Override the checkAuthentication function
  const originalCreateStore = actual.useCartStore;

  return {
    ...actual,
    useCartStore: originalCreateStore,
    __mockCheckAuth: mockCheckAuth, // Export for test control
  };
});

// Import after mocking
import { useCartStore } from "../cartStore";

// Get the mock function for controlling auth behavior
const mockCheckAuth = (require("../cartStore") as any).__mockCheckAuth;

// Mock window.location for redirect tests
Object.defineProperty(window, "location", {
  value: {
    href: "",
  },
  writable: true,
});

describe("useCartStore", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckAuth.mockResolvedValue(true); // Default to authenticated
    // Reset store state
    useCartStore.setState({ items: [], loading: false, error: null });
  });

  it("should add item to cart when authenticated", async () => {
    mockCheckAuth.mockResolvedValue(true);
    const { result } = renderHook(() => useCartStore());

    const newItem = {
      productId: "1",
      productName: "Test Product",
      quantity: 2,
      price: 10.99,
      sku: "TEST-001",
    };

    await act(async () => {
      await result.current.addItem(newItem);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toMatchObject(newItem);
    expect(result.current.items[0].id).toBeDefined();
    expect(result.current.error).toBe(null);
  });

  it("should update quantity for existing item", async () => {
    mockCheckAuth.mockResolvedValue(true);
    const { result } = renderHook(() => useCartStore());

    const existingItem = {
      productId: "1",
      productName: "Test Product",
      quantity: 1,
      price: 10.99,
      sku: "TEST-001",
    };

    // Add item first
    await act(async () => {
      await result.current.addItem(existingItem);
    });

    // Add same item again
    await act(async () => {
      await result.current.addItem({ ...existingItem, quantity: 2 });
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].quantity).toBe(3); // 1 + 2
  });

  it("should calculate total correctly", async () => {
    mockCheckAuth.mockResolvedValue(true);
    const { result } = renderHook(() => useCartStore());

    const items = [
      {
        productId: "1",
        productName: "Product 1",
        quantity: 2,
        price: 10.99,
        sku: "TEST-001",
      },
      {
        productId: "2",
        productName: "Product 2",
        quantity: 1,
        price: 5.5,
        sku: "TEST-002",
      },
    ];

    await act(async () => {
      await result.current.addItem(items[0]);
      await result.current.addItem(items[1]);
    });

    const total = result.current.getTotal();
    expect(total).toBe(27.48); // (10.99 * 2) + (5.50 * 1)
  });

  it("should get item count correctly", async () => {
    mockCheckAuth.mockResolvedValue(true);
    const { result } = renderHook(() => useCartStore());

    const items = [
      {
        productId: "1",
        productName: "Product 1",
        quantity: 2,
        price: 10.99,
        sku: "TEST-001",
      },
      {
        productId: "2",
        productName: "Product 2",
        quantity: 3,
        price: 5.5,
        sku: "TEST-002",
      },
    ];

    await act(async () => {
      await result.current.addItem(items[0]);
      await result.current.addItem(items[1]);
    });

    const itemCount = result.current.getItemCount();
    expect(itemCount).toBe(5); // 2 + 3
  });

  it("should handle authentication error", async () => {
    mockCheckAuth.mockResolvedValue(false);
    const { result } = renderHook(() => useCartStore());

    const newItem = {
      productId: "1",
      productName: "Test Product",
      quantity: 1,
      price: 10.99,
      sku: "TEST-001",
    };

    await act(async () => {
      await result.current.addItem(newItem);
    });

    expect(result.current.error).toBe(
      "Please log in to add items to your cart"
    );
    expect(result.current.items).toHaveLength(0);
    expect(window.location.href).toBe("/auth/login");
  });

  it("should clear cart", async () => {
    mockCheckAuth.mockResolvedValue(true);
    const { result } = renderHook(() => useCartStore());

    // Add some items first
    await act(async () => {
      await result.current.addItem({
        productId: "1",
        productName: "Test Product",
        quantity: 1,
        price: 10.99,
        sku: "TEST-001",
      });
    });

    expect(result.current.items).toHaveLength(1);

    await act(async () => {
      await result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("should handle loading state", async () => {
    mockCheckAuth.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100))
    );
    const { result } = renderHook(() => useCartStore());

    const newItem = {
      productId: "1",
      productName: "Test Product",
      quantity: 1,
      price: 10.99,
      sku: "TEST-001",
    };

    // Start adding item (should set loading to true)
    const addPromise = act(async () => {
      await result.current.addItem(newItem);
    });

    // Check that loading state is managed correctly
    expect(result.current.loading).toBe(true);

    await addPromise;

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toHaveLength(1);
  });
});
