"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

const HOME: Record<string, string> = { CUSTOMER: "/", MERCHANT: "/merchant", COURIER: "/courier", ADMIN: "/admin" };

export default function Login() {
  const r = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [id, setId] = useState(""), [secret, setSecret] = useState(""), [err, setErr] = useState("");
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr("");
    const res = await signIn("credentials", { identifier: id, secret, redirect: false });
    if (res?.error) return setErr("بيانات الدخول غير صحيحة");
    const s: any = await getSession();
    r.push(HOME[s?.user?.role] ?? "/"); r.refresh();
  }
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3">
      <h1 className="text-2xl font-black">تسجيل الدخول</h1>
      <div className="flex gap-2">
        {(["email", "phone"] as const).map((m) => (
          <button type="button" key={m} onClick={() => { setMode(m); setId(""); setSecret(""); }} className={`flex-1 rounded-full border py-1.5 font-semibold ${mode === m ? "border-brand bg-brand" : "bg-white"}`}>
            {m === "email" ? "البريد وكلمة المرور" : "رقم الهاتف + OTP"}
          </button>
        ))}
      </div>
      <input className="input" dir="ltr" placeholder={mode === "email" ? "name@example.com" : "+10000000002"} value={id} onChange={(e) => setId(e.target.value)} required />
      <input className="input" dir="ltr" type={mode === "email" ? "password" : "text"} placeholder={mode === "email" ? "كلمة المرور" : "رمز التحقق (للتجربة: 123456)"} value={secret} onChange={(e) => setSecret(e.target.value)} required />
      {err && <p className="text-red-600">{err}</p>}
      <button className="btn w-full">دخول</button>
      <p className="text-sm">ليس لديك حساب؟ <Link href="/register" className="font-bold underline">سجّل الآن</Link></p>
    </form>
  );
}
