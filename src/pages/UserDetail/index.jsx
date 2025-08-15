import { useEffect, useState, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import { StatCard } from "../../components/StatCard";
import Heatmap from "../../components/Heatmap";
import { DataContext } from "../../context/DataContext";
import DataTable2 from "../../components/DataTable2";
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

export default function UserDetail() {
  const { mac } = useParams();
  const {
    users,
    fetchHeatPoint,
    userHeatPoint,
    connectionsCount,
    fetchLastVisits,
    lastVisits,
    fetchConnectionsByHour,
    connectionsByHour,
  } = useContext(DataContext);

  // -----------------------
  // NUEVO: Filtros (día y hora)
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

  // Cargar datos base (como antes)
  useEffect(() => {
    setSelectedUser(users.find((u) => u.mac === mac));
    fetchHeatPoint(mac);
    fetchLastVisits(mac);
    // Llamo con "date" por si tu DataContext ya lo soporta; si lo ignora, no pasa nada.
    fetchConnectionsByHour(mac, { date: filters.date });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, mac]);

  // Reconsultar horas cuando cambie el día (sin romper si se ignora el segundo parámetro)
  useEffect(() => {
    if (!mac) return;
    fetchConnectionsByHour(mac, { date: filters.date });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.date, mac]);

  // Helpers de fecha/hora
  function ymd(dateObj) {
    // YYYY-MM-DD del Date
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function passesDateHourFilter(fechaStr) {
    // fechaStr viene de lastVisits.fecha
    if (!fechaStr) return false;
    const d = new Date(fechaStr);
    if (Number.isNaN(d.getTime())) return false;

    // Filtro por día
    if (filters.date) {
      const rowYmd = ymd(d);
      if (rowYmd !== filters.date) return false;
    }

    // Filtro por hora
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

  // Filtrado de visitas para tabla (en cliente, SIN tocar APIs)
  const filteredVisits = useMemo(() => {
    if (!Array.isArray(lastVisits)) return [];
    // Si NO hay ningún filtro activo, regreso tal cual
    const noDay = !filters.date;
    const noHour =
      filters.hourMode === "all" ||
      (filters.hourMode === "single" && filters.hour === "") ||
      (filters.hourMode === "range" && (filters.hourStart === "" || filters.hourEnd === ""));

    if (noDay && noHour) return lastVisits;

    return lastVisits.filter((row) => passesDateHourFilter(row?.fecha));
  }, [lastVisits, filters]);

  // Para el heatmap: si hay filtro activo, mostramos solo puntos cuyos routers
  // aparezcan en las visitas filtradas. Si no hay filtros, mostramos todo igual que antes.
  const filteredHeatRouters = useMemo(() => {
    const noDay = !filters.date;
    const noHour =
      filters.hourMode === "all" ||
      (filters.hourMode === "single" && filters.hour === "") ||
      (filters.hourMode === "range" && (filters.hourStart === "" || filters.hourEnd === ""));

    if (noDay && noHour) return null; // sin filtro -> no restringir
    const s = new Set(
      filteredVisits
        .map((r) => r?.router_mac)
        .filter((v) => typeof v === "string" && v.trim() !== "")
    );
    return s;
  }, [filteredVisits, filters]);

  useEffect(() => {
    // Formato que espera <Heatmap />: [lat, lng, intensity]
    // Si hay routers filtrados, solo incluimos esos; si no, incluimos todos
    const points = (userHeatPoint || [])
      .filter((item) => {
        if (!filteredHeatRouters) return true; // sin filtro -> todos
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

  // Chart data igual que antes (se actualizará si connectionsByHour cambia al cambiar el día)
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">

        {/* User Info Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4">
          <div className="text-xs text-gray-600 font-medium mb-3">MAC: {mac}</div>
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

        {/* NUEVO: Filtros Día / Hora (solo en UserDetail) */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Filtros</h3>
          <div className="grid sm:grid-cols-4 gap-3">
            {/* Día */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Día</label>
              <input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Modo hora */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-600">Modo de hora</label>
              <select
                value={filters.hourMode}
                onChange={(e) => setFilters((f) => ({ ...f, hourMode: e.target.value }))}
                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todas</option>
                <option value="single">Hora específica</option>
                <option value="range">Rango</option>
              </select>
            </div>

            {/* Hora única */}
            {filters.hourMode === "single" && (
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Hora</label>
                <select
                  value={filters.hour}
                  onChange={(e) => setFilters((f) => ({ ...f, hour: e.target.value }))}
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="text-xs text-gray-600">Desde</label>
                  <select
                    value={filters.hourStart}
                    onChange={(e) => setFilters((f) => ({ ...f, hourStart: e.target.value }))}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">—</option>
                    {hours.map((h) => (
                      <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-600">Hasta</label>
                  <select
                    value={filters.hourEnd}
                    onChange={(e) => setFilters((f) => ({ ...f, hourEnd: e.target.value }))}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
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
          {/* Tips pequeños */}
          {/* <p className="mt-2 text-[11px] text-gray-500">
            La tabla se filtra en cliente por día/hora. El heatmap se restringe a routers vistos en ese período. 
            El gráfico por hora vuelve a consultar si cambias el día (si tu backend acepta <code>?date=</code>).
          </p> */}
        </div>

        {/* Heatmap */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200/80">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-medium text-gray-900">User Location Heatmap</h2>
            <p className="text-xs text-gray-600 mt-1">
              Geographic distribution of connections{filters.date ? ` — ${filters.date}` : ""}
            </p>
          </div>
          <div className="p-4">
            <div className="rounded-lg overflow-hidden border border-gray-200">
              <Heatmap points={mapData} heightClass="h-[35vh]" />
            </div>
          </div>
        </div>

        {/* Data Table and Chart */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Recent Visits */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Recent Visits</h3>
              <p className="text-xs text-gray-600 mt-1">
                Last 10 connection records {renderFilterBadge(filters)}
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/80">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Hourly Connections</h3>
              <p className="text-xs text-gray-600 mt-1">
                Connection activity by hour {filters.date ? `(${filters.date})` : ""}
              </p>
            </div>
            <div className="p-4">
              <div className="h-[250px] w-full">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
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

// -----------------------
// Helpers UI
// -----------------------
function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2 py-1">
      <div className="w-32 text-xs text-gray-600 font-medium flex-shrink-0">{label}</div>
      <div className="text-xs text-gray-900">{value ?? "—"}</div>
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
