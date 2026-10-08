export type ChatHistoryMessage = {
  id: string
  sender: "user" | "ai"
  text: string
  createdAt: string
}

export type ChatHistoryRecord = {
  id: string
  title: string
  messages: ChatHistoryMessage[]
  createdAt: string
  updatedAt: string
}

export const CHAT_HISTORY_STORAGE_KEY = "personaAI_chat_history_v1"

const isValidMessage = (value: unknown): value is ChatHistoryMessage => {
  if (!value || typeof value !== "object") return false

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    (record.sender === "user" || record.sender === "ai") &&
    typeof record.text === "string" &&
    typeof record.createdAt === "string"
  )
}

const isValidRecord = (value: unknown): value is ChatHistoryRecord => {
  if (!value || typeof value !== "object") return false

  const record = value as Record<string, unknown>

  return (
    typeof record.id === "string" &&
    typeof record.title === "string" &&
    Array.isArray(record.messages) &&
    record.messages.every(isValidMessage) &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string"
  )
}

export const readChatHistoryRecords = (): ChatHistoryRecord[] => {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(CHAT_HISTORY_STORAGE_KEY)

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isValidRecord)
  } catch {
    return []
  }
}

export const writeChatHistoryRecords = (records: ChatHistoryRecord[]) => {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(records))
}

export const createTitleFromMessages = (messages: ChatHistoryMessage[]) => {
  const firstUserMessage = messages.find((message) => message.sender === "user")

  if (firstUserMessage && firstUserMessage.text.trim()) {
    return firstUserMessage.text.trim().slice(0, 40).trim() || "New conversation"
  }

  const firstAiMessage = messages.find((message) => message.sender === "ai")

  if (firstAiMessage && firstAiMessage.text.trim()) {
    return firstAiMessage.text.trim().slice(0, 40).trim() || "New conversation"
  }

  return "New conversation"
}

export const createChatHistoryRecord = (
  initialMessages: ChatHistoryMessage[] = []
): ChatHistoryRecord => {
  const now = new Date().toISOString()

  return {
    id: crypto.randomUUID(),
    title: createTitleFromMessages(initialMessages) || "New conversation",
    messages: initialMessages,
    createdAt: now,
    updatedAt: now,
  }
}

export const upsertChatHistoryRecord = (record: ChatHistoryRecord) => {
  const records = readChatHistoryRecords()
  const nextRecords = records.filter((item) => item.id !== record.id)

  nextRecords.unshift(record)
  writeChatHistoryRecords(nextRecords)

  return record
}

export const addMessageToChatHistory = (
  conversationId: string,
  message: ChatHistoryMessage
) => {
  const records = readChatHistoryRecords()
  const targetIndex = records.findIndex((record) => record.id === conversationId)

  if (targetIndex === -1) {
    const newRecord = createChatHistoryRecord([message])
    writeChatHistoryRecords([newRecord, ...records])
    return newRecord
  }

  const nextRecord = {
    ...records[targetIndex],
    messages: [...records[targetIndex].messages, message],
    title: createTitleFromMessages([...records[targetIndex].messages, message]),
    updatedAt: new Date().toISOString(),
  }

  const nextRecords = [...records]
  nextRecords[targetIndex] = nextRecord
  writeChatHistoryRecords(nextRecords)

  return nextRecord
}

export const renameChatHistoryRecord = (conversationId: string, nextTitle: string) => {
  const records = readChatHistoryRecords()
  const targetIndex = records.findIndex((record) => record.id === conversationId)

  if (targetIndex === -1) {
    return null
  }

  const nextRecord = {
    ...records[targetIndex],
    title: nextTitle.trim() || records[targetIndex].title,
    updatedAt: new Date().toISOString(),
  }

  const nextRecords = [...records]
  nextRecords[targetIndex] = nextRecord
  writeChatHistoryRecords(nextRecords)

  return nextRecord
}

export const deleteChatHistoryRecord = (conversationId: string) => {
  const records = readChatHistoryRecords()
  const nextRecords = records.filter((record) => record.id !== conversationId)
  writeChatHistoryRecords(nextRecords)
  return nextRecords
}
