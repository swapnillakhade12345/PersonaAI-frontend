import { randomUUID } from "node:crypto";
import express from "express";
import { AIServiceClient } from "../services/ai-service.client.js";
import { env } from "../config/env.js";
import {
  addMessage,
  createChatIfMissing,
  deleteChat,
  getChat,
  getChatMessages,
  listChats,
  updateChatTitle
} from "../db/chat.repository.js";

export const router = express.Router();
const aiClient = new AIServiceClient(env.aiServiceUrl);

// List chats so the client can show the user's conversations. -> working
router.get("/", (_req, res) => {
  res.json(listChats());
});

// Create a chat; accepting an ID lets the desktop client retry creation safely. -> working, just need to improve the timestamps
router.post("/", (req, res, next) => {
  try {
    const { id, title = "New chat" } = req.body || {};
    if (id !== undefined && (typeof id !== "string" || !id.trim())) {
      return res.status(400).json({ error: "id must be a non-empty string" });
    }
    if (typeof title !== "string" || !title.trim()) {
      return res.status(400).json({ error: "title must be a non-empty string" });
    }

    const chatId = typeof id === "string" ? id.trim() : randomUUID();
    const existed = Boolean(getChat(chatId));
    createChatIfMissing(chatId, title.trim());
    const chat = getChat(chatId);
    if (!chat) {
      throw new Error("Could not create chat");
    }
    res.status(existed ? 200 : 201).json(chat);
  } catch (error) {
    next(error);
  }
});

// Get one chat's details. -> working ! gives chatID, timestamps
router.get("/:chatId", (req, res) => {
  const chat = getChat(req.params.chatId);
  if (!chat) {
    return res.status(404).json({ error: "chat not found" });
  }
  res.json(chat);
});

// Get all messages that belong to a chat. -> working
router.get("/:chatId/messages", (req, res) => {
  if (!getChat(req.params.chatId)) {
    return res.status(404).json({ error: "chat not found" });
  }
  res.json(getChatMessages(req.params.chatId));
});

// Rename a chat and update its modified timestamp. -> working, need to improve timestamps
router.patch("/:chatId", (req, res) => {
  const { title } = req.body || {};
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required" });
  }

  const chat = updateChatTitle(req.params.chatId, title.trim());
  if (!chat) {
    return res.status(404).json({ error: "chat not found" });
  }
  res.json(chat);
});

// Delete a chat; SQLite removes its messages through the foreign-key cascade. - working
router.delete("/:chatId", (req, res) => {
  if (!deleteChat(req.params.chatId)) {
    return res.status(404).json({ error: "chat not found" });
  }
  res.status(204).end();
});

// without streaming <-- thinking mode
// Save a user message, get the AI reply, and return both message data and reply metadata. - working
router.post("/:chatId/messages", async (req, res, next) => {
  try {
    const { message } = req.body || {};
    const chatId = req.params.chatId;
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (!getChat(chatId)) {
      return res.status(404).json({ error: "chat not found" });
    }

    const userMessage = addMessage(chatId, message, "user");
    const response = await aiClient.chat({ message, conversationId: chatId });
    const assistantMessage = addMessage(chatId, response.response, "ai");
    res.json({ ...response, userMessage, assistantMessage });
  } catch (error) {
    next(error);
  }
});

// Stream the AI reply for a chat while saving the user message and completed reply.
router.post("/:chatId/messages/stream", async (req, res, next) => {
  const abortController = new AbortController();
  res.on("close", () => {
    if (!res.writableEnded) abortController.abort();
  });

  try {
    const { message } = req.body || {};
    const chatId = req.params.chatId;
    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }
    if (!getChat(chatId)) {
      return res.status(404).json({ error: "chat not found" });
    }

    addMessage(chatId, message, "user");
    const upstream = await aiClient.streamChat(
      { message, conversationId: chatId },
      abortController.signal
    );

    if (!upstream.ok) {
      const errorText = await upstream.text();
      return res.status(upstream.status).send(errorText || upstream.statusText);
    }
    if (!upstream.body) {
      return res.status(502).json({ error: "AI service returned no stream" });
    }

    res.setHeader(
      "Content-Type",
      upstream.headers.get("content-type") || "text/plain; charset=utf-8"
    );
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = "";
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done || res.destroyed) break;
        const chunk = Buffer.from(value);
        assistantContent += decoder.decode(chunk, { stream: true });
        if (!res.write(chunk)) {
          await new Promise<void>((resolve) => res.once("drain", resolve));
        }
      }
      assistantContent += decoder.decode();
    } finally {
      reader.releaseLock();
    }

    if (assistantContent) {
      addMessage(chatId, assistantContent, "ai");
    }
    res.end();
  } catch (error) {
    if (abortController.signal.aborted) {
      if (!res.writableEnded) res.end();
      return;
    }
    if (res.headersSent) {
      res.destroy(error instanceof Error ? error : undefined);
      return;
    }
    next(error);
  }
});
