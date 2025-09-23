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
    // console.log(points);
    setMapData(points);
  }, [generalHeatPoints]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200/80 dark:border-gray-700/80">
            <div className="text-3xl font-light text-gray-900 dark:text-white mb-2">{visits?.length || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Total de Visitas</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200/80 dark:border-gray-700/80">
            <div className="text-3xl font-light text-gray-900 dark:text-white mb-2">{topUsers?.length || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Usuarios Únicos</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200/80 dark:border-gray-700/80">
            <div className="text-3xl font-light text-gray-900 dark:text-white mb-2">{topRouters?.length || 0}</div>
            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">Puntos Activos</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8 mb-12">
          {/* Data Table */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80 flex flex-col">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Actividad Reciente</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Últimos registros de conexión</p>
            </div>
            <div className="flex-1 p-0">
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

          {/* Side Panel */}
          <div className="flex flex-col gap-5">
            {/* Top Users */}
            <div className="bg-white dark:bg-gray-800 h-[50%] rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Usuarios con más conexiones</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Top 10</p>
              </div>
              <div className="p-2 h-full">
                <TopList 
                  items={topUsers}
                  leftKey="mac"
                  rightKey="count" 
                />
              </div>
            </div>

            {/* Top Routers */}
            <div className="bg-white dark:bg-gray-800 h-[50%] overflow-hidden rounded-xl pb-4 shadow-sm border border-gray-200/80 dark:border-gray-700/80">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Puntos con más conexiones</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Top 10</p>
              </div>
              <div className="p-2 h-full">
                <TopList 
                  items={topRouters}
                  leftKey="estacion"
                  rightKey="count"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200/80 dark:border-gray-700/80">
          <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-medium text-gray-900 dark:text-white">Distribución Geográfica</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Mapa de densidad de conexiones</p>
            </div>
          </div>
          <div className="p-8">
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
              <Heatmap points={mapData} heightClass="h-[60vh]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




