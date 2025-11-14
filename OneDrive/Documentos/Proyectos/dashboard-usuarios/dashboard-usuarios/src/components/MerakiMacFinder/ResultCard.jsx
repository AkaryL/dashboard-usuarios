import React, { useState } from 'react';
import HistoryTimeline from './HistoryTimeline';

const ResultCard = ({ client, index, currentApiKey, currentMac, timespan, proxyUrl }) => {
  const [historyData, setHistoryData] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);

  const networkId = client.network?.id || 'N/A';
  const networkName = client.network?.name || 'N/A';
  const recentDeviceName = client.recentDeviceName || 'N/A';
  const recentDeviceSerial = client.recentDeviceSerial || 'N/A';
  const lastSeen = client.lastSeen 
    ? new Date(client.lastSeen * 1000).toLocaleString('es-MX') 
    : 'N/A';
  const ip = client.ip || 'N/A';
  const manufacturer = client.manufacturer || 'N/A';
  const os = client.os || 'N/A';

  const loadHistory = async () => {
    if (networkId === 'N/A') {
      alert('No se puede obtener historial sin network ID');
      return;
    }

    if (!currentMac) {
      alert('Error: MAC no disponible. Busque de nuevo.');
      return;
    }

    setLoadingHistory(true);
    setHistoryError(null);

    try {
      const formattedMac = currentMac.match(/.{1,2}/g).join(':');
      
      // 1. Obtener historial de uso
      const usageUrl = `${proxyUrl}/client-history?networkId=${networkId}&mac=${formattedMac}&apiKey=${encodeURIComponent(currentApiKey)}&timespan=${timespan}`;
      const usageResponse = await fetch(usageUrl);
      const usageText = await usageResponse.text();
      const usageData = usageText && usageText.trim() ? JSON.parse(usageText) : [];

      // 2. Obtener estadísticas de conexión
      let statsData = null;
      try {
        const statsUrl = `${proxyUrl}/connection-events?networkId=${networkId}&mac=${formattedMac}&apiKey=${encodeURIComponent(currentApiKey)}&timespan=${timespan}`;
        const statsResponse = await fetch(statsUrl);
        const statsText = await statsResponse.text();
        statsData = statsText && statsText.trim() ? JSON.parse(statsText) : null;
      } catch (e) {
        console.log('No hay datos de conexión wireless disponibles');
      }

      // 3. Obtener eventos de conectividad (con APs)
      let connectivityData = null;
      try {
        const connectivityUrl = `${proxyUrl}/connectivity-events?networkId=${networkId}&mac=${formattedMac}&apiKey=${encodeURIComponent(currentApiKey)}&timespan=${timespan}`;
        const connectivityResponse = await fetch(connectivityUrl);
        const connectivityText = await connectivityResponse.text();
        connectivityData = connectivityText && connectivityText.trim() ? JSON.parse(connectivityText) : null;
      } catch (e) {
        console.log('No hay eventos de conectividad disponibles');
      }

      // 4. Si hay eventos de conectividad, obtener ubicaciones de APs
      let apLocations = {};
      if (connectivityData && Array.isArray(connectivityData) && connectivityData.length > 0) {
        const uniqueSerials = [...new Set(connectivityData.map(e => e.deviceSerial).filter(s => s))];
        
        if (uniqueSerials.length > 0) {
          const locationsUrl = `${proxyUrl}/ap-locations?serials=${uniqueSerials.join(',')}`;
          
          try {
            const locationsResponse = await fetch(locationsUrl);
            const locationsData = await locationsResponse.json();
            
            locationsData.forEach(loc => {
              apLocations[loc.serial] = loc;
            });
          } catch (e) {
            console.log('Error obteniendo ubicaciones:', e.message);
          }
        }
      }

      setHistoryData({
        usageData,
        statsData,
        connectivityData,
        apLocations,
        timespan
      });

      setLoadingHistory(false);

    } catch (error) {
      console.error('Error completo:', error);
      setHistoryError(error.message);
      setLoadingHistory(false);
    }
  };

  return (
    <div className="result-card">
      <div className="result-header">
        <span>📍 Network: {networkName}</span>
        <button 
          className="history-btn" 
          onClick={loadHistory}
          disabled={loadingHistory}
        >
          {loadingHistory ? '⏳ Cargando...' : '📊 Ver Historial y Mapa'}
        </button>
      </div>
      
      <div className="result-detail">
        <span className="result-label">Device actual:</span>
        <span className="result-value">{recentDeviceName} ({recentDeviceSerial})</span>
      </div>
      
      <div className="result-detail">
        <span className="result-label">Última conexión:</span>
        <span className="result-value">{lastSeen}</span>
      </div>
      
      <div className="result-detail">
        <span className="result-label">IP:</span>
        <span className="result-value">{ip}</span>
      </div>
      
      <div className="result-detail">
        <span className="result-label">Fabricante:</span>
        <span className="result-value">{manufacturer}</span>
      </div>
      
      {os !== 'N/A' && (
        <div className="result-detail">
          <span className="result-label">Sistema Operativo:</span>
          <span className="result-value">{os}</span>
        </div>
      )}

      {historyError && (
        <div className="error-message" style={{ marginTop: '15px' }}>
          ❌ Error obteniendo historial: {historyError}
        </div>
      )}

      {historyData && (
        <HistoryTimeline 
          {...historyData}
          index={index}
        />
      )}
    </div>
  );
};

export default ResultCard;
