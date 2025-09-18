// src/components/Heatmap/index.jsx
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet.heat";
import L from "leaflet";

function HeatLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(points) || points.length === 0) return;

    // ✅ Filtrar puntos inválidos y normalizar
    const safePoints = points
      .filter((p) => Array.isArray(p) && p.length >= 2) // que tenga al menos lat y lng
      .map(([lat, lng, intensity]) => {
        const latNum = Number(lat);
        const lngNum = Number(lng);
        if (isNaN(latNum) || isNaN(lngNum)) return null; // descartar si no son válidos
        
        let intensityNum = Number(intensity) || 0;
        
        // 🔥 BOOST para intensidades >= 5: multiplicar por 2-3x
        if (intensityNum >= 5) {
          intensityNum = intensityNum * 2.5; // Ajusta este multiplicador según prefieras
        }
        
        return [latNum, lngNum, intensityNum];
      })
      .filter(Boolean); // quitar nulls

    if (safePoints.length === 0) return;

    const heat = L.heatLayer(safePoints, {
      radius: 30,        // Aumentado de 25 a 30 para mayor visibilidad
      blur: 15,          // Aumentado de 8 a 15 para suavizar
      maxZoom: 17,
      max: 15,           // Valor máximo esperado (ajusta según tus datos)
      minOpacity: 0.3,   // Opacidad mínima para que se vea algo
      gradient: {        // Gradiente personalizado para resaltar altas intensidades
        0.2: 'blue',
        0.4: 'cyan', 
        0.6: 'lime',
        0.8: 'yellow',
        0.9: 'orange',
        1.0: 'red'
      }
    }).addTo(map);

    return () => map.removeLayer(heat);
  }, [points, map]);

  return null;
}

export default function Heatmap({
  points = [],
  center = [20.6748, -103.344],
  zoom = 12,
  heightClass = "h-96",
}) {
  return (
    <div
      className={`w-full ${heightClass} rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700`}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        className="w-full h-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer points={points} />
      </MapContainer>
    </div>
  );
}