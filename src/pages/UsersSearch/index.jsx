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
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 p-4">
          <div className="mb-4">
            <h1 className="text-base font-medium text-gray-900">Búsqueda de Usuarios</h1>
            <p className="text-xs text-gray-600 mt-1">Buscar usuarios por cualquier campo</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Dirección MAC</label>
              <input 
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" 
                placeholder="Ingresa MAC" 
                value={q.mac}     
                onChange={(e)=>setQ({...q, mac: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
              <input 
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" 
                placeholder="Ingresa teléfono" 
                value={q.phone} 
                onChange={(e)=>setQ({...q, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input 
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" 
                placeholder="Ingresa nombre" 
                value={q.name}   
                onChange={(e)=>setQ({...q, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">CURP</label>
              <input 
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" 
                placeholder="Ingresa CURP" 
                value={q.curp}     
                onChange={(e)=>setQ({...q, curp: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Correo</label>
              <input 
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400" 
                placeholder="Ingresa correo" 
                value={q.email}  
                onChange={(e)=>setQ({...q, email: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-700 text-xs flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Buscando usuarios...
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-700 text-xs">{error}</div>
          </div>
        )}

        {/* Results Table */}
        {users?.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200/80 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-medium text-gray-900">Resultados de Búsqueda</h2>
              <p className="text-xs text-gray-600 mt-1">{users.length} usuarios encontrados</p>
            </div>

            {/* Mobile View - Card Layout */}
            <div className="md:hidden">
              <div className="max-h-[400px] overflow-y-auto p-3 space-y-3">
                {users.map((u, i) => (
                  <div key={i} className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600">MAC:</span>
                        <span className="text-xs text-gray-900 text-right">{u.mac}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600">Nombre:</span>
                        <span className="text-xs text-gray-900 text-right">{u.name || "—"}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600">Correo:</span>
                        <span className="text-xs text-gray-900 text-right">{u.email || "—"}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600">Edad:</span>
                        <span className="text-xs text-gray-900 text-right">{u.age || "—"}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600">Teléfono:</span>
                        <span className="text-xs text-gray-900 text-right">{u.phone || "—"}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200">
                        <button
                          className="w-full px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
                          onClick={() => nav(`/usuarios/${encodeURIComponent(u.mac)}`)}
                        >
                          Ver Detalles
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden md:block">
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50/50 border-b border-gray-100 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900">MAC</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900">Nombre</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900">Correo</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900">Edad</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900">Teléfono</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors duration-150">
                        <td className="px-4 py-3 text-xs text-gray-600">{u.mac}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{u.name || "—"}</td> 
                        <td className="px-4 py-3 text-xs text-gray-600">{u.email || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{u.age || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{u.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors"
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
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && !error && canSearch && safeResults.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <div className="text-gray-500 text-sm">No se encontraron resultados para los filtros actuales.</div>
          </div>
        )}
      </div>
    </div>
  );
}