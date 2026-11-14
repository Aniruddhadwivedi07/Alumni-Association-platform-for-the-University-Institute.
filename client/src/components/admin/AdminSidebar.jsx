import { NavLink } from 'react-router-dom'
import nstLogo from '../../assets/nst-logo.png'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/admin', icon: '📊', end: true },
  { label: 'Alumni Verification', to: '/admin/verification', icon: '✅' },
  { label: 'Alumni Management', to: '/admin/alumni', icon: '🎓' },
  { label: 'Events', to: '/admin/events', icon: '📅' },
  { label: 'Jobs', to: '/admin/jobs', icon: '💼' },
  { label: 'Donations', to: '/admin/donations', icon: '🎁' },
  { label: 'Mentorship', to: '/admin/mentorship', icon: '🤝' },
  { label: 'Success Stories', to: '/admin/success-stories', icon: '🌟' },
  { label: 'Feedback & Surveys', to: '/admin/surveys', icon: '📋' },
  { label: 'User Management', to: '/admin/users', icon: '👥' },
]

export default function AdminSidebar({ mobileOpen, onCloseMobile }) {
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? 'bg-[#0878D1] text-white shadow-xs'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`

  const content = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <NavLink to="/admin" className="flex items-center gap-2.5" onClick={onCloseMobile}>
          <div className="rounded bg-white p-1">
            <img src={nstLogo} alt="NST" className="h-6 w-auto object-contain" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">Admin Console</span>
        </NavLink>
        {mobileOpen && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded p-1 text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        )}
      </div>

      <div className="px-4 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Management Modules
        </span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onCloseMobile}
            className={linkClass}
          >
            <span className="text-base" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-4 text-xs text-slate-400">
        <p className="font-semibold text-slate-200">NST Alumni Admin Console</p>
        <p className="mt-0.5 text-slate-500">Newton School of Technology</p>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop static sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-800 lg:block">
        {content}
      </aside>

      {/* Mobile drawer backdrop and sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-full shadow-2xl">
            {content}
          </div>
        </div>
      )}
    </>
  )
}
