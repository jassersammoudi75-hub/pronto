import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { money } from "@/lib/utils";
import { AddBtn } from "@/components/Bits";

export default async function StorePage({ params }: { params: { id: string } }) {
  const s = await db.store.findUnique({ where: { id: params.id }, include: { products: { orderBy: { name: "asc" } } } });
  if (!s) notFound();
  return (
    <>
      <img src={s.image} alt="" className="mb-4 h-40 w-full rounded-xl object-cover" />
      <h1 className="text-2xl font-black">{s.name}</h1>
      <p className="mb-5 text-neutral-500">{s.category}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {s.products.map((p) => (
          <div key={p.id} className="flex gap-3 rounded-xl border bg-white p-3">
            <img src={p.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
            <div className="flex-1"><h3 className="font-bold">{p.name}</h3><p className="text-sm">{money(p.price)}</p></div>
            <AddBtn storeId={s.id} item={{ productId: p.id, name: p.name, price: p.price }} />
          </div>
        ))}
      </div>
    </>
  );
}
