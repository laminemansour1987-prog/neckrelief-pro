import { prisma } from "@/lib/db";
import type { PlanId } from "@/lib/plans";

export interface SubscriberRecord {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: PlanId;
  status: string;
  updatedAt: string;
}

function toRecord(row: {
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  plan: string;
  status: string;
  updatedAt: Date;
}): SubscriberRecord {
  return {
    email: row.email,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    plan: row.plan as PlanId,
    status: row.status,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function upsertSubscriber(record: Omit<SubscriberRecord, "updatedAt">) {
  const email = record.email.toLowerCase();
  await prisma.subscriber.upsert({
    where: { email },
    create: { ...record, email },
    update: { ...record, email },
  });
}

export async function getSubscriberByEmail(email: string): Promise<SubscriberRecord | null> {
  const row = await prisma.subscriber.findUnique({ where: { email: email.toLowerCase() } });
  return row ? toRecord(row) : null;
}

export async function getSubscriberByCustomerId(customerId: string): Promise<SubscriberRecord | null> {
  const row = await prisma.subscriber.findFirst({ where: { stripeCustomerId: customerId } });
  return row ? toRecord(row) : null;
}
