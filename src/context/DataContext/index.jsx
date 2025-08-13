import React, { createContext, use, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";

// // 🧩 Lee la URL desde .env y quita "/" final para evitar URLs con doble slash
// const RAW_API_BASE = import.meta.env.VITE_API_URL || "";
// const API_BASE = RAW_API_BASE.replace(/\/+$/, ""); // <— importante
// const ENDPOINT = "/api/v2/usuarios/all";

// const DataContext = createContext(null);

// export function DataProvider({ children }) {
//   const [rows, setRows] = useState([]);      // usuarios crudos
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // 🔎 filtros básicos
//   const [query, setQuery] = useState("");
//   const [gender, setGender] = useState("todos");
//   const [municipality, setMunicipality] = useState("todos");

//   async function fetchUsers() {
//     try {
//       setLoading(true);
//       setError("");

//       if (!API_BASE) {
//         throw new Error("VITE_API_URL no está definido en .env");
//       }

//       // ⏱️ Timeout 15s para evitar quedarse colgado si el server no responde
//       const controller = new AbortController();
//       const id = setTimeout(() => controller.abort(), 15000);

//       const res = await fetch(`${API_BASE}${ENDPOINT}`, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//         signal: controller.signal,
//       });

//       clearTimeout(id);

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(`HTTP ${res.status} - ${text || "falló la petición"}`);
//       }

//       const data = await res.json();

//       // normaliza por si no viene array
//       const arr = Array.isArray(data) ? data : [];

//       // mapea para añadir id y evitar nulls raros en render
//       const normalized = arr.map(u => ({
//         id: u.mac || (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)),
//         mac: u.mac ?? "",
//         name: u.name ?? "",
//         email: u.email ?? "",
//         phone: u.phone ?? "",
//         gender: u.gender ?? "",
//         municipality: u.municipality ?? "",
//         instagram: u.instagram ?? "",
//         twitter: u.twitter ?? "",
//         facebook: u.facebook ?? "",
//         preferences: u.preferences ?? "",
//         political_preferences: u.political_preferences ?? "",
//         socioeconomic_level: u.socioeconomic_level ?? "",
//         academic_level: u.academic_level ?? "",
//         most_used_app: u.most_used_app ?? "",
//         age: typeof u.age === "number" ? u.age : (Number(u.age) || null),
//         phone_os: u.phone_os ?? "",
//         user_agent: u.user_agent ?? "",
//         language: u.language ?? "",
//         createdat: u.createdat ?? "",
//         updatedat: u.updatedat ?? "",
//       }));

//       // 🔍 Log de depuración útil
//       console.log("[DataProvider] Usuarios recibidos:", normalized.length);
//       console.table(normalized.map(u => ({
//         name: u.name,
//         email: u.email,
//         municipality: u.municipality,
//         gender: u.gender,
//         age: u.age
//       })));

//       setRows(normalized);
//     } catch (e) {
//       setError(e?.name === "AbortError" ? "Timeout al consultar la API (15s)" : (e?.message || "Error cargando usuarios"));
//       setRows([]);
//       console.warn("[DataProvider] fetchUsers error:", e);
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   // aplica filtros en memo
//   const filtered = useMemo(() => {
//     const q = (query || "").toLowerCase().trim();
//     const muni = (municipality || "").toLowerCase().trim();

//     return (Array.isArray(rows) ? rows : [])
//       .filter(u => (gender === "todos" ? true : (u.gender || "").toLowerCase() === gender))
//       .filter(u => (municipality === "todos" ? true : (u.municipality || "").toLowerCase().trim() === muni))
//       .filter(u => {
//         if (!q) return true;
//         return [
//           u.name, u.email, u.phone, u.municipality, u.instagram, u.twitter, u.facebook, u.language, u.mac
//         ].some(val => (val || "").toString().toLowerCase().includes(q));
//       });
//   }, [rows, query, gender, municipality]);

//   const value = useMemo(() => ({
//     rows,
//     loading,
//     error,
//     refetch: fetchUsers,
//     // filtros expuestos
//     query, setQuery,
//     gender, setGender,
//     municipality, setMunicipality,
//     filteredRows: filtered,
//   }), [rows, loading, error, query, gender, municipality, filtered]);

//   return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
// }

// export function useData() {
//   const ctx = useContext(DataContext);
//   if (!ctx) throw new Error("useData debe usarse dentro de <DataProvider>");
//   return ctx;
// }



const DataContext = createContext(null);
const DataProvider = ({ children }) => {
    const [users, setUsers] = useState([]);
    const [ heatPoint, setHeatPoint] = useState([]);
    
    const API_URL = import.meta.env.VITE_API_URL;

    const fetchUsers = async () => {
        try{
            const response = await axios.get(`${API_URL}/api/v2/usuarios/all`);
            if(response.status === 200 ){
                setUsers(response.data);
                console.log("Usuarios cargados:", response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    }

    const fetchHeatPoint = async (mac) => {
        try {
            const response = await axios.get(`${API_URL}/api/v2/usuarios/getPoints/${mac}`);
            if (response.status === 200) {
                setHeatPoint(response.data);
                console.log("Heatmap data cargada:", response.data);
            }
        } catch (error) {
            console.error("Error fetching heatmap data:", error);
        }
    }

    useEffect (() => {
        fetchUsers();
    }, []);

    return ( 
        <DataContext.Provider value={{users, setUsers, fetchHeatPoint, heatPoint}}>
            {children}
        </DataContext.Provider>
    )
}

export { DataProvider, DataContext };