// src/pages/UsersSearch.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { searchUsers } from "../../lib/api";
import { DataContext } from "../../context/DataContext";
import { useNavigate } from "react-router-dom";

export default function UsersSearch() {
  const [q, setQ] = useState({ mac: "", phone: "", name: "", curp: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]); // siempre array
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { users } = useContext(DataContext);

  const canSearch = useMemo(() => Object.values(q).some((v) => v?.trim()), [q]);

  useEffect(() => {
    const id = setTimeout(() => {
      if (!canSearch) { setResults([]); setError(""); return; }

      setLoading(true);
      setError("");

      searchUsers(q)
        .then((arr) => {
          // searchUsers YA devuelve array normalizado
          setResults(Array.isArray(arr) ? arr : []);
        })
        .catch((e) => {
          console.error("searchUsers error:", e);
          setError("No se pudo obtener resultados.");
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 400); // debounce

    return () => clearTimeout(id);
  }, [q, canSearch]);

  const safeResults = Array.isArray(results) ? results : [];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <div onClick={() => console.log(users)} className="bg-white rounded-xl shadow p-4 grid md:grid-cols-5 gap-3">
        <input className="input" placeholder="MAC" value={q.mac}     onChange={(e)=>setQ({...q, mac: e.target.value})}/>
        <input className="input" placeholder="Teléfono" value={q.phone} onChange={(e)=>setQ({...q, phone: e.target.value})}/>
        <input className="input" placeholder="Nombre" value={q.name}   onChange={(e)=>setQ({...q, name: e.target.value})}/>
        <input className="input" placeholder="CURP" value={q.curp}     onChange={(e)=>setQ({...q, curp: e.target.value})}/>
        <input className="input" placeholder="Correo" value={q.email}  onChange={(e)=>setQ({...q, email: e.target.value})}/>
      </div>

      {loading && <div className="text-gray-500">Buscando…</div>}
      {error && <div className="text-red-600 text-sm">{error}</div>}

      {users?.length > 0 && (
        <div className="bg-white rounded-xl shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-3 py-2">MAC</th>
                <th className="text-left px-3 py-2">Nombre</th>
                <th className="text-left px-3 py-2">Correo</th>
                <th className="text-left px-3 py-2">EDAD</th>
                <th className="text-left px-3 py-2">Teléfono</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{u.mac}</td>
                  <td className="px-3 py-2">{u.name || "—"}</td>
                  <td className="px-3 py-2">{u.email || "—"}</td>
                  <td className="px-3 py-2">{u.age || "—"}</td>
                  <td className="px-3 py-2">{u.phone || "—"}</td>
                  <td className="px-3 py-2">
                    <button
                      className="px-3 py-1 rounded bg-slate-900 text-white"
                      onClick={() => nav(`/usuarios/${encodeURIComponent(u.mac)}`)}
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && canSearch && safeResults.length === 0 && (
        <div className="text-gray-500 text-sm">Sin resultados para los filtros actuales.</div>
      )}

      <style>{`
        .input{ 
          @apply border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300; 
        }
      `}</style>
    </div>
  );
}
