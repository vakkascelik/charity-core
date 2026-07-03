/**
 * Resend email transport shared by the charity apps. Brand-agnostic: the sender
 * (`from`) is supplied by the caller — each app reads it from RESEND_FROM_EMAIL
 * and applies its own brand default. When RESEND_API_KEY is unset the message
 * is logged to the console instead of sent, so local development never fails.
 */
export type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  from: string;
  replyTo?: string;
};

export async function sendEmail({
  to,
  subject,
  html,
  from,
  replyTo,
}: SendEmailInput): Promise<{ ok: boolean; id?: string; reason?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

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
