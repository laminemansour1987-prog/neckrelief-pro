import { promises as fs } from "fs";
import path from "path";

// Lightweight file-backed user store for demo/dev purposes.
// Swap this for a real database before going to production.

export interface UserRecord {
  email: string;
  passwordHash: string;
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "users.json");

async function readAll(): Promise<Record<string, UserRecord>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, UserRecord>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function createUser(email: string, passwordHash: string): Promise<UserRecord> {
  const all = await readAll();
  const key = email.toLowerCase();
  if (all[key]) {
    throw new Error("Un compte existe déjà avec cet email.");
  }
  const record: UserRecord = { email: key, passwordHash, createdAt: new Date().toISOString() };
  all[key] = record;
  await writeAll(all);
  return record;
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const all = await readAll();
  return all[email.toLowerCase()] ?? null;
}
