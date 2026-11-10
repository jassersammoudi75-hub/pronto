import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { me } from "@/lib/auth";

export async function PATCH(req: Request) {
  const u = await me();
  if (!u || u.role !== "COURIER" || !u.approved) return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  await db.user.update({ where: { id: u.id }, data: { online: !!(await req.json()).online } });
  return NextResponse.json({ ok: true });
}
