import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="text-4xl font-bold text-slate-900">Alumni Association</h1>
      <p className="mt-4 text-lg text-slate-600">Connecting alumni, students, and our institution.</p>
      <Link to="/about" className="mt-6 inline-block text-indigo-700 underline">About the association</Link>
    </section>
  )
}
