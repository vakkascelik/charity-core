/**
 * Resolve the canonical site URL for metadata, sitemaps, and OG tags.
 *
 * Falls back through several sources so the app builds in any environment:
 *   1. NEXT_PUBLIC_SITE_URL (user-provided; protocol optional)
 *   2. NEXTAUTH_URL          (often set in the same envs)
 *   3. RAILWAY_PUBLIC_DOMAIN (set automatically by Railway)
 *   4. VERCEL_URL            (set automatically by Vercel)
 *   5. http://localhost:3000 (last-ditch dev fallback)
 *
 * We normalise: a value missing `https://` (e.g. just a hostname) is treated
 * as https. This keeps `new URL()` from throwing during the build if someone
 * pastes a bare domain into the env var.
 */
export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.RAILWAY_PUBLIC_DOMAIN ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  const trimmed = raw.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  // bare hostname → assume https in production, http for localhost
  const isLocal = /^(localhost|127\.|0\.0\.0\.0)/i.test(trimmed);
  return `${isLocal ? "http" : "https"}://${trimmed}`;
}

/** Absolute URL for a site-relative path (e.g. "/news/foo" → "https://…/news/foo"). */
export function absoluteUrl(path = ""): string {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}
