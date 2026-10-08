import { useEffect, useState } from "react"

import WorkspaceLayout from "./WorkspaceLayout"
import type { PersonaSidebarItem } from "./PersonaSidebarNavigation"

interface SettingsScreenProps {
  onBackToDashboard: () => void
  onOpenSettings: () => void
  onNavigate: (item: PersonaSidebarItem) => void
}

function SettingsScreen({
  onBackToDashboard,
  onOpenSettings,
  onNavigate,
}: SettingsScreenProps) {
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("personaAI_notifications") !== "false"
  )
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("personaAI_darkMode") !== "false"
  )

  useEffect(() => {
    localStorage.setItem("personaAI_notifications", String(notifications))
  }, [notifications])

  useEffect(() => {
    localStorage.setItem("personaAI_darkMode", String(darkMode))
  }, [darkMode])

  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <WorkspaceLayout
          activeItem="home"
          onOpenSettings={onOpenSettings}
          onNavigate={onNavigate}
          background={false}
      >

        <section className="relative min-h-screen flex-1 p-10">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">Personalize your experience</p>
              <h2 className="mt-1 text-3xl font-bold">Settings</h2>
              <p className="mt-2 text-gray-400">
                Customize how PersonaAI works for you.
              </p>
            </div>

            <button
              type="button"
              onClick={onBackToDashboard}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
            >
              ← Dashboard
            </button>
          </header>

          <div className="mt-10 grid max-w-5xl gap-6">
            <section className="rounded-2xl border border-white/10 bg-[#11182B] p-6">
              <h3 className="text-lg font-semibold">Preferences</h3>
              <p className="mt-1 text-sm text-gray-500">
                Customize how PersonaAI works for you.
              </p>

              <div className="mt-5 space-y-4">
                <button
                  type="button"
                  aria-pressed={darkMode}
                  onClick={() => setDarkMode((enabled) => !enabled)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#0B1020] p-4 text-left transition hover:border-white/10"
                >
                  <div>
                    <p className="font-medium">Dark Mode</p>
                    <p className="text-xs text-gray-500">Use the dark interface.</p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`h-6 w-11 rounded-full p-1 transition ${
                      darkMode ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white transition ${
                        darkMode ? "ml-auto" : "ml-0"
                      }`}
                    />
                  </span>
                </button>

                <button
                  type="button"
                  aria-pressed={notifications}
                  onClick={() => setNotifications((enabled) => !enabled)}
                  className="flex w-full items-center justify-between rounded-xl border border-white/5 bg-[#0B1020] p-4 text-left transition hover:border-white/10"
                >
                  <div>
                    <p className="font-medium">Notifications</p>
                    <p className="text-xs text-gray-500">
                      Receive assistant notifications.
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className={`h-6 w-11 rounded-full p-1 transition ${
                      notifications ? "bg-blue-500" : "bg-gray-600"
                    }`}
                  >
                    <span
                      className={`block h-4 w-4 rounded-full bg-white transition ${
                        notifications ? "ml-auto" : "ml-0"
                      }`}
                    />
                  </span>
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#11182B] p-6">
              <h3 className="text-lg font-semibold">Privacy &amp; Offline</h3>
              <p className="mt-1 text-sm text-gray-500">
                PersonaAI desktop data preferences.
              </p>
              <div className="mt-5 flex items-center justify-between rounded-xl border border-[#263449] bg-[#0F172A] p-4">
                <div>
                  <p className="font-medium">Offline Mode</p>
                  <p className="text-xs text-gray-500">
                    Keep your personal workspace available offline.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                  <span className="text-sm text-green-400">Active</span>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#11182B] p-6">
              <h3 className="text-lg font-semibold">About PersonaAI</h3>
              <p className="mt-2 text-sm leading-6 text-gray-500">
                PersonaAI is your personal AI assistant designed to help with
                conversations, productivity, questions, and everyday tasks.
              </p>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-xs text-gray-600">Version 1.0.0</p>
                <p className="text-xs text-gray-600">Desktop Edition</p>
              </div>
            </section>
          </div>
        </section>
      </WorkspaceLayout>
    </main>
  )
}

export default SettingsScreen
