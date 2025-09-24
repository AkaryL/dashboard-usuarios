// src/pages/UserDetail/UserDetail.jsx
import { useEffect, useState, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { StatCard } from "../../components/StatCard";
import Heatmap from "../../components/Heatmap";
import { DataContext } from "../../context/DataContext";
import DataTable2 from "../../components/DataTable2";
import { searchUsers } from "../../lib/api";
import axios from "axios";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Utilidad: obtener la “mac”
function getUserMac(u = {}) {
  return u?.mac || u?.mac_address || u?.fingerprint || "";
}

const base64toFile = (base64String) => {
  const byteString = atob(base64String.split(",")[1]);
  const mimeString = base64String.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) ia[i] = byteString.charCodeAt(i);
  return new File([ab], "image.png", { type: mimeString });
};

const getRiskColor = (level) => {
  if (level === "Alto")
    return "px-2 py-1 text-red-400 border border-red-500 rounded-lg shadow-[0_0_10px_rgba(239,68,68,0.6)] animate-pulse";
  if (level === "Medio")
    return "px-2 py-1 text-yellow-300 border border-yellow-400 rounded-lg shadow-[0_0_10px_rgba(253,224,71,0.5)]";
  return "px-2 py-1 text-green-400 border border-green-500 rounded-lg shadow-[0_0_10px_rgba(34,197,94,0.5)]";
};

const NEON = "#6CFC4F";

// Helpers UI
function InfoRow({ label, value, risk }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <div className="w-32 text-xs font-medium text-slate-300 flex-shrink-0">{label}</div>
      {!risk && <div className="text-xs text-slate-100">{value ?? "—"}</div>}
      {risk && <div className={`text-xs font-medium ${getRiskColor(value)}`}>{value}</div>}
    </div>
  );
}
function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleString();
}
function renderFilterBadge(filters) {
  const pieces = [];
  if (filters.date) pieces.push(filters.date);
  if (filters.hourMode === "single" && filters.hour !== "") {
    pieces.push(`${String(filters.hour).padStart(2, "0")}:00`);
  } else if (filters.hourMode === "range" && filters.hourStart !== "" && filters.hourEnd !== "") {
    const a = String(Math.min(Number(filters.hourStart), Number(filters.hourEnd))).padStart(2, "0");
    const b = String(Math.max(Number(filters.hourStart), Number(filters.hourEnd))).padStart(2, "0");
    pieces.push(`${a}:00–${b}:59`);
  }
  if (!pieces.length) return "";
  return `— ${pieces.join(" · ")}`;
}

// Badge de estatus documento
function StatusBadge({ status = "verificado" }) {
  const map = {
    verificado: { cls: "text-emerald-300", border: "border-emerald-500", bg: "bg-emerald-900/30" },
    pendiente:  { cls: "text-amber-300",  border: "border-amber-500",   bg: "bg-amber-900/30"  },
    rechazado:  { cls: "text-rose-300",   border: "border-rose-500",    bg: "bg-rose-900/30"   },
  };
  const { cls, border, bg } = map[status] || map.verificado;
  const label = status === "verificado" ? "Verificado" : status === "pendiente" ? "Pendiente" : "Rechazado";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${cls} ${border} ${bg}`}
      style={{ boxShadow: "0 0 10px rgba(108,252,79,.25)" }}
    >
      <span className="text-[12px] leading-none">✓</span>
      {label}
    </span>
  );
}

export default function UserDetail() {
  const { mac } = useParams();
  const macParam = decodeURIComponent(mac || "");
  const [riskLevel, setRiskLevel] = useState("Bajo");

  const {
    users,
    setUsers,
    fetchHeatPoint,
    userHeatPoint,
    connectionsCount,
    fetchLastVisits,
    lastVisits,
    fetchConnectionsByHour,
    connectionsByHour,
    firstAndLastSeen,
    fetchFirstAndLastSeen,
  } = useContext(DataContext);

  // -----------------------
  // Tabs
  // -----------------------
  const [activeTab, setActiveTab] = useState("detalles");
  const tabs = [
    { id: "detalles", label: "Detalles" },
    { id: "informacion_general", label: "Información General" },
    { id: "ocupacion", label: "Ocupación/Educación" },
    { id: "rutas", label: "Rutas y Patrones" },
    { id: "redes", label: "Redes Sociales" },
    { id: "dispositivos", label: "Dispositivos/MAC" },
    { id: "analisis", label: "Análisis IA" },
    { id: "interinstitucional", label: "Interinstitucional" },
    { id: "documentos", label: "Documentos" },
  ];

  // -----------------------
  // Filtros (día y hora)
  // -----------------------
  const [filters, setFilters] = useState({
    date: "",
    hourMode: "all",
    hour: "",
    hourStart: "",
    hourEnd: "",
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [mapData, setMapData] = useState([]);

  // Cargar usuario y data derivada
  useEffect(() => {
    if (!macParam) return;
    const cached = users.find((u) => getUserMac(u) === macParam) || null;
    if (cached) {
      setSelectedUser(cached);
    } else {
      (async () => {
        let arr = await searchUsers({ mac: macParam });
        if (!arr?.length) arr = await searchUsers({ mac_address: macParam });
        if (!arr?.length) arr = await searchUsers({ fingerprint: macParam });
        const u = arr?.[0] || null;
        if (u) {
          setSelectedUser(u);
          setUsers((prev) => {
            const exists = prev.some((x) => getUserMac(x) === getUserMac(u));
            return exists
              ? prev.map((x) => (getUserMac(x) === getUserMac(u) ? { ...x, ...u } : x))
              : [...prev, u];
          });
        }
      })();
    }
    fetchHeatPoint(macParam);
    fetchLastVisits(macParam);
    fetchFirstAndLastSeen(macParam);
    fetchConnectionsByHour(macParam, { date: filters.date });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, macParam]);

  // Reconsultar horas cuando cambie el día
  useEffect(() => {
    if (!macParam) return;
    fetchConnectionsByHour(macParam, { date: filters.date });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date, macParam]);

  // Helpers de fecha/hora
  function ymd(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  function passesDateHourFilter(fechaStr) {
    if (!fechaStr) return false;
    const d = new Date(fechaStr);
    if (Number.isNaN(d.getTime())) return false;

    if (filters.date) {
      const rowYmd = ymd(d);
      if (rowYmd !== filters.date) return false;
    }
    const h = d.getHours();
    if (filters.hourMode === "single" && filters.hour !== "") {
      if (h !== Number(filters.hour)) return false;
    } else if (filters.hourMode === "range" && filters.hourStart !== "" && filters.hourEnd !== "") {
      const start = Number(filters.hourStart);
      const end = Number(filters.hourEnd);
      const lo = Math.min(start, end);
      const hi = Math.max(start, end);
      if (h < lo || h > hi) return false;
    }
    return true;
  }

  // Filtrado de visitas (cliente)
  const filteredVisits = useMemo(() => {
    if (!Array.isArray(lastVisits)) return [];
    const noDay = !filters.date;
    const noHour =
      filters.hourMode === "all" ||
      (filters.hourMode === "single" && filters.hour === "") ||
      (filters.hourMode === "range" && (filters.hourStart === "" || filters.hourEnd === ""));
    if (noDay && noHour) return lastVisits;
    return lastVisits.filter((row) => passesDateHourFilter(row?.fecha));
  }, [lastVisits, filters]);

  // Heatmap routers filtrados
  const filteredHeatRouters = useMemo(() => {
    const noDay = !filters.date;
    const noHour =
      filters.hourMode === "all" ||
      (filters.hourMode === "single" && filters.hour === "") ||
      (filters.hourMode === "range" && (filters.hourStart === "" || filters.hourEnd === ""));
    if (noDay && noHour) return null;
    const s = new Set(
      filteredVisits.map((r) => r?.router_mac).filter((v) => typeof v === "string" && v.trim() !== "")
    );
    return s;
  }, [filteredVisits, filters]);

  const markRiskLevel = async (level, mac) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/v2/usuarios/markRisk/${mac}`,
        { risk: level }
      );
      if (response.status === 200) {
        setSelectedUser((prev) => ({ ...prev, risk_level: level }));
        setUsers((prev) =>
          prev.map((u) => (getUserMac(u) === getUserMac(selectedUser) ? { ...u, risk_level: level } : u))
        );
      } else {
        console.error("Failed to mark risk level:", response.statusText);
      }
    } catch (error) {
      console.error("Error marking risk level:", error);
    }
  };

  useEffect(() => {
    const points = (userHeatPoint || [])
      .filter((item) => {
        if (!filteredHeatRouters) return true;
        const rm = item?.router_mac;
        return rm && filteredHeatRouters.has(rm);
      })
      .map((item) => [item.latitud, item.longitud, Number(item.count || 0)]);
    setMapData(points);
  }, [userHeatPoint, filteredHeatRouters]);

  // Chart data (verde neón)
  const chartData = useMemo(() => {
    const labels = (connectionsByHour || []).map((c) => `${c.hora}:00`);
    const data = (connectionsByHour || []).map((c) => Number(c.total_conexiones || 0));
    return {
      labels,
      datasets: [
        {
          label: "Conexiones",
          data,
          backgroundColor: "rgba(108,252,79,0.35)",
          borderColor: "rgba(108,252,79,0.9)",
          borderWidth: 1,
          hoverBackgroundColor: "rgba(108,252,79,0.55)",
        },
      ],
    };
  }, [connectionsByHour]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, h) => h), []);

  const documents = useMemo(
    () => [
      { name: "INE / ID oficial", status: "verificado" },
      { name: "Comprobante de domicilio", status: "pendiente" },
      { name: "Acta de nacimiento", status: "verificado" },
      { name: "Antecedentes", status: "verificado", meta: "2 registros" },
      { name: "Fotografías", status: "verificado", meta: "12 imágenes" },
      { name: "Videos", status: "verificado", meta: "3 grabaciones" },
    ],
    [selectedUser]
  );

  // —— Componentes de sección —— //
  const SectionCard = ({ title, subtitle, children }) => (
    <div
      className="rounded-xl shadow-xl"
      style={{
        background: "rgba(10,13,22,0.78)",
        border: "1px solid rgba(108,252,79,0.18)",
        boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
      }}
    >
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid rgba(108,252,79,0.16)" }}
      >
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className="p-4 text-slate-100">{children}</div>
    </div>
  );

  const Button = ({ children, onClick, className = "", style }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-xs rounded-md font-medium transition-all ${className}`}
      style={{
        border: `1px solid ${NEON}66`,
        background: "transparent",
        color: "#fff",
        textShadow: `0 0 8px ${NEON}55`,
        ...style,
      }}
    >
      {children}
    </button>
  );

  // Acciones
  const handleGenerarCarpeta = () => window.print();
  const handleAlertaCritica = () => alert("⚠️ ALERTA CRÍTICA emitida (placeholder).");
  const handleCompartirInter = () => alert("🔗 Compartido interinstitucionalmente (placeholder).");

  return (
    <div
      className="min-h-screen relative text-slate-100 overflow-hidden"
      style={{
        background:
          "radial-gradient(1200px 600px at 15% -10%, rgba(108,252,79,0.10), transparent 60%)," +
          "linear-gradient(180deg, #0a0f17 0%, #080c14 35%, #070a11 100%)",
      }}
    >
      {/* Grid neón sutil */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(108,252,79,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,252,79,.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Halo verde */}
      <div
        className="absolute -left-24 bottom-[-6rem] w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 -z-10"
        style={{ background: NEON }}
      />

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4 relative z-10">
        {/* ===== HEADER con controles ===== */}
        <div
          className="rounded-xl p-4 shadow-xl"
          style={{
            background: "rgba(10,13,22,0.78)",
            border: "1px solid rgba(108,252,79,0.18)",
            boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              {selectedUser?.photo && (
                <img
                  src={URL.createObjectURL(base64toFile(selectedUser.photo))}
                  alt="User"
                  className="w-24 h-24 object-cover rounded-lg border"
                  style={{ borderColor: "rgba(108,252,79,0.3)" }}
                />
              )}
              <div className="text-xs text-slate-300 font-medium">
                <div style={{ color: NEON, textShadow: `0 0 10px ${NEON}55` }}>
                  MAC: {getUserMac(selectedUser) || macParam}
                </div>
                <div className="text-white text-sm font-semibold">
                  {selectedUser?.name || "Usuario sin nombre"}
                </div>
              </div>
            </div>

            {/* Controles */}
            <div className="flex flex-col items-end justify-start gap-3">
              <div className="flex gap-2 flex-wrap">
                <Button onClick={handleGenerarCarpeta}>GENERAR CARPETA</Button>
                <Button
                  onClick={handleAlertaCritica}
                  style={{ border: "1px solid rgba(244,63,94,0.6)", textShadow: "none", color: "#fff" }}
                >
                  ALERTA CRÍTICA
                </Button>
                <Button onClick={handleCompartirInter}>COMPARTIR INTERINSTITUCIONAL</Button>
              </div>
              <div className="flex gap-3 items-center">
                <label htmlFor="risk" className="text-xs text-slate-300">
                  Nivel de riesgo:
                </label>
                <select
                  id="risk"
                  value={riskLevel}
                  onChange={(e) => setRiskLevel(e.target.value)}
                  className="px-2 py-1 text-xs rounded outline-none"
                  style={{
                    background: "rgba(9,12,20,0.85)",
                    color: "#E5F2E8",
                    border: "1px solid rgba(108,252,79,0.22)",
                    boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.08)",
                  }}
                >
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                </select>
                <Button
                  onClick={() => selectedUser && markRiskLevel(riskLevel, getUserMac(selectedUser))}
                  style={{ border: "1px solid rgba(251,146,60,0.7)", textShadow: "none", color: "#fff" }}
                >
                  Marcar como riesgo
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TABS ===== */}
        <div
          className="rounded-xl shadow-xl overflow-hidden"
          style={{
            background: "rgba(10,13,22,0.78)",
            border: "1px solid rgba(108,252,79,0.18)",
            boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
          }}
        >
          <div className="flex items-center gap-2 px-2 pt-2 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className="relative px-4 py-2 text-xs font-medium rounded-t-lg transition whitespace-nowrap"
                style={{
                  color: activeTab === t.id ? "#fff" : "#cbd5e1",
                  background: activeTab === t.id ? "rgba(108,252,79,.08)" : "transparent",
                  border: activeTab === t.id ? `1px solid ${NEON}66` : "1px solid transparent",
                  boxShadow: activeTab === t.id ? "0 0 12px rgba(108,252,79,0.35)" : "none",
                }}
              >
                {t.label}
                {activeTab === t.id && (
                  <span
                    className="absolute left-3 right-3 -bottom-[2px] h-[2px] rounded-full"
                    style={{ background: `linear-gradient(90deg, transparent, ${NEON}, transparent)` }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t" style={{ borderColor: "rgba(108,252,79,0.16)" }}>
            {/* ===== CONTENIDOS NUEVOS ===== */}
            {activeTab === "informacion_general" && (
              <SectionCard title="Información General">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="text-sm space-y-2">
                    <div><span className="font-semibold">ÚLTIMA DETECCIÓN:</span> hace 2 horas</div>
                    <div><span className="font-semibold">Detecciones Hoy:</span> 15</div>
                    <div className="pt-2">
                      <div className="font-semibold">📍 Localización Actual</div>
                      <div className="text-xs text-slate-300">
                        Puerto Vallarta, Jalisco<br />Calle Melón 29 y/o 12, Campestre de San Nicolás
                      </div>
                    </div>
                  </div>
                  <div className="text-sm space-y-2">
                    <div className="font-semibold">🏠 Domicilio Principal</div>
                    <div className="text-xs text-slate-300">
                      Lomas de San Nicolás,<br />Puerto Vallarta, Jalisco.
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === "ocupacion" && (
              <SectionCard title="Ocupación/Educación">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-semibold">🎓 Institución Educativa</div>
                    <div className="text-xs text-slate-300">Universidad de Guadalajara<br />Preparatoria No. 2</div>
                    <div className="font-semibold pt-2">📚 Programa Académico</div>
                    <div className="text-xs text-slate-300">Bachillerato General<br />3er Semestre - Turno Matutino</div>
                    <div className="font-semibold pt-2">📊 Rendimiento</div>
                    <div className="text-xs text-slate-300">Promedio: 8.2<br />Asistencia: 85%</div>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold">💼 Ocupación</div>
                    <div className="text-xs text-slate-300">Estudiante<br />Sin empleo registrado</div>
                    <div className="font-semibold pt-2">🏫 Horario Escolar</div>
                    <div className="text-xs text-slate-300">07:00 - 13:00<br />Lunes a Viernes</div>
                    <div className="font-semibold pt-2">📍 Campus</div>
                    <div className="text-xs text-slate-300">Sede Centro Histórico<br />Av. Hidalgo 919</div>
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === "rutas" && (
              <SectionCard title="Rutas y Patrones" subtitle="Rutas Detectadas por IA">
                <ul className="text-sm space-y-2">
                  <li>🚌 Parada Camión <span className="font-semibold">200</span> → Centro <span className="text-xs text-slate-300">(07:00 diario)</span></li>
                  <li>🚌 Parada Camión <span className="font-semibold">20</span> → Zapopan <span className="text-xs text-slate-300">(14:00 L-M-V)</span></li>
                  <li>🚌 Camión <span className="font-semibold">12</span> → Tlaquepaque <span className="text-xs text-slate-300">(18:00 fines de semana)</span></li>
                </ul>
              </SectionCard>
            )}

            {activeTab === "redes" && (
              <SectionCard title="Redes Sociales">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <div className="font-semibold text-sm mb-1">IG</div>
                    <div className="text-xs text-slate-300 mb-2">@moxc12</div>
                    <div className="text-[11px] text-slate-400">Cuentas que Sigue:</div>
                    <ul className="text-xs text-slate-300 list-disc pl-5">
                      <li>Fest Tecno GDL</li>
                      <li>DWE Underground</li>
                      <li className="text-amber-300">⚠️ PVE_Resistencia</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">FB</div>
                    <div className="text-xs text-slate-300 mb-2">José M. Peña</div>
                    <div className="text-[11px] text-slate-400">Grupos:</div>
                    <ul className="text-xs text-slate-300 list-disc pl-5">
                      <li>UDG Estudiantes Unidos</li>
                      <li className="text-amber-300">⚠️ Resistencia Juvenil GDL</li>
                      <li>Música Electrónica Jalisco</li>
                    </ul>
                  </div>
                  <div>
                    <div className="font-semibold text-sm mb-1">TW</div>
                    <div className="text-xs text-slate-300 mb-2">@jmadero_gdl</div>
                    <div className="text-[11px] text-slate-400">Actividad Reciente:</div>
                    <ul className="text-xs text-slate-300 list-disc pl-5">
                      <li className="text-amber-300">⚠️ Retuits contenido político</li>
                    </ul>
                    <div className="mt-3 text-xs text-rose-300 font-semibold">
                      ⚠️ ALERTA: Grupos de Riesgo Detectados
                    </div>
                    <div className="text-xs text-slate-300">
                      Se ha detectado interacción con 3 grupos relacionados con violencia política (PVE)
                    </div>
                    <div className="text-xs" style={{ color: NEON }}>
                      Recomendación: Elevar nivel de monitoreo a 24/7
                    </div>
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === "dispositivos" && (
              <SectionCard title="Dispositivos / MAC">
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="font-semibold">📱 Smartphone Principal 3328284017</div>
                    <div className="text-xs text-slate-300">
                      Marca: Xiaomi Redmi Note 11<br />
                      SO: Android 13<br />
                      MAC: A4:C3:F0:12:34:56<br />
                      Última conexión: Hace 2 horas<br />
                      AP: Plaza_Armas_WiFi
                    </div>
                    <div className="font-semibold pt-2">Detecciones Sin Conexión (Proximidad AP)</div>
                    <ul className="text-xs text-slate-300 list-disc pl-5">
                      <li>Detectado cerca de AP_Gobierno_JAL - Sin conexión (3 veces esta semana)</li>
                      <li>Proximidad a RedSegura_C5 - Sin autenticación (Diario 07:15)</li>
                      <li>Señal detectada en Zona_Restringida_01 - Acceso denegado</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <div className="font-semibold">MACs Relacionadas (Misma Zona/Horario)</div>
                    <div className="text-xs text-slate-300">Dispositivos Frecuentes</div>
                    <ul className="text-xs text-slate-300 list-disc pl-5">
                      <li>F4:E5:D6:78:90:AB (85% coincidencia)</li>
                      <li>C8:D9:E0:12:34:CD (72% coincidencia)</li>
                      <li>A1:B2:C3:45:67:EF (68% coincidencia)</li>
                    </ul>
                  </div>
                </div>
              </SectionCard>
            )}

            {activeTab === "analisis" && (
              <SectionCard title="Análisis IA">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {[
                    ["Probabilidad de Reincidencia", "23%"],
                    ["Índice de Peligrosidad", "MEDIO"],
                    ["Patrón de Movimiento", "REGULAR"],
                    ["Riesgo Suicidio", "BAJO"],
                    ["Radicalización", "35%"],
                    ["Predicción 48h", "ESTABLE"],
                  ].map(([h, v]) => (
                    <div
                      key={h}
                      className="rounded-lg p-3"
                      style={{
                        background: "rgba(12,18,27,0.6)",
                        border: "1px solid rgba(108,252,79,0.18)",
                        boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.06)",
                      }}
                    >
                      <div className="text-xs text-slate-300">{h}</div>
                      <div className="text-white font-semibold text-lg">{v}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {activeTab === "interinstitucional" && (
              <SectionCard title="Interinstitucional">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  {[
                    ["🏛️ Fiscalía de Jalisco", "Sin carpetas activas", "Última consulta: 15/09/2025"],
                    ["🛡️ C5 Escudo Urbano", "Monitoreo Activo", "15 detecciones esta semana"],
                    ["🏥 Secretaría de Salud", "Sin alertas médicas", "Historial: Normal"],
                    ["🔬 Ciencias Forenses", "Sin registros", "N/A"],
                    ["⚖️ INJALRESO", "Sin antecedentes", "Estado: Limpio"],
                    ["🔍 Comisión de Búsqueda", "No relacionado", "Sin coincidencias"],
                  ].map(([title, desc, meta]) => (
                    <div key={title} className="space-y-1">
                      <div className="font-semibold">{title}</div>
                      <div className="text-xs text-slate-300">{desc}</div>
                      <div className="text-[11px] text-slate-400">{meta}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* ===== CONTENIDOS ORIGINALES ===== */}
            {activeTab === "detalles" && (
              <div
                className="rounded-xl p-4 shadow-xl"
                style={{
                  background: "rgba(10,13,22,0.78)",
                  border: "1px solid rgba(108,252,79,0.18)",
                  boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
                }}
              >
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="grid sm:grid-cols-2 gap-2">
                      <InfoRow label="Nombre" value={selectedUser?.name} />
                      <InfoRow label="Email" value={selectedUser?.email} />
                      <InfoRow label="Teléfono" value={selectedUser?.phone} />
                      <InfoRow label="User agent" value={selectedUser?.user_agent} />
                      <InfoRow label="Instagram" value={selectedUser?.instagram} />
                      <InfoRow label="Facebook" value={selectedUser?.facebook} />
                      <InfoRow label="Twitter" value={selectedUser?.twitter} />
                      <InfoRow label="Género" value={selectedUser?.gender} />
                      <InfoRow label="Edad" value={selectedUser?.age} />
                      <InfoRow label="Municipio" value={selectedUser?.municipality} />
                      <InfoRow label="Lenguaje" value={selectedUser?.language} />
                      <InfoRow label="Nivel académico" value={selectedUser?.academic_level} />
                      <InfoRow label="Nivel de riesgo" value={selectedUser?.risk_level} risk />
                      <InfoRow label="Nivel socioeconómico" value={selectedUser?.socioeconomic_level} />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <StatCard title="Primera conexión" value={formatDate(firstAndLastSeen?.first_seen)} />
                    <StatCard title="Última conexión" value={formatDate(firstAndLastSeen?.last_seen)} />
                    <StatCard title="Número de conexiones" value={connectionsCount} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "documentos" && (
              <div
                className="rounded-xl shadow-xl overflow-hidden"
                style={{
                  background: "rgba(10,13,22,0.78)",
                  border: "1px solid rgba(108,252,79,0.18)",
                  boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
                }}
              >
                <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(108,252,79,0.16)" }}>
                  <h3 className="text-sm font-semibold text-white">Documentos del usuario</h3>
                  <p className="text-xs text-slate-400 mt-1">Estado de verificación de identidad</p>
                </div>
                <div className="p-4">
                  <ul className="divide-y" style={{ borderColor: "rgba(108,252,79,0.12)" }}>
                    {documents.map((doc) => (
                      <li key={doc.name} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span
                            className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{
                              background: "rgba(108,252,79,0.15)",
                              color: "#eaffea",
                              border: "1px solid rgba(108,252,79,0.35)",
                              boxShadow: "0 0 8px rgba(108,252,79,0.25)",
                            }}
                          >
                            {doc.name.slice(0, 1).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm text-white">{doc.name}</p>
                            <p className="text-[11px] text-slate-400">{doc.meta ?? "Documento oficial"}</p>
                          </div>
                        </div>
                        <StatusBadge status={doc.status} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ===== FIN TABS ===== */}

        {/* Filtros Día / Hora */}
        <div
          className="rounded-xl p-4 shadow-xl"
          style={{
            background: "rgba(10,13,22,0.78)",
            border: "1px solid rgba(108,252,79,0.18)",
            boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
          }}
        >
          <h3 className="text-sm font-semibold text-white mb-3">Filtros</h3>
          <div className="grid sm:grid-cols-4 gap-3">
            {/* Día */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-300">Día</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{
                  background: "rgba(9,12,20,0.85)",
                  color: "#E5F2E8",
                  border: "1px solid rgba(108,252,79,0.22)",
                  boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.08)",
                }}
              />
            </div>

            {/* Modo hora */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-300">Modo de hora</label>
              <select
                value={filters.hourMode}
                onChange={(e) => setFilters((f) => ({ ...f, hourMode: e.target.value }))}
                className="w-full rounded-md px-3 py-2 text-sm outline-none"
                style={{
                  background: "rgba(9,12,20,0.85)",
                  color: "#E5F2E8",
                  border: "1px solid rgba(108,252,79,0.22)",
                  boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.08)",
                }}
              >
                <option value="all">Todas</option>
                <option value="single">Hora específica</option>
                <option value="range">Rango</option>
              </select>
            </div>

            {/* Hora única */}
            {filters.hourMode === "single" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-slate-300">Hora</label>
                <select
                  value={filters.hour}
                  onChange={(e) => setFilters((f) => ({ ...f, hour: e.target.value }))}
                  className="w-full rounded-md px-3 py-2 text-sm outline-none"
                  style={{
                    background: "rgba(9,12,20,0.85)",
                    color: "#E5F2E8",
                    border: "1px solid rgba(108,252,79,0.22)",
                    boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.08)",
                  }}
                >
                  <option value="">—</option>
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, "0")}:00
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Rango horas */}
            {filters.hourMode === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-300">Desde</label>
                  <select
                    value={filters.hourStart}
                    onChange={(e) => setFilters((f) => ({ ...f, hourStart: e.target.value }))}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{
                      background: "rgba(9,12,20,0.85)",
                      color: "#E5F2E8",
                      border: "1px solid rgba(108,252,79,0.22)",
                      boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.08)",
                    }}
                  >
                    <option value="">—</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-slate-300">Hasta</label>
                  <select
                    value={filters.hourEnd}
                    onChange={(e) => setFilters((f) => ({ ...f, hourEnd: e.target.value }))}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{
                      background: "rgba(9,12,20,0.85)",
                      color: "#E5F2E8",
                      border: "1px solid rgba(108,252,79,0.22)",
                      boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.08)",
                    }}
                  >
                    <option value="">—</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>
                        {String(h).padStart(2, "0")}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap */}
        <div
          className="rounded-xl shadow-xl"
          style={{
            background: "rgba(10,13,22,0.78)",
            border: "1px solid rgba(108,252,79,0.18)",
            boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
          }}
        >
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(108,252,79,0.16)" }}>
            <h2 className="text-base font-semibold text-white">Mapa de calor de ubicación del usuario</h2>
            <p className="text-xs text-slate-400 mt-1">
              Distribución geográfica de conexiones{filters.date ? ` — ${filters.date}` : ""}
            </p>
          </div>
          <div className="p-4">
            <div
              className="rounded-lg overflow-hidden"
              style={{ border: "1px solid rgba(108,252,79,0.16)", boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.06)" }}
            >
              <Heatmap points={mapData} heightClass="h-[35vh]" />
            </div>
          </div>
        </div>

        {/* Data Table and Chart */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Recent Visits */}
          <div
            className="rounded-xl shadow-xl flex flex-col"
            style={{
              background: "rgba(10,13,22,0.78)",
              border: "1px solid rgba(108,252,79,0.18)",
              boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
            }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(108,252,79,0.16)" }}>
              <h3 className="text-sm font-semibold text-white">Visitas recientes</h3>
              <p className="text-xs text-slate-400 mt-1">
                Últimos 10 registros de conexión {renderFilterBadge(filters)}
              </p>
            </div>
            <div className="flex-1">
              <DataTable2
                columns={[
                  { key: "fecha", header: "Fecha", render: (v) => formatDate(v) },
                  { key: "campaña", header: "Campaña" },
                  { key: "estacion", header: "Estación" },
                  { key: "router_mac", header: "Router" },
                ]}
                rows={filteredVisits}
              />
            </div>
          </div>

          {/* Connections Chart */}
          <div
            className="rounded-xl shadow-xl"
            style={{
              background: "rgba(10,13,22,0.78)",
              border: "1px solid rgba(108,252,79,0.18)",
              boxShadow: "0 6px 24px rgba(0,0,0,.45), inset 0 0 0 1px rgba(108,252,79,.08)",
            }}
          >
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(108,252,79,0.16)" }}>
              <h3 className="text-sm font-semibold text-white">Conexiones por horas</h3>
              <p className="text-xs text-slate-400 mt-1">
                Actividad de conexión por hora {filters.date ? `(${filters.date})` : ""}
              </p>
            </div>
            <div className="p-4">
              <div className="h-[250px] w-full">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false }, tooltip: { titleColor: "#e5f2e8", bodyColor: "#e5f2e8" } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: "rgba(108,252,79,0.12)" },
                        ticks: { font: { size: 10 }, color: "#B7C6BE" },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, color: "#B7C6BE" },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
