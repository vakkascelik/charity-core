/**
 * Email helper. Uses Resend when RESEND_API_KEY is set; otherwise logs the
 * message to the server console so local development never fails.
 *
 * Shared across charity apps — the sender and notification addresses come from
 * env so each app brands its own mail:
 *   RESEND_FROM_EMAIL        e.g. "Pearl of the Islands <hello@pif.org.nz>"
 *   RESEND_NOTIFICATIONS_TO  e.g. "info@pif.org.nz"
 */
type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
}: SendEmailInput): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? "Charity <noreply@example.org>";

  if (!apiKey) {
    console.info(
      `[email:dev] would send "${subject}" to ${Array.isArray(to) ? to.join(", ") : to}`,
    );
    return { ok: true, reason: "logged-only" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      reply_to: replyTo,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[email] Resend send failed", res.status, text);
    return { ok: false, reason: text };
  }
  const data = (await res.json()) as { id?: string };
  return { ok: true, id: data.id };
}

export function notifyAddress(): string {
  return process.env.RESEND_NOTIFICATIONS_TO ?? "info@example.org";
}

/**
 * Escape untrusted text before interpolating it into an HTML email body.
 * Prevents visitors from injecting markup (phishing links, spoofed content)
 * into notification emails sent to staff.
 */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
