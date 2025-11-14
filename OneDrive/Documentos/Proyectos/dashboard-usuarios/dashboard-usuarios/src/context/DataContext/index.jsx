/* eslint react-refresh/only-export-components: "off" */
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const DataContext = createContext(null);

const DataProvider = ({ children }) => {
  //Datos generales
  const [topUsers, setTopUsers] = useState([]);
  const [topRouters, setTopRouters] = useState([]);
  const [visits, setVisits] = useState([]);
  const [generalHeatPoints, setGeneralHeatPoints] = useState([]);
  const [riskUsers, setRiskUsers] = useState([]);

  // Datos de Usuario
  const [users, setUsers] = useState([]);
  const [userHeatPoint, setUserHeatPoint] = useState([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [lastVisits, setLastVisits] = useState([]);
  const [connectionsByHour, setConnectionsByHour] = useState([]);
  const [firstAndLastSeen, setFirstAndLastSeen] = useState(null);
  const [count, setCount] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchUsers = async () => {  
    try {
      const res = await axios.get(`${API_URL}/api/v2/usuarios/all`);
      if (res.status === 200) {
        setUsers(Array.isArray(res.data) ? res.data : []);
        // console.log("Usuarios cargados:", res.data?.length ?? 0);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setUsers([]);
    } 
  };
  
  const fetchCount = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v2/visitas/last24h`);
      if (res.status === 200) {
        setCount(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      console.error("Error fetching count:", err);
      setCount([]);
    }
  };

  const fetchRiskUsers = async () => {  
    try {
      const res = await axios.get(`${API_URL}/api/v2/visitas/getRiskyUsers`);
      console.log(res);
      if (res.status === 200) {
        setRiskUsers(Array.isArray(res.data) ? res.data : []);
        // console.log("Usuarios de riesgo cargados:", res.data?.length ?? 0);
      }
    } catch (err) {
      console.error("Error fetching risk users:", err);
      setRiskUsers([]);
    }
  };

  const fetchHeatPoint = async (mac) => {
    try {
      // Limpia estados al cambiar de usuario
      setUserHeatPoint([]);
      setConnectionsCount(0);

      const res = await axios.get(`${API_URL}/api/v2/usuarios/getPoints/${mac}`);
      if (res.status === 200) {
        const data = Array.isArray(res.data) ? res.data : [];
        setUserHeatPoint(data);

        // ✅ Sumar todos los count (vienen como string)
        const total = data.reduce((sum, item) => sum + Number(item?.count ?? 0), 0);
        setConnectionsCount(total);

        // console.log("Heatmap data cargada:", data.length, "puntos. Total conexiones:", total);
      }
    } catch (err) {
      console.error("Error fetching heatmap data:", err);
      setUserHeatPoint([]);
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

  const fetchVisits = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v2/visitas/last100`);
      if (res.status === 200) {
        setVisits(res.data);
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
      setVisits([]);
    }
  };

  const fetchTopUsers = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v2/visitas/topUsers`);
      if (res.status === 200) {
        setTopUsers(res.data);
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
      setVisits([]);
    }
  };

  const fetchTopRouters = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/v2/visitas/topRouters`);
      if (res.status === 200) {
        setTopRouters(res.data);
      }
    } catch (err) {
      console.error("Error fetching visits:", err);
      setVisits([]);
    }
  };



  const fetchGeneralHeatPoints = async (mac) => {
    try {
      // Limpia estados al cambiar de usuario
      setGeneralHeatPoints([]);

      const res = await axios.get(`${API_URL}/api/v2/visitas/getPoints2`);
      if (res.status === 200) {
        setGeneralHeatPoints(res.data);
      }
    } catch (err) {
      console.error("Error fetching heatmap data:", err);
      setGeneralHeatPoints([]);
    }
  };

  const fetchFirstAndLastSeen = async (mac) => {
    try {
      const res = await axios.get(`${API_URL}/api/v2/usuarios/firstAndLastSeen/${mac}`);
      if (res.status === 200) {
        setFirstAndLastSeen(res.data);
      }
    } catch (err) {
      console.error("Error fetching first and last seen:", err);
      setFirstAndLastSeen(null);
    }
  };

  useEffect(() => {
  // Ejecuta las primeras cargas normales
  fetchUsers();
  fetchRiskUsers();
  fetchTopUsers();
  fetchTopRouters();
  fetchGeneralHeatPoints();
  
  // Ejecuta fetchVisits cada 5s
  const interval = setInterval(() => {
    fetchCount();
    fetchVisits();
    // fetchCount();
    // console.log("Visitas cargadas");
  }, 10000);

  // Limpieza al desmontar
  return () => clearInterval(interval);
}, []);


  return (
    <DataContext.Provider
      value={{
        users,
        setUsers,
        userHeatPoint,
        fetchHeatPoint,
        connectionsCount, // 👈 exponemos el total
        lastVisits,
        fetchLastVisits,
        connectionsByHour,
        fetchConnectionsByHour,
        riskUsers,
        fetchRiskUsers,
        visits,
        topUsers,
        topRouters,
        generalHeatPoints,
        firstAndLastSeen,
        fetchFirstAndLastSeen,
        count,
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
