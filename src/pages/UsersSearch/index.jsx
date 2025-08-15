// src/pages/UsersSearch.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { searchUsers } from "../../lib/api";
import { DataContext } from "../../context/DataContext";
import { useNavigate } from "react-router-dom";

function norm(s) {
  if (s == null) return "";
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function includesStr(hay, needle) {
  const H = norm(hay);
  const N = norm(needle);
  return H.includes(N);
}

function digits(s) {
  return String(s || "").replace(/\D/g, "");
}

function uniqueByMac(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const key = (x?.mac || "").toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      out.push(x);
    }
  }
  return out;
}

export default function UsersSearch() {
  // Quitamos CURP como pediste
  const [q, setQ] = useState({ mac: "", phone: "", name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]); // array final combinado
  const [error, setError] = useState("");
  const nav = useNavigate();

  // usamos users del contexto para filtrado local (coincidencia parcial garantizada)
  const { users } = useContext(DataContext);

  const canSearch = useMemo(() => Object.values(q).some((v) => v?.trim()), [q]);

  // Filtro local "contiene" para TODOS los campos
  const localMatches = useMemo(() => {
    if (!canSearch) return [];
    const macQ = q.mac?.trim();
    const nameQ = q.name?.trim();
    const emailQ = q.email?.trim();
    const phoneQ = digits(q.phone);

    let base = Array.isArray(users) ? users : [];

    if (macQ) base = base.filter((u) => includesStr(u.mac, macQ));
    if (nameQ) base = base.filter((u) => includesStr(u.name, nameQ));
    if (emailQ) base = base.filter((u) => includesStr(u.email, emailQ));
    if (phoneQ) base = base.filter((u) => String(u?.phone || "").includes(phoneQ));

    return base;
  }, [q, users, canSearch]);

  // Disparo al backend + combinación con local (para que nunca pierdas "contiene")
  useEffect(() => {
    const id = setTimeout(async () => {
      if (!canSearch) {
        setResults([]);
        setError("");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const serverArr = await searchUsers(q);
        // Afinamos server por si el backend hace exact-match (aplicamos "contiene")
        let refined = serverArr;

        if (q.mac?.trim()) refined = refined.filter((u) => includesStr(u.mac, q.mac));
        if (q.name?.trim()) refined = refined.filter((u) => includesStr(u.name, q.name));
        if (q.email?.trim()) refined = refined.filter((u) => includesStr(u.email, q.email));
        if (q.phone?.trim()) refined = refined.filter((u) =>
          String(u?.phone || "").includes(digits(q.phone))
        );

        // Unimos server (refinado) + local, sin duplicar por mac
        const combined = uniqueByMac([...refined, ...localMatches]);
        setResults(combined);
      } catch (e) {
        console.error("searchUsers effect error:", e);
        // Si el servidor falla, aún mostramos lo local
        setResults(uniqueByMac([...localMatches]));
        setError("No se pudo consultar el servidor, mostrando coincidencias locales.");
      } finally {
        setLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(id);
  }, [q, canSearch, localMatches]);

  const safeResults = Array.isArray(results) ? results : [];

  const clearFilters = () => {
    setQ({ mac: "", phone: "", name: "", email: "" });
    setResults([]);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
        {/* Search Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-base font-medium text-gray-900 dark:text-white">Búsqueda de Usuarios</h1>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                Coincidencia en MAC, Teléfono, Nombre o Correo
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-xs rounded-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección MAC</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ingresa MAC"
                value={q.mac}
                onChange={(e) => setQ({ ...q, mac: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ingresa teléfono"
                value={q.phone}
                onChange={(e) => setQ({ ...q, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ingresa nombre"
                value={q.name}
                onChange={(e) => setQ({ ...q, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Correo</label>
              <input
                className="w-full border border-gray-200 dark:border-gray-600 rounded-md px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gray-400 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Ingresa correo"
                value={q.email}
                onChange={(e) => setQ({ ...q, email: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
            <div className="text-blue-700 dark:text-blue-300 text-xs flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              Buscando usuarios...
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3">
            <div className="text-red-700 dark:text-red-300 text-xs">{error}</div>
          </div>
        )}

        {/* Results Table */}
        {safeResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-sm font-medium text-gray-900 dark:text-white">Resultados de Búsqueda</h2>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{safeResults.length} usuarios encontrados</p>
            </div>

            {/* Mobile View - Card Layout */}
            <div className="md:hidden">
              <div className="max-h-[400px] overflow-y-auto p-3 space-y-3">
                {safeResults.map((u, i) => (
                  <div key={i} className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">MAC:</span>
                        <span className="text-xs text-gray-900 dark:text-white text-right">{u.mac}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Nombre:</span>
                        <span className="text-xs text-gray-900 dark:text-white text-right">{u.name || "—"}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Correo:</span>
                        <span className="text-xs text-gray-900 dark:text-white text-right">{u.email || "—"}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Edad:</span>
                        <span className="text-xs text-gray-900 dark:text-white text-right">{u.age || "—"}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Teléfono:</span>
                        <span className="text-xs text-gray-900 dark:text-white text-right">{u.phone || "—"}</span>
                      </div>
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <button
                          className="w-full px-3 py-2 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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
                  <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">MAC</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">Nombre</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">Correo</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">Edad</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">Teléfono</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {safeResults.map((u, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150">
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{u.mac}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{u.name || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{u.email || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{u.age || "—"}</td>
                        <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">{u.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            className="px-3 py-1.5 rounded-md bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
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
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 text-center">
            <div className="text-gray-500 dark:text-gray-400 text-sm">No se encontraron resultados para los filtros actuales.</div>
          </div>
        )}
      </div>
    </div>
  );
}