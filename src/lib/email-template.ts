/**
 * Brand-parameterized HTML email wrapper shared by the charity apps.
 * The body is plain text: paragraphs separated by blank lines; single
 * newlines become <br>.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function brandedEmailHtml({
  orgName,
  accent,
  siteUrl,
  subject,
  bodyText,
  unsubscribeUrl,
  kicker,
}: {
  orgName: string;
  /** Brand color for the header band and links, e.g. "#b5451b". */
  accent: string;
  siteUrl: string;
  subject: string;
  /** Plain text; blank-line separated paragraphs. Escaped here. */
  bodyText: string;
  /** Omit to skip the unsubscribe footer line (e.g. transactional mail). */
  unsubscribeUrl?: string;
  /** Small line under the org name in the header (e.g. issue + date). */
  kicker?: string;
}): string {
  const paragraphs = bodyText
    .split(/\n{2,}/)
    .map(
      (p) =>
        `<p style="color:#444;font-size:16px;line-height:1.65;margin:0 0 18px;font-family:sans-serif">${escapeHtml(p.trim()).replace(/\n/g, "<br>")}</p>`,
    )
    .join("");
  const unsub = unsubscribeUrl
    ? `<br><a href="${unsubscribeUrl}" style="color:${accent};text-decoration:none">Unsubscribe</a> from these emails.`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(subject)}</title></head>
<body style="margin:0;padding:0;background:#f5f0e8;font-family:Georgia,serif">
  <div style="max-width:600px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.07)">
    <div style="background:${accent};padding:28px 32px">
      <div style="color:#fff;font-family:sans-serif;font-size:22px;font-weight:700;letter-spacing:-0.3px">
        ${escapeHtml(orgName)}
      </div>
      ${kicker ? `<div style="margin-top:8px;color:rgba(255,255,255,0.75);font-family:sans-serif;font-size:13px">${escapeHtml(kicker)}</div>` : ""}
    </div>
    <div style="padding:36px 32px">
      <h1 style="margin:0 0 20px;font-size:24px;color:#1a1a18;line-height:1.3">${escapeHtml(subject)}</h1>
      ${paragraphs}
    </div>
    <div style="padding:20px 32px;border-top:1px solid #eee;font-size:12px;color:#aaa;font-family:sans-serif;line-height:1.6">
      You&rsquo;re receiving this because you subscribed at
      <a href="${siteUrl}" style="color:${accent};text-decoration:none">${siteUrl}</a>.${unsub}
    </div>
  </div>
</body>
</html>`;
}
