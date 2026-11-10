"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { CartItem, useCart } from "@/lib/cart";

export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/checkout" className="rounded-full border border-white/40 px-3 py-1">
      السلة{count > 0 && <b className="ms-2 rounded-full bg-brand px-2 text-black">{count}</b>}
    </Link>
  );
}
export const SignOut = () => <button onClick={() => signOut({ callbackUrl: "/" })}>خروج</button>;

export function AddBtn({ storeId, item }: { storeId: string; item: Omit<CartItem, "qty"> }) {
  const { add } = useCart();
  const [ok, setOk] = useState(false);
  return (
    <button className="btn self-center" onClick={() => { add(storeId, item); setOk(true); setTimeout(() => setOk(false), 900); }}>
      {ok ? "تمت الإضافة" : "أضف"}
    </button>
  );
}
export function AutoRefresh({ ms = 5000 }: { ms?: number }) {
  const r = useRouter();
  useEffect(() => { const t = setInterval(() => r.refresh(), ms); return () => clearInterval(t); }, [r, ms]);
  return null;
}
async function call(url: string, method: string, body: unknown) {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (!res.ok) alert((await res.json().catch(() => ({}))).error || "حدث خطأ");
}
// Generic action button: status changes, approvals, delete, online toggle.
export function Act({ url, method = "PATCH", body, label, dark }: { url: string; method?: string; body: unknown; label: string; dark?: boolean }) {
  const r = useRouter();
  return <button className={dark ? "btn-dark" : "btn"} onClick={async () => { await call(url, method, body); r.refresh(); }}>{label}</button>;
}
export function ProductForm({ storeId }: { storeId: string }) {
  const r = useRouter();
  const [name, setName] = useState(""), [price, setPrice] = useState("");
  return (
    <form className="mt-3 flex flex-wrap gap-2" onSubmit={async (e) => { e.preventDefault(); await call("/api/products", "POST", { storeId, name, price: Math.round(+price * 100) }); setName(""); setPrice(""); r.refresh(); }}>
      <input className="input w-auto flex-1" placeholder="اسم المنتج" value={name} onChange={(e) => setName(e.target.value)} required />
      <input className="input w-28" type="number" step="0.01" min="0.01" placeholder="السعر" value={price} onChange={(e) => setPrice(e.target.value)} required />
      <button className="btn">إضافة منتج</button>
    </form>
  );
}
export function EditPrice({ id, price }: { id: string; price: number }) {
  const r = useRouter();
  return (
    <button className="text-sm underline" onClick={async () => { const v = prompt("السعر الجديد", String(price / 100)); if (!v || !(+v > 0)) return; await call("/api/products", "PUT", { id, price: Math.round(+v * 100) }); r.refresh(); }}>
      تعديل السعر
    </button>
  );
}
