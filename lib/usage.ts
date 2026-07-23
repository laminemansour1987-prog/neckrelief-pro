import { promises as fs } from "fs";
import path from "path";

// Server-side daily usage counters, file-backed for demo/dev purposes.
// Swap for a real database (or Redis, for atomic increments) in production.

interface UsageEntry {
  date: string;
  count: number;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "usage.json");

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

async function readAll(): Promise<Record<string, UsageEntry>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, UsageEntry>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function getUsageToday(identity: string): Promise<number> {
  const all = await readAll();
  const entry = all[identity];
  if (!entry || entry.date !== todayKey()) return 0;
  return entry.count;
}

/** Increments and returns the new count for today. */
export async function incrementUsage(identity: string): Promise<number> {
  const all = await readAll();
  const today = todayKey();
  const entry = all[identity];
  const newCount = entry && entry.date === today ? entry.count + 1 : 1;
  all[identity] = { date: today, count: newCount };
  await writeAll(all);
  return newCount;
}
