import { randomUUID } from "node:crypto";
import { database } from "./database.js";

export type MessageRole = "ai" | "user" | "system";

export interface Chat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  role: MessageRole;
  conversation_id: string;
  created_at: string;
}

export function createChatIfMissing(id: string, title: string): void {
  const now = new Date().toISOString();
  database.prepare(`
    INSERT OR IGNORE INTO chats (id, title, created_at, updated_at)
    VALUES (?, ?, ?, ?)
  `).run(id, title, now, now);
}

export function addMessage(
  conversationId: string,
  content: string,
  role: MessageRole
): ChatMessage {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const addMessageAndUpdateChat = database.transaction(() => {
    const result = database.prepare(`
      INSERT INTO messages (id, content, role, conversation_id, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, content, role, conversationId, createdAt);

    if (result.changes !== 1) {
      throw new Error("Could not save chat message");
    }

    database.prepare(`
      UPDATE chats SET updated_at = ? WHERE id = ?
    `).run(createdAt, conversationId);
  });

  addMessageAndUpdateChat();
  return {
    id,
    content,
    role,
    conversation_id: conversationId,
    created_at: createdAt
  };
}

export function listChats(): Chat[] {
  return database.prepare(`
    SELECT id, title, created_at, updated_at
    FROM chats
    ORDER BY updated_at DESC
  `).all() as Chat[];
}

export function getChat(id: string): Chat | undefined {
  return database.prepare(`
    SELECT id, title, created_at, updated_at
    FROM chats
    WHERE id = ?
  `).get(id) as Chat | undefined;
}

export function getChatMessages(conversationId: string): ChatMessage[] {
  return database.prepare(`
    SELECT id, content, role, conversation_id, created_at
    FROM messages
    WHERE conversation_id = ?
    ORDER BY created_at ASC, rowid ASC
  `).all(conversationId) as ChatMessage[];
}

export function updateChatTitle(id: string, title: string): Chat | undefined {
  const result = database.prepare(`
    UPDATE chats
    SET title = ?, updated_at = ?
    WHERE id = ?
  `).run(title, new Date().toISOString(), id);

  if (result.changes !== 1) {
    return undefined;
  }

  return database.prepare(`
    SELECT id, title, created_at, updated_at
    FROM chats
    WHERE id = ?
  `).get(id) as Chat | undefined;
}

export function deleteChat(id: string): boolean {
  return database.prepare("DELETE FROM chats WHERE id = ?").run(id).changes === 1;
}
