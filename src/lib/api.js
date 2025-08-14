import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  timeout: 20000,
});

// Helpers generales
export const getLastVisits = () => api.get(`/api/v2/visitas/last100`);
export const getTopUsers   = () => api.get(`/api/v2/visitas/topUsers`);
export const getTopRouters = () => api.get(`/api/v2/visitas/topRouters`);
export const getHeatmapAll = () => api.get(`/api/v2/usuarios/getPoints/all`);

// Búsqueda de usuarios
export const searchUsers = (filters) =>
  api.get(`/api/v2/usuarios/search`, { params: filters }).then((r) => {
    const d = r?.data;
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.results)) return d.results;
    if (Array.isArray(d?.items)) return d.items;
    if (Array.isArray(d?.data)) return d.data;
    return [];
  });

// Endpoints por usuario
export const getUserOverview = (mac) =>
  api.get(`/api/v2/usuarios/overview/${encodeURIComponent(mac)}`);
export const getUserTopRouters = (mac, limit = 5) =>
  api.get(`/api/v2/usuarios/topRouters/${encodeURIComponent(mac)}`, {
    params: { limit },
  });
export const getUserByHour = (mac) =>
  api.get(`/api/v2/usuarios/connectionsByHour/${encodeURIComponent(mac)}`);
export const getHeatmapUser = (mac) =>
  api.get(`/api/v2/usuarios/getPoints/${encodeURIComponent(mac)}`);

