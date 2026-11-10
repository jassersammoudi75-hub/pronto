import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { me } from "@/lib/auth";

const merchant = async () => { const u = await me(); return u?.role === "MERCHANT" && u.approved ? u : null; };
const no = () => NextResponse.json({ error: "غير مصرح" }, { status: 403 });
const ok = () => NextResponse.json({ ok: true });

export async function POST(req: Request) {
  const u = await merchant(); if (!u) return no();
  const p = z.object({ storeId: z.string(), name: z.string().min(1), price: z.number().int().positive(), image: z.string().url().optional() }).safeParse(await req.json());
  if (!p.success) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  if (!(await db.store.findFirst({ where: { id: p.data.storeId, ownerId: u.id } }))) return no();
  await db.product.create({ data: { ...p.data, image: p.data.image ?? `https://picsum.photos/seed/${encodeURIComponent(p.data.name)}/300/300` } });
  return ok();
}
export async function PUT(req: Request) {
  const u = await merchant(); if (!u) return no();
  const { id, price } = await req.json();
  await db.product.updateMany({ where: { id, store: { ownerId: u.id } }, data: { price: Math.round(price) } });
  return ok();
}
export async function DELETE(req: Request) {
  const u = await merchant(); if (!u) return no();
  const { id } = await req.json();
  await db.product.deleteMany({ where: { id, store: { ownerId: u.id } } });
  return ok();
}
