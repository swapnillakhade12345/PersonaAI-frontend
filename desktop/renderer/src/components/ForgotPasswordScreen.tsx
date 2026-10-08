import { useState } from "react"

import AuthScreenLayout from "./AuthScreenLayout"
import PersonaLogo from "./PersonaLogo"

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void
}

function ForgotPasswordScreen({
  onBackToLogin,
}: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email) {
      setMessage("Please enter your email address.")
      return
    }

    setMessage("Password reset link sent successfully! 📧")
  }

  return (
    <AuthScreenLayout
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0B1220] px-6 text-slate-50"
    >
      <div className="relative z-10 w-full max-w-md">

        <div className="rounded-3xl border border-[#263449] bg-[#111827]/95 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.38)] backdrop-blur-2xl">

          {/* Logo */}
          <div className="flex justify-center">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 shadow-[0_0_30px_rgba(59,130,246,0.12)]">
              <PersonaLogo size="lg" />
            </div>
          </div>

          {/* Heading */}
          <div className="mt-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              Account Recovery
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight">
              Forgot Password?
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-300">
              Enter your email address and we&apos;ll help you reset your
              password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email Address
              </label>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setMessage("")
                  }}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-[#263449] bg-[#0F172A] px-4 py-3.5 text-sm text-slate-50 outline-none transition placeholder:text-slate-500 hover:border-slate-500 focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/10"
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-center text-sm text-blue-300">
                {message}
              </div>
            )}

            {/* Reset Button */}
            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-xl bg-[#2563EB] py-3.5 font-semibold text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] transition duration-200 hover:bg-[#1D4ED8] active:translate-y-0"
            >
              <span className="relative z-10">
                Send Reset Link
              </span>

              <span className="absolute inset-0 -translate-x-full bg-white/10 transition-transform duration-500 group-hover:translate-x-0" />
            </button>

          </form>

          {/* Divider */}
          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[11px] uppercase tracking-wider text-gray-600">
              or
            </span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          {/* Back to Login */}
          <button
            type="button"
            onClick={onBackToLogin}
            className="group mx-auto flex items-center gap-2 text-sm font-semibold text-sky-400 transition hover:text-sky-300"
          >
            <span className="transition-transform duration-200 group-hover:-translate-x-1">
              ←
            </span>
            Back to Login
          </button>

        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-gray-600">
          Private • Offline • Personal
        </p>

      </div>
    </AuthScreenLayout>
  )
}

export default ForgotPasswordScreen