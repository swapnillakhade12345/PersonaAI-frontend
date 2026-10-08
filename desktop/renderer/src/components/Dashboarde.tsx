import { useRef, useState } from "react"

import PersonaLogo from "./PersonaLogo"
import ProfileAvatar from "./ProfileAvatar"
import WorkspaceLayout from "./WorkspaceLayout"
import type { PersonaSidebarItem } from "./PersonaSidebarNavigation"

type DashboardProps = {
  onOpenChat?: () => void
  onOpenSettings: () => void
  onOpenFiles?: () => void
  onOpenTasks?: () => void
  onNewChat?: () => void
  onNavigate: (item: PersonaSidebarItem) => void
}

function Dashboard({
  onOpenChat,
  onOpenSettings,
  onOpenFiles,
  onOpenTasks,
  onNewChat,
  onNavigate,
}: DashboardProps) {
  const [userName] = useState(() => {
    return localStorage.getItem("personaAI_userName") || "User"
  })

  const [profileImage, setProfileImage] = useState(() => {
    return localStorage.getItem("personaAI_profileImage") || ""
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleProfileImage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith("image/")) {
      return
    }

    const reader = new FileReader()

    reader.onload = () => {
      const imageData = reader.result

      if (typeof imageData === "string") {
        setProfileImage(imageData)
        localStorage.setItem("personaAI_profileImage", imageData)
      }
    }

    reader.readAsDataURL(file)

    event.target.value = ""
  }

  return (
    <main className="min-h-screen bg-[#0B1220] text-slate-50">
      <WorkspaceLayout
        activeItem="home"
        onOpenSettings={onOpenSettings}
        onNavigate={onNavigate}
        background="dashboard"
      >

      {/* ================= MAIN ================= */}
      {/* NEW (Code 2): w-[calc(100%-16rem)] */}
      <section className="relative min-h-screen flex-1 p-8">

        {/* ================= HEADER ================= */}
        <header className="flex items-center justify-between">

          <div>
            <p className="text-sm font-medium text-blue-300">
              Welcome back 👋
            </p>

            <h2 className="mt-1 text-3xl font-bold tracking-tight">
               {userName}
            </h2>

            <p className="mt-2 text-gray-400">
              Your personal workspace is ready.
            </p>
          </div>

          <div className="flex items-center gap-3">

            {/* Notification */}
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition hover:border-white/20 hover:bg-white/10"
            >
              🔔
            </button>

            {/* Profile */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Change profile picture"
              className="rounded-full"
            >
              <ProfileAvatar
                image={profileImage || null}
                name={userName}
                className="h-11 w-11 bg-gradient-to-br from-blue-500 to-purple-500 font-bold shadow-[0_0_20px_rgba(99,102,241,0.25)]"
              />
            </button>

          </div>

        </header>

        {/* ================= HERO ================= */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#263449] bg-gradient-to-br from-[#111827] via-[#111827] to-[#162033] p-8 shadow-[0_15px_35px_rgba(15,23,42,0.22)]">

          {/* Decorative Glow */}
          <div className="pointer-events-none absolute right-[-80px] top-[-100px] h-72 w-72 rounded-full bg-blue-500/10 blur-[100px]" />

          <div className="relative flex items-center justify-between gap-8">

            <div className="max-w-2xl">

              {/* Status */}
              <div className="flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />

                <span className="text-xs font-semibold tracking-[0.22em] text-cyan-300">
                  AI ASSISTANT OFFLINE
                </span>

              </div>

              <h3 className="mt-5 text-3xl font-bold leading-tight md:text-4xl">
                Your ideas.
                <br />
                <span className="bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                  Your productivity.
                </span>
              </h3>

              <p className="mt-4 max-w-xl text-sm leading-6 text-gray-400">
                PersonaAI gives you one focused workspace for conversations,
                files, tasks, and everyday productivity.
              </p>

              {/* Chat CTA */}
              <button
                type="button"
                onClick={onNewChat ?? onOpenChat}
                className="mt-7 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-3 text-sm font-semibold shadow-[0_0_25px_rgba(99,102,241,0.25)] transition duration-200 hover:scale-[1.02]"
              >
                Start Conversation →
              </button>

            </div>

            {/* Logo */}
            <div className="hidden pr-8 md:block">
              <div className="relative flex h-36 w-36 items-center justify-center">

                <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] shadow-[0_0_60px_rgba(59,130,246,0.12)]">

                  {/* Rotating Neon Arcs */}
                  <svg
                    className="pointer-events-none absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)]"
                    viewBox="0 0 144 144"
                    fill="none"
                  >
                    <defs>

                      {/* Main blue/cyan gradient */}
                      <linearGradient
                        id="personaArcBlue"
                        x1="25"
                        y1="20"
                        x2="120"
                        y2="100"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#2563eb" stopOpacity="0.05" />
                        <stop offset="0.25" stopColor="#38bdf8" />
                        <stop offset="0.65" stopColor="#60a5fa" />
                        <stop offset="1" stopColor="#67e8f9" stopOpacity="0.05" />
                      </linearGradient>

                      {/* Second arc */}
                      <linearGradient
                        id="personaArcCyan"
                        x1="120"
                        y1="120"
                        x2="25"
                        y2="50"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop offset="0" stopColor="#2563eb" stopOpacity="0.05" />
                        <stop offset="0.3" stopColor="#38bdf8" />
                        <stop offset="0.7" stopColor="#22d3ee" />
                        <stop offset="1" stopColor="#60a5fa" stopOpacity="0.05" />
                      </linearGradient>

                      {/* Soft neon glow */}
                      <filter
                        id="personaArcGlow"
                        x="-100%"
                        y="-100%"
                        width="300%"
                        height="300%"
                      >
                        <feGaussianBlur
                          stdDeviation="3"
                          result="blur"
                        />

                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>

                    </defs>

                    {/* This GROUP rotates continuously */}
                    <g
                      style={{
                        transformOrigin: "72px 72px",
                        animation: "personaArcRotate 6s linear infinite",
                      }}
                    >

                      {/* Upper arc */}
                      <circle
                        cx="72"
                        cy="72"
                        r="67"
                        fill="none"
                        stroke="url(#personaArcBlue)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="145 276"
                        filter="url(#personaArcGlow)"
                      />

                      {/* Lower arc */}
                      <circle
                        cx="72"
                        cy="72"
                        r="67"
                        fill="none"
                        stroke="url(#personaArcCyan)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="145 276"
                        strokeDashoffset="-210"
                        filter="url(#personaArcGlow)"
                      />

                    </g>
                  </svg>

                  {/* PersonaAI logo */}
                  <PersonaLogo size="lg" />

                </div>
              </div>
            </div>

          </div>

          {/* Search / Ask UI */}
          <div className="relative mt-8 flex items-center rounded-2xl border border-white/10 bg-[#080D1B]/80 p-2">

            <span className="px-3 text-gray-500">
              ✦
            </span>

            <input
              type="text"
              placeholder="Ask PersonaAI anything..."
              className="flex-1 bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-gray-600"
            />

            <button
              type="button"
              onClick={onOpenChat}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)] transition hover:scale-105"
            >
              →
            </button>

          </div>

        </div>

        {/* ================= OVERVIEW ================= */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">

          {/* AI Chat */}
          <button
            type="button"
            onClick={onOpenChat}
            className="group rounded-2xl border border-[#263449] bg-[#111827] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-sky-400/30 hover:bg-[#162033]"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-xl">
                💬
              </div>

              <span className="text-gray-600 transition group-hover:text-blue-300">
                →
              </span>

            </div>

            <p className="mt-5 text-sm font-semibold">
              AI Chat
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Continue your conversations
            </p>
          </button>

          {/* Files */}
          <button
            type="button"
            onClick={onOpenFiles}
            className="group rounded-2xl border border-[#263449] bg-[#111827] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-indigo-400/30 hover:bg-[#162033]"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-xl">
                📁
              </div>

              <span className="text-gray-600 transition group-hover:text-purple-300">
                →
              </span>

            </div>

            <p className="mt-5 text-sm font-semibold">
              Files
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Manage your workspace files
            </p>
          </button>

          {/* Tasks */}
          <button
            type="button"
            onClick={onOpenTasks}
            className="group rounded-2xl border border-white/10 bg-[#11182B] p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-cyan-400/30 hover:bg-[#141B30]"
          >
            <div className="flex items-center justify-between">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-xl">
                ✓
              </div>

              <span className="text-gray-600 transition group-hover:text-cyan-300">
                →
              </span>

            </div>

            <p className="mt-5 text-sm font-semibold">
              Tasks
            </p>

            <p className="mt-1 text-xs text-gray-500">
              Keep track of your work
            </p>
          </button>

        </div>

        {/* ================= QUICK ACTIONS ================= */}
        <div className="mt-9">

          <div className="flex items-end justify-between">

            <div>
              <h3 className="text-xl font-semibold">
                Quick Actions
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Start something in one click
              </p>
            </div>

          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">

            {/* Conversation */}
            <button
              type="button"
              onClick={onOpenChat}
              className="group rounded-2xl border border-[#263449] bg-[#111827] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-sky-400/40"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">
                💬
              </div>

              <h4 className="mt-5 font-semibold">
                New Conversation
              </h4>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Start a fresh conversation with PersonaAI.
              </p>

              <span className="mt-5 block text-sm text-blue-400">
                Start Chat →
              </span>

            </button>

            {/* Writing */}
            <button
              type="button"
              onClick={onOpenChat}
              className="group rounded-2xl border border-[#263449] bg-[#111827] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-indigo-400/40"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-2xl">
                📝
              </div>

              <h4 className="mt-5 font-semibold">
                Write Something
              </h4>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Create and organize your ideas.
              </p>

              <span className="mt-5 block text-sm text-purple-400">
                Start Writing →
              </span>

            </button>

            {/* Ask */}
            <button
              type="button"
              onClick={onOpenChat}
              className="group rounded-2xl border border-[#263449] bg-[#111827] p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-400/40"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-2xl">
                💡
              </div>

              <h4 className="mt-5 font-semibold">
                Ask AI
              </h4>

              <p className="mt-2 text-sm leading-5 text-gray-500">
                Get help with your questions and ideas.
              </p>

              <span className="mt-5 block text-sm text-cyan-400">
                Ask Now →
              </span>

            </button>

          </div>

        </div>

        {/* ================= RECENT ACTIVITY ================= */}
        <div className="mt-9 pb-8">

          <div className="flex items-end justify-between">

            <div>
              <h3 className="text-xl font-semibold">
                Recent Activity
              </h3>

              <p className="mt-1 text-xs text-gray-500">
                Your latest workspace activity
              </p>
            </div>

            <span className="text-xs text-gray-600">
              Today
            </span>

          </div>

          <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#11182B]">

            {/* Activity 1 */}
            <div className="flex items-center gap-4 border-b border-white/5 p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
                💬
              </div>

              <div className="flex-1">

                <p className="text-sm font-medium">
                  Welcome to PersonaAI
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your personal AI workspace is ready.
                </p>

              </div>

              <span className="text-xs text-gray-600">
                Just now
              </span>

            </div>

            {/* Activity 2 */}
            <div className="flex items-center gap-4 border-b border-white/5 p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10">
                ✨
              </div>

              <div className="flex-1">

                <p className="text-sm font-medium">
                  PersonaAI initialized
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Your workspace is ready to use.
                </p>

              </div>

              <span className="text-xs text-gray-600">
                Today
              </span>

            </div>

            {/* Activity 3 */}
            <div className="flex items-center gap-4 p-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10">
                ✓
              </div>

              <div className="flex-1">

                <p className="text-sm font-medium">
                  Workspace ready
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Chat, Files and Tasks are available.
                </p>

              </div>

              <span className="text-xs text-gray-600">
                Today
              </span>

            </div>

          </div>

        </div>

      </section>
      </WorkspaceLayout>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleProfileImage}
        className="hidden"
      />

    </main>
  )
}

export default Dashboard