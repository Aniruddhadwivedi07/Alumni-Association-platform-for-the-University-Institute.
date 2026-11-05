import { Link } from 'react-router-dom'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-8 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
        <p>© {year} Government Engineering College Alumni Association. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-6">
          <Link to="/about" className="font-semibold text-indigo-700 hover:underline">
            About
          </Link>
          <Link to="/alumni-association" className="font-semibold text-indigo-700 hover:underline">
            Association
          </Link>
          <Link to="/contact" className="font-semibold text-indigo-700 hover:underline">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}
