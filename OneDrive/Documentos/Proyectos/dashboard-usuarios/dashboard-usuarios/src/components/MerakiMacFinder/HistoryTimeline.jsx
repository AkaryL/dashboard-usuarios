import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Colores para las rutas por día
const routeColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788'
];

const HistoryTimeline = ({ 
  usageData, 
  statsData, 
  connectivityData, 
  apLocations, 
  timespan,
  index 
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selectedDate, setSelectedDate] = useState('all');
  const [uniqueDays, setUniqueDays] = useState([]);
  const [mapStats, setMapStats] = useState(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);

  const timespanDays = Math.floor(parseInt(timespan) / 86400);

  // Obtener días únicos de los eventos
  useEffect(() => {
    if (connectivityData && Array.isArray(connectivityData)) {
      const days = new Set();
      connectivityData.forEach(event => {
        const date = new Date(event.occurredAt);
        const dayStr = date.toISOString().split('T')[0];
        days.add(dayStr);
      });
      setUniqueDays(Array.from(days).sort());
    }
  }, [connectivityData]);

  // Inicializar mapa
  useEffect(() => {
    if (mapRef.current && connectivityData && Object.keys(apLocations).length > 0) {
      // Limpiar mapa anterior si existe
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Crear nuevo mapa
      const map = L.map(mapRef.current).setView([19.4326, -99.1332], 11);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Dibujar rutas iniciales
      drawRoutes('all');

      // Cleanup
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, [connectivityData, apLocations]);

  // Redibujar rutas cuando cambia el filtro de fecha
  useEffect(() => {
    if (mapInstanceRef.current) {
      drawRoutes(selectedDate);
    }
  }, [selectedDate]);

  const drawRoutes = (dateFilter) => {
    if (!mapInstanceRef.current || !connectivityData) return;

    const map = mapInstanceRef.current;

    // Limpiar marcadores y líneas anteriores
    markersRef.current.forEach(m => map.removeLayer(m));
    polylinesRef.current.forEach(p => map.removeLayer(p));
    markersRef.current = [];
    polylinesRef.current = [];

    // Filtrar eventos por fecha
    let filteredEvents = connectivityData;
    if (dateFilter !== 'all') {
      filteredEvents = connectivityData.filter(event => {
        const eventDate = new Date(event.occurredAt).toISOString().split('T')[0];
        return eventDate === dateFilter;
      });
    }

    // Filtrar solo conexiones con ubicación válida
    const eventsWithLocation = filteredEvents
      .filter(e => {
        const isConnection = e.type === 'assoc' || e.type === 'association';
        const location = apLocations[e.deviceSerial];
        if (!location) return false;
        
        const lat = parseFloat(location.lat);
        const lng = parseFloat(location.lng);
        return isConnection && location.lat !== null && location.lng !== null && 
               !isNaN(lat) && !isNaN(lng);
      })
      .sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));

    if (eventsWithLocation.length === 0) {
      return;
    }

    // Agrupar por día
    const eventsByDay = {};
    eventsWithLocation.forEach(event => {
      const day = new Date(event.occurredAt).toISOString().split('T')[0];
      if (!eventsByDay[day]) eventsByDay[day] = [];
      eventsByDay[day].push(event);
    });

    const days = Object.keys(eventsByDay).sort();
    const bounds = [];

    // Dibujar rutas por día
    days.forEach((day, dayIndex) => {
      const dayEvents = eventsByDay[day];
      const color = routeColors[dayIndex % routeColors.length];
      const points = [];

      dayEvents.forEach(event => {
        const location = apLocations[event.deviceSerial];
        if (!location || !location.lat || !location.lng) return;

        const point = [location.lat, location.lng];
        points.push(point);
        bounds.push(point);

        // Crear marcador
        const date = new Date(event.occurredAt);
        const timeStr = date.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit'
        });

        const marker = L.circleMarker(point, {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);

        marker.bindPopup(`
          <div class="popup-title">${location.name}</div>
          <div class="popup-info"><strong>Serial:</strong> ${location.serial}</div>
          <div class="popup-info"><strong>Coordenadas:</strong> ${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}</div>
          <div class="popup-info"><strong>Hora:</strong> ${timeStr}</div>
          <div class="popup-info"><strong>SSID:</strong> ${event.ssid || 'N/A'}</div>
          <div class="popup-info"><strong>Banda:</strong> ${event.band || 'N/A'}</div>
        `);

        markersRef.current.push(marker);
      });

      // Dibujar línea conectando los puntos
      if (points.length > 1) {
        const polyline = L.polyline(points, {
          color: color,
          weight: 3,
          opacity: 0.6,
          smoothFactor: 1
        }).addTo(map);
        
        polylinesRef.current.push(polyline);
      }
    });

    // Ajustar vista del mapa
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    // Actualizar estadísticas
    const uniqueAPs = new Set(eventsWithLocation.map(e => e.deviceSerial)).size;
    const durationsMs = eventsWithLocation
      .filter(e => e.durationMs)
      .map(e => e.durationMs);
    const avgDuration = durationsMs.length > 0 
      ? (durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length / 1000 / 60).toFixed(2)
      : 'N/A';

    setMapStats({
      uniqueAPs,
      totalConnections: eventsWithLocation.length,
      avgDuration,
      eventsByDay
    });
  };

  const totalAPs = Object.keys(apLocations).length;
  const apsWithCoords = Object.values(apLocations).filter(ap => 
    ap.lat !== null && ap.lng !== null && 
    !isNaN(parseFloat(ap.lat)) && !isNaN(parseFloat(ap.lng))
  ).length;
  const apsWithoutCoords = totalAPs - apsWithCoords;

  return (
    <div className="history-container">
      {/* Estadísticas de conexión */}
      {statsData && statsData.connectionStats && (
        <div className="timeline">
          <div className="timeline-header">📅 Historial de los últimos {timespanDays} días</div>
          <div className="timeline-stats" style={{ marginBottom: '20px' }}>
            <div className="stat-box">
              <div className="stat-label">Conexiones exitosas</div>
              <div className="stat-value">{statsData.connectionStats.assoc || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Fallos de autenticación</div>
              <div className="stat-value">{statsData.connectionStats.authNeg || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Fallos DHCP</div>
              <div className="stat-value">{statsData.connectionStats.dhcpNeg || 0}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">Fallos DNS</div>
              <div className="stat-value">{statsData.connectionStats.dnsNeg || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Mapa de rutas */}
      {connectivityData && Object.keys(apLocations).length > 0 && (
        <div className="map-container">
          <div className="map-header">
            <span>🗺️ Mapa de Rutas</span>
            <div className="date-filter">
              <label htmlFor={`dateFilter-${index}`}>Filtrar por día:</label>
              <select 
                id={`dateFilter-${index}`}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              >
                <option value="all">Todos los días</option>
                {uniqueDays.map(day => (
                  <option key={day} value={day}>
                    {new Date(day).toLocaleDateString('es-MX', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Advertencia de coordenadas */}
          {apsWithoutCoords > 0 ? (
            <div className="info-box warning">
              ⚠️ <strong>Advertencia:</strong> {apsWithoutCoords} de {totalAPs} APs no tienen coordenadas GPS configuradas.
              <strong> Se mostrarán {apsWithCoords} APs en el mapa.</strong>
            </div>
          ) : apsWithCoords > 0 ? (
            <div className="info-box">
              ✅ <strong>¡Perfecto!</strong> Todos los APs ({totalAPs}) tienen coordenadas GPS configuradas.
            </div>
          ) : (
            <div className="info-box error">
              ❌ <strong>Error:</strong> Ninguno de los {totalAPs} APs tiene coordenadas GPS.
            </div>
          )}

          {/* Contenedor del mapa */}
          <div ref={mapRef} className="map-element"></div>

          {/* Leyenda */}
          {mapStats && (
            <div className="map-legend">
              <div className="legend-title">Leyenda de Rutas</div>
              {Object.keys(mapStats.eventsByDay).map((day, i) => {
                const color = routeColors[i % routeColors.length];
                const dayStr = new Date(day).toLocaleDateString('es-MX', {
                  month: 'short',
                  day: 'numeric'
                });
                const count = mapStats.eventsByDay[day].length;
                
                return (
                  <div key={day} className="legend-item">
                    <div className="legend-color" style={{ background: color }}></div>
                    <span>{dayStr} ({count} conexiones)</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Estadísticas del mapa */}
          {mapStats && (
            <div className="map-stats">
              <div className="stat-box">
                <div className="stat-label">📡 APs únicos</div>
                <div className="stat-value">{mapStats.uniqueAPs}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">🔌 Total conexiones</div>
                <div className="stat-value">{mapStats.totalConnections}</div>
              </div>
              <div className="stat-box">
                <div className="stat-label">⏱️ Duración promedio</div>
                <div className="stat-value">
                  {mapStats.avgDuration !== 'N/A' ? `${mapStats.avgDuration} min` : 'N/A'}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Eventos de conectividad */}
      {connectivityData && Array.isArray(connectivityData) && connectivityData.length > 0 && (
        <div className="connectivity-section">
          <div className="connectivity-header">🔌 Eventos de Conectividad</div>
          {connectivityData.map((event, idx) => {
            const date = new Date(event.occurredAt);
            const dateStr = date.toLocaleString('es-MX', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            });
            
            const isConnect = event.type === 'association' || event.type === 'assoc';
            const typeIcon = isConnect ? '✅' : '❌';
            const typeText = isConnect ? 'Conectado' : 'Desconectado';
            const cardClass = isConnect ? 'connect' : 'disconnect';
            
            const deviceSerial = event.deviceSerial || 'N/A';
            const apLocation = apLocations[deviceSerial];
            const apName = apLocation ? apLocation.name : 'Desconocido';
            
            const ssid = event.ssid || 'N/A';
            const band = event.band || 'N/A';
            const rssi = event.rssi || 'N/A';
            const vlan = event.vlan || 'N/A';
            const duration = event.durationMs ? `${(event.durationMs / 1000 / 60).toFixed(2)} min` : 'N/A';

            return (
              <div key={idx} className={`event-card ${cardClass}`}>
                <div className={`event-type ${cardClass}`}>{typeIcon} {typeText}</div>
                <div style={{ color: '#666', fontSize: '13px', marginBottom: '10px' }}>{dateStr}</div>
                <div className="timeline-stats">
                  <div className="stat-box">
                    <div className="stat-label">📡 AP</div>
                    <div className="stat-value" style={{ fontSize: '11px' }}>{apName}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">🔢 Serial</div>
                    <div className="stat-value" style={{ fontSize: '11px' }}>{deviceSerial}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">📶 SSID</div>
                    <div className="stat-value">{ssid}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">🌐 Banda</div>
                    <div className="stat-value">{band}</div>
                  </div>
                  {rssi !== 'N/A' && (
                    <div className="stat-box">
                      <div className="stat-label">📊 RSSI</div>
                      <div className="stat-value">{rssi} dBm</div>
                    </div>
                  )}
                  {vlan !== 'N/A' && (
                    <div className="stat-box">
                      <div className="stat-label">🏷️ VLAN</div>
                      <div className="stat-value">{vlan}</div>
                    </div>
                  )}
                  {duration !== 'N/A' && isConnect && (
                    <div className="stat-box">
                      <div className="stat-label">⏱️ Duración</div>
                      <div className="stat-value">{duration}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Historial de uso de datos */}
      {usageData && usageData.length > 0 && (
        <div className="timeline" style={{ marginTop: '20px' }}>
          <div className="connectivity-header" style={{ color: '#333' }}>📊 Historial de Uso de Datos</div>
          {usageData.map((entry, idx) => {
            const date = new Date(entry.ts);
            const dateStr = date.toLocaleString('es-MX');
            const sent = (entry.sent / 1024 / 1024).toFixed(2);
            const received = (entry.received / 1024 / 1024).toFixed(2);

            return (
              <div key={idx} className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-date">{dateStr}</div>
                  <div className="timeline-stats">
                    <div className="stat-box">
                      <div className="stat-label">⬆️ Enviado</div>
                      <div className="stat-value">{sent} MB</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-label">⬇️ Recibido</div>
                      <div className="stat-value">{received} MB</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default HistoryTimeline;
