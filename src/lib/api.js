import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  timeout: 20000,
});

// Helpers
export const getLastVisits = (limit=100) => api.get(`/visits`, { params: { limit } });
export const getTopUsers   = (limit=10)  => api.get(`/stats/top-users`, { params: { limit } });
export const getTopRouters = (limit=10)  => api.get(`/stats/top-routers`, { params: { limit } });
export const getHeatmapAll = ()          => api.get(`/heatmap`, { params: { scope: "all" } });

export const searchUsers = (filters) =>
  api.get(`/users/search`, { params: filters }).then((r) => {
    const d = r?.data;
    // Normaliza cualquier forma común -> array
    if (Array.isArray(d)) return d;
    if (Array.isArray(d?.results)) return d.results;
    if (Array.isArray(d?.items)) return d.items;
    if (Array.isArray(d?.data)) return d.data;
    return []; // fallback
  });
export const getUserOverview = (mac) => api.get(`/users/${encodeURIComponent(mac)}/overview`);
export const getUserTopRouters = (mac, limit=5) => api.get(`/users/${encodeURIComponent(mac)}/top-routers`, { params: { limit }});
export const getUserByHour = (mac) => api.get(`/users/${encodeURIComponent(mac)}/connections-by-hour`);
export const getHeatmapUser = (mac) => api.get(`/heatmap`, { params: { mac }});


