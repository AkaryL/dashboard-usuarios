import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { StatCard } from "../../components/StatCard";
import Heatmap from "../../components/Heatmap";
import { DataContext } from "../../context/DataContext";
// import { Bar } from "react-chartjs-2";
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
// ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function UserDetail() {
  const { mac } = useParams();
  const { users, fetchHeatPoint, heatPoint, connectionsCount } = useContext(DataContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    setSelectedUser(users.find((u) => u.mac === mac));
    fetchHeatPoint(mac);
  }, [users, mac]);

  useEffect(() => {
    // Formato que espera tu <Heatmap />: [lat, lng, intensity]
    const points = (heatPoint || []).map((item) => [
      item.latitud,
      item.longitud,
      Number(item.count || 0),
    ]);
    setMapData(points);
  }, [heatPoint]);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="text-sm text-gray-500 mb-2">MAC: {mac}</div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="grid sm:grid-cols-2 gap-3">
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
            {/* ✅ Aquí mostramos la suma de count */}
            <StatCard title="Número de conexiones" value={connectionsCount} />
          </div>
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">Mapa de calor del usuario</div>
        <Heatmap points={mapData} heightClass="h-[60vh]" />
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-40 text-xs text-gray-500">{label}</div>
      <div className="text-sm">{value ?? "—"}</div>
    </div>
  );
}
function formatDate(v) {
  if (!v) return "—";
  const d = new Date(v);
  return d.toLocaleString();
}
