export default function FormField({ label, name, error, ...props }) {
  const errorId = `${name}-error`
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-semibold text-slate-700">{label}</label>
      <input
        id={name}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
        {...props}
      />
      {error && <p id={errorId} className="text-sm text-red-700">{error}</p>}
    </div>
  )
}
