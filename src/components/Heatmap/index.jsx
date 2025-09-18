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
        const intensityNum = Number(intensity) || 0; // fallback a 0
        return [latNum, lngNum, intensityNum];
      })
      .filter(Boolean); // quitar nulls

    if (safePoints.length === 0) return;

    const heat = L.heatLayer(safePoints, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
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
