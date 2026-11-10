import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { me } from "@/lib/auth";
import { FEE } from "@/lib/utils";

const S = z.object({
  storeId: z.string(), address: z.string().min(5), payment: z.enum(["CASH", "CARD"]),
  items: z.array(z.object({ productId: z.string(), qty: z.number().int().min(1).max(50) })).min(1),
});
export async function POST(req: Request) {
  const u = await me();
  if (!u || u.role !== "CUSTOMER") return NextResponse.json({ error: "يجب تسجيل الدخول كعميل" }, { status: 403 });
  const p = S.safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "بيانات الطلب غير صحيحة" }, { status: 400 });
  const d = p.data;
  const ps = await db.product.findMany({ where: { id: { in: d.items.map((i) => i.productId) }, storeId: d.storeId } });
  if (ps.length !== d.items.length) return NextResponse.json({ error: "بعض المنتجات لم تعد متاحة" }, { status: 400 });
  const lines = d.items.map((i) => { const x = ps.find((y) => y.id === i.productId)!; return { productId: x.id, name: x.name, price: x.price, qty: i.qty }; }); // prices come from the DB
  const o = await db.order.create({
    data: {
      customerId: u.id, storeId: d.storeId, address: d.address, payment: d.payment, // CARD = mocked Stripe test payment
      total: lines.reduce((s, l) => s + l.price * l.qty, 0) + FEE, lat: 30.06 + Math.random() * 0.03, lng: 31.22 + Math.random() * 0.03,
      items: { create: lines },
    },
  });
  return NextResponse.json({ id: o.id });
}
