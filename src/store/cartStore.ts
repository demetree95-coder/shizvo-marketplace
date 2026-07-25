import { create } from "zustand";
import { ProductType } from "@/types";

interface CartItem {
  product: ProductType;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: ProductType, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setOpen: (open: boolean) => void;
  getTotal: () => number;
  getItemCount: () => number;
}

function saveCart(items: CartItem[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("cart", JSON.stringify(items));
  }
}

function loadCart(): CartItem[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {}
  }
  return [];
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  isOpen: false,
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find((item) => item.product.id === product.id);
      const items = existing
        ? state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          )
        : [...state.items, { product, quantity }];
      saveCart(items);
      return { items };
    });
  },
  removeItem: (productId) => {
    set((state) => {
      const items = state.items.filter((item) => item.product.id !== productId);
      saveCart(items);
      return { items };
    });
  },
  updateQuantity: (productId, quantity) => {
    set((state) => {
      const items = state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      saveCart(items);
      return { items };
    });
  },
  clearCart: () => { saveCart([]); set({ items: [] }); },
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  setOpen: (isOpen) => set({ isOpen }),
  getTotal: () => {
    const state = get();
    return state.items.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  },
  getItemCount: () => {
    const state = get();
    return state.items.reduce((count, item) => count + item.quantity, 0);
  },
}));
