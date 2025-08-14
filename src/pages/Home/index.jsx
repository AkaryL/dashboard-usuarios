import React, { useContext, useEffect, useState } from "react";
import { DataContext } from "../../context/DataContext";
import DataTable from "../../components/DataTable";
import { TopList } from "../../components/TopList";
import Heatmap from "../../components/Heatmap";

export default function Home() {
  const { visits, topUsers, topRouters, generalHeatPoints } = useContext(DataContext);
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    // Formato que espera tu <Heatmap />: [lat, lng, intensity]
    const points = (generalHeatPoints.filter(item => item.latitud && item.longitud)).map((item) => [
      item.latitud,
      item.longitud,
      Number(item.count || 0),
    ]);
    console.log(points);
    setMapData(points);
  }, [generalHeatPoints]);

  // useEffect(() => {
  //   Promise.all([
  //     getLastVisits().then(r => r.data),
  //     getTopUsers().then(r => r.data),
  //     getTopRouters().then(r => r.data),
  //     getHeatmapAll().then(r => r.data),
  //   ]).then(([v, tu, tr, hm]) => {
  //     setLastVisits(v);
  //     setTopUsers(tu);
  //     setTopRouters(tr);
  //     setHeatPoints(hm);
  //   }).catch(console.error);
  // }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <DataTable
          columns={[
            { key: "fecha", header: "Fecha" },
            { key: "campaña", header: "Campaña vista" },
            { key: "mac", header: "MAC" },
            { key: "estacion", header: "Router" },
          ]}
          rows={visits}
        />
        <div className="grid grid-rows-2 gap-4">
          <TopList 
            title="Top 10 usuarios con más conexiones"
            items={topUsers}
            leftKey="mac"
            rightKey="count" />
          <TopList 
            title="Top 10 puntos con más conexiones"
            items={topRouters}
            leftKey="estacion"
            rightKey="count"
          />
        </div>
      </div>

      <div>
        <div className="mb-2 font-medium" onClick={() => console.log(generalHeatPoints)}>Mapa de calor (todas las conexiones)</div>
        <Heatmap points={mapData} heightClass="h-[60vh]" />
      </div>
    </div>
  );
}
