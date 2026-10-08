import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import PersonaLogo from "./PersonaLogo"
import ProfileAvatar from "./ProfileAvatar"
import { dispatchUserAccountAction } from "../userAccountEvents"

export type PersonaSidebarItem = "home" | "chat" | "chatHistory" | "files" | "tasks"

export interface PersonaSidebarNavigationProps {
  activeItem?: PersonaSidebarItem
  onNavigate?: (item: PersonaSidebarItem) => void
  onOpenSettings?: () => void
}

const NAV_ITEMS: Array<{ id: PersonaSidebarItem; label: string; icon: string }> = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "chat", label: "New  Chat", icon: "◉" },
  { id: "chatHistory", label: "Chat History", icon: "◷" },
  { id: "files", label: "Files", icon: "▣" },
  { id: "tasks", label: "Tasks", icon: "✓" },
]

function PersonaSidebarNavigation({
  activeItem = "home",
  onNavigate,
  onOpenSettings,
}: PersonaSidebarNavigationProps) {
  const [userName, setUserName] = useState(
    () => localStorage.getItem("personaAI_userName") || "User"
  )
  const [profileImage, setProfileImage] = useState<string | null>(
    () => localStorage.getItem("personaAI_profileImage") || null
  )
  const [email, setEmail] = useState(
    () => localStorage.getItem("personaAI_userEmail") || ""
  )
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] = useState(false)
  const accountMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleProfileUpdate = () => {
      setUserName(localStorage.getItem("personaAI_userName") || "User")
      setProfileImage(localStorage.getItem("personaAI_profileImage") || null)
      setEmail(localStorage.getItem("personaAI_userEmail") || "")
    }

    window.addEventListener("personaAI-profile-updated", handleProfileUpdate)

    return () => {
      window.removeEventListener("personaAI-profile-updated", handleProfileUpdate)
    }
  }, [])

  useEffect(() => {
    if (!isPopupOpen && !isLogoutConfirmationOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (
        isPopupOpen &&
        event.target instanceof Node &&
        !accountMenuRef.current?.contains(event.target)
      ) {
        setIsPopupOpen(false)
      }
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPopupOpen(false)
        setIsLogoutConfirmationOpen(false)
      }
    }

    document.addEventListener("pointerdown", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isPopupOpen, isLogoutConfirmationOpen])

  return (
    <>
      <aside className="sticky top-0 flex h-screen max-h-screen w-64 shrink-0 flex-col overflow-hidden border-r border-[#263449] bg-[#111827]/95 p-5 backdrop-blur-xl">
      <div className="flex shrink-0 items-center gap-3">
        <PersonaLogo size={52} />

        <div className="flex flex-col justify-center">
          <h1 className="text-base font-semibold leading-none tracking-wide text-white">
            PersonaAI
          </h1>

          <p className="mt-1 text-[10px] leading-none tracking-[0.12em] text-gray-500">
            Offline Personal Intelligence
          </p>
        </div>
      </div>

      <nav className="mt-10 min-h-0 flex-1 space-y-1.5 overflow-hidden">
        {NAV_ITEMS.map(({ id, label, icon }) => {
          const isActive = activeItem === id

          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate?.(id)}
              className={[
                "group flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm transition-all duration-200",
                isActive
                  ? "border border-sky-500/20 bg-[#162033] text-sky-300 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.04)]"
                  : "text-gray-400 hover:bg-white/5 hover:text-white",
              ].join(" ")}
            >
              <span className="text-base transition-transform group-hover:scale-110">{icon}</span>
              <span className={isActive ? "font-medium" : ""}>{label}</span>
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.9)]" />
              )}
            </button>
          )
        })}
      </nav>

        <div className="relative mt-auto shrink-0 border-t border-[#263449] pt-4" ref={accountMenuRef}>
          {isPopupOpen && (
            <div
              role="menu"
              aria-label="User account"
              className="absolute bottom-[calc(100%+0.75rem)] left-0 right-0 z-50 overflow-hidden rounded-2xl border border-[#263449] bg-[#111827] p-2 shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
            >
              <div className="flex items-center gap-3 border-b border-[#263449] px-3 py-3">
                <ProfileAvatar
                  image={profileImage}
                  name={userName}
                  className="h-11 w-11 shrink-0 border border-[#263449] bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-sm font-semibold text-white"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">
                    {userName}
                  </p>
                  <p className="truncate text-xs text-slate-400">
                    {email || "No email added"}
                  </p>
                </div>
              </div>

              <div className="space-y-1 pt-2">
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsPopupOpen(false)
                    dispatchUserAccountAction("profile")
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  <span aria-hidden="true">👤</span>
                  <span>Profile</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsPopupOpen(false)
                    onOpenSettings?.()
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  <span aria-hidden="true">⚙</span>
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsPopupOpen(false)
                    dispatchUserAccountAction("add-account")
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-gray-300 transition hover:bg-white/5 hover:text-white"
                >
                  <span aria-hidden="true">＋</span>
                  <span>Add Account</span>
                </button>
                <div className="my-1 border-t border-[#263449]" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setIsPopupOpen(false)
                    setIsLogoutConfirmationOpen(true)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
                >
                  <span aria-hidden="true">↪</span>
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="button"
            aria-haspopup="menu"
            aria-expanded={isPopupOpen}
            onClick={() => setIsPopupOpen((open) => !open)}
            className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-200 hover:bg-white/5"
          >
            <ProfileAvatar
              image={profileImage}
              name={userName}
              className="h-11 w-11 border border-[#263449] bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-sm font-semibold text-white"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{userName}</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                Personal Account
              </p>
            </div>
          </button>
        </div>
      </aside>
      {isLogoutConfirmationOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setIsLogoutConfirmationOpen(false)
              }
            }}
          >
            <section
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="persona-logout-title"
              className="w-full max-w-sm rounded-2xl border border-[#263449] bg-[#111827] p-6 text-white shadow-[0_18px_45px_rgba(0,0,0,0.45)]"
            >
              <h2 id="persona-logout-title" className="text-lg font-semibold">
                Are you sure you want to log out?
              </h2>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsLogoutConfirmationOpen(false)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogoutConfirmationOpen(false)
                    dispatchUserAccountAction("log-out")
                  }}
                  className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500"
                >
                  Log Out
                </button>
              </div>
            </section>
          </div>,
          document.body
        )}
    </>
  )
}

export default PersonaSidebarNavigation
