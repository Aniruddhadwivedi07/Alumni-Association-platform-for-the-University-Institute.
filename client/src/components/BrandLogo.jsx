export default function BrandLogo({ className = '', variant = 'full' }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0878D1] to-[#004B87] text-white shadow-xs">
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
      </div>
      {variant !== 'icon-only' && (
        <div className="flex flex-col text-left">
          <span className="text-sm font-bold tracking-tight text-[#172B45] sm:text-base leading-none">
            Alumni Association
          </span>
          <span className="text-[11px] font-medium text-slate-500 mt-0.5">
            University & Institute Network
          </span>
        </div>
      )}
    </div>
  )
}
