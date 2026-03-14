import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, "../../../data");
const dbPath = path.join(dataDir, "app.db");
const schemaPath = path.join(__dirname, "schema.sql");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(dbPath);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

export function runSchema(): void {
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  db.exec(schemaSql);
}

export function nowIso(): string {
  return new Date().toISOString();
}
