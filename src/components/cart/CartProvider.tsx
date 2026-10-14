"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/types";

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  ready: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (items: CartItem[]) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
}

const Ctx = createContext<CartCtx | null>(null);
const KEY = "empowerme-cart-v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        // Descarta fechas que ya pasaron.
        setItems(parsed.filter((i) => new Date(i.startsAt) > new Date()));
      }
    } catch {
      /* almacenamiento no disponible */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [items, ready]);

  const add = useCallback((incoming: CartItem[]) => {
    setItems((prev) => {
      const next = [...prev];
      for (const it of incoming) {
        const i = next.findIndex((x) => x.key === it.key);
        if (i >= 0) next[i] = { ...next[i], qty: Math.min(10, next[i].qty + it.qty) };
        else next.push(it);
      }
      return next;
    });
  }, []);

  const remove = useCallback((key: string) => setItems((p) => p.filter((x) => x.key !== key)), []);
  const setQty = useCallback(
    (key: string, qty: number) => setItems((p) => p.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(10, qty)) } : x))),
    [],
  );
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(
    () => ({
      items,
      ready,
      open,
      setOpen,
      add,
      remove,
      setQty,
      clear,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.qty * i.unitPrice, 0),
    }),
    [items, ready, open, add, remove, setQty, clear],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart debe usarse dentro de CartProvider");
  return c;
}
