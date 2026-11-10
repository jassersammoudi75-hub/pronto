"use client";
import { useEffect, useState } from "react";
export type CartItem = { productId: string; name: string; price: number; qty: number };
export type Cart = { storeId: string | null; items: CartItem[] };
const K = "pronto-cart";
const read = (): Cart => { try { return JSON.parse(localStorage.getItem(K) || "") as Cart; } catch { return { storeId: null, items: [] }; } };
const save = (c: Cart) => { localStorage.setItem(K, JSON.stringify(c)); dispatchEvent(new Event("cart")); };

export function useCart() {
  const [cart, set] = useState<Cart>({ storeId: null, items: [] });
  useEffect(() => { const f = () => set(read()); f(); addEventListener("cart", f); return () => removeEventListener("cart", f); }, []);
  return {
    cart,
    count: cart.items.reduce((s, i) => s + i.qty, 0),
    total: cart.items.reduce((s, i) => s + i.price * i.qty, 0),
    add(storeId: string, i: Omit<CartItem, "qty">) {
      const c = read(); if (c.storeId && c.storeId !== storeId) c.items = []; // one store per cart
      c.storeId = storeId;
      const e = c.items.find((x) => x.productId === i.productId); e ? e.qty++ : c.items.push({ ...i, qty: 1 }); save(c);
    },
    setQty(id: string, q: number) {
      const c = read(); c.items = c.items.map((x) => (x.productId === id ? { ...x, qty: q } : x)).filter((x) => x.qty > 0);
      if (!c.items.length) c.storeId = null; save(c);
    },
    clear: () => save({ storeId: null, items: [] }),
  };
}
