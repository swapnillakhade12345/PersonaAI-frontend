from __future__ import annotations

import logging

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
import requests

from app.config.settings import settings
from app.services.ollama_client import (
    SYSTEM_PROMPT,
    ask_ollama,
    chat_ollama,
    check_ollama,
    stream_ollama,
)

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="PersonaAI AI Service", version="0.1.0")

# Temporary in-memory history so we can test continuity before Node stores messages.
# Lost on restart; Node/DB will replace this later.
_histories: dict[str, list[dict]] = {}
MAX_HISTORY_MESSAGES = 20


class Message(BaseModel):
    role: str
    content: str

    @field_validator("role")
    @classmethod
    def normalize_role(cls, value: str) -> str:
        value = value.strip().lower()
        if value == "ai":
            value = "assistant"
        if value not in {"user", "assistant"}:
            raise ValueError("role must be 'user' or 'assistant'")
        return value


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversationId: str | None = "default"
    context: dict | None = None
    messages: list[Message] | None = None  # optional history sent by the caller
    think: bool = False                    # temporary switch for testing Fast vs Think


class ChatResponse(BaseModel):
    response: str
    conversationId: str
    route: str = "GENERAL"
    model: str = settings.ollama_model
    sources: list[dict] = Field(default_factory=list)
    metrics: dict | None = None


def _build_messages(request: ChatRequest, conversation_id: str) -> tuple[list[dict], list[dict]]:
    if request.messages is not None:
        history = [m.model_dump() for m in request.messages]
    else:
        history = list(_histories.get(conversation_id, []))

    history = [
        message
        for message in history
        if isinstance(message, dict) and "role" in message and "content" in message
    ]

    messages: list[dict] = [{"role": "system", "content": SYSTEM_PROMPT}]

    if request.context:
        context_text = "\n".join(
            f"{key}: {value}" for key, value in request.context.items() if value is not None
        )
        if context_text:
            messages.append({"role": "system", "content": f"Context:\n{context_text}"})

    messages.extend(history)
    messages.append({"role": "user", "content": request.message})

    logger = logging.getLogger("personaai.api")
    logger.info(
        "conversation=%s history_from_caller=%s history_count=%d",
        conversation_id,
        request.messages is not None,
        len(history),
    )

    return history, messages


@app.get("/api/health")
async def health() -> dict:
    ollama = check_ollama()
    return {
        "ok": True,
        "status": "healthy",
        "service": "ai-service",
        "ollama": ollama,
        "model": settings.ollama_model,
    }


@app.post("/api/chat")
def chat(request: ChatRequest) -> ChatResponse:  # plain def: runs in a thread pool
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="message is required")

    conversation_id = request.conversationId or "default"
    history, messages = _build_messages(request, conversation_id)

    try:
        result = chat_ollama(messages, think=request.think)
    except requests.RequestException as error:
        raise HTTPException(status_code=502, detail=f"Ollama request failed: {error}")

    answer = result["content"]

    _histories[conversation_id] = [
        *history,
        {"role": "user", "content": request.message},
        {"role": "assistant", "content": answer},
    ][-MAX_HISTORY_MESSAGES:]

    return ChatResponse(
        response=answer,
        conversationId=conversation_id,
        route="GENERAL",
        model=settings.ollama_model,
        sources=[],
        metrics=result.get("metrics"),
    )


@app.post("/api/chat/stream")
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="message is required")

    conversation_id = request.conversationId or "default"
    history, messages = _build_messages(request, conversation_id)

    async def event_stream():
        parts: list[str] = []
        async for chunk in stream_ollama(messages, think=request.think):
            parts.append(chunk)
            yield chunk

        answer = "".join(parts)
        if answer:
            _histories[conversation_id] = [
                *history,
                {"role": "user", "content": request.message},
                {"role": "assistant", "content": answer},
            ][-MAX_HISTORY_MESSAGES:]

    return StreamingResponse(
        event_stream(),
        media_type="text/plain; charset=utf-8",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
        },
    )


@app.get("/api/documents")
async def list_documents() -> list[dict]:
    return []


@app.post("/api/documents/upload")
async def upload_document() -> dict:
    return {"id": "doc-1", "name": "uploaded-file.txt", "createdAt": "2025-01-01T00:00:00Z"}


@app.post("/api/documents/search")
async def search_documents(query: str | None = None, limit: int = 5) -> list[dict]:
    return [{"id": "doc-1", "score": 0.0, "text": f"Document search placeholder for query: {query or 'none'}"}]


@app.get("/api/conversations/{conversation_id}")
async def get_conversation(conversation_id: str) -> dict:
    return {"conversationId": conversation_id, "entries": []}


@app.post("/api/memory/search")
async def search_memory() -> dict:
    return {"conversationId": "default", "entries": []}


@app.post("/api/tools/execute")
async def execute_tool() -> dict:
    return {"ok": True, "result": "Tool service placeholder"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)