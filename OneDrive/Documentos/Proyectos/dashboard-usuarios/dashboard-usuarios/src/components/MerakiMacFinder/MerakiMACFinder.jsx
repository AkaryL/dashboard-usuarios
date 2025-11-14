import React, { useState } from 'react';
import SearchForm from './SearchForm';
import ResultsContainer from './ResultsContainer';
import LoadingSpinner from './LoadingSpinner';
import './MerakiMACFinder.css';

const MerakiMACFinder = () => {
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [currentApiKey, setCurrentApiKey] = useState('');
  const [currentMac, setCurrentMac] = useState('');

  // IMPORTANTE: Cambiar esta URL según su configuración
  const PROXY_URL = import.meta.env.REACT_APP_PROXY_URL || 'http://localhost:3000';

  const handleSearch = async (formData) => {
    const { apiKey, orgId, macAddress, timespan } = formData;
    
    setCurrentApiKey(apiKey);
    setCurrentMac(macAddress.replace(/[:-]/g, '').toLowerCase());
    setResults(null);
    setError(null);
    setLoading(true);
    setLoadingText('Buscando en toda la organización...');

    try {
      const cleanMac = macAddress.replace(/[:-]/g, '').toLowerCase();
      const proxyUrl = `${PROXY_URL}/?orgId=${orgId}&mac=${cleanMac}&apiKey=${encodeURIComponent(apiKey)}`;

      const response = await fetch(proxyUrl, { method: 'GET' });

      let data;
      try {
        const text = await response.text();
        if (!text || text.trim().length === 0) {
          data = { records: [] };
        } else {
          data = JSON.parse(text);
        }
      } catch (parseError) {
        throw new Error('La respuesta del servidor no es válida');
      }

      setLoading(false);

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data || !data.records || data.records.length === 0) {
        setError(`La MAC ${macAddress} no se ha conectado a ningún device de su organización.`);
        return;
      }

      setResults({
        records: data.records,
        macAddress: macAddress,
        timespan: timespan
      });

    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  return (
    <div className="meraki-container">
      <div className="meraki-header">
        <h1>🗺️ Meraki MAC Finder con Mapa de Rutas</h1>
        <p className="subtitle">Busque una MAC y visualice su ruta en el mapa</p>
      </div>

      <div className="info-box">
        💡 <strong>Nueva funcionalidad:</strong> Visualice en un mapa interactivo las conexiones y rutas del cliente por todos los APs
      </div>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {loading && <LoadingSpinner text={loadingText} />}

      {error && (
        <div className="error-message">
          <p style={{ fontSize: '18px', marginBottom: '10px' }}>😕 Error</p>
          <p>{error}</p>
        </div>
      )}

      {results && (
        <ResultsContainer 
          results={results}
          currentApiKey={currentApiKey}
          currentMac={currentMac}
          proxyUrl={PROXY_URL}
        />
      )}
    </div>
  );
};

export default MerakiMACFinder;
