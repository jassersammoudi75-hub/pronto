import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { money, STATUS } from "@/lib/utils";
import { Act, AutoRefresh, EditPrice, ProductForm } from "@/components/Bits";

export default async function Merchant() {
  const u = await requireRole("MERCHANT");
  const [orders, stores] = await Promise.all([
    db.order.findMany({ where: { store: { ownerId: u.id }, status: { in: ["PENDING", "ACCEPTED", "READY"] } }, include: { items: true, store: true }, orderBy: { createdAt: "asc" } }),
    db.store.findMany({ where: { ownerId: u.id }, include: { products: { orderBy: { name: "asc" } } } }),
  ]);
  return (
    <>
      <AutoRefresh />
      <h1 className="mb-3 text-2xl font-black">الطلبات الواردة</h1>
      <div className="mb-8 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border bg-white p-4">
            <div className="flex items-center justify-between"><b>{o.store.name}</b><span>{money(o.total)}</span><span className="text-sm">{o.status === "READY" ? "بانتظار المندوب" : STATUS[o.status]}</span></div>
            <ul className="my-2 text-sm">{o.items.map((i) => <li key={i.id}>{i.qty} × {i.name}</li>)}</ul>
            {o.status !== "READY" && <Act url={`/api/orders/${o.id}`} body={{ status: o.status === "PENDING" ? "ACCEPTED" : "READY" }} label={o.status === "PENDING" ? "قبول الطلب" : "جاهز للاستلام"} />}
          </div>
        ))}
        {!orders.length && <p className="text-neutral-500">لا توجد طلبات حالياً.</p>}
      </div>
      <h2 className="mb-3 text-xl font-black">المنتجات</h2>
      {stores.map((s) => (
        <section key={s.id} className="mb-6 rounded-xl border bg-white p-4">
          <h3 className="font-bold">{s.name}</h3>
          {s.products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 border-b py-2">
              <span className="flex-1">{p.name}</span><span>{money(p.price)}</span>
              <EditPrice id={p.id} price={p.price} />
              <Act url="/api/products" method="DELETE" body={{ id: p.id }} label="حذف" dark />
            </div>
          ))}
          <ProductForm storeId={s.id} />
        </section>
      ))}
    </>
  );
}
