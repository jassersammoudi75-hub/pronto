"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Register() {
  const r = useRouter();
  const [f, setF] = useState({ role: "CUSTOMER", name: "", email: "", phone: "", password: "", storeName: "" });
  const [err, setErr] = useState("");
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const res = await fetch("/api/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
    if (!res.ok) return setErr((await res.json()).error || "حدث خطأ");
    r.push("/login");
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3">
      <h1 className="text-2xl font-black">حساب جديد</h1>
      <select className="input" value={f.role} onChange={set("role")}>
        <option value="CUSTOMER">عميل</option><option value="MERCHANT">تاجر (يحتاج موافقة الإدارة)</option><option value="COURIER">مندوب توصيل (يحتاج موافقة الإدارة)</option>
      </select>
      <input className="input" placeholder="الاسم" value={f.name} onChange={set("name")} required />
      {f.role === "MERCHANT" && <input className="input" placeholder="اسم المتجر" value={f.storeName} onChange={set("storeName")} required />}
      <input className="input" dir="ltr" type="email" placeholder="البريد الإلكتروني" value={f.email} onChange={set("email")} />
      <input className="input" dir="ltr" placeholder="رقم الهاتف (مثال: +10000000009)" value={f.phone} onChange={set("phone")} />
      <input className="input" dir="ltr" type="password" minLength={6} placeholder="كلمة المرور" value={f.password} onChange={set("password")} required />
      {err && <p className="text-red-600">{err}</p>}
      <button className="btn w-full">إنشاء الحساب</button>
    </form>
  );
}
