import { NextResponse } from "next/server";

/**
 * Lightweight in-memory protection for public, unauthenticated form endpoints.
 *
 * The rate limiter is a fixed-window counter kept in a module-level Map. It is
 * per-instance and resets on redeploy — not a distributed limiter — but that is
 * sufficient to stop casual flooding of a low-traffic charity site's forms
 * (which each write a row and send an email). For stronger guarantees put a WAF
 * / edge rate limit in front.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Returns true when the request for `key` is allowed; false when throttled. */
export function rateLimit(key: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 10_000) {
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}

/** Best-effort client IP from proxy headers (Railway sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Honeypot: forms render a hidden `company` field that humans never see. If it
 * arrives filled, the submission is almost certainly an automated bot.
 */
export function looksLikeBot(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const hp = (body as Record<string, unknown>).company;
  return typeof hp === "string" && hp.trim().length > 0;
}

/**
 * Guard for public POST routes. Pass the parsed JSON body and a route key.
 * Returns a Response to short-circuit with, or null when the request may
 * proceed. Honeypot hits get a fake 200 so bots can't detect the trap.
 */
export function publicFormGuard(
  req: Request,
  body: unknown,
  key: string,
  limit = 5,
  windowMs = 60_000,
): NextResponse | null {
  if (looksLikeBot(body)) {
    return NextResponse.json({ ok: true });
  }
  if (!rateLimit(`${key}:${clientIp(req)}`, limit, windowMs)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }
  return null;
}
