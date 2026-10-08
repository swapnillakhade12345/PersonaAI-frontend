import { useEffect, useState, type ReactNode } from "react"

import SplashScreen from "./components/SplashScreen"
import WelcomeScreen from "./components/WelcomeScreen"
import SignUpScreen from "./components/SignUpScreen"
import LoginScreen from "./components/LoginScreen"
import ForgotPasswordScreen from "./components/ForgotPasswordScreen"
import Dashboard from "./components/Dashboard"
import ChatScreen from "./components/ChatScreen"
import SettingsScreen from "./components/SettingsScreen"
import FilesScreen from "./components/FilesScreen"
import TasksScreen from "./components/TasksScreen"
import PersonaChatHistoryScreen from "./components/PersonaChatHistoryScreen"
import ProfileScreen from "./components/ProfileScreen"
import type { PersonaSidebarItem } from "./components/PersonaSidebarNavigation"

import IntroVideo from "./components/IntroVideo"
import {
  USER_ACCOUNT_ACTION_EVENT,
  type UserAccountAction,
} from "./userAccountEvents"
import { createChat } from "./services/api"

type Page =
  | "splash"
  | "welcome"
  | "signup"
  | "login"
  | "forgot"
  | "dashboard"
  | "chat"
  | "chatHistory"
  | "profile"
  | "settings"
  | "files"
  | "tasks"

function App() {
  // First show the PersonaAI intro video
  const [showIntroVideo, setShowIntroVideo] = useState(true)

  const [page, setPage] = useState<Page>("splash")
  const [activeConversationId, setActiveConversationId] = useState(() => {
    const savedId = localStorage.getItem("personaAI_conversationId")
    if (savedId) return savedId

    const conversationId = crypto.randomUUID()
    localStorage.setItem("personaAI_conversationId", conversationId)
    return conversationId
  })

  const handleCreateNewChat = async (): Promise<boolean> => {
    const conversationId = crypto.randomUUID()
    try {
      await createChat(conversationId, "New chat")
      localStorage.setItem("personaAI_conversationId", conversationId)
      setActiveConversationId(conversationId)
      setPage("chat")
      return true
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Could not create a new chat.")
      return false
    }
  }

  const withThemeControls = (content: ReactNode) => content
  const navigateWorkspace = (item: PersonaSidebarItem) => {
    const destination: Record<PersonaSidebarItem, Page> = {
      home: "dashboard",
      chat: "chat",
      chatHistory: "chatHistory",
      files: "files",
      tasks: "tasks",
    }

    setPage(destination[item])
  }

  // Show the splash screen briefly after the intro video finishes.
  useEffect(() => {
    if (showIntroVideo || page !== "splash") return

    const timer = setTimeout(() => {
      setPage("welcome")
    }, 2000)

    return () => clearTimeout(timer)
  }, [page, showIntroVideo])

  useEffect(() => {
    const handleAccountAction = (event: Event) => {
      const action = (event as CustomEvent<UserAccountAction>).detail

      if (action === "profile") {
        setPage("profile")
      } else if (action === "add-account") {
        setPage("login")
      } else if (action === "log-out") {
        setPage("login")
      }
    }

    window.addEventListener(USER_ACCOUNT_ACTION_EVENT, handleAccountAction)
    return () => {
      window.removeEventListener(USER_ACCOUNT_ACTION_EVENT, handleAccountAction)
    }
  }, [])

  // --------------------------------------------------
  // FIRST: PersonaAI Intro Video
  // --------------------------------------------------
  if (showIntroVideo) {
    return (
      <IntroVideo
        onComplete={() => {
          setShowIntroVideo(false)
        }}
      />
    )
  }

  // --------------------------------------------------
  // Splash
  // --------------------------------------------------
  if (page === "splash") {
    return withThemeControls(
      <SplashScreen />
    )
  }

  // --------------------------------------------------
  // Welcome
  // --------------------------------------------------
  if (page === "welcome") {
    return withThemeControls(
      <WelcomeScreen
        onGetStarted={() => setPage("signup")}
        onLogin={() => setPage("login")}
        onSignUp={() => setPage("signup")}
        onOpenChat={() => setPage("chat")}
        onOpenDashboard={() => setPage("dashboard")}
      />
    )
  }

  // --------------------------------------------------
  // Sign Up
  // --------------------------------------------------
  if (page === "signup") {
    return withThemeControls(
      <SignUpScreen
        onLogin={() => setPage("login")}
        onHome={() => setPage("welcome")}
      />
    )
  }

  // --------------------------------------------------
  // Login
  // --------------------------------------------------
  if (page === "login") {
    return withThemeControls(
      <LoginScreen
        onCreateAccount={() => setPage("signup")}
        onForgotPassword={() => setPage("forgot")}
        onLoginSuccess={() => setPage("dashboard")}
        onHome={() => setPage("welcome")}
      />
    )
  }

  // --------------------------------------------------
  // Forgot Password
  // --------------------------------------------------
  if (page === "forgot") {
    return withThemeControls(
      <ForgotPasswordScreen
        onBackToLogin={() => setPage("login")}
      />
    )
  }

  // --------------------------------------------------
  // Dashboard
  // --------------------------------------------------
  if (page === "dashboard") {
    return withThemeControls(
      <Dashboard
        onOpenChat={() => setPage("chat")}
        onOpenSettings={() => setPage("settings")}
        onOpenFiles={() => setPage("files")}
        onOpenTasks={() => setPage("tasks")}
        onNavigate={navigateWorkspace}
        onNewChat={() => { void handleCreateNewChat() }}
      />
    )
  }

  // --------------------------------------------------
  // AI Chat History
  // --------------------------------------------------
  if (page === "chatHistory") {
    return withThemeControls(
      <PersonaChatHistoryScreen
        onBack={() => setPage("chat")}
        onOpenSettings={() => setPage("settings")}
        onNavigate={navigateWorkspace}
        onOpenConversation={(conversationId) => {
          localStorage.setItem("personaAI_conversationId", conversationId)
          setActiveConversationId(conversationId)
          setPage("chat")
        }}
        onCreateNewChat={() => { void handleCreateNewChat() }}
      />
    )
  }

  // --------------------------------------------------
  // AI Chat
  // --------------------------------------------------
  if (page === "chat") {
    return withThemeControls(
      <ChatScreen
        conversationId={activeConversationId}
        onBackToDashboard={() => setPage("dashboard")}
        onCreateNewChat={handleCreateNewChat}
        onOpenSettings={() => setPage("settings")}
        onNavigate={navigateWorkspace}
      />
    )
  }

  // --------------------------------------------------
  // Files
  // --------------------------------------------------
  if (page === "files") {
    return withThemeControls(
      <FilesScreen
        onOpenSettings={() => setPage("settings")}
        onNavigate={navigateWorkspace}
      />
    )
  }

  // --------------------------------------------------
  // Tasks
  // --------------------------------------------------
  if (page === "tasks") {
    return withThemeControls(
      <TasksScreen
        onOpenSettings={() => setPage("settings")}
        onNavigate={navigateWorkspace}
      />
    )
  }

  // --------------------------------------------------
  // Settings
  // --------------------------------------------------
  if (page === "settings") {
    return withThemeControls(
      <SettingsScreen
        onBackToDashboard={() => setPage("dashboard")}
        onOpenSettings={() => setPage("settings")}
        onNavigate={navigateWorkspace}
      />
    )
  }

  // --------------------------------------------------
  // Profile
  // --------------------------------------------------
  if (page === "profile") {
    return withThemeControls(
      <ProfileScreen
        onBackToDashboard={() => setPage("dashboard")}
        onOpenSettings={() => setPage("settings")}
        onNavigate={navigateWorkspace}
      />
    )
  }

  return null
}

export default App