export interface ChatMessage {
  id: number
  sender: "user" | "ai"
  text: string
}

interface ChatSnapshot {
  messages: ChatMessage[]
  isTyping: boolean
  hasStartedStreaming: boolean
}

interface PersistedChat {
  messages: ChatMessage[]
  pendingAssistantMessageId: number | null
}

const storageKey = "personaAI_chat"
const listeners = new Set<() => void>()
let activeRequest: AbortController | null = null
let pendingAssistantMessageId: number | null = null
let recoveredInterruptedStream = false

function initialMessages(): ChatMessage[] {
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    try {
      const parsed = JSON.parse(stored) as ChatMessage[] | PersistedChat
      const messages = Array.isArray(parsed) ? parsed : parsed.messages
      pendingAssistantMessageId = Array.isArray(parsed)
        ? null
        : parsed.pendingAssistantMessageId

      if (Array.isArray(messages)) {
        if (pendingAssistantMessageId !== null) {
          const interruptedMessageId = pendingAssistantMessageId
          pendingAssistantMessageId = null
          recoveredInterruptedStream = true
          return messages.map((message) =>
            message.id === interruptedMessageId
              ? {
                  ...message,
                  text: message.text
                    ? `${message.text}\n\n[Response interrupted when the app was refreshed.]`
                    : "[Response interrupted when the app was refreshed.]",
                }
              : message
          )
        }
        return messages
      }
    } catch {
      return []
    }
  }

  return []
}

let snapshot: ChatSnapshot = {
  messages: initialMessages(),
  isTyping: false,
  hasStartedStreaming: false,
}

function persistMessages(): void {
  localStorage.setItem(
    storageKey,
    JSON.stringify({
      messages: snapshot.messages,
      pendingAssistantMessageId,
    } satisfies PersistedChat)
  )
}

if (recoveredInterruptedStream) {
  persistMessages()
}

function publish(nextSnapshot: ChatSnapshot): void {
  snapshot = nextSnapshot
  persistMessages()
  listeners.forEach((listener) => listener())
}

function updateMessages(update: (messages: ChatMessage[]) => ChatMessage[]): void {
  publish({ ...snapshot, messages: update(snapshot.messages) })
}

export function subscribeToChat(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getChatSnapshot(): ChatSnapshot {
  return snapshot
}

export async function sendChatMessage(message: string, conversationId: string): Promise<void> {
  if (snapshot.isTyping) return

  const userMessage: ChatMessage = {
    id: Date.now(),
    sender: "user",
    text: message,
  }
  const assistantMessageId = userMessage.id + 1
  const controller = new AbortController()
  activeRequest = controller
  pendingAssistantMessageId = assistantMessageId

  publish({
    messages: [
      ...snapshot.messages,
      userMessage,
      { id: assistantMessageId, sender: "ai", text: "" },
    ],
    isTyping: true,
    hasStartedStreaming: false,
  })

  try {
    const createResponse = await fetch("http://127.0.0.1:3001/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: conversationId,
        title: message.trim().slice(0, 80) || "New chat",
      }),
      signal: controller.signal,
    })

    if (!createResponse.ok) {
      const responseText = await createResponse.text()
      throw new Error(responseText || `Could not create chat (${createResponse.status})`)
    }

    const response = await fetch(
      `http://127.0.0.1:3001/api/chats/${encodeURIComponent(conversationId)}/messages/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
        signal: controller.signal,
      }
    )

    if (!response.ok) {
      const responseText = await response.text()
      let errorMessage = responseText
      try {
        const body = JSON.parse(responseText) as { detail?: string; error?: string }
        errorMessage = body.detail || body.error || responseText
      } catch {
        // Keep the plain-text response as the error message.
      }
      throw new Error(errorMessage || `Request failed: ${response.status}`)
    }
    if (!response.body) {
      throw new Error("The server returned no response stream.")
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      if (chunk) {
        publish({ ...snapshot, hasStartedStreaming: true })
        updateMessages((messages) =>
          messages.map((chatMessage) =>
            chatMessage.id === assistantMessageId
              ? { ...chatMessage, text: chatMessage.text + chunk }
              : chatMessage
          )
        )
      }
    }

    const finalChunk = decoder.decode()
    if (finalChunk) {
      updateMessages((messages) =>
        messages.map((chatMessage) =>
          chatMessage.id === assistantMessageId
            ? { ...chatMessage, text: chatMessage.text + finalChunk }
            : chatMessage
        )
      )
    }

    if (!snapshot.messages.find((chatMessage) => chatMessage.id === assistantMessageId)?.text) {
      updateMessages((messages) =>
        messages.map((chatMessage) =>
          chatMessage.id === assistantMessageId
            ? { ...chatMessage, text: "The AI service returned an empty response." }
            : chatMessage
        )
      )
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      const errorMessage =
        error instanceof Error ? error.message : "Could not reach the server."
      updateMessages((messages) =>
        messages.map((chatMessage) =>
          chatMessage.id === assistantMessageId
            ? {
                ...chatMessage,
                text: chatMessage.text
                  ? `${chatMessage.text}\n\n[Stream interrupted: ${errorMessage}]`
                  : `Sorry, I couldn't get a response. ${errorMessage}`,
              }
            : chatMessage
        )
      )
    }
  } finally {
    if (activeRequest === controller) {
      activeRequest = null
      pendingAssistantMessageId = null
      publish({ ...snapshot, isTyping: false, hasStartedStreaming: false })
    }
  }
}

export function stopChatResponse(): void {
  if (!activeRequest) {
    return
  }

  const controller = activeRequest
  activeRequest = null
  pendingAssistantMessageId = null
  controller.abort()

  publish({
    ...snapshot,
    isTyping: false,
    hasStartedStreaming: false,
  })
}

export function clearChatMessages(): void {
  activeRequest?.abort()
  activeRequest = null
  pendingAssistantMessageId = null
  publish({
    messages: [],
    isTyping: false,
    hasStartedStreaming: false,
  })
}