const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:3001").replace(/\/$/, "")

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init)

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string; details?: string } | null
    throw new Error(body?.details || body?.error || `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export interface ChatResponse {
  response: string
  conversationId: string
  route?: string
  model?: string
  sources?: unknown[]
}

export interface ChatSummary {
  id: string
  title: string
  created_at: string
  updated_at: string
}

export interface DocumentSummary {
  id: string
  name: string
  createdAt: string
}

export function createChat(id: string, title: string) {
  return request<ChatSummary>("/api/chats", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title }),
  })
}

//Non-streaming API helper
export function sendChatMessage(message: string, chatId: string) {
  return request<ChatResponse>(`/api/chats/${encodeURIComponent(chatId)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
}

export function listDocuments() {
  return request<DocumentSummary[]>("/api/documents")
}

export function uploadDocument(file: File) {
  const formData = new FormData()
  formData.append("file", file, file.name)
  return request<DocumentSummary>("/api/documents/upload", {
    method: "POST",
    body: formData,
  })
}