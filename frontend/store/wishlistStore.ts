import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  id: string;
  productId: string;
  productName: string;
  price: number;
  imageUrl?: string;
  sku?: string;
  category?: string;
};

type WishlistState = {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  // Actions
  addItem: (item: Omit<WishlistItem, "id">) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  // Computed
  getItemCount: () => number;
  getTotal: () => number;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find(
          (item) => item.productId === newItem.productId
        );

        if (!existingItem) {
          const itemWithId = {
            ...newItem,
            id: `${newItem.productId}-${Date.now()}`,
          };
          set({ items: [...items, itemWithId] });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        const updatedItems = items.filter(
          (item) => item.productId !== productId
        );
        set({ items: updatedItems });
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },

      getItemCount: () => {
        const { items } = get();
        return items.length;
      },

      getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price, 0);
      },
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
