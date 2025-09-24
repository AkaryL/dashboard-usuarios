// src/components/DataTable/index.jsx
import React from "react";

const NEON = "#6CFC4F";

export default function DataTable({ columns = [], rows = [] }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div
      className="overflow-hidden "
      style={{
        background: "rgba(10,13,22,0.75)",              
      }}
    >
      {/* Mobile View - Card Layout */}
      <div className="md:hidden">
        <div className="max-h-[350px] overflow-y-auto p-3 space-y-3">
          {safeRows.length ? (
            safeRows.map((r, i) => (
              <div
                key={i}
                className="rounded-lg p-3 transition-shadow"
                style={{
                  background: "rgba(12,18,27,0.85)",
                  border: "1px solid rgba(108,252,79,0.18)",
                  boxShadow: "0 0 0 1px rgba(108,252,79,.06) inset",
                }}
              >
                {columns.map((c) => (
                  <div
                    key={c.key}
                    className="flex justify-between items-start py-2 last:pb-0"
                    style={{ borderBottom: "1px dashed rgba(108,252,79,0.14)" }}
                  >
                    <span className="text-[11px] font-medium text-slate-300 w-1/2 pr-2">
                      {c.header}
                    </span>
                    <span className="text-[11px] text-slate-100 w-1/2 text-right"
                          style={{ textShadow: `0 0 8px ${NEON}22` }}>
                      {c.render ? c.render(r[c.key], r) : r[c.key] || "—"}
                    </span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block">
        <div
          className="overflow-x-auto overflow-y-auto h-[1000px]"
          // Scrollbar gamer sutil (webkit)
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `${NEON}22 transparent`,
          }}
        >
          <table className="min-w-full">
            <thead
              className="sticky top-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(108,252,79,0.12), rgba(108,252,79,0.06))",
                backdropFilter: "blur(6px)",
                borderBottom: "1px solid rgba(108,252,79,0.16)",
                boxShadow: "0 1px 0 rgba(108,252,79,0.08) inset, 0 8px 24px rgba(0,0,0,.25)",
              }}
            >
              <tr>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="text-left px-4 py-3 text-[11px] font-semibold tracking-wider uppercase text-slate-100"
                    style={{ textShadow: `0 0 10px ${NEON}22` }}
                  >
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {safeRows.length ? (
                safeRows.map((r, i) => (
                  <tr
                    key={i}
                    className="transition-colors"
                    style={{
                      background:
                        i % 2 === 0 ? "rgba(12,18,27,0.75)" : "rgba(12,18,27,0.6)",
                      borderBottom: "1px solid rgba(108,252,79,0.08)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(12,18,27,0.9)";
                      e.currentTarget.style.boxShadow =
                        "inset 0 0 0 1px rgba(108,252,79,0.18)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        i % 2 === 0 ? "rgba(12,18,27,0.75)" : "rgba(12,18,27,0.6)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {columns.map((c) => (
                      <td
                        key={c.key}
                        className="px-4 py-3 align-top"
                        style={{ fontSize: 12, color: "#DCE7DD" }}
                      >
                        {c.render ? c.render(r[c.key], r) : r[c.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-xs"
                    style={{ color: "rgba(220,231,221,0.65)" }}
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Estilos scrollbar webkit */}
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
  );
}
