// src/components/DataTable2/index.jsx
import React from "react";

export default function DataTable2({ columns = [], rows = [] }) {
  const safeRows = Array.isArray(rows) ? rows : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200/80 dark:border-gray-700/80 overflow-hidden">
      {/* Mobile View - Card Layout */}
      <div className="md:hidden">
        <div className="max-h-[300px] overflow-y-auto p-3 space-y-3">
          {safeRows.length ? (
            safeRows.map((r, i) => (
              <div key={i} className="bg-gray-50/50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-100 dark:border-gray-600">
                {columns.map((c) => (
                  <div key={c.key} className="flex justify-between items-start py-1 border-b border-gray-100 dark:border-gray-600 last:border-b-0">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300 w-1/3">{c.header}:</span>
                    <span className="text-xs text-gray-900 dark:text-white w-2/3 text-right">
                      {c.render ? c.render(r[c.key], r) : r[c.key] || "—"}
                    </span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-xs">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden md:block">
        <div className="overflow-x-auto overflow-y-auto h-[300px]">
          <table className="min-w-full">
            <thead className="bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 sticky top-0">
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className="text-left bg-white dark:bg-gray-800 px-4 py-3 text-xs font-medium text-gray-900 dark:text-white">
                    {c.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {safeRows.length ? (
                safeRows.map((r, i) => (
                  <tr 
                    key={i} 
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                  >
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 text-xs text-gray-600 dark:text-gray-300">
                        {c.render ? c.render(r[c.key], r) : r[c.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-gray-500 dark:text-gray-400 text-center text-xs"
                  >
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}