"use client";

import { useEffect } from "react";

/**
 * Persists a ?ref=CODE query param so a referral survives across pages until
 * the visitor eventually signs up. Mounted once in the root layout.
 */
export default function RefCapture() {
  useEffect(() => {
    try {
      const ref = new URLSearchParams(window.location.search).get("ref");
      if (ref) {
        window.localStorage.setItem("aura_ref", ref.toUpperCase().slice(0, 16));
      }
    } catch {
      // localStorage unavailable — referral just won't be attributed
    }
  }, []);

  return null;
}
