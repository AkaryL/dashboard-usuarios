// src/components/LiveTrendChart.jsx
import React, { useEffect, useRef } from "react";
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

export default function LiveTrendChart({ points = 80, height = 64 }) {
  const chartRef = useRef(null);
  const frameRef = useRef(null);
  const queueRef = useRef([]);

  // señal suave + ruido
  const nextValue = (() => {
    let v = 0.2, target = 0.3;
    return () => {
      if (Math.random() < 0.05) target = 0.15 + Math.random() * 0.6;
      v += (target - v) * 0.15;
      v += (Math.random() - 0.5) * 0.02;
      return Math.max(0.05, Math.min(0.95, v));
    };
  })();

  function enqueueBeat() {
    queueRef.current.push(0.3, 0.4, 1.0, 0.35, 0.25);
  }

  const initial = Array.from({ length: points }, () => nextValue());

  const data = {
    labels: Array.from({ length: points }, (_, i) => i),
    datasets: [
      {
        data: initial,
        borderColor: "#6CFC4F",
        borderWidth: 2,
        tension: 0.25,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    parsing: false,
    animation: { duration: 160, easing: "linear" },
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, min: 0, max: 1.2 },
    },
  };

  // plugin opcional de "glow"
  const glowPlugin = {
    id: "glow",
    beforeDatasetsDraw(chart) {
      const { ctx } = chart;
      ctx.save();
      ctx.shadowColor = "rgba(108,252,79,0.6)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
    },
    afterDatasetsDraw(chart) {
      chart.ctx.restore();
    },
  };

  useEffect(() => {
    const chart = chartRef.current; // ✅ instancia real
    if (!chart) return;

    // gradient dinámico
    const { ctx } = chart;
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, "#6CFC4F");
    g.addColorStop(1, "#6CFC4FCC");
    chart.data.datasets[0].borderColor = g;

    const beatTimer = setInterval(() => enqueueBeat(), 1200 + Math.random() * 1300);

    const stepMs = 50; // ≈20 fps (bájalo a 33 para más fluidez)
    let last = performance.now();

    function tick(now) {
      if (now - last >= stepMs) {
        const ds = chart.data.datasets[0].data;
        const next = queueRef.current.length ? queueRef.current.shift() : nextValue();
        ds.push(next);
        if (ds.length > points) ds.shift();
        chart.update("default");
        last = now;
      }
      frameRef.current = requestAnimationFrame(tick);
    }
    frameRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearInterval(beatTimer);
    };
  }, [points, height]);

  return (
    <div className="w-full" style={{ height }}>
      <Line ref={chartRef} data={data} options={options} plugins={[glowPlugin]} />
    </div>
  );
}
