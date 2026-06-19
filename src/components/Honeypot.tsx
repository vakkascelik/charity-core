"use client";
import { useRef } from "react";

/**
 * Spam honeypot for public forms. Renders a visually-hidden field that real
 * users never fill; bots that auto-complete every input will populate it, and
 * the server (see lib/rate-limit `looksLikeBot`) silently drops those.
 *
 * Usage:
 *   const hp = useHoneypot();
 *   ...
 *   {hp.field}
 *   body: JSON.stringify({ ...payload, company: hp.value() })
 */
export function useHoneypot() {
  const ref = useRef<HTMLInputElement>(null);
  const field = (
    <input
      ref={ref}
      type="text"
      name="company"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      style={{
        position: "absolute",
        left: "-9999px",
        width: 1,
        height: 1,
        opacity: 0,
        pointerEvents: "none",
      }}
    />
  );
  const value = () => ref.current?.value ?? "";
  return { field, value };
}
