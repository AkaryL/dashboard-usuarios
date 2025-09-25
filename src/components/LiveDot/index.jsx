// src/components/LiveDot.jsx
export default function LiveDot({ label = "LIVE", color = "#6CFC4F" }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="relative inline-block w-2.5 h-2.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 12px ${color}66` }}
      >
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: color, opacity: .35 }}
        />
      </span>
      <span className="text-xs tracking-widest uppercase text-slate-400">{label}</span>
    </div>
  );
}
