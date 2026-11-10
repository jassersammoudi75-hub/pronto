import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const S = z.object({
  name: z.string().min(2), email: z.string().email().optional().or(z.literal("")), phone: z.string().min(6).optional().or(z.literal("")),
  password: z.string().min(6), role: z.enum(["CUSTOMER", "MERCHANT", "COURIER"]), storeName: z.string().optional(),
});
export async function POST(req: Request) {
  const p = S.safeParse(await req.json());
  if (!p.success || (!p.data.email && !p.data.phone)) return NextResponse.json({ error: "بيانات غير صحيحة (أدخل بريداً أو هاتفاً)" }, { status: 400 });
  const d = p.data;
  try {
    await db.user.create({
      data: {
        name: d.name, email: d.email?.toLowerCase() || null, phone: d.phone || null, password: await bcrypt.hash(d.password, 10),
        role: d.role, approved: d.role === "CUSTOMER", // merchants/couriers wait for admin approval
        ...(d.role === "MERCHANT" ? { stores: { create: { name: d.storeName || d.name, category: "مطاعم", image: `https://picsum.photos/seed/${encodeURIComponent(d.name)}/600/400`, lat: 30.05, lng: 31.23 } } } : {}),
      },
    });
  } catch { return NextResponse.json({ error: "الحساب موجود مسبقاً" }, { status: 409 }); }
  return NextResponse.json({ ok: true });
}
