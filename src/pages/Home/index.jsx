import { useEffect, useState } from "react";
import DataTable from "../../components/DataTable";
import { TopList } from "../../components/TopList";
import Heatmap from "../../components/Heatmap";
import { getLastVisits, getTopUsers, getTopRouters, getHeatmapAll } from "../../lib/api";

export default function Home() {
  const [lastVisits, setLastVisits] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topRouters, setTopRouters] = useState([]);
  const [heatPoints, setHeatPoints] = useState([]);

  useEffect(() => {
    Promise.all([
      getLastVisits().then(r => r.data),
      getTopUsers().then(r => r.data),
      getTopRouters().then(r => r.data),
      getHeatmapAll().then(r => r.data),
    ]).then(([v, tu, tr, hm]) => {
      setLastVisits(v);
      setTopUsers(tu);
      setTopRouters(tr);
      setHeatPoints(hm);
    }).catch(console.error);
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <DataTable
          columns={[
            { key: "ts", header: "Fecha" },
            { key: "campaign", header: "Campaña vista" },
            { key: "mac", header: "MAC" },
            { key: "router", header: "Router" },
          ]}
          rows={Array.isArray(lastVisits) ? lastVisits : []}
        />
        <div className="grid grid-rows-2 gap-4">
          <TopList title="Top 10 usuarios con más conexiones"
         items={Array.isArray(topUsers) ? topUsers : []}
         leftKey="mac"
         rightKey="count" />
          <TopList title="Top 10 puntos con más conexiones"
                   items={Array.isArray(topRouters) ? topRouters : []} leftKey="router" rightKey="count" />
        </div>
      </div>

      <div>
        <div className="mb-2 font-medium">Mapa de calor (todas las conexiones)</div>
        <Heatmap points={Array.isArray(heatPoints) ? heatPoints : []} heightClass="h-[60vh]" />
      </div>
    </div>
  );
}
