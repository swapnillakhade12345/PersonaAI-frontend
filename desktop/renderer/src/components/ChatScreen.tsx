import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import {
  clearChatMessages,
  getChatSnapshot,
  sendChatMessage,
  stopChatResponse,
  subscribeToChat,
} from "../chat-store"

import PersonaLogo from "./PersonaLogo"
import WorkspaceLayout from "./WorkspaceLayout"
import type { PersonaSidebarItem } from "./PersonaSidebarNavigation"
import {
  createTitleFromMessages,
  type ChatHistoryMessage,
  upsertChatHistoryRecord,
} from "./personaChatHistoryStorage"

type SpeechRecognitionResultEvent = {
  results: {
    [index: number]: {
      [index: number]: { transcript: string }
    }
  }
}

interface SpeechRecognitionLike {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

interface ChatScreenProps {
  onBackToDashboard: () => void
  onOpenSettings: () => void
  onNavigate: (item: PersonaSidebarItem) => void
}

function ChatScreen({
  onBackToDashboard,
  onOpenSettings,
  onNavigate,
}: ChatScreenProps) {
  const [message, setMessage] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [voiceError, setVoiceError] = useState("")

  // Persist conversation ID
  const [conversationId, setConversationId] = useState(() => {
    const savedId = localStorage.getItem("personaAI_conversationId")
    if (savedId) return savedId

    const newId = crypto.randomUUID()
    localStorage.setItem("personaAI_conversationId", newId)
    return newId
  })

  // External store subscription for streaming
  const { messages, isTyping, hasStartedStreaming } = useSyncExternalStore(
    subscribeToChat,
    getChatSnapshot,
    getChatSnapshot
  )

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)

  // NEW (Code 2): input reference for auto-focus
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Persist messages to local storage as backup
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem("personaAI_chat", JSON.stringify(messages))
    }
  }, [messages])

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
    }
  }, [])

  useEffect(() => {
    if (messages.length === 0) {
      return
    }

    const historyMessages: ChatHistoryMessage[] = messages.map((chatMessage) => ({
      id: String(chatMessage.id),
      sender: chatMessage.sender,
      text: chatMessage.text,
      createdAt: new Date().toISOString(),
    }))

    upsertChatHistoryRecord({
      id: conversationId,
      title: createTitleFromMessages(historyMessages),
      messages: historyMessages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }, [conversationId, messages])

  // NEW (Code 2): response khatam hone par input pe focus
  useEffect(() => {
    if (!isTyping) {
      requestAnimationFrame(() => {
        inputRef.current?.focus()
      })
    }
  }, [isTyping])

  const handleSendMessage = async () => {
    const trimmedMessage = message.trim()

    if (!trimmedMessage || isTyping) {
      return
    }

    setMessage("")
    void sendChatMessage(trimmedMessage, conversationId)
  }

  // NEW (Code 2): stop response
  const handleStopResponse = () => {
    stopChatResponse()

    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const handleClearChat = () => {
    const confirmed = window.confirm(
      "Are you sure you want to clear the chat?"
    )

    if (!confirmed) {
      return
    }

    // Wipe local storage & generate new conversation ID
    const newConversationId = crypto.randomUUID()
    setConversationId(newConversationId)
    localStorage.setItem("personaAI_conversationId", newConversationId)

    clearChatMessages()

    // NEW (Code 2): clear ke baad input reset + focus
    setMessage("")
    requestAnimationFrame(() => {
      inputRef.current?.focus()
    })
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleMicrophone = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const speechWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor
      webkitSpeechRecognition?: SpeechRecognitionConstructor
    }

    const Recognition =
      speechWindow.SpeechRecognition ??
      speechWindow.webkitSpeechRecognition

    if (!Recognition) {
      setVoiceError("Voice typing is not supported in this app.")
      return
    }

    const recognition = new Recognition()

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = "en-US"

    recognition.onresult = (event) => {
      const transcript = Object.values(event.results)
        .map((result) => result[0]?.transcript ?? "")
        .join(" ")

      setMessage((previousMessage) =>
        `${previousMessage} ${transcript}`.trim()
      )
    }

    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognition.onerror = () => {
      setIsListening(false)
      setVoiceError("Microphone access was not available.")
      recognitionRef.current = null
    }

    setVoiceError("")
    recognitionRef.current = recognition
    setIsListening(true)

    recognition.start()
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#0B1220] text-slate-50">
      <WorkspaceLayout
        activeItem="chat"
        onOpenSettings={onOpenSettings}
        onNavigate={onNavigate}
      >

      {/* Main Chat Area (min-w-0 + width from Code 2) */}
      <section className="relative flex h-screen flex-1 min-w-0 flex-col">

        {/* Header */}
        <header className="flex shrink-0 items-center justify-between border-b border-[#263449] bg-[#0F172A]/80 px-8 py-5 backdrop-blur-xl">

          <div className="flex items-center gap-4">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/10 bg-gradient-to-br from-blue-500/15 to-purple-500/10">
              <PersonaLogo size="sm" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0B1222] bg-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">AI Chat</h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                <p className="text-xs text-gray-500">Personal AI Assistant</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClearChat}
              className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-sm text-red-300 transition-all duration-200 hover:bg-red-500/10"
            >
              Clear Chat
            </button>
            <button
              type="button"
              onClick={onBackToDashboard}
              className="rounded-xl border border-[#263449] bg-[#111827] px-4 py-2.5 text-sm text-slate-300 transition-all duration-200 hover:bg-[#162033] hover:text-white"
            >
              ← Dashboard
            </button>
          </div>

        </header>

        {/* Messages Container (min-h-0 added from Code 2 for proper scrolling) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-8">

          {messages.length === 0 && !isTyping ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <h1 className="text-3xl font-semibold tracking-tight text-slate-100">
                  Hello, how can I help you?
                </h1>
                <p className="mt-3 text-sm text-slate-500">
                  Start a conversation with PersonaAI
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-4xl space-y-6">

              {messages.map((chatMessage) => (
                <div
                  key={chatMessage.id}
                  className={
                    chatMessage.sender === "user"
                      ? "flex justify-end"
                      : "flex items-start gap-3"
                  }
                >

                  {/* AI Avatar */}
                  {chatMessage.sender === "ai" && (
                    <div className="shrink-0">
                      <PersonaLogo size="sm" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={
                      chatMessage.sender === "user"
                        ? "max-w-xl rounded-2xl rounded-tr-md bg-[#2563EB] px-5 py-4 shadow-[0_10px_22px_rgba(37,99,235,0.18)]"
                        : "max-w-xl rounded-2xl rounded-tl-md border border-[#263449] bg-[#111827] px-5 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.18)]"
                    }
                  >
                    {/* Inline Typing Indicator */}
                    {chatMessage.sender === "ai" &&
                    !chatMessage.text &&
                    isTyping &&
                    !hasStartedStreaming ? (
                      <div className="flex items-center gap-1.5" aria-label="Assistant is responding">
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400 [animation-delay:150ms]" />
                        <span className="h-2 w-2 animate-bounce rounded-full bg-purple-400 [animation-delay:300ms]" />
                      </div>
                    ) : (
                      <p
                        className={
                          chatMessage.sender === "user"
                            ? "text-sm leading-6 text-white"
                            : "text-sm leading-6 text-gray-300"
                        }
                      >
                        {chatMessage.text}
                      </p>
                    )}
                  </div>

                </div>
              ))}

            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="shrink-0 border-t border-[#263449] bg-[#0F172A]/90 px-8 py-5 backdrop-blur-xl">

          <div className="mx-auto max-w-4xl">

            <div className="rounded-2xl border border-[#263449] bg-[#0F172A] p-2 shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-all duration-200 focus-within:border-sky-400/30 focus-within:shadow-[0_10px_25px_rgba(56,189,248,0.08)]">

              <div className="flex items-center gap-2">

                {/* Input (ref added from Code 2) */}
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask PersonaAI anything..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-slate-50 outline-none placeholder:text-slate-500"
                />

                {/* Microphone */}
                <button
                  type="button"
                  onClick={handleMicrophone}
                  aria-label={isListening ? "Stop voice typing" : "Start voice typing"}
                  title={isListening ? "Stop voice typing" : "Start voice typing"}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-200 ${
                    isListening
                      ? "border-red-400/40 bg-red-500/15 text-red-300 shadow-[0_0_15px_rgba(248,113,113,0.15)]"
                      : "border-white/10 bg-white/[0.04] text-gray-400 hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  {isListening ? (
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
                    </svg>
                  ) : (
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="3" width="6" height="12" rx="3" />
                      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 18v3m-4 0h8" />
                    </svg>
                  )}
                </button>

                {/* Send / Stop (Stop button NEW from Code 2, Send is Code 1) */}
                {isTyping ? (
                  <button
                    type="button"
                    onClick={handleStopResponse}
                    aria-label="Stop response"
                    title="Stop response"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white transition-all duration-200 hover:bg-red-600"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                      <rect x="7" y="7" width="10" height="10" rx="2" fill="currentColor" />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    aria-label="Send message"
                    title="Send message"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] transition-all duration-200 hover:scale-105 hover:shadow-[0_0_25px_rgba(99,102,241,0.35)] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100"
                  >
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" className="h-5 w-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 19V5m-7 7 7-7 7 7" />
                    </svg>
                  </button>
                )}

              </div>

            </div>

            {voiceError && (
              <p className="mt-2 text-xs text-red-300">
                {voiceError}
              </p>
            )}

            <p className="mt-2 text-center text-[11px] text-gray-600">
              Press Enter to send • Use the microphone for voice typing
            </p>

          </div>

        </div>

      </section>
      </WorkspaceLayout>
    </main>
  )
}

export default ChatScreen