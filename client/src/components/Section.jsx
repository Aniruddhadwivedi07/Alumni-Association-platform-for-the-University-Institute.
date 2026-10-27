export default function Section({ id, title, children }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  )
}
