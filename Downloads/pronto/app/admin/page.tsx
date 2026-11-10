import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { money } from "@/lib/utils";
import { Act } from "@/components/Bits";

const R: Record<string, string> = { CUSTOMER: "عميل", MERCHANT: "تاجر", COURIER: "مندوب", ADMIN: "أدمن" };

export default async function Admin() {
  await requireRole("ADMIN");
  const [orders, rev, users] = await Promise.all([
    db.order.count(),
    db.order.aggregate({ _sum: { total: true }, where: { status: "DELIVERED" } }),
    db.user.findMany({ orderBy: [{ approved: "asc" }, { createdAt: "desc" }] }),
  ]);
  const stats = [["عدد الطلبات", orders], ["الإيرادات (المُسلَّمة)", money(rev._sum.total ?? 0)], ["المستخدمون", users.length], ["بانتظار الموافقة", users.filter((x) => !x.approved).length]];
  return (
    <>
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([l, v]) => <div key={l} className="rounded-xl border bg-white p-4"><p className="text-sm text-neutral-500">{l}</p><p className="text-2xl font-black">{v}</p></div>)}
      </div>
      <h2 className="mb-3 text-xl font-black">المستخدمون</h2>
      <div className="divide-y rounded-xl border bg-white">
        {users.map((x) => (
          <div key={x.id} className="flex items-center gap-3 p-3">
            <span className="flex-1 font-semibold">{x.name}</span><span className="text-sm">{R[x.role]}</span>
            <span className={`text-sm ${x.approved ? "" : "font-bold text-brand"}`}>{x.approved ? "مفعّل" : "قيد المراجعة"}</span>
            {(x.role === "MERCHANT" || x.role === "COURIER") && <Act url="/api/admin" body={{ id: x.id, approved: !x.approved }} label={x.approved ? "إيقاف" : "موافقة"} dark={x.approved} />}
          </div>
        ))}
      </div>
    </>
  );
}
