"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { money, FEE } from "@/lib/utils";

export default function Checkout() {
  const { cart, setQty, clear, total } = useCart();
  const r = useRouter();
  const [address, setAddress] = useState(""), [payment, setPayment] = useState("CASH"), [err, setErr] = useState(""), [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true); setErr("");
    const res = await fetch("/api/orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: cart.storeId, items: cart.items.map(({ productId, qty }) => ({ productId, qty })), address, payment }),
    });
    const d = await res.json(); setBusy(false);
    if (!res.ok) return setErr(d.error || "تعذر إنشاء الطلب");
    clear(); r.push(`/orders/${d.id}`);
  }
  if (!cart.items.length) return <p className="py-10 text-center text-neutral-500">سلتك فارغة. اختر متجراً وأضف منتجات.</p>;
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-black">إتمام الطلب</h1>
      <div className="divide-y rounded-xl border bg-white">
        {cart.items.map((i) => (
          <div key={i.productId} className="flex items-center gap-3 p-3">
            <span className="flex-1 font-semibold">{i.name}</span>
            <button className="btn-dark !px-3 !py-1" onClick={() => setQty(i.productId, i.qty - 1)} aria-label="إنقاص">−</button>
            <span className="w-6 text-center">{i.qty}</span>
            <button className="btn-dark !px-3 !py-1" onClick={() => setQty(i.productId, i.qty + 1)} aria-label="زيادة">+</button>
            <span className="w-20 text-end">{money(i.price * i.qty)}</span>
            <button className="text-sm underline" onClick={() => setQty(i.productId, 0)}>حذف</button>
          </div>
        ))}
        <div className="flex justify-between p-3 text-sm"><span>رسوم التوصيل</span><span>{money(FEE)}</span></div>
        <div className="flex justify-between p-3 font-black"><span>الإجمالي</span><span>{money(total + FEE)}</span></div>
      </div>
      <input className="input" placeholder="عنوان التوصيل" value={address} onChange={(e) => setAddress(e.target.value)} />
      <select className="input" value={payment} onChange={(e) => setPayment(e.target.value)}>
        <option value="CASH">الدفع عند الاستلام</option>
        <option value="CARD">بطاقة (Stripe وضع الاختبار - محاكاة)</option>
      </select>
      {err && <p className="text-red-600">{err}</p>}
      <button className="btn w-full" disabled={busy || address.trim().length < 5} onClick={confirm}>تأكيد الطلب</button>
    </div>
  );
}
