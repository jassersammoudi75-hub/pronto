import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { money } from "@/lib/utils";
import Tracker from "@/components/Tracker";

export default async function OrderPage({ params }: { params: { id: string } }) {
  const u = await requireRole("CUSTOMER");
  const o = await db.order.findFirst({ where: { id: params.id, customerId: u.id }, include: { store: true, items: true } });
  if (!o) notFound();
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-black">طلبك من {o.store.name}</h1>
      <Tracker id={o.id} init={o.status} store={[o.store.lat, o.store.lng]} dest={[o.lat, o.lng]} />
      <ul className="mt-4 rounded-xl border bg-white p-4 text-sm">
        {o.items.map((i) => <li key={i.id} className="flex justify-between"><span>{i.qty} × {i.name}</span><span>{money(i.price * i.qty)}</span></li>)}
        <li className="mt-2 flex justify-between font-black"><span>الإجمالي</span><span>{money(o.total)}</span></li>
      </ul>
    </div>
  );
}
