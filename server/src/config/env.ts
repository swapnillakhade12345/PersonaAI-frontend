import "dotenv/config";
import os from "node:os";
import path from "node:path";

// location where DB flie is store on user's device
const userDataRoot = process.platform === "win32"
  ? path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "PersonaAI")
  : process.platform === "darwin"
    ? path.join(os.homedir(), "Library", "Application Support", "PersonaAI")
    : path.join(process.env.XDG_DATA_HOME || path.join(os.homedir(), ".local", "share"), "personaai");
const configuredDataDir = process.env.DATA_DIR;

export const env = {
  port: Number(process.env.PORT || 3001),
  aiServiceUrl: process.env.AI_SERVICE_URL || "http://127.0.0.1:8000",
  ollamaUrl: process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434",
  model: process.env.OLLAMA_MODEL || "qwen2.5:7b",
  dataDir: configuredDataDir
    ? path.resolve(path.isAbsolute(configuredDataDir)
      ? configuredDataDir
      : path.join(userDataRoot, configuredDataDir))
    : userDataRoot
};
