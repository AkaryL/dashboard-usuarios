// src/components/LiveTicker.jsx
import { useMemo } from "react";

export default function LiveTicker({ items = [], leftKey="mac", rightKey="count", speed = 30 }) {
  const data = useMemo(() => items?.slice(0, 20) ?? [], [items]);

  return (
    <div className="relative overflow-hidden rounded-lg border border-[rgba(108,252,79,0.14)]">
      <div
        className="flex gap-8 whitespace-nowrap will-change-transform"
        style={{ animation: `ticker ${speed}s linear infinite` }}
      >
        {[...data, ...data].map((it, i) => (
          <div key={i} className="py-2 px-4 text-sm text-slate-300/90">
            <span className="text-slate-400 mr-2">{it?.[leftKey] ?? "—"}</span>
            <span className="text-slate-200 font-medium">{it?.[rightKey] ?? 0}</span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      `}</style>
    </div>
  );
}
