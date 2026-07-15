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

export type BatchEmailItem = {
  from: string;
  to: string;
  subject: string;
  html: string;
  headers?: Record<string, string>;
};

export type BatchSendResult = {
  sent: number;
  failed: number;
  /** Addresses Resend rejected, with its reason — surface these to the admin. */
  failures: Array<{ to: string; reason: string }>;
};

/**
 * Send a list of emails through Resend's batch endpoint: 100 per request (the
 * API cap), paced to the 2 req/s rate limit.
 *
 * Validation is set to permissive. In the default strict mode one malformed
 * address makes Resend reject its whole 100-email request, silently skipping
 * 99 good recipients — permissive mode queues the good ones and reports the
 * bad ones per address in `failures`.
 */
export async function sendEmailBatch(emails: BatchEmailItem[]): Promise<BatchSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.info(`[email:dev] would batch-send ${emails.length} emails`);
    return { sent: emails.length, failed: 0, failures: [] };
  }

  let sent = 0;
  const failures: Array<{ to: string; reason: string }> = [];

  for (let i = 0; i < emails.length; i += 100) {
    if (i > 0) await new Promise((r) => setTimeout(r, 600));
    const chunk = emails.slice(i, i + 100);
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
        "x-batch-validation": "permissive",
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("[email] batch request failed", res.status, text);
      for (const e of chunk) failures.push({ to: e.to, reason: `HTTP ${res.status}` });
      continue;
    }
    const json = (await res.json()) as {
      data?: { id: string }[];
      errors?: { index: number; message: string }[];
    };
    const errs = json.errors ?? [];
    for (const err of errs) {
      failures.push({ to: chunk[err.index]?.to ?? `#${i + err.index}`, reason: err.message });
    }
    sent += json.data?.length ?? chunk.length - errs.length;
  }

  if (failures.length) {
    console.error("[email] rejected recipients:", JSON.stringify(failures));
  }
  return { sent, failed: failures.length, failures };
}
