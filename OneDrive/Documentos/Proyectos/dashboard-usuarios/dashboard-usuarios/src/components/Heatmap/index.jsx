// src/components/Heatmap/index.jsx
import { useEffect } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet.heat";
import L from "leaflet";

function HeatLayer({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!Array.isArray(points) || points.length === 0) return;

    // ✅ Filtrar y procesar puntos
    const safePoints = points
      .filter((p) => Array.isArray(p) && p.length >= 2)
      .map(([lat, lng, intensity]) => {
        const latNum = Number(lat);
        const lngNum = Number(lng);
        if (isNaN(latNum) || isNaN(lngNum)) return null;
        
        return [latNum, lngNum, Number(intensity) || 1];
      })
      .filter(Boolean);

    if (safePoints.length === 0) return;

    // 🔥 BOOST SIMPLE Y DIRECTO - mientras más alto, MÁS BOOST
    const boostedPoints = safePoints.map(([lat, lng, intensity]) => {
      let boostedIntensity = intensity;
      
      // Multiplicadores por rangos - ajusta estos números según necesites
      if (intensity >= 10) {
        boostedIntensity = intensity * 50; // Los más altos x50
      } else if (intensity >= 5) {
        boostedIntensity = intensity * 25; // Altos x25  
      } else if (intensity >= 3) {
        boostedIntensity = intensity * 15; // Medios x15
      } else if (intensity >= 2) {
        boostedIntensity = intensity * 8;  // Bajos x8
      } else {
        boostedIntensity = intensity * 3;  // Mínimos x3
      }
      
      return [lat, lng, boostedIntensity];
    });

    const heat = L.heatLayer(boostedPoints, {
      radius: 25,          // Radio óptimo
      blur: 10,            // Blur reducido para más definición
      maxZoom: 18,
      max: 30,             // Valor máximo ajustado
      minOpacity: 0.3,     // Opacidad mínima muy baja
      gradient: {          // Gradiente agresivo hacia rojo
        0.5: 'rgba(0, 0, 255, 0.1)',     // Azul muy tenue
        0.6: 'rgba(0, 255, 255, 0.3)',   // Cyan ligero  
        0.7: 'rgba(0, 255, 0, 0.5)',     // Verde
        0.8: 'rgba(255, 255, 0, 0.7)',   // Amarillo
        0.85: 'rgba(255, 165, 0, 0.9)',  // Naranja intenso
        0.95: 'rgba(255, 69, 0, 1)',     // Rojo-naranja
        1.0: 'rgba(220, 20, 60, 1)'      // Rojo intenso
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
          url="https://{s}.tile.openstreetMap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer points={points} />
      </MapContainer>
    </div>
  );
}