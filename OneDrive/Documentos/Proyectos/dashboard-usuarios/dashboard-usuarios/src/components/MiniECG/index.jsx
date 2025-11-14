// src/components/MiniECG.jsx
import React, { useEffect, useRef } from "react";

export default function MiniECG({
  width = 280,
  height = 64,
  lineColor = "#6CFC4F",
  fps = 20,
  points = 120
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const queueRef = useRef([]);

  // ✅ señal con baseline alto
  const nextValueRef = useRef(() => 0.7);
  useEffect(() => {
    let v = 0.7, target = 0.8; // baseline alto
    nextValueRef.current = () => {
      if (Math.random() < 0.05) target = 0.65 + Math.random() * 0.35; 
      v += (target - v) * 0.2;
      v += (Math.random() - 0.5) * 0.03; // ruido pequeño
      return Math.max(0.55, Math.min(1.1, v)); // 🔝 límites altos
    };
  }, []);

  // picos más fuertes
  useEffect(() => {
    const beat = () => queueRef.current.push(0.85, 0.95, 1.1, 0.9, 0.8);
    const id = setInterval(beat, 1200 + Math.random() * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let data = Array.from({ length: points }, () => nextValueRef.current());

    const stepMs = Math.max(16, Math.round(1000 / fps));
    let last = performance.now();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = lineColor;

      ctx.save();
      ctx.shadowColor = lineColor;
      ctx.shadowBlur = 10;

      ctx.beginPath();
      const stepX = width / (points - 1);
      for (let i = 0; i < data.length; i++) {
        const y = height - data[i] * (height * 0.9) - height * 0.05;
        if (i === 0) ctx.moveTo(0, y);
        else ctx.lineTo(i * stepX, y);
      }
      ctx.stroke();
      ctx.restore();
    };

    const tick = (now) => {
      if (now - last >= stepMs) {
        const next = queueRef.current.length ? queueRef.current.shift() : nextValueRef.current();
        data.push(next);
        if (data.length > points) data.shift();
        draw();
        last = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    draw();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [width, height, lineColor, fps, points]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width, height, display: "block", padding: 0 }}
    />
  );
}
