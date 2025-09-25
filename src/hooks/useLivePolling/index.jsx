// src/hooks/useLivePolling.js
import { useEffect, useRef } from "react";

export default function useLivePolling(cb, { interval = 5000 } = {}) {
  const savedCb = useRef(cb);
  useEffect(() => { savedCb.current = cb; }, [cb]);

  useEffect(() => {
    let id;
    let running = true;

    const tick = async () => {
      if (!running) return;
      try { await savedCb.current?.(); } catch {}
    };

    const start = () => { id = setInterval(tick, interval); };
    const stop  = () => { if (id) clearInterval(id); };

    const handleVis = () => (document.hidden ? stop() : (tick(), start()));

    tick(); // primera carga inmediata
    start();

    document.addEventListener("visibilitychange", handleVis);
    return () => { running = false; stop(); document.removeEventListener("visibilitychange", handleVis); };
  }, [interval]);
}
