import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { me } from "@/lib/auth";

export async function PATCH(req: Request) {
  const u = await me();
  if (u?.role !== "ADMIN") return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  const { id, approved } = await req.json();
  await db.user.updateMany({ where: { id, role: { in: ["MERCHANT", "COURIER"] } }, data: { approved: !!approved, ...(approved ? {} : { online: false }) } });
  return NextResponse.json({ ok: true });
}
