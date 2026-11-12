export function AdminTable({ columns, data = [], emptyMessage = 'No records found.' }) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-[640px] divide-y divide-slate-200 text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600">
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                scope="col"
                className={`px-4 py-3.5 sm:px-6 ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-10 text-center text-sm text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="hover:bg-slate-50/75 transition-colors">
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    className={`whitespace-nowrap px-4 py-3.5 text-slate-700 sm:px-6 ${col.cellClassName || ''}`}
                  >
                    {col.render ? col.render(row, rowIdx) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function StatusBadge({ status, label }) {
  const normalized = (status || '').toUpperCase()
  let colorClass = 'bg-slate-100 text-slate-700 border-slate-200'

  if (normalized === 'ACTIVE' || normalized === 'APPROVED' || normalized === 'RESOLVED') {
    colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200'
  } else if (normalized === 'PENDING' || normalized === 'REVIEW' || normalized === 'SUBMITTED') {
    colorClass = 'bg-amber-50 text-amber-700 border-amber-200'
  } else if (normalized === 'REJECTED' || normalized === 'INACTIVE' || normalized === 'SUSPENDED') {
    colorClass = 'bg-rose-50 text-rose-700 border-rose-200'
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {label || status}
    </span>
  )
}
