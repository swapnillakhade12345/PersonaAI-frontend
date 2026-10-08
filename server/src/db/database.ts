import { mkdirSync } from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { env } from "../config/env.js";
import { schema } from "./schema.js";

mkdirSync(env.dataDir, { recursive: true });

export const database = new Database(path.join(env.dataDir, "personaai.sqlite"));
database.pragma("foreign_keys = ON");
database.exec(schema);
