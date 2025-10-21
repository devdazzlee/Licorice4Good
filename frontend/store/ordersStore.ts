import { create } from "zustand";
import axios from "axios";

export type OrderItem = {
  id?: string;
  productId: string | null;  // NULL for custom packs
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
  // Custom pack fields
  flavorIds?: string[];
  customPackName?: string | null;
  total?: number;
};

export type Order = {
  id?: string;
  userId?: string;
  orderItems?: OrderItem[];
  items?: Array<{
    productId: string | null;
    quantity: number;
  }>;
  total: number;
  status?: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "shipping_failed";
  paymentStatus?:
    | "pending"
    | "paid"
    | "failed"
    | "completed"
    | "successful"
    | "declined"
    | "error"
    | "processing"
    | "refunded";
  shippingAddress?:
    | string
    | {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
  orderNotes?: string;
  createdAt?: string;
  updatedAt?: string;
  // Shippo shipping fields
  shipmentId?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  shippingLabelUrl?: string;
  shippingStatus?: string;
  shippingCarrier?: string;
  shippingService?: string;
  shippingCost?: number;
  shippingError?: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

type OrdersState = {
  orders: Order[];
  order: Order | null;
  pagination: Pagination | null;
  loading: boolean;
  error: string | null;
  fetchOrders: (params: {
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  loadMoreOrders: (params: {
    status?: string;
    page?: number;
    limit?: number;
  }) => Promise<void>;
  fetchOrder: (id: string) => Promise<Order | null>;
  fetchOrderById: (id: string) => Promise<void>;
  createOrder: (orderData: Partial<Order>) => Promise<Order | null>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  clearOrder: () => void;
};

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  order: null,
  pagination: null,
  loading: false,
  error: null,

  fetchOrders: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const queryParams = new URLSearchParams();

      if (params.status) queryParams.append("status", params.status);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const { data } = await axios.get<{
        orders: Order[];
        pagination: Pagination;
      }>(`${API_URL}/orders?${queryParams.toString()}`, {
        withCredentials: true,
      });

      set({
        orders: data.orders || [],
        pagination: data.pagination || null,
        loading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch orders";
      set({ error: message, loading: false, orders: [] });
    }
  },

  // Load more orders (for infinite scroll or load more functionality)
  loadMoreOrders: async (params = {}) => {
    const currentState = get();
    if (currentState.loading) return;

    set({ loading: true, error: null });
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const queryParams = new URLSearchParams();

      if (params.status) queryParams.append("status", params.status);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const { data } = await axios.get<{
        orders: Order[];
        pagination: Pagination;
      }>(`${API_URL}/orders?${queryParams.toString()}`, {
        withCredentials: true,
      });

      set({
        orders: [...currentState.orders, ...(data.orders || [])],
        pagination: data.pagination || null,
        loading: false,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load more orders";
      set({ error: message, loading: false });
    }
  },

  fetchOrder: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.get<Order>(`${API_URL}/orders/${id}`, {
        withCredentials: true,
      });
      set({ loading: false });
      return data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch order";
      set({ error: message, loading: false });
      return null;
    }
  },

  createOrder: async (orderData: Partial<Order>) => {
    set({ loading: true, error: null });
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;

      console.log("Creating order with data:", orderData);

      const { data } = await axios.post<{ message: string; order: Order }>(`${API_URL}/orders`, orderData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Order creation response:", data);

      // Extract the order from the response
      const order = data.order;

      if (!order || !order.id) {
        console.error("Invalid order response:", data);
        throw new Error("Order creation failed - invalid response from server");
      }

      // Add the new order to the local state
      const { orders } = get();
      set({
        orders: [order, ...orders], // Add new order at the beginning
        loading: false,
      });

      console.log("Order created successfully with ID:", order.id);
      return order;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: {
          data?: { message?: string; error?: string };
          status?: number;
        };
      };
      console.error("Order creation failed:", axiosError.response?.data);
      const message =
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        (error instanceof Error ? error.message : "Failed to create order");
      set({ error: message, loading: false });
      return null;
    }
  },

  updateOrderStatus: async (id: string, status: Order["status"]) => {
    set({ loading: true, error: null });
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      await axios.put(
        `${API_URL}/orders/${id}/status`,
        { status },
        { withCredentials: true }
      );

      // Update the order in the local state
      const { orders } = get();
      const updatedOrders = orders.map((order) =>
        order.id === id ? { ...order, status } : order
      );
      set({ orders: updatedOrders, loading: false });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update order status";
      set({ error: message, loading: false });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const { data } = await axios.get<Order>(`${API_URL}/orders/${id}`, {
        withCredentials: true,
      });
      set({ order: data, loading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to fetch order";
      set({ error: message, loading: false, order: null });
    }
  },

  clearOrder: () => {
    set({ order: null, error: null });
  },
}));
