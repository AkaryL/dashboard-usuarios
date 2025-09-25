import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../context/DataContext";
import DataTable from "../../components/DataTable";
import { TopList } from "../../components/TopList";
import Heatmap from "../../components/Heatmap";
import LiveTrendChart from "../../components/LiveTrendChart";
import MiniECG from "../../components/MiniECG";
import LiveDot from "../../components/LiveDot";
import LiveTicker from "../../components/LiveTicker";

const NEON = "#6CFC4F";
const CYAN = "#00E5FF";
const MAG  = "#FF3EF0";

export default function Home() {
  const { visits, topUsers, topRouters, generalHeatPoints, riskUsers, count } = useContext(DataContext);
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    const points = (generalHeatPoints.filter(item => item.latitud && item.longitud)).map((item) => [
      item.latitud,
      item.longitud,
      Number(item.count || 0),
    ]);
    setMapData(points);
  }, [generalHeatPoints]);

  return (
    <div
      className="min-h-screen relative text-slate-100 overflow-hidden"
      // Fondo gamer: gradient oscuro + vignette + noise sutil
      style={{
        background:
          "radial-gradient(1200px 600px at 15% -10%, rgba(108,252,79,0.10), transparent 60%)," +
          "radial-gradient(1200px 700px at 100% -20%, rgba(255,62,240,0.08), transparent 60%)," +
          "linear-gradient(180deg, #0a0f17 0%, #080c14 35%, #070a11 100%)",
      }}
    >
      {/* Halos y scan line */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-15"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(108,252,79,.20) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,252,79,.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute left-[-8rem] bottom-[-8rem] w-[28rem] h-[28rem] rounded-full blur-3xl opacity-30 -z-10"
        style={{ background: NEON }}
      />
      <div
        className="absolute right-[-6rem] top-[-6rem] w-[22rem] h-[22rem] rounded-full blur-3xl opacity-25 -z-10"
        style={{ background: MAG }}
      />
      <div
        className="absolute left-1/4 right-1/4 -top-1/3 h-1/3 -z-10"
        style={{
          background: "linear-gradient(to bottom, transparent, rgba(108,252,79,.12), transparent)",
          filter: "blur(2px)",
          animation: "scan 7s linear infinite",
        }}
      />
      <style>{`
        @keyframes scan { 0% { transform: translateY(-100%); } 100% { transform: translateY(300%); } }
        .card-neon { background: rgba(10, 13, 22, 0.75); }
        .card-neon:hover { box-shadow: 0 0 0 1px rgba(108,252,79,.25) inset, 0 10px 30px rgba(0,0,0,.35), 0 0 22px rgba(108,252,79,.18); }
      `}</style>

      <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 relative z-10">
        {/* HERO */}
        <div className="mb-10">
          <p className="text-sm text-slate-400">Bienvenido de nuevo!</p>
          <h1 className="mt-1 text-2xl md:text-3xl font-semibold tracking-tight">
            {/* Dashboard <span style={{ color: NEON, textShadow: `0 0 12px ${NEON}66` }}>Usuarios</span> */}
          </h1>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { label: "Total de Visitas", comit: "ultimas 24 horas",value: count[0]?.total_visitas || 0, line: CYAN },
            { label: "Usuarios Únicos",  comit: "ultimas 24 horas", value: count[0]?.total_mac_unicas || 0, line: NEON },
            { label: "Puntos Activos",  comit: "ultimas 24 horas", value: count[0]?.total_router_mac_diferentes || 0, line: MAG },
          ].map((s, i) => (
            <div
              key={i}
              className="rounded-xl p-6 md:p-7 border card-neon transition-shadow"
              style={{
                borderColor: "rgba(108,252,79,0.18)",
                boxShadow: "0 6px 24px rgba(0,0,0,.45), 0 0 0 1px rgba(108,252,79,.09) inset",
              }}
            >
              <div className="text-xs uppercase tracking-widest text-slate-400 ">{s.label}</div>
              <span className="text-xs" style={{ color: NEON }}>{s.comit}</span>
              <div className="text-3xl font-semibold text-white">{parseInt(s.value).toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* MAIN */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 mb-12">
          {/* Tabla */}
          <div
            className="rounded-xl border card-neon shadow-xl flex flex-col overflow-hidden"
            style={{ borderColor: "rgba(108,252,79,0.18)" }}
          >
            <div className="px-6 md:px-8 py-5 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(108,252,79,0.14)" }}>
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-medium text-white">Actividad Reciente</h2>
                <a className="text-sm font-medium" style={{ color: NEON }}>Últimos 100</a>
              </div>
              <div className="flex gap-4 mr-12 w-32 h-12">
                <LiveDot />
                <MiniECG width={128} height={90} fps={45} points={150} />
              </div>
            </div>
            <div className="flex-1 p-0 m-0">
              <DataTable
                columns={[
                  { key: "fecha", header: "Fecha" },
                  { key: "campaña", header: "Campaña vista" },
                  { key: "mac", header: "MAC" },
                  { key: "estacion", header: "Router" },
                ]}
                rows={visits}
              />
            </div>
          </div>

          {/* Aside */}
          <div className="flex flex-col gap-6">
            {/* Top Users */}
            <div
              className="rounded-xl overflow-hidden border card-neon shadow-xl"
              style={{ borderColor: "rgba(108,252,79,0.18)" }}
            >
              <div className="px-5 py-4 flex items-center justify-between"
                   style={{ borderBottom: "1px solid rgba(108,252,79,0.14)" }}>
                <h3 className="text-base md:text-lg font-medium text-white">Usuarios con más conexiones</h3>
                <a className="text-sm font-medium" style={{ color: CYAN }}>Top 10</a>
              </div>
              <div className="p-2">
                <TopList items={topUsers} leftKey="mac" rightKey="count" name="name" risk="riesgo" user />
              </div>
            </div>

            {/* High Risk */}
            <div
              className="rounded-xl overflow-hidden border card-neon shadow-xl"
              style={{ borderColor: "rgba(108,252,79,0.18)" }}
            >
              <div className="px-5 py-4"
                   style={{ borderBottom: "1px solid rgba(108,252,79,0.14)" }}>
                <h3 className="text-base md:text-lg font-medium text-white">Usuarios de Alto Riesgo</h3>
              </div>
              <div className="p-2">
                <TopList items={riskUsers} leftKey="mac" name="name" risk="riesgo" user />
              </div>
            </div>

            {/* Routers */}
            <div
              className="rounded-xl overflow-hidden border card-neon shadow-xl"
              style={{ borderColor: "rgba(108,252,79,0.18)" }}
            >
              <div className="px-5 py-4 flex items-center justify-between"
                   style={{ borderBottom: "1px solid rgba(108,252,79,0.14)" }}>
                <h3 className="text-base md:text-lg font-medium text-white">Puntos con más conexiones</h3>
                <a className="text-sm font-medium" style={{ color: MAG }}>Top 10</a>
              </div>
              <div className="p-2">
                <TopList items={topRouters} leftKey="estacion" rightKey="count" />
              </div>
            </div>
          </div>
        </div>

        {/* HEATMAP */}
        <div
          className="rounded-xl overflow-hidden border card-neon shadow-xl"
          style={{ borderColor: "rgba(108,252,79,0.18)" }}
        >
          <div className="px-6 md:px-8 py-5 flex items-center justify-between"
               style={{ borderBottom: "1px solid rgba(108,252,79,0.14)" }}>
            <div>
              <h2 className="text-lg md:text-xl font-medium text-white">Distribución Geográfica</h2>
              <p className="text-sm text-slate-400 mt-1">Mapa de densidad de conexiones</p>
            </div>
          </div>
          <div className="p-6 md:p-8">
            <div className="rounded-xl overflow-hidden"
                 style={{ border: "1px solid rgba(108,252,79,0.14)", boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.06)" }}>
              <Heatmap points={mapData} heightClass="h-[60vh]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
