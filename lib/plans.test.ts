import { describe, expect, it } from "vitest";
import { getPlan, PLANS, GUEST_DAILY_LIMIT } from "@/lib/plans";

describe("plans", () => {
  it("defines free, plus and pro plans", () => {
    expect(PLANS.map((p) => p.id)).toEqual(["free", "plus", "pro"]);
  });

  it("free plan has no price and a daily message cap", () => {
    const free = getPlan("free");
    expect(free.priceMonthly).toBe(0);
    expect(free.dailyMessageLimit).toBeGreaterThan(0);
  });

  it("pro plan has unlimited messages", () => {
    const pro = getPlan("pro");
    expect(pro.dailyMessageLimit).toBeNull();
  });

  it("falls back to free for unknown or missing plan ids", () => {
    expect(getPlan("does-not-exist").id).toBe("free");
    expect(getPlan(null).id).toBe("free");
    expect(getPlan(undefined).id).toBe("free");
  });

  it("guest daily limit is lower than the free plan limit", () => {
    const free = getPlan("free");
    expect(GUEST_DAILY_LIMIT).toBeLessThan(free.dailyMessageLimit ?? Infinity);
  });
});
