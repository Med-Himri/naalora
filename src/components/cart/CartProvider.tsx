"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from "react";
import { cartStore, type CartItem } from "./cart-store";

type CartContext = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  bump: number;
  open: () => void;
  close: () => void;
  add: (item: Omit<CartItem, "key">, opts?: { open?: boolean }) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.getSnapshot, cartStore.getServerSnapshot);
  const [isOpen, setOpen] = useState(false);
  const [bump, setBump] = useState(0);

  const add = useCallback((item: Omit<CartItem, "key">, opts?: { open?: boolean }) => {
    cartStore.add(item);
    setBump((b) => b + 1);
    if (opts?.open !== false) setOpen(true);
  }, []);

  const value = useMemo<CartContext>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price, 0),
      isOpen,
      bump,
      open: () => setOpen(true),
      close: () => setOpen(false),
      add,
      setQty: cartStore.setQty,
      remove: cartStore.remove,
      clear: cartStore.clear,
    }),
    [items, isOpen, bump, add],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartContext {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
