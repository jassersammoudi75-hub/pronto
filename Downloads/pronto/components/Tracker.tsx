"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { STATUS } from "@/lib/utils";

const LiveMap = dynamic(() => import("./LiveMap"), { ssr: false, loading: () => <div className="h-64 rounded-xl bg-neutral-200" /> });
const STEPS: [string, string[]][] = [["قيد التحضير", ["PENDING", "ACCEPTED", "READY"]], ["في الطريق", ["PICKED_UP"]], ["تم التوصيل", ["DELIVERED"]]];

export default function Tracker({ id, init, store, dest }: { id: string; init: string; store: [number, number]; dest: [number, number] }) {
  const [status, setStatus] = useState(init);
  const [p, setP] = useState(0);
  useEffect(() => { // poll the real status every 4s
    const t = setInterval(async () => { const r = await fetch(`/api/orders/${id}`); if (r.ok) setStatus((await r.json()).status); }, 4000);
    return () => clearInterval(t);
  }, [id]);
  useEffect(() => { // simulated courier movement while "on the way"
    if (status !== "PICKED_UP") { setP(status === "DELIVERED" ? 1 : 0); return; }
    const t = setInterval(() => setP((x) => Math.min(x + 0.04, 0.9)), 1000);
    return () => clearInterval(t);
  }, [status]);
  const cur = STEPS.findIndex(([, s]) => s.includes(status));
  return (
    <div>
      <ol className="mb-3 grid grid-cols-3 gap-2">
        {STEPS.map(([l], i) => <li key={l} className={`rounded-lg p-3 text-center text-sm font-bold ${i <= cur ? "bg-brand" : "bg-neutral-200 text-neutral-500"}`}>{l}</li>)}
      </ol>
      <p className="mb-3 font-semibold">{STATUS[status]}</p>
      <LiveMap store={store} dest={dest} progress={p} />
    </div>
  );
}
