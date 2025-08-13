import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { StatCard } from "../../components/StatCard";
import Heatmap from "../../components/Heatmap";
import { DataContext } from "../../context/DataContext";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { getUserOverview, getUserTopRouters, getUserByHour, getHeatmapUser } from "../../lib/api";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function UserDetail() {
  const { mac } = useParams();
  const [ov, setOv] = useState(null);
  const [topRouters, setTopRouters] = useState([]);
  const { users, fetchHeatPoint, heatPoint } = useContext(DataContext);
  const [selectedUser, setSelectedUser] = useState(null);
  const [byHour, setByHour] = useState([]);
  const [heatPoints, setHeatPoints] = useState([]);
  const [mapData, setMapData] = useState([]);


  useEffect(() => {
    setSelectedUser(users.find(u => u.mac === mac));
    fetchHeatPoint(mac);
  }, [users, mac]);

  useEffect(() => {
    setMapData(heatPoint.map(item => [
    item.latitud,
    item.longitud,
    Number(item.count) // Aseguramos que sea número
    ]));
  }, [heatPoint]);

  useEffect(() => {
    Promise.all([
      getUserOverview(mac).then(r=>r.data),
      getUserTopRouters(mac).then(r=>r.data),
      getUserByHour(mac).then(r=>r.data),
      getHeatmapUser(mac).then(r=>r.data),
    ]).then(([o, tr, h, hm]) => {
      setOv(o); setTopRouters(tr); setByHour(h); setHeatPoints(hm);
    }).catch(console.error);
  }, [mac]);

  // const chartData = {
  //   labels: Array.from({length:24}, (_,i)=>i.toString().padStart(2,"0")+":00"),
  //   datasets: [{
  //     label: "Conexiones",
  //     data: Array.from({length:24}, (_,i)=> byHour.find(x=>x.hour===i)?.count || 0),
  //   }]
  // };

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="bg-white rounded-xl shadow p-4">
        <div className="text-sm text-gray-500 mb-2">MAC: {mac}</div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <div className="grid sm:grid-cols-2 gap-3">
              <InfoRow label="Nombre" value={selectedUser?.name}/>
              <InfoRow label="Email" value={selectedUser?.email}/>
              <InfoRow label="Teléfono" value={selectedUser?.phone}/>
              <InfoRow label="User agent" value={selectedUser?.user_agent}/>
              <InfoRow label="Instagram" value={selectedUser?.instagram}/>
              <InfoRow label="Facebook" value={selectedUser?.facebook}/>
              <InfoRow label="Twitter" value={selectedUser?.twitter}/>
              <InfoRow label="Género" value={selectedUser?.gender}/>
              <InfoRow label="Edad" value={selectedUser?.age}/>
              <InfoRow label="Municipio" value={selectedUser?.municipality}/>
              <InfoRow label="Lenguaje" value={selectedUser?.language}/>
              <InfoRow label="Nivel académico" value={selectedUser?.academic_level}/>
              <InfoRow label="Nivel socioeconómico" value={selectedUser?.socioeconomic_level}/>
            </div>
          </div>
          <div className="grid gap-3">
            <StatCard title="Primera conexión" value={formatDate(selectedUser?.createdat)} />
            <StatCard title="Última conexión" value={formatDate(selectedUser?.updatedat)} />
            <StatCard title="Número de conexiones" value={selectedUser?.connections_count} />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-medium mb-2">Top 5 puntos más visitados</div>
          <ul className="divide-y text-sm">
            {/* {topRouters?.map((r,i)=>(
              <li key={i} className="py-2 flex justify-between">
                <span className="truncate">{r.router}</span>
                <span className="font-semibold">{r.count}</span>
              </li>
            ))} */}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <div className="font-medium mb-2">Conexiones por horario</div>
          {/* <Bar data={chartData} options={{ responsive:true, plugins:{ legend:{display:false} }, scales:{ y:{ beginAtZero:true }}}} /> */}
        </div>
      </div>

      <div>
        <div onClick={() => console.log(heatPoint)} className="font-medium mb-2">Mapa de calor del usuario</div>
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
function formatDate(v){ if(!v) return "—"; const d = new Date(v); return d.toLocaleString(); }
