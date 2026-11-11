import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  const linkClass = ({ isActive }) => `rounded px-3 py-2 text-sm font-semibold ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`
  const close = () => setOpen(false)

  async function signOut() {
    await logout()
    close()
    navigate('/')
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav aria-label="Main navigation" className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-5">
        <Link to="/" onClick={close} className="font-bold tracking-tight text-indigo-900">GEC <span className="font-normal text-slate-600">Alumni Association</span></Link>
        <button type="button" aria-expanded={open} aria-controls="navigation-links" onClick={() => setOpen(!open)} className="rounded border border-slate-300 px-3 py-2 text-sm md:hidden">{open ? 'Close menu' : 'Menu'}</button>
        <div id="navigation-links" className={`${open ? 'flex' : 'hidden'} w-full flex-col gap-2 md:flex md:w-auto md:flex-row md:items-center`}>
          <NavLink to="/" end onClick={close} className={linkClass}>Home</NavLink>
          <NavLink to="/about" onClick={close} className={linkClass}>About</NavLink>
          <NavLink to="/alumni-association" onClick={close} className={linkClass}>Association</NavLink>
          <NavLink to="/contact" onClick={close} className={linkClass}>Contact</NavLink>
          <NavLink to="/directory" onClick={close} className={linkClass}>Directory</NavLink>
          <NavLink to="/donations" onClick={close} className={linkClass}>Donate</NavLink>
          <NavLink to="/stories" onClick={close} className={linkClass}>Stories</NavLink>
          {session && <NavLink to="/donations/history" onClick={close} className={linkClass}>My donations</NavLink>}
          {session && <NavLink to="/jobs" onClick={close} className={linkClass}>Jobs</NavLink>}
          {session && <NavLink to="/events" onClick={close} className={linkClass}>Events</NavLink>}
          {session && <NavLink to="/my-events" onClick={close} className={linkClass}>My events</NavLink>}
          {session && <NavLink to="/mentorship" onClick={close} className={linkClass}>Mentorship</NavLink>}
          {session && session.role !== 'ADMIN' && <NavLink to="/applications" onClick={close} className={linkClass}>Applications</NavLink>}
          {(session?.role === 'ALUMNI' || session?.role === 'ADMIN') && <NavLink to="/my-jobs" onClick={close} className={linkClass}>My jobs</NavLink>}
          {session ? (
            <>
              {session.role === 'ADMIN' && (
                <NavLink to="/admin" onClick={close} className="rounded bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
                  Admin Panel
                </NavLink>
              )}
              <NavLink to="/profile" onClick={close} className={linkClass}>My profile</NavLink>
              <button onClick={signOut} className="rounded px-3 py-2 text-left text-sm font-semibold text-slate-600 hover:bg-slate-100">Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/register" onClick={close} className={linkClass}>Register</NavLink>
              <NavLink to="/login" onClick={close} className={linkClass}>Sign in</NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
