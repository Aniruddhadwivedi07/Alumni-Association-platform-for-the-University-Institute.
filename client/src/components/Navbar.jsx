import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const linkClass = ({ isActive }) => `rounded px-3 py-2 text-sm font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link to="/" onClick={() => setOpen(false)} className="font-bold tracking-tight text-indigo-900">GEC <span className="font-normal text-slate-600">Alumni Association</span></Link>
        <button type="button" aria-expanded={open} aria-controls="navigation-links" onClick={() => setOpen(!open)} className="rounded border border-slate-300 px-3 py-2 text-sm md:hidden">{open ? 'Close menu' : 'Menu'}</button>
        <div id="navigation-links" className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-2 md:flex md:w-auto md:flex-row`}>
          <NavLink to="/" end onClick={() => setOpen(false)} className={linkClass}>Home</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)} className={linkClass}>About</NavLink>
        </div>
      </nav>
    </header>
  )
}
