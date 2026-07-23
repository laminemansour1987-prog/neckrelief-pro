import { promises as fs } from "fs";
import path from "path";
import type { PlanId } from "./plans";

// Lightweight file-backed store for demo/dev purposes.
// Swap this for a real database (Postgres, etc.) before going to production.

interface SubscriberRecord {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: PlanId;
  status: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "subscribers.json");

async function readAll(): Promise<Record<string, SubscriberRecord>> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeAll(data: Record<string, SubscriberRecord>) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function upsertSubscriber(record: SubscriberRecord) {
  const all = await readAll();
  all[record.email.toLowerCase()] = record;
  await writeAll(all);
}

export async function getSubscriberByEmail(
  email: string
): Promise<SubscriberRecord | null> {
  const all = await readAll();
  return all[email.toLowerCase()] ?? null;
}

export async function getSubscriberByCustomerId(
  customerId: string
): Promise<SubscriberRecord | null> {
  const all = await readAll();
  return (
    Object.values(all).find((s) => s.stripeCustomerId === customerId) ?? null
  );
}
