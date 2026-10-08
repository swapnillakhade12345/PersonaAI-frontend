# PersonaAI

PersonaAI is a privacy-preserving local desktop AI assistant designed for offline-first use. The project separates a desktop shell from a Node API gateway and a single Python AI service so the local AI stack, RAG pipeline, memory, tools, and orchestration logic can evolve without creating redundant microservices.

## Why it exists       
The goal is to explore how a local AI assistant can selectively decide when to use general knowledge, retrieved personal documents, memory, or local tools while keeping context small, latency reasonable, and private data local.

## Architecture
- Electron + React desktop shell
- Node.js + Express API boundary
- Python FastAPI AI service with the authoritative AI/RAG implementation
- Optional Ollama-backed local model

## Technology stack
- Frontend: Electron, React, TypeScript, Vite, Tailwind
- Gateway: Node.js, Express, TypeScript
- AI core: Python, FastAPI, Ollama, Qwen-ready configuration
- Research: modular RAG, memory, routing, evaluation modules

## Quick start
1. Install dependencies: `npm install`
2. Install Python service dependencies: `python -m pip install -r ai-service/requirements.txt`
3. Copy `.env.example` to `.env` and configure values if needed.
4. Start the AI service: `npm run ai`
5. Start the API: `npm run server`
6. Start the desktop UI: `npm run dev`

## Local model setup
Configure Ollama locally and set environment variables such as:

- `OLLAMA_BASE_URL=http://127.0.0.1:11434`
- `OLLAMA_MODEL=qwen`

If Ollama is unavailable, the service returns a clear starter response rather than crashing.

## Project structure
- `desktop/` — Electron + React app
- `server/` — Node API and gateway logic
- `ai-service/` — single authoritative Python AI core
- `docs/` — architecture and API docs
- `experiments/` — downstream research areas
- `tests/` — end-to-end coverage and harnesses

## Development workflow
- `npm run ai` starts the Python AI service
- `npm run server` starts the Node API
- `npm run dev` starts the server + renderer
- `npm run desktop` launches the Electron shell
- `npm run build` builds the renderer and server
- `npm test` runs the existing TypeScript test suite

## Research plan
The initial project is intentionally modular so later work can compare:
- LLM-only
- vector RAG
- hybrid retrieval
- reranking
- adaptive routing

See `docs/architecture/`, `docs/api/api-specification.md`, and `docs/research/` for starter references.
