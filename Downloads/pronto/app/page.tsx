import Link from "next/link";
import { db } from "@/lib/db";

export default async function Home({ searchParams }: { searchParams: { q?: string; c?: string } }) {
  const { q, c } = searchParams;
  const stores = await db.store.findMany({
    where: { owner: { approved: true }, ...(c ? { category: c } : {}), ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}) },
    orderBy: { name: "asc" },
  });
  const cats = (await db.store.findMany({ where: { owner: { approved: true } }, distinct: ["category"], select: { category: true } })).map((s) => s.category);
  return (
    <>
      <section className="-mx-4 -mt-6 mb-6 bg-black px-4 pb-10 pt-8 text-white">
        <h1 className="text-4xl font-black sm:text-5xl">توصيلك، أولويتنا</h1>
        <form className="mt-5 flex max-w-xl gap-2">
          <input name="q" defaultValue={q} placeholder="ابحث عن متجر أو مطعم…" className="input text-black" />
          <button className="btn">بحث</button>
        </form>
      </section>
      <div className="mb-5 flex flex-wrap gap-2">
        {[undefined, ...cats].map((x) => (
          <Link key={x ?? "all"} href={x ? `/?c=${encodeURIComponent(x)}` : "/"} className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${c === x ? "border-brand bg-brand" : "border-neutral-300 bg-white"}`}>
            {x ?? "الكل"}
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((s) => (
          <Link key={s.id} href={`/stores/${s.id}`} className="overflow-hidden rounded-xl border bg-white">
            <img src={s.image} alt="" className="h-36 w-full object-cover" />
            <div className="p-3"><h2 className="font-bold">{s.name}</h2><p className="text-sm text-neutral-500">{s.category}</p></div>
          </Link>
        ))}
        {!stores.length && <p className="text-neutral-500">لا توجد نتائج مطابقة.</p>}
      </div>
    </>
  );
}
