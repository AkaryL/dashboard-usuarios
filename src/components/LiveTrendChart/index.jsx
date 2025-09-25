// src/components/LiveTrendChart.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Tooltip);

export default function LiveTrendChart({
  points = 80,
  height = 64,
  lineColor = "#6CFC4F",
  fps = 20, // 20fps = 50ms por tick
}) {
  const chartRef = useRef(null);
  const rafRef = useRef(0);
  const queueRef = useRef([]);

  // Generador de señal base + ruido suave
  const nextValue = useMemo(() => {
    let v = 0.2, target = 0.3;
    return () => {
      if (Math.random() < 0.05) target = 0.15 + Math.random() * 0.6;
      v += (target - v) * 0.15;
      v += (Math.random() - 0.5) * 0.02;
      return Math.max(0.05, Math.min(0.95, v));
    };
  }, []);

  // Datos iniciales
  const data = useMemo(() => {
    const initial = Array.from({ length: points }, () => nextValue());
    return {
      labels: Array.from({ length: points }, (_, i) => i),
      datasets: [
        {
          data: initial,
          borderColor: lineColor,
          borderWidth: 2,
          tension: 0.25,
          pointRadius: 0,
        },
      ],
    };
  }, [points, lineColor, nextValue]);

  // Opciones básicas
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    parsing: false,
    animation: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0, max: 1.2 },
    },
  }), []);

  // Glow sencillo (sombra en el trazo)
  const glowPlugin = useMemo(() => ({
    id: "glow",
    beforeDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.shadowColor = "rgba(108,252,79,0.6)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    },
    afterDatasetsDraw(chart) {
      chart.ctx.restore();
    },
  }), []);

  // Gradiente dinámico: requiere chartArea (existe tras layout)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    function applyGradient() {
      const { ctx, chartArea } = chart;
      if (!chartArea) return; // aún no hay layout
      const g = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
      g.addColorStop(0, lineColor);
      g.addColorStop(1, lineColor + "CC");
      chart.data.datasets[0].borderColor = g;
      chart.update("none");
    }

    // Al primer layout y en cada resize, rehacemos el gradiente
    const unsub = chart.$context?.resize || (() => {});
    applyGradient();
    // Chart.js no expone un onResize oficial aquí, así que rehacemos en rAF siguiente
    // y cada que el browser resiza el canvas.
    const onWindowResize = () => {
      // Defer a siguiente frame para tener chartArea correcto
      requestAnimationFrame(applyGradient);
    };
    window.addEventListener("resize", onWindowResize);

    return () => {
      window.removeEventListener("resize", onWindowResize);
      unsub?.();
    };
  }, [lineColor]);

  // Encola un “latido” (pico)
  useEffect(() => {
    const beat = () => queueRef.current.push(0.3, 0.4, 1.0, 0.35, 0.25);
    const id = setInterval(beat, 1200 + Math.random() * 1300);
    return () => clearInterval(id);
  }, []);

  // Bucle de actualización (streaming)
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const stepMs = Math.max(16, Math.round(1000 / fps)); // clamp a 60fps min
    let last = performance.now();

    const tick = (now) => {
      if (now - last >= stepMs) {
        const ds = chart.data.datasets[0].data;
        const next = queueRef.current.length ? queueRef.current.shift() : nextValue();
        ds.push(next);
        if (ds.length > points) ds.shift();
        chart.update("none"); // sin anim extra
        last = now;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fps, points, nextValue]);

  return (
    <div className="w-full" style={{ height }}>
      <Line ref={chartRef} data={data} options={options} plugins={[glowPlugin]} />
    </div>
  );
}
