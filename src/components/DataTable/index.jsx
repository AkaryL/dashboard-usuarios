// src/components/DataTable/index.jsx
import React from "react";

export default function DataTable({ columns = [], rows = [] }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="bg-white rounded-xl shadow overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-3 py-2">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {safeRows.length ? (
            safeRows.map((r, i) => (
              <tr key={i} className="border-t">
                {columns.map((c) => (
                  <td key={c.key} className="px-3 py-2">
                    {c.render ? c.render(r[c.key], r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-6 text-gray-400 text-center"
              >
                Sin datos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
