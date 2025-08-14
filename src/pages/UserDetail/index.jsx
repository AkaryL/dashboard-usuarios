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
  const [selectedUser, setSelectedUser] = useState(null);
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    setSelectedUser(users.find((u) => u.mac === mac));
    fetchHeatPoint(mac);
    fetchLastVisits(mac);
    fetchConnectionsByHour(mac);
  }, [users, mac]);

  useEffect(() => {
    // Formato que espera tu <Heatmap />: [lat, lng, intensity]
    const points = (userHeatPoint || []).map((item) => [
      item.latitud,
      item.longitud,
      Number(item.count || 0),
    ]);
    setMapData(points);
  }, [userHeatPoint]);

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

        {/* Heatmap */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200/80">
          <div className="px-4 py-3 border-b border-gray-100">
            <h2 className="text-base font-medium text-gray-900">User Location Heatmap</h2>
            <p className="text-xs text-gray-600 mt-1">Geographic distribution of connections</p>
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
              <p className="text-xs text-gray-600 mt-1">Last 10 connection records</p>
            </div>
            <div className="flex-1">
              <DataTable2
                columns={[
                  { key: "fecha", header: "Fecha", render: (v) => formatDate(v) },
                  { key: "campaña", header: "Campaña" },
                  { key: "estacion", header: "Estación" },
                  { key: "router_mac", header: "Router" },
                ]}
                rows={lastVisits}
              />
            </div>
          </div>

          {/* Connections Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/80">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-medium text-gray-900">Hourly Connections</h3>
              <p className="text-xs text-gray-600 mt-1">Connection activity by hour</p>
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
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          font: {
                            size: 10
                          },
                          color: '#6B7280'
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        },
                        ticks: {
                          font: {
                            size: 10
                          },
                          color: '#6B7280'
                        }
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