import { useMemo, useState } from "react"

import PersonaChatHistoryItem from "./PersonaChatHistoryItem"
import {
  deleteChatHistoryRecord,
  readChatHistoryRecords,
  renameChatHistoryRecord,
  type ChatHistoryRecord,
} from "./personaChatHistoryStorage"
import WorkspaceLayout from "./WorkspaceLayout"
import type { PersonaSidebarItem } from "./PersonaSidebarNavigation"

interface PersonaChatHistoryScreenProps {
  onBack?: () => void
  onOpenConversation?: (conversationId: string) => void
  onCreateNewChat?: () => void
  onNavigate: (item: PersonaSidebarItem) => void
  onOpenSettings: () => void
}

function PersonaChatHistoryScreen({
  onBack,
  onOpenConversation,
  onCreateNewChat,
  onNavigate,
  onOpenSettings,
}: PersonaChatHistoryScreenProps) {
  const [search, setSearch] = useState("")
  const [conversationList, setConversationList] = useState<ChatHistoryRecord[]>(() =>
    readChatHistoryRecords()
  )

  const filteredConversations = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return conversationList
    }

    return conversationList.filter((conversation) => {
      const haystack = [
        conversation.title,
        ...conversation.messages.map((message) => `${message.sender}:${message.text}`),
      ].join(" ")

      return haystack.toLowerCase().includes(query)
    })
  }, [conversationList, search])

  const handleOpenConversation = (conversation: ChatHistoryRecord) => {
    onOpenConversation?.(conversation.id)
  }

  const handleRenameConversation = (conversation: ChatHistoryRecord) => {
    const nextTitle = window.prompt("Rename conversation", conversation.title)

    if (!nextTitle) {
      return
    }

    const renamed = renameChatHistoryRecord(conversation.id, nextTitle)

    if (renamed) {
      setConversationList(readChatHistoryRecords())
    }
  }

  const handleDeleteConversation = (conversation: ChatHistoryRecord) => {
    const confirmed = window.confirm(`Delete "${conversation.title}"?`)

    if (!confirmed) {
      return
    }

    deleteChatHistoryRecord(conversation.id)
    setConversationList(readChatHistoryRecords())
  }

  return (
    <main className="min-h-screen bg-[#0B1020] text-slate-50">
      <WorkspaceLayout
          activeItem="chatHistory"
          onOpenSettings={onOpenSettings}
          onNavigate={onNavigate}
          background={false}
      >
        <section className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/80">History</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Chat History</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCreateNewChat}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5 text-sm font-medium text-cyan-200 transition hover:border-cyan-400/40 hover:bg-cyan-500/15"
            >
              New Chat
            </button>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-[#263449] bg-[#111827] px-4 py-2.5 text-sm text-slate-300 transition hover:bg-[#162033] hover:text-white"
              >
                ← Back
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-[#263449] bg-[#111827]/80 p-3 shadow-[0_12px_30px_rgba(15,23,42,0.18)]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, user message, or AI message"
            className="w-full bg-transparent px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
          />
        </div>

        {filteredConversations.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#263449] bg-[#111827]/60 p-10 text-center">
            <h2 className="text-xl font-semibold text-slate-200">No conversations found</h2>
            <p className="mt-2 text-sm text-slate-400">
              Start a new chat or adjust your search terms.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredConversations.map((conversation) => (
              <PersonaChatHistoryItem
                key={conversation.id}
                conversation={conversation}
                onOpen={handleOpenConversation}
                onRenamed={handleRenameConversation}
                onDelete={handleDeleteConversation}
              />
            ))}
          </div>
        )}
      </div>
        </section>
      </WorkspaceLayout>
    </main>
  )
}

export default PersonaChatHistoryScreen
