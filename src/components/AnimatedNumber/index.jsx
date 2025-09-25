// src/components/AnimatedNumber.jsx
import { useEffect, useRef, useState } from "react";

export default function AnimatedNumber({ value = 0, duration = 600, format = (v)=>v.toLocaleString() }) {
  const [display, setDisplay] = useState(Number(value) || 0);
  const fromRef = useRef(Number(value) || 0);

  useEffect(() => {
    const from = fromRef.current;
    const to = Number(value) || 0;
    if (from === to) return;

    const start = performance.now();
    const d = Math.max(200, duration);
    const ease = (t) => 1 - Math.pow(1 - t, 3); // easeOutCubic

    let raf;
    const step = (now) => {
      const p = Math.min(1, (now - start) / d);
      const v = Math.round(from + (to - from) * ease(p));
      setDisplay(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    fromRef.current = to;
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return <span>{format(display)}</span>;
}
