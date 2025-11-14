// src/lib/api.js
import axios from "axios";

function normalizeQuery(q = {}) {
  const clean = {};
  for (const [k, v] of Object.entries(q)) {
    const val = typeof v === "string" ? v.trim() : v;
    if (val !== undefined && val !== null && String(val).trim() !== "") {
      clean[k] = val;
    }
  }
  return clean;
}

/**
 * Busca en el backend.
 * Nota: El backend puede no soportar "contiene" en phone; por eso luego refinamos localmente.
 */
export async function searchUsers(q = {}) {
  const API_URL = import.meta.env.VITE_API_URL;
  if (!API_URL) throw new Error("VITE_API_URL no está definido en el .env");

  const params = normalizeQuery(q);
  const hasAny = Object.keys(params).length > 0;
  if (!hasAny) return [];

  try {
    const res = await axios.get(`${API_URL}/api/v2/usuarios/search`, {
      params,
      timeout: 10000,
    });
    const data = Array.isArray(res.data) ? res.data : [];
    return data.map((u) => ({
      mac: u?.mac ?? "",
      name: u?.name ?? "",
      email: u?.email ?? "",
      phone: u?.phone ?? "",
      age: typeof u?.age === "number" ? u.age : (u?.age ? Number(u.age) || "" : ""),
      ...u,
    }));
  } catch (err) {
    console.error("searchUsers error:", err);
    return [];
  }
}
