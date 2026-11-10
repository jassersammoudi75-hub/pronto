import Link from "next/link";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { money, STATUS } from "@/lib/utils";

export default async function Orders() {
  const u = await requireRole("CUSTOMER");
  const orders = await db.order.findMany({ where: { customerId: u.id }, include: { store: true }, orderBy: { createdAt: "desc" } });
  return (
    <>
      <h1 className="mb-4 text-2xl font-black">طلباتي</h1>
      <div className="space-y-2">
        {orders.map((o) => (
          <Link key={o.id} href={`/orders/${o.id}`} className="flex justify-between rounded-xl border bg-white p-4">
            <b>{o.store.name}</b><span>{STATUS[o.status]}</span><span>{money(o.total)}</span>
          </Link>
        ))}
        {!orders.length && <p className="text-neutral-500">لم تقدّم أي طلب بعد.</p>}
      </div>
    </>
  );
}
