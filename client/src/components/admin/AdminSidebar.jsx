import { NavLink } from 'react-router-dom'

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
        ? 'bg-indigo-700 text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`

  const content = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-100">
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-6">
        <NavLink to="/admin" className="flex items-center gap-2 font-bold text-white tracking-tight" onClick={onCloseMobile}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-extrabold text-white">
            AA
          </span>
          <span className="text-base">Admin Portal</span>
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
          Main Navigation
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
        <p className="font-semibold text-slate-300">GEC Admin Console</p>
        <p className="mt-0.5">Role: Administrator</p>
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
