// src/components/Heatmap/index.jsx
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet.heat";
import L from "leaflet";

function HeatLayer({ points }) {
  const map = useMap();
  const safePoints = Array.isArray(points) ? points : [];

  useEffect(() => {
    if (!safePoints.length) return;
    const heat = L.heatLayer(
      safePoints.map(([lat, lng, intensity]) => [
        lat,
        lng,
        // Math.max(0, Math.min(1, (Number(intensity) || 0) / 100)),
        intensity || 0
      ]),
      { radius: 25, blur: 15, maxZoom: 17 }
    ).addTo(map);

    return () => map.removeLayer(heat);
  }, [safePoints, map]);

  return null;
}

export default function Heatmap({
  points = [],
  center = [20.6748, -103.344],
  zoom = 12,
  heightClass = "h-96",
}) {
  return (
    <div className={`w-full ${heightClass} rounded-xl overflow-hidden shadow`}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom className="w-full h-full">
        <TileLayer
          attribution="&copy; OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer points={points} />
      </MapContainer>
    </div>
  );
}
