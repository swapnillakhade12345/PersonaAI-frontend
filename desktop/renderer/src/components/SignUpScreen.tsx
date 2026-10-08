import { useState } from "react"

import AuthScreenLayout from "./AuthScreenLayout"
import PersonaLogo from "./PersonaLogo"

interface SignUpScreenProps {
  onLogin: () => void
  onHome: () => void
}

function SignUpScreen({ onLogin, onHome }: SignUpScreenProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Please fill all fields.")
      return
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.")
      return
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.")
      return
    }

    // Save user information locally.
    // Password is intentionally NOT stored.
    localStorage.setItem("personaAI_userName", name.trim())
    localStorage.setItem("personaAI_userEmail", email.trim())

    setMessage("Account created successfully! 🎉")

    setTimeout(() => {
      onLogin()
    }, 700)
  }

  return (
    <AuthScreenLayout
      onHome={onHome}
      homeLabel="Back"
      homeAriaLabel="Go back to Home"
    >
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#263449] bg-[#111827]/95 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.38)] backdrop-blur-xl">

        {/* Top Glow */}
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400/70 to-transparent" />

        {/* Logo */}
        <div className="flex justify-center">
          <PersonaLogo size="lg" />
        </div>

        {/* Heading */}
        <h1 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Create Your Account
        </h1>

        <p className="mt-2 text-center text-sm leading-6 text-slate-300">
          Join PersonaAI and start your smarter journey.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">

          {/* Full Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Full Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-blue-400/60 focus:bg-[#0D1426] focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-blue-400/60 focus:bg-[#0D1426] focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 pr-12 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-blue-400/60 focus:bg-[#0D1426] focus:ring-2 focus:ring-blue-500/10"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {showPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-[19px] w-[19px]"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 8-.5 1-1.4 2.2-2.7 3.2" />
                    <path d="M6.2 6.2C4.4 7.5 3.2 9.1 2.5 12c1 2 4.5 6 9.5 6 1 0 2-.2 2.9-.5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-[19px] w-[19px]"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Confirm Password
            </label>

            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3 pr-12 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-blue-400/60 focus:bg-[#0D1426] focus:ring-2 focus:ring-blue-500/10"
              />

              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                title={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
              >
                {showConfirmPassword ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-[19px] w-[19px]"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                    <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5 0 8.5 4 9.5 8-.5 1-1.4 2.2-2.7 3.2" />
                    <path d="M6.2 6.2C4.4 7.5 3.2 9.1 2.5 12c1 2 4.5 6 9.5 6 1 0 2-.2 2.9-.5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-[19px] w-[19px]"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`rounded-xl border px-4 py-3 text-center text-sm ${
                message.includes("successfully")
                  ? "border-green-400/20 bg-green-500/10 text-green-300"
                  : "border-red-400/20 bg-red-500/10 text-red-300"
              }`}
            >
              {message}
            </div>
          )}

          {/* Create Account */}
          <button
            type="submit"
            className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition-all duration-200 hover:bg-[#1D4ED8] active:translate-y-0"
          >
            <span>Create Account</span>

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>

        </form>

        {/* Login */}
        <div className="mt-6 flex items-center justify-center gap-1 text-sm text-gray-400">
          <span>Already have an account?</span>

          <button
            type="button"
            onClick={onLogin}
            className="font-semibold text-sky-400 transition hover:text-sky-300"
          >
            Login
          </button>
        </div>

        {/* Footer */}
        <p className="mt-5 text-center text-[11px] tracking-wide text-gray-600">
          Private • Offline • Personal
        </p>

      </div>
    </AuthScreenLayout>
  )
}

export default SignUpScreen