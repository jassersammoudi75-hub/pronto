import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { money } from "@/lib/utils";
import { Act, AutoRefresh } from "@/components/Bits";

export default async function Courier() {
  const u = await requireRole("COURIER");
  const mine = await db.order.findMany({ where: { delivery: { courierId: u.id }, status: { in: ["READY", "PICKED_UP"] } }, include: { store: true } });
  const open = u.online ? await db.order.findMany({ where: { status: "READY", delivery: null }, include: { store: true }, orderBy: { createdAt: "asc" } }) : [];
  return (
    <>
      <AutoRefresh />
      <div className="mb-6 flex items-center justify-between rounded-xl bg-black p-4 text-white">
        <b>{u.online ? "أنت متصل" : "أنت غير متصل"}</b>
        <Act url="/api/courier" body={{ online: !u.online }} label={u.online ? "إيقاف الاستقبال" : "ابدأ الاستقبال"} />
      </div>
      <h2 className="mb-3 text-xl font-black">توصيلاتي</h2>
      <div className="mb-8 space-y-3">
        {mine.map((o) => (
          <div key={o.id} className="rounded-xl border bg-white p-4">
            <p><b>{o.store.name}</b> إلى {o.address}</p>
            <Act url={`/api/orders/${o.id}`} body={{ status: o.status === "READY" ? "PICKED_UP" : "DELIVERED" }} label={o.status === "READY" ? "تم الاستلام من المتجر" : "تم التسليم للعميل"} />
          </div>
        ))}
        {!mine.length && <p className="text-neutral-500">لا توجد توصيلات نشطة.</p>}
      </div>
      <h2 className="mb-3 text-xl font-black">طلبات متاحة</h2>
      <div className="space-y-3">
        {open.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3 rounded-xl border bg-white p-4">
            <span><b>{o.store.name}</b> إلى {o.address}</span><span>{money(o.total)}</span>
            <Act url={`/api/orders/${o.id}`} body={{ status: "ASSIGN" }} label="قبول التوصيل" />
          </div>
        ))}
        {!u.online && <p className="text-neutral-500">فعّل الاستقبال لعرض الطلبات المتاحة.</p>}
        {u.online && !open.length && <p className="text-neutral-500">لا توجد طلبات جاهزة حالياً.</p>}
      </div>
    </>
  );
}
