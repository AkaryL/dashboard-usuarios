import React, { useState } from 'react';

const SearchForm = ({ onSearch, loading }) => {
  const [formData, setFormData] = useState({
    apiKey: '',
    orgId: '',
    macAddress: '',
    timespan: '2592000'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-formatear MAC address
    if (name === 'macAddress') {
      let cleanValue = value.replace(/[^a-fA-F0-9]/g, '');
      if (cleanValue.length > 12) cleanValue = cleanValue.substr(0, 12);
      if (cleanValue.length > 0) {
        cleanValue = cleanValue.match(/.{1,2}/g).join(':');
      }
      setFormData({ ...formData, macAddress: cleanValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="form-group">
        <label htmlFor="apiKey">API Key de Meraki *</label>
        <input 
          type="password" 
          id="apiKey"
          name="apiKey"
          placeholder="Su API key de Meraki Dashboard"
          value={formData.apiKey}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="orgId">Organization ID *</label>
        <input 
          type="text" 
          id="orgId"
          name="orgId"
          placeholder="ID de su organización (ej: 123456)"
          value={formData.orgId}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="macAddress">Dirección MAC *</label>
        <input 
          type="text" 
          id="macAddress"
          name="macAddress"
          placeholder="aa:bb:cc:dd:ee:ff"
          value={formData.macAddress}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="timespan">Período de historial</label>
        <select 
          id="timespan"
          name="timespan"
          value={formData.timespan}
          onChange={handleChange}
        >
          <option value="86400">Último día</option>
          <option value="604800">Última semana</option>
          <option value="2592000">Último mes (30 días)</option>
          <option value="7776000">Últimos 3 meses</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="search-button">
        🔍 Buscar MAC
      </button>
    </form>
  );
};

export default SearchForm;
