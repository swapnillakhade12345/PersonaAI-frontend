import type { ChatHistoryRecord } from "./personaChatHistoryStorage"

interface PersonaChatHistoryItemProps {
  conversation: ChatHistoryRecord
  onOpen: (conversation: ChatHistoryRecord) => void
  onRenamed: (conversation: ChatHistoryRecord) => void
  onDelete: (conversation: ChatHistoryRecord) => void
}

function PersonaChatHistoryItem({
  conversation,
  onOpen,
  onRenamed,
  onDelete,
}: PersonaChatHistoryItemProps) {
  // Array optional chaining to prevent runtime error if messages is undefined/null
  const lastMessage = conversation.messages?.[conversation.messages.length - 1]
  const lastText = lastMessage?.text ?? "No messages yet"

  return (
    <div className="rounded-xl border border-[#263449] bg-[#111827]/80 p-3 shadow-[0_8px_18px_rgba(15,23,42,0.15)] transition-all duration-200 hover:border-[#06B6D4]/30 hover:bg-[#121F33]">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">
            {conversation.title || "Untitled Conversation"}
          </p>
          <p className="mt-0.5 text-[10px] text-[#94A3B8]">
            {new Date(conversation.updatedAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpen(conversation)}
            className="rounded-md border border-[#06B6D4]/20 bg-[#06B6D4]/5 px-2 py-1 text-[11px] font-medium text-[#A5F3FC] transition hover:border-[#22D3EE]/40 hover:bg-[#06B6D4]/10"
          >
            Open
          </button>
          <button
            type="button"
            onClick={() => onRenamed(conversation)}
            className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] text-[#CBD5E1] transition hover:bg-white/[0.08]"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(conversation)}
            className="rounded-md border border-[#EF4444]/20 bg-[#EF4444]/5 px-2 py-1 text-[11px] text-[#FCA5A5] transition hover:bg-[#EF4444]/10"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="mt-2 line-clamp-1 text-xs leading-5 text-[#D1D5DB]">
        {lastText}
      </p>

      <div className="mt-2 flex items-center justify-between text-[9px] uppercase tracking-[0.12em] text-[#64748B]">
        <span>{conversation.messages?.length ?? 0} messages</span>
        <span>{new Date(conversation.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

export default PersonaChatHistoryItem