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

// Utilidad: obtener la “mac” sin importar cómo venga del backend
function getUserMac(u = {}) {
  return u?.mac || u?.mac_address || u?.fingerprint || "";
}

// Helpers UI
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <div className="w-32 text-xs text-gray-600 dark:text-green-300 font-medium flex-shrink-0">{label}</div>
      <div className="text-xs text-gray-900 dark:text-white">{value ?? "—"}</div>
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
    verificado: "bg-green-100 text-green-700 border-green-200",
    pendiente: "bg-amber-100 text-amber-700 border-amber-200",
    rechazado: "bg-red-100 text-red-700 border-red-200",
  };
  const cls = map[status] || map.verificado;
  const label =
    status === "verificado" ? "Verificado" : status === "pendiente" ? "Pendiente" : "Rechazado";
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${cls}`}>
      <span className="text-[12px] leading-none">✓</span>{label}
    </span>
  );
}

export default function UserDetail() {
  const { mac } = useParams();
  const macParam = decodeURIComponent(mac || ""); // corrige %3A
  const [ riskLevel, setRiskLevel ] = useState("Bajo");

  const {
    users,
    setUsers,                 // cachearemos el usuario buscado
    fetchHeatPoint,
    userHeatPoint,
    connectionsCount,
    fetchLastVisits,
    lastVisits,
    fetchConnectionsByHour,
    connectionsByHour,
  } = useContext(DataContext);

  // -----------------------
  // Tabs (Detalles / Documentos)
  // -----------------------
  const [activeTab, setActiveTab] = useState("detalles"); // 'detalles' | 'documentos'

  // -----------------------
  // Filtros (día y hora)
  // -----------------------
  const [filters, setFilters] = useState({
    date: "",           // YYYY-MM-DD
    hourMode: "all",    // 'all' | 'single' | 'range'
    hour: "",           // 0..23  (para 'single')
    hourStart: "",      // 0..23  (para 'range')
    hourEnd: "",        // 0..23  (para 'range')
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [mapData, setMapData] = useState([]);

  // Cargar usuario (cache -> /search fallback) y data derivada
  useEffect(() => {
    if (!macParam) return;

    // 1) intenta encontrarlo en el cache `users`
    const cached = users.find(u => getUserMac(u) === macParam) || null;
    if (cached) {
      setSelectedUser(cached);
    } else {
      // 2) no está: búscalo en el backend usando tu helper searchUsers
      (async () => {
        let arr = await searchUsers({ mac: macParam });
        if (!arr?.length) arr = await searchUsers({ mac_address: macParam });
        if (!arr?.length) arr = await searchUsers({ fingerprint: macParam });
        const u = arr?.[0] || null;
        if (u) {
          setSelectedUser(u);
          // cachea para futuras visitas
          setUsers(prev => {
            const exists = prev.some(x => getUserMac(x) === getUserMac(u));
            return exists ? prev.map(x => (getUserMac(x) === getUserMac(u) ? { ...x, ...u } : x)) : [...prev, u];
          });
        }
      })();
    }

    // Carga derivada del usuario (estas ya funcionaban con la MAC de la URL)
    fetchHeatPoint(macParam);
    fetchLastVisits(macParam);
    // si tu backend no acepta el 2° arg, simplemente lo ignorará
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
    } else if (
      filters.hourMode === "range" &&
      filters.hourStart !== "" &&
      filters.hourEnd !== ""
    ) {
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

  // Heatmap: restringir a routers de las visitas filtradas si hay filtros
  const filteredHeatRouters = useMemo(() => {
    const noDay = !filters.date;
    const noHour =
      filters.hourMode === "all" ||
      (filters.hourMode === "single" && filters.hour === "") ||
      (filters.hourMode === "range" && (filters.hourStart === "" || filters.hourEnd === ""));
    if (noDay && noHour) return null;
    const s = new Set(
      filteredVisits
        .map((r) => r?.router_mac)
        .filter((v) => typeof v === "string" && v.trim() !== "")
    );
    return s;
  }, [filteredVisits, filters]);

  const markRiskLevel = async (level, mac) => {
    try {
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/v2/usuarios/markRisk/${mac}`, { risk: level });
      if (response.status === 200) {
        setSelectedUser(prev => ({ ...prev, risk_level: level }));
        // Actualiza también en el cache global
        setUsers(prev => prev.map(u => (getUserMac(u) === getUserMac(selectedUser) ? { ...u, risk_level: level } : u)));
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
      .map((item) => [
        item.latitud,
        item.longitud,
        Number(item.count || 0),
      ]);
    setMapData(points);
  }, [userHeatPoint, filteredHeatRouters]);

  // Chart data
  const chartData = useMemo(() => {
    const labels = (connectionsByHour || []).map((c) => `${c.hora}:00`);
    const data = (connectionsByHour || []).map((c) => Number(c.total_conexiones || 0));
    return {
      labels,
      datasets: [
        {
          label: "Conexiones",
          data,
          backgroundColor: "rgba(30,64,175,0.6)",
        },
      ],
    };
  }, [connectionsByHour]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, h) => h), []);

  // Documentos: actualizado con tus cambios
  const documents = useMemo(() => ([
    { name: "INE / ID oficial", status: "verificado" },
    { name: "Comprobante de domicilio", status: "pendiente" },                   // <- Pendiente
    { name: "Acta de nacimiento", status: "verificado" },
    { name: "Antecedentes", status: "verificado", meta: "2 registros" },         // <- 2 registros
    { name: "Fotografías", status: "verificado", meta: "12 imágenes" },          // <- 12 imágenes
    { name: "Videos", status: "verificado", meta: "3 grabaciones" },             // <- 3 grabaciones
  ]), [selectedUser]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

        {/* ===== TABS (aquí, arriba del User Info Card) ===== */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80">
          <div className="flex items-center gap-2 px-2 pt-2">
            {[
              { id: "detalles", label: "Detalles" },
              { id: "documentos", label: "Documentos" },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`relative px-4 py-2 text-xs font-medium rounded-t-lg transition
                ${activeTab === t.id
                    ? "bg-white dark:bg-gray-800 text-blue-800 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                {t.label}
                {activeTab === t.id && (
                  <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-blue-800 dark:bg-blue-400" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {/* ===== CONTENIDO: DETALLES ===== */}
            {activeTab === "detalles" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-4">
                <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mb-3 flex justify-between">
                  <div className="text-green-400">MAC: {getUserMac(selectedUser) || macParam}</div>
                  <div className="flex gap-2 sm:gap-4 flex-wrap">
                    <button className="px-3 py-2 bg-green-800/20 border-green-800 border text-white text-xs rounded hover:bg-blue-700" onClick={() => window.print()}>
                      Generar Reporte
                    </button>
                    <label htmlFor="risk" className="text-xs text-gray-600 dark:text-gray-300 self-center">Nivel de riesgo:</label>
                    <select
                      id="risk"
                      value={riskLevel}
                      onChange={(e) => setRiskLevel(e.target.value)}
                      className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white text-xs rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Bajo">Bajo</option>
                      <option value="Medio">Medio</option>
                      <option value="Alto">Alto</option>
                    </select>
                    <button
                      className="px-3 py-2 bg-red-700/30 border-red-700 border text-white text-xs rounded hover:bg-red-800"
                      onClick={() => selectedUser && markRiskLevel(riskLevel, getUserMac(selectedUser))}
                    >
                      Marcar como riesgo
                    </button>
                  </div>
                </div>
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
                      <InfoRow label="Nivel de riesgo" value={selectedUser?.risk_level} />
                      <InfoRow label="Nivel socioeconómico" value={selectedUser?.socioeconomic_level} />
                    </div>
                  </div>
                  <div className="grid gap-3">
                    <StatCard title="Primera conexión" value={formatDate(selectedUser?.createdat)} />
                    <StatCard title="Última conexión" value={formatDate(selectedUser?.updatedat)} />
                    <StatCard title="Número de conexiones" value={connectionsCount} />
                  </div>
                </div>
              </div>
            )}

            {/* ===== CONTENIDO: DOCUMENTOS ===== */}
            {activeTab === "documentos" && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">Documentos del usuario</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">Estado de verificación de identidad</p>
                </div>
                <div className="p-4">
                  <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                    {documents.map((doc) => (
                      <li key={doc.name} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="h-7 w-7 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 text-xs font-bold">
                            {doc.name.slice(0,1).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm text-gray-900 dark:text-white">{doc.name}</p>
                            <p className="text-[11px] text-gray-500 dark:text-gray-400">
                              {doc.meta ?? "Documento oficial"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={doc.status} />
                          {/* Botón "Ver" listo para conectar a doc.url si lo tienes
                          <button
                            className="text-xs px-3 py-1.5 rounded border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                            onClick={() => doc.url ? window.open(doc.url, "_blank") : alert(`Abrir ${doc.name}`)}
                          >
                            Ver
                          </button>
                          */}
                        </div>
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Filtros</h3>
          <div className="grid sm:grid-cols-4 gap-3">
            {/* Día */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-300">Día</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            {/* Modo hora */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600 dark:text-gray-300">Modo de hora</label>
              <select
                value={filters.hourMode}
                onChange={(e) => setFilters((f) => ({ ...f, hourMode: e.target.value }))}
                className="w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">Todas</option>
                <option value="single">Hora específica</option>
                <option value="range">Rango</option>
              </select>
            </div>

            {/* Hora única */}
            {filters.hourMode === "single" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600 dark:text-gray-300">Hora</label>
                <select
                  value={filters.hour}
                  onChange={(e) => setFilters((f) => ({ ...f, hour: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">—</option>
                  {hours.map((h) => (
                    <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                  ))}
                </select>
              </div>
            )}

            {/* Rango horas */}
            {filters.hourMode === "range" && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600 dark:text-gray-300">Desde</label>
                  <select
                    value={filters.hourStart}
                    onChange={(e) => setFilters((f) => ({ ...f, hourStart: e.target.value }))}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">—</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600 dark:text-gray-300">Hasta</label>
                  <select
                    value={filters.hourEnd}
                    onChange={(e) => setFilters((f) => ({ ...f, hourEnd: e.target.value }))}
                    className="w-full rounded-md border border-gray-200 dark:border-gray-600 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">—</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-base font-medium text-gray-900 dark:text-white">Mapa de calor de ubicación del usuario</h2>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
              Distribución geográfica de conexiones{filters.date ? ` — ${filters.date}` : ""}
            </p>
          </div>
          <div className="p-4">
            <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <Heatmap points={mapData} heightClass="h-[35vh]" />
            </div>
          </div>
        </div>

        {/* Data Table and Chart */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Recent Visits */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                Visitas recientes
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Conexiones por horas</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
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
                    plugins: { legend: { display: false } },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: "rgba(0, 0, 0, 0.05)" },
                        ticks: { font: { size: 10 }, color: "#6B7280" }
                      },
                      x: {
                        grid: { display: false },
                        ticks: { font: { size: 10 }, color: "#6B7280" }
                      }
                    }
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
