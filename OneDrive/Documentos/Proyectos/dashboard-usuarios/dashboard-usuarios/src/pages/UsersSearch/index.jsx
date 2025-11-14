// src/pages/UsersSearch.jsx
import { useEffect, useMemo, useState, useContext } from "react";
import { searchUsers } from "../../lib/api";
import { DataContext } from "../../context/DataContext";
import { useNavigate } from "react-router-dom";

const NEON = "#6CFC4F";

function norm(s) {
  if (s == null) return "";
  return String(s).toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
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
  const [q, setQ] = useState({ mac: "", phone: "", name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const nav = useNavigate();
  const { users } = useContext(DataContext);

  const canSearch = useMemo(() => Object.values(q).some((v) => v?.trim()), [q]);

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
        let refined = serverArr;
        if (q.mac?.trim()) refined = refined.filter((u) => includesStr(u.mac, q.mac));
        if (q.name?.trim()) refined = refined.filter((u) => includesStr(u.name, q.name));
        if (q.email?.trim()) refined = refined.filter((u) => includesStr(u.email, q.email));
        if (q.phone?.trim()) refined = refined.filter((u) => String(u?.phone || "").includes(digits(q.phone)));
        const combined = uniqueByMac([...refined, ...localMatches]);
        setResults(combined);
      } catch (e) {
        console.error("searchUsers effect error:", e);
        setResults(uniqueByMac([...localMatches]));
        setError("No se pudo consultar el servidor, mostrando coincidencias locales.");
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [q, canSearch, localMatches]);

  const safeResults = Array.isArray(results) ? results : [];

  const clearFilters = () => {
    setQ({ mac: "", phone: "", name: "", email: "" });
    setResults([]);
    setError("");
  };

  return (
    <div
      className="min-h-screen relative text-slate-100 overflow-hidden"
      // Fondo gamer como Home
      style={{
        background:
          "radial-gradient(1200px 600px at 15% -10%, rgba(108,252,79,0.10), transparent 60%)," +
          "linear-gradient(180deg, #0a0f17 0%, #080c14 35%, #070a11 100%)",
      }}
    >
      {/* Grid neón sutil */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(108,252,79,.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(108,252,79,.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      {/* Halo lateral */}
      <div
        className="absolute -left-24 bottom-[-6rem] w-[28rem] h-[28rem] rounded-full blur-3xl opacity-25 -z-10"
        style={{ background: NEON }}
      />

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4 relative z-10">
        {/* Search Form */}
        <div
          className="rounded-xl p-4 shadow-xl"
          style={{
            background: "rgba(10,13,22,0.78)",
            border: "1px solid rgba(108,252,79,0.18)",
            boxShadow: "0 6px 24px rgba(0,0,0,.45), 0 0 0 1px rgba(108,252,79,.08) inset",
          }}
        >
          <div
            className="mb-4 flex items-center justify-between gap-3"
            style={{ borderBottom: "1px solid rgba(108,252,79,0.16)", paddingBottom: 12 }}
          >
            <div>
              <h1 className="text-base font-semibold text-white">Búsqueda de Usuarios</h1>
              <p className="text-xs text-slate-400 mt-1">Coincidencia en MAC, Teléfono, Nombre o Correo</p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="px-3 py-2 text-xs rounded-md transition-all"
              style={{
                border: `1px solid ${NEON}55`,
                background: "transparent",
                color: "#fff",
                textShadow: `0 0 8px ${NEON}44`,
              }}
            >
              Limpiar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { key: "mac", label: "Dirección MAC", ph: "Ingresa MAC" },
              { key: "phone", label: "Teléfono", ph: "Ingresa teléfono" },
              { key: "name", label: "Nombre", ph: "Ingresa nombre" },
              { key: "email", label: "Correo", ph: "Ingresa correo" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-medium text-slate-300 mb-1">{f.label}</label>
                <input
                  className="w-full rounded-md px-3 py-2 text-xs outline-none"
                  style={{
                    background: "rgba(9,12,20,0.85)",
                    color: "#E5F2E8",
                    border: "1px solid rgba(108,252,79,0.22)",
                    boxShadow: "inset 0 0 0 1px rgba(108,252,79,0.08)",
                  }}
                  placeholder={f.ph}
                  value={q[f.key]}
                  onChange={(e) => setQ({ ...q, [f.key]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Status Messages */}
        {loading && (
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(10,13,22,0.6)", border: `1px solid ${NEON}33` }}
          >
            <div className="text-[12px] text-slate-200 flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 rounded-full animate-spin"
                style={{ borderColor: `${NEON}`, borderTopColor: "transparent" }}
              />
              Buscando usuarios...
            </div>
          </div>
        )}

        {error && (
          <div
            className="rounded-lg p-3"
            style={{ background: "rgba(30,10,14,0.6)", border: "1px solid rgba(244,63,94,0.45)" }}
          >
            <div className="text-[12px]" style={{ color: "#fda4af" }}>
              {error}
            </div>
          </div>
        )}

        {/* Results Table */}
        {safeResults.length > 0 && (
          <div
            className="rounded-xl overflow-hidden shadow-xl"
            style={{
              background: "rgba(10,13,22,0.78)",
              border: "1px solid rgba(108,252,79,0.18)",
              boxShadow: "0 6px 24px rgba(0,0,0,.45), 0 0 0 1px rgba(108,252,79,.08) inset",
            }}
          >
            <div
              className="px-4 py-3"
              style={{ borderBottom: "1px solid rgba(108,252,79,0.16)" }}
            >
              <h2 className="text-sm font-semibold text-white">Resultados de Búsqueda</h2>
              <p className="text-xs text-slate-400 mt-1">{safeResults.length} usuarios encontrados</p>
            </div>

            {/* Mobile View - Card Layout */}
            <div className="md:hidden">
              <div className="max-h-[400px] overflow-y-auto p-3 space-y-3">
                {safeResults.map((u, i) => (
                  <div
                    key={i}
                    className="rounded-lg p-3"
                    style={{
                      background: "rgba(12,18,27,0.85)",
                      border: "1px solid rgba(108,252,79,0.18)",
                      boxShadow: "0 0 0 1px rgba(108,252,79,.06) inset",
                    }}
                  >
                    {[
                      ["MAC:", u.mac],
                      ["Nombre:", u.name || "—"],
                      ["Correo:", u.email || "—"],
                      ["Edad:", u.age || "—"],
                      ["Teléfono:", u.phone || "—"],
                    ].map(([label, val]) => (
                      <div
                        key={label}
                        className="flex justify-between items-start py-2 last:pb-0"
                        style={{ borderBottom: "1px dashed rgba(108,252,79,0.14)" }}
                      >
                        <span className="text-[11px] font-medium text-slate-300">{label}</span>
                        <span className="text-[11px] text-slate-100 text-right">{val}</span>
                      </div>
                    ))}
                    <div className="pt-2">
                      <button
                        className="w-full px-3 py-2 rounded-md text-xs font-medium transition-all"
                        style={{
                          border: `1px solid ${NEON}66`,
                          background: "transparent",
                          color: "#fff",
                          textShadow: `0 0 8px ${NEON}55`,
                        }}
                        onClick={() => nav(`/usuarios/${encodeURIComponent(u.mac)}`)}
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop View - Table Layout */}
            <div className="hidden md:block">
              <div
                className="overflow-x-auto max-h-[400px] overflow-y-auto"
                style={{ scrollbarWidth: "thin", scrollbarColor: `${NEON}22 transparent` }}
              >
                <table className="min-w-full">
                  <thead
                    className="sticky top-0"
                    style={{
                      background: "linear-gradient(180deg, rgba(108,252,79,0.12), rgba(108,252,79,0.06))",
                      backdropFilter: "blur(6px)",
                      borderBottom: "1px solid rgba(108,252,79,0.16)",
                      boxShadow: "0 1px 0 rgba(108,252,79,0.08) inset, 0 8px 24px rgba(0,0,0,.25)",
                    }}
                  >
                    <tr>
                      {["MAC", "Nombre", "Correo", "Edad", "Teléfono", "Acciones"].map((h) => (
                        <th
                          key={h}
                          className="text-left px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-slate-100"
                          style={{ textShadow: `0 0 10px ${NEON}22` }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {safeResults.map((u, i) => (
                      <tr
                        key={i}
                        className="transition-colors"
                        style={{
                          background: i % 2 === 0 ? "rgba(12,18,27,0.75)" : "rgba(12,18,27,0.6)",
                          borderBottom: "1px solid rgba(108,252,79,0.08)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(12,18,27,0.9)";
                          e.currentTarget.style.boxShadow = "inset 0 0 0 1px rgba(108,252,79,0.18)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            i % 2 === 0 ? "rgba(12,18,27,0.75)" : "rgba(12,18,27,0.6)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <td className="px-4 py-3 text-[12px] text-slate-200">{u.mac}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-200">{u.name || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-200">{u.email || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-200">{u.age || "—"}</td>
                        <td className="px-4 py-3 text-[12px] text-slate-200">{u.phone || "—"}</td>
                        <td className="px-4 py-3">
                          <button
                            className="px-3 py-1.5 rounded-md text-xs font-medium transition-all"
                            style={{
                              border: `1px solid ${NEON}66`,
                              background: "transparent",
                              color: "#fff",
                              textShadow: `0 0 8px ${NEON}55`,
                            }}
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

              {/* Scrollbar webkit */}
              <style>{`
                @media (min-width: 768px) {
                  .md\\:block ::-webkit-scrollbar { height: 10px; width: 10px; }
                  .md\\:block ::-webkit-scrollbar-thumb {
                    background: ${NEON}33; border-radius: 8px; border: 2px solid transparent; background-clip: content-box;
                  }
                  .md\\:block ::-webkit-scrollbar-thumb:hover { background: ${NEON}55; }
                  .md\\:block ::-webkit-scrollbar-track { background: transparent; }
                }
              `}</style>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && canSearch && safeResults.length === 0 && (
          <div
            className="rounded-lg p-6 text-center"
            style={{ background: "rgba(10,13,22,0.6)", border: "1px solid rgba(108,252,79,0.2)" }}
          >
            <div className="text-sm text-slate-300">
              No se encontraron resultados para los filtros actuales.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
