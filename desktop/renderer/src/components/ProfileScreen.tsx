import { useRef, useState, type ChangeEvent, type FormEvent } from "react"

import ProfileAvatar from "./ProfileAvatar"
import WorkspaceLayout from "./WorkspaceLayout"
import type { PersonaSidebarItem } from "./PersonaSidebarNavigation"

interface ProfileScreenProps {
  onBackToDashboard: () => void
  onOpenSettings: () => void
  onNavigate: (item: PersonaSidebarItem) => void
}

function ProfileScreen({
  onBackToDashboard,
  onOpenSettings,
  onNavigate,
}: ProfileScreenProps) {
  const [userName, setUserName] = useState(
    () => localStorage.getItem("personaAI_userName") || ""
  )
  const [email, setEmail] = useState(
    () => localStorage.getItem("personaAI_userEmail") || ""
  )
  const [profileImage, setProfileImage] = useState<string | null>(
    () => localStorage.getItem("personaAI_profileImage") || null
  )
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""

    if (!file) return

    if (!file.type.startsWith("image/")) {
      setError("Choose an image file for your profile photo.")
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setProfileImage(reader.result)
        setError("")
        setSaved(false)
      } else {
        setError("The selected photo could not be read.")
      }
    }
    reader.onerror = () => setError("The selected photo could not be read.")
    reader.readAsDataURL(file)
  }

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmedName = userName.trim()
    const trimmedEmail = email.trim()

    if (!trimmedName || !trimmedEmail) {
      setError("Enter your name and email address.")
      return
    }

    try {
      localStorage.setItem("personaAI_userName", trimmedName)
      localStorage.setItem("personaAI_userEmail", trimmedEmail)
      if (profileImage) {
        localStorage.setItem("personaAI_profileImage", profileImage)
      } else {
        localStorage.removeItem("personaAI_profileImage")
      }

      setUserName(trimmedName)
      setEmail(trimmedEmail)
      setError("")
      setSaved(true)
      window.dispatchEvent(new Event("personaAI-profile-updated"))
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? `Could not save your profile: ${saveError.message}`
          : "Could not save your profile."
      )
    }
  }

  return (
    <main className="min-h-screen bg-[#0B1020] text-white">
      <WorkspaceLayout
          activeItem="home"
          onOpenSettings={onOpenSettings}
          onNavigate={onNavigate}
          background={false}
      >

        <section className="relative min-h-screen flex-1 p-12">
          <header className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300">Your account</p>
              <h1 className="mt-1 text-3xl font-bold">Profile</h1>
              <p className="mt-2 text-gray-400">
                Manage your personal information.
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

          <form
            onSubmit={handleSave}
            className="mt-10 w-full max-w-5xl rounded-2xl border border-white/10 bg-[#11182B] p-10"
          >
            <div className="flex flex-wrap items-center gap-7 rounded-xl border border-[#263449] bg-[#0F172A] p-8">
              <ProfileAvatar
                image={profileImage}
                name={userName}
                className="h-32 w-32 shrink-0 border-2 border-white/10 bg-gradient-to-br from-blue-500 to-purple-500 text-4xl font-bold text-white"
              />

              <div className="min-w-0 flex-1">
                <p className="font-medium">Profile Photo</p>
                <p className="mt-1 text-sm text-gray-500">
                  Add a photo to personalize your account.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-lg bg-[#2563EB] px-4 py-2 text-sm font-medium transition hover:bg-[#1D4ED8]"
                  >
                    {profileImage ? "Change Photo" : "Upload Photo"}
                  </button>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImage(null)
                        setSaved(false)
                      }}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:bg-white/10"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                aria-label="Upload profile photo"
              />
            </div>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">
                  Name
                </span>
                <input
                  type="text"
                  value={userName}
                  onChange={(event) => {
                    setUserName(event.target.value)
                    setSaved(false)
                  }}
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-5 py-4 text-base text-white outline-none transition focus:border-sky-400/60"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-300">
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setSaved(false)
                  }}
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-5 py-4 text-base text-white outline-none transition focus:border-sky-400/60"
                />
              </label>
            </div>

            {error && (
              <p role="alert" className="mt-4 text-sm text-red-300">
                {error}
              </p>
            )}
            {saved && (
              <p role="status" className="mt-4 text-sm text-green-300">
                Changes saved.
              </p>
            )}

            <button
              type="submit"
              className="mt-7 rounded-xl bg-[#2563EB] px-6 py-3.5 text-base font-semibold text-white transition hover:bg-[#1D4ED8]"
            >
              Save Changes
            </button>
          </form>
        </section>
      </WorkspaceLayout>
    </main>
  )
}

export default ProfileScreen
