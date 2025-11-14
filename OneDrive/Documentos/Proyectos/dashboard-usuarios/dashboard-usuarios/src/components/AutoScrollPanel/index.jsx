// src/components/AutoScrollPanel.jsx
import { useEffect, useRef } from "react";

export default function AutoScrollPanel({ height = 220, children, speed = 1 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let y = 0, raf;

    // duplica contenido para loop infinito
    el.innerHTML = el.innerHTML + el.innerHTML;

    const loop = () => {
      y += speed * 0.2; // ajusta la velocidad
      if (y >= el.scrollHeight / 2) y = 0;
      el.scrollTop = y;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [speed]);

  return (
    <div className="overflow-hidden relative" style={{ height }}>
      <div
        ref={ref}
        className="pr-2"
        style={{ maskImage: "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)" }}
      >
        {children}
      </div>
    </div>
  );
}
