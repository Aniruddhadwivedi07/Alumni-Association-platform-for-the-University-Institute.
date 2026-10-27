import { Link } from 'react-router-dom'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Government Engineering College Alumni Association</p>
        <Link to="/about" className="font-semibold text-indigo-700 hover:underline">About our community</Link>
      </div>
    </footer>
  )
}
