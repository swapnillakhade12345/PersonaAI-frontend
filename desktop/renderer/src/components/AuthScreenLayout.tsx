import type { ReactNode } from "react"

interface AuthScreenLayoutProps {
  children: ReactNode
  onHome?: () => void
  homeLabel?: string
  homeAriaLabel?: string
  className?: string
}

function AuthScreenLayout({
  children,
  onHome,
  homeLabel = "Home",
  homeAriaLabel = "Go to Home",
  className = "relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1220] px-6 py-10 text-slate-50",
}: AuthScreenLayoutProps) {
  return (
    <main className={className}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.08),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:46px_46px] opacity-[0.03]" />

      {onHome && (
        <button
          type="button"
          onClick={onHome}
          aria-label={homeAriaLabel}
          className="group absolute left-6 top-6 z-20 flex items-center gap-2 rounded-full border border-[#263449] bg-[#111827]/80 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-sky-400/30 hover:bg-[#162033] hover:text-white"
        >
          <span className="text-lg leading-none transition-transform duration-200 group-hover:-translate-x-1">
            ←
          </span>
          {homeLabel}
        </button>
      )}

      {children}
    </main>
  )
}

export default AuthScreenLayout
