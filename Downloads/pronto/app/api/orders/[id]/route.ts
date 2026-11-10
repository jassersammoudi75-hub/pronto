import { NextResponse } from "next/server";
import { OrderStatus, Role } from "@prisma/client";
import { db } from "@/lib/db";
import { me } from "@/lib/auth";

const err = (error: string, status: number) => NextResponse.json({ error }, { status });
const T: Record<string, { role: Role; from: OrderStatus }> = {
  ACCEPTED: { role: "MERCHANT", from: "PENDING" }, READY: { role: "MERCHANT", from: "ACCEPTED" },
  PICKED_UP: { role: "COURIER", from: "READY" }, DELIVERED: { role: "COURIER", from: "PICKED_UP" },
};

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const u = await me();
  const o = u && (await db.order.findFirst({ where: { id: params.id, customerId: u.id } }));
  return o ? NextResponse.json({ status: o.status }) : err("غير موجود", 404);
}
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const u = await me();
  if (!u || !u.approved) return err("غير مصرح", 401);
  const { status } = await req.json();
  const o = await db.order.findUnique({ where: { id: params.id }, include: { store: true, delivery: true } });
  if (!o) return err("غير موجود", 404);
  if (status === "ASSIGN") {
    if (u.role !== "COURIER" || !u.online || o.status !== "READY" || o.delivery) return err("لا يمكن قبول هذا الطلب", 403);
    try { await db.delivery.create({ data: { orderId: o.id, courierId: u.id } }); } catch { return err("سبقك مندوب آخر", 409); } // orderId is unique
    return NextResponse.json({ ok: true });
  }
  const t = T[status];
  if (!t || u.role !== t.role || o.status !== t.from) return err("انتقال غير مسموح", 403);
  if (u.role === "MERCHANT" && o.store.ownerId !== u.id) return err("غير مصرح", 403);
  if (u.role === "COURIER" && o.delivery?.courierId !== u.id) return err("غير مصرح", 403);
  await db.order.update({ where: { id: o.id }, data: { status } });
  return NextResponse.json({ ok: true });
}
