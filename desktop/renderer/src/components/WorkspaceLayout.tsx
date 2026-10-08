import type { ReactNode } from "react"

import PersonaSidebarNavigation, {
  type PersonaSidebarItem,
} from "./PersonaSidebarNavigation"

interface WorkspaceLayoutProps {
  activeItem: PersonaSidebarItem
  onNavigate: (item: PersonaSidebarItem) => void
  onOpenSettings: () => void
  background?: "standard" | "dashboard" | false
  children: ReactNode
}

function WorkspaceLayout({
  activeItem,
  onNavigate,
  onOpenSettings,
  background = "standard",
  children,
}: WorkspaceLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {background === "standard" && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-purple-600/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-cyan-500/5 blur-3xl" />
        </div>
      )}
      {background === "dashboard" && (
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-[20%] top-[-10%] h-96 w-96 rounded-full bg-sky-500/8 blur-[130px]" />
          <div className="absolute right-[-5%] top-[30%] h-96 w-96 rounded-full bg-indigo-500/8 blur-[130px]" />
          <div className="absolute bottom-[-10%] left-[35%] h-96 w-96 rounded-full bg-cyan-500/5 blur-[130px]" />
        </div>
      )}
      <PersonaSidebarNavigation
        activeItem={activeItem}
        onOpenSettings={onOpenSettings}
        onNavigate={onNavigate}
      />
      {children}
    </div>
  )
}

export default WorkspaceLayout
