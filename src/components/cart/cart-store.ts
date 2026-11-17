"use client";

import { MAX_QTY_PER_LINE } from "@/lib/pricing";
import type { L10n } from "@/lib/types";

/** Display snapshot only — the server rebuilds every line from MongoDB at checkout. */
export type CartItem = {
  key: string; // `${productId}:${size}`
  productId: string;
  slug: string;
  size: number;
  qty: number;
  price: number;
  maxQty: number;
  name: L10n;
  color: L10n;
  image: string;
};

const KEY = "naalora-cart-v1";
const EMPTY: CartItem[] = [];
let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function isItem(x: unknown): x is CartItem {
  const i = x as CartItem;
  return !!i && typeof i.productId === "string" && typeof i.size === "number" && typeof i.qty === "number" && i.qty > 0;
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) || "[]");
    items = Array.isArray(raw) ? raw.filter(isItem) : EMPTY;
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage full or blocked: keep in memory */
  }
  listeners.forEach((l) => l());
}

function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  loaded = false;
  load();
  listeners.forEach((l) => l());
}

export const cartStore = {
  subscribe(listener: () => void) {
    load();
    listeners.add(listener);
    if (listeners.size === 1) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0) window.removeEventListener("storage", onStorage);
    };
  },
  getSnapshot(): CartItem[] {
    load();
    return items;
  },
  getServerSnapshot(): CartItem[] {
    return EMPTY;
  },
  add(item: Omit<CartItem, "key">) {
    const key = `${item.productId}:${item.size}`;
    const cap = Math.max(1, Math.min(MAX_QTY_PER_LINE, item.maxQty));
    const existing = items.find((i) => i.key === key);
    if (existing) {
      commit(items.map((i) => (i.key === key ? { ...i, ...item, key, qty: Math.min(cap, i.qty + item.qty) } : i)));
    } else {
      commit([...items, { ...item, key, qty: Math.min(cap, item.qty) }]);
    }
  },
  setQty(key: string, qty: number) {
    commit(
      items
        .map((i) => (i.key === key ? { ...i, qty: Math.max(0, Math.min(qty, Math.min(MAX_QTY_PER_LINE, i.maxQty))) } : i))
        .filter((i) => i.qty > 0),
    );
  },
  remove(key: string) {
    commit(items.filter((i) => i.key !== key));
  },
  clear() {
    commit(EMPTY);
  },
};
