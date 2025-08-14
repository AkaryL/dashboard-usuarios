/* eslint react-refresh/only-export-components: "off" */
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const DataContext = createContext(null);

const DataProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [heatPoint, setHeatPoint] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [lastVisits, setLastVisits] = useState([]);
  const [connectionsByHour, setConnectionsByHour] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v2/usuarios/all`);
      if (res.status === 200) {
        setUsers(Array.isArray(res.data) ? res.data : []);
        console.log("Usuarios cargados:", res.data?.length ?? 0);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    }
  };

  const fetchHeatPoint = async (mac) => {
    try {
      // Limpia estados al cambiar de usuario
      setHeatPoint([]);
      setConnectionsCount(0);

      const res = await axios.get(`${API_URL}/api/v2/usuarios/getPoints/${mac}`);
      if (res.status === 200) {
        const data = Array.isArray(res.data) ? res.data : [];
        setHeatPoint(data);

        // ✅ Sumar todos los count (vienen como string)
        const total = data.reduce((sum, item) => sum + Number(item?.count ?? 0), 0);
        setConnectionsCount(total);

        console.log("Heatmap data cargada:", data.length, "puntos. Total conexiones:", total);
      }
    } catch (err) {
      console.error("Error fetching heatmap data:", err);
      setHeatPoint([]);
      setConnectionsCount(0);
    }
  };

  const fetchLastVisits = async (mac) => {
    try {
      setLastVisits([]);
      const res = await axios.get(`${API_URL}/api/v2/usuarios/last10/${mac}`);
      if (res.status === 200) {
        setLastVisits(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Error fetching last visits:", err);
      setLastVisits([]);
    }
  };

  const fetchConnectionsByHour = async (mac) => {
    try {
      setConnectionsByHour([]);
      const res = await axios.get(`${API_URL}/api/v2/usuarios/connectionsByHour/${mac}`);
      if (res.status === 200) {
        setConnectionsByHour(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Error fetching connections by hour:", err);
      setConnectionsByHour([]);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <DataContext.Provider
      value={{
        users,
        setUsers,
        heatPoint,
        fetchHeatPoint,
        connectionsCount, // 👈 exponemos el total
        lastVisits,
        fetchLastVisits,
        connectionsByHour,
        fetchConnectionsByHour,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataProvider, DataContext };
export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData debe usarse dentro de <DataProvider>");
  return ctx;
};
