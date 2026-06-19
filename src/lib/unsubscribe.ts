import { createHmac, timingSafeEqual } from "crypto";
import { getSiteUrl } from "./site-url";

/**
 * Signed, stateless unsubscribe links for newsletter emails. The token is an
 * HMAC of the subscriber's email with the app secret, so no per-subscriber
 * token needs to be stored and links can't be forged or enumerated.
 */

function secret(): string {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "dev-secret-change-me"
  );
}

export function unsubscribeToken(email: string): string {
  return createHmac("sha256", secret())
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  if (!email || !token) return false;
  const expected = unsubscribeToken(email);
  if (token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/** Human-facing confirmation page link (shown as "Unsubscribe" in the email). */
export function unsubscribePageUrl(email: string): string {
  return `${getSiteUrl()}/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}

/** RFC 8058 one-click endpoint for the List-Unsubscribe header. */
export function unsubscribeOneClickUrl(email: string): string {
  return `${getSiteUrl()}/api/unsubscribe?e=${encodeURIComponent(email)}&t=${unsubscribeToken(email)}`;
}
