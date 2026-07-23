import { randomUUID } from "crypto";
import { describe, expect, it } from "vitest";
import { getUsageToday, incrementUsage } from "@/lib/usage";

describe("usage tracking", () => {
  it("starts at zero for an unknown identity", async () => {
    const identity = `test:${randomUUID()}`;
    expect(await getUsageToday(identity)).toBe(0);
  });

  it("increments and persists the count for today", async () => {
    const identity = `test:${randomUUID()}`;
    expect(await incrementUsage(identity)).toBe(1);
    expect(await incrementUsage(identity)).toBe(2);
    expect(await getUsageToday(identity)).toBe(2);
  });

  it("tracks separate identities independently", async () => {
    const a = `test:${randomUUID()}`;
    const b = `test:${randomUUID()}`;
    await incrementUsage(a);
    expect(await getUsageToday(a)).toBe(1);
    expect(await getUsageToday(b)).toBe(0);
  });
});
