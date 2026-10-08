import { useState } from "react"

import AuthScreenLayout from "./AuthScreenLayout"
import PersonaLogo from "./PersonaLogo"

interface LoginScreenProps {
  onCreateAccount: () => void
  onForgotPassword: () => void
  onLoginSuccess: () => void
  onHome: () => void
}

function LoginScreen({
  onCreateAccount,
  onForgotPassword,
  onLoginSuccess,
  onHome,
}: LoginScreenProps) {
  const [email, setEmail] = useState("")
  const [contact, setContact] = useState("")
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !contact) {
      setError("Please enter your email and contact number.")
      return
    }

    setError("")

    // Frontend demo login
    onLoginSuccess()
  }

  return (
    <AuthScreenLayout onHome={onHome}>
      <div className="relative z-10 w-full max-w-md rounded-3xl border border-[#263449] bg-[#111827]/95 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.38)] backdrop-blur-xl">

        {/* Top Glow */}
        <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-linear-to-r from-transparent via-blue-400/70 to-transparent" />

        {/* Logo */}
        <div className="flex justify-center">
          <PersonaLogo size="lg" />
        </div>

        {/* Small Label */}
        <div className="mt-5 flex items-center justify-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />

          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-gray-500">
            Personal Workspace
          </span>
        </div>

        {/* Heading */}
        <h1 className="mt-4 text-center text-3xl font-bold tracking-tight">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-sm leading-6 text-slate-300">
          Login to continue to your PersonaAI workspace.
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="mt-7 space-y-5">

          {/* Email */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setError("")
              }}
              placeholder="Enter your email address"
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-blue-400/60 focus:bg-[#0D1426] focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Contact Number */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Contact Number
              </label>

              <button
                type="button"
                onClick={onForgotPassword}
                className="text-xs font-medium text-sky-400 transition hover:text-sky-300"
              >
                Forgot Password?
              </button>
            </div>

            <input
              type="tel"
              value={contact}
              onChange={(e) => {
                setContact(e.target.value)
                setError("")
              }}
              placeholder="Enter your contact number"
              className="w-full rounded-xl border border-white/10 bg-[#0B1020] px-4 py-3.5 text-sm text-white outline-none transition-all placeholder:text-gray-600 focus:border-blue-400/60 focus:bg-[#0D1426] focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              <span>!</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] py-3.5 font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition-all duration-200 hover:bg-[#1D4ED8] active:translate-y-0"
          >
            <span>Login to PersonaAI</span>

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </button>

        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />

          <span className="text-[10px] uppercase tracking-widest text-gray-600">
            or
          </span>

          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Register */}
        <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
          <span>Don't have an account?</span>

          <button
            type="button"
            onClick={onCreateAccount}
            className="font-semibold text-sky-400 transition hover:text-sky-300"
          >
            Create Account
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

export default LoginScreen