import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import nstLogo from '../assets/nst-logo.png'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { session, logout } = useAuth()
  const navigate = useNavigate()
  
  const linkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#EAF2FF] text-[#0878D1] font-semibold'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`
  const close = () => setOpen(false)

  async function signOut() {
    await logout()
    close()
    navigate('/')
  }

  // Generate avatar initials like the student portal (e.g. "AJ")
  const initials = (
    session?.profile?.fullName
      ? session.profile.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
      : session?.email?.slice(0, 2).toUpperCase() || 'U'
  )

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-sm shadow-xs">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5"
      >
        {/* Brand / Logo */}
        <Link
          to="/"
          onClick={close}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
          aria-label="NST Alumni Association Home"
        >
          <img
            src={nstLogo}
            alt="Newton School of Technology"
            className="h-8 w-auto object-contain sm:h-9"
          />
          <span className="hidden h-5 w-px bg-slate-300 sm:block" />
          <span className="text-sm font-semibold tracking-tight text-[#064477] sm:text-base">
            Alumni Association
          </span>
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="navigation-links"
          onClick={() => setOpen(!open)}
          className="inline-flex items-center justify-center rounded-lg border border-slate-300 p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-[#0878D1] md:hidden"
        >
          <span className="sr-only">{open ? 'Close main menu' : 'Open main menu'}</span>
          {open ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Navigation links */}
        <div
          id="navigation-links"
          className={`${
            open ? 'flex' : 'hidden'
          } w-full min-w-0 flex-col gap-1 border-t border-slate-100 pt-3 md:flex md:w-auto md:flex-row md:flex-wrap md:items-center md:justify-end md:gap-1.5 md:border-t-0 md:pt-0`}
        >
          <NavLink to="/" end onClick={close} className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/about" onClick={close} className={linkClass}>
            About
          </NavLink>
          <NavLink to="/alumni-association" onClick={close} className={linkClass}>
            Association
          </NavLink>
          <NavLink to="/contact" onClick={close} className={linkClass}>
            Contact
          </NavLink>
          <NavLink to="/directory" onClick={close} className={linkClass}>
            Directory
          </NavLink>
          <NavLink to="/donations" onClick={close} className={linkClass}>
            Donate
          </NavLink>
          <NavLink to="/stories" onClick={close} className={linkClass}>
            Stories
          </NavLink>
          <NavLink to="/feedback" onClick={close} className={linkClass}>
            Feedback
          </NavLink>

          {session && (
            <>
              <NavLink to="/donations/history" onClick={close} className={linkClass}>
                My donations
              </NavLink>
              <NavLink to="/jobs" onClick={close} className={linkClass}>
                Jobs
              </NavLink>
              <NavLink to="/events" onClick={close} className={linkClass}>
                Events
              </NavLink>
              <NavLink to="/my-events" onClick={close} className={linkClass}>
                My events
              </NavLink>
              <NavLink to="/mentorship" onClick={close} className={linkClass}>
                Mentorship
              </NavLink>
              {session.role !== 'ADMIN' && (
                <NavLink to="/applications" onClick={close} className={linkClass}>
                  Applications
                </NavLink>
              )}
              {(session?.role === 'ALUMNI' || session?.role === 'ADMIN') && (
                <NavLink to="/my-jobs" onClick={close} className={linkClass}>
                  My jobs
                </NavLink>
              )}
            </>
          )}

          {session ? (
            <div className="flex flex-col gap-1 border-t border-slate-100 pt-2 md:flex-row md:items-center md:gap-2 md:border-t-0 md:border-l md:border-slate-200 md:pl-2 md:pt-0">
              {session.role === 'ADMIN' && (
                <NavLink
                  to="/admin"
                  onClick={close}
                  className="rounded-lg bg-[#0878D1] px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#0665B2]"
                >
                  Admin Panel
                </NavLink>
              )}
              <NavLink
                to="/profile"
                onClick={close}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF2FF] text-xs font-bold text-[#0878D1]">
                  {initials}
                </span>
                <span className="md:hidden">My Profile</span>
              </NavLink>
              <button
                type="button"
                onClick={signOut}
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:py-1.5"
              >
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1 border-t border-slate-100 pt-2 md:flex-row md:items-center md:gap-2 md:border-t-0 md:border-l md:border-slate-200 md:pl-2 md:pt-0">
              <NavLink
                to="/register"
                onClick={close}
                className="rounded-lg border border-slate-300 px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Register
              </NavLink>
              <NavLink
                to="/login"
                onClick={close}
                className="rounded-lg bg-[#0878D1] px-3.5 py-1.5 text-sm font-semibold text-white shadow-xs hover:bg-[#0665B2]"
              >
                Sign in
              </NavLink>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
