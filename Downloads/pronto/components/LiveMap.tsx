"use client";
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Mock coordinates: the courier dot is interpolated between store and customer.
export default function LiveMap({ store, dest, progress }: { store: [number, number]; dest: [number, number]; progress: number }) {
  const el = useRef<HTMLDivElement>(null);
  const dot = useRef<L.CircleMarker | null>(null);
  useEffect(() => {
    const m = L.map(el.current!).setView(store, 13);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(m);
    L.circleMarker(store, { color: "#000" }).addTo(m).bindTooltip("المتجر");
    L.circleMarker(dest, { color: "#16a34a" }).addTo(m).bindTooltip("عنوانك");
    dot.current = L.circleMarker(store, { radius: 9, color: "#FF6A00", fillOpacity: 1 }).addTo(m);
    m.fitBounds([store, dest], { padding: [30, 30] });
    return () => { m.remove(); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { dot.current?.setLatLng([store[0] + (dest[0] - store[0]) * progress, store[1] + (dest[1] - store[1]) * progress]); }, [progress]); // eslint-disable-line react-hooks/exhaustive-deps
  return <div ref={el} className="h-64 overflow-hidden rounded-xl" />;
}
