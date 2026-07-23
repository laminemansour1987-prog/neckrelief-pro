import { beforeAll, describe, expect, it } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";

beforeAll(() => {
  process.env.SESSION_SECRET = "test-secret-do-not-use-in-production";
});

describe("password hashing", () => {
  it("verifies a correct password", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(verifyPassword("correct horse battery staple", stored)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const stored = hashPassword("correct horse battery staple");
    expect(verifyPassword("wrong password", stored)).toBe(false);
  });

  it("produces different salts (and hashes) for the same password", () => {
    const a = hashPassword("same-password");
    const b = hashPassword("same-password");
    expect(a).not.toBe(b);
  });
});

describe("session tokens", () => {
  it("round-trips a valid token", async () => {
    const token = await createSessionToken("user@example.com");
    const email = await verifySessionToken(token);
    expect(email).toBe("user@example.com");
  });

  it("rejects a tampered token", async () => {
    const token = await createSessionToken("user@example.com");
    const tampered = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
    const email = await verifySessionToken(tampered);
    expect(email).toBeNull();
  });

  it("rejects a missing token", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
  });
});
