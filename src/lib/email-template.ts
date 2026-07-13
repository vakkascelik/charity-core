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

/** A single blank-line-separated paragraph, styled like the rest of the email body. */
export function paragraphHtml(p: string): string {
  return `<p style="color:#444;font-size:16px;line-height:1.65;margin:0 0 18px;font-family:sans-serif">${escapeHtml(p.trim()).replace(/\n/g, "<br>")}</p>`;
}

function renderParagraphs(bodyText: string): string {
  return bodyText.split(/\n{2,}/).map(paragraphHtml).join("");
}

/**
 * A CTA block for "read the full thing online": optional cover image (e.g.
 * a PDF's first page), an accent button, and the plain URL underneath for
 * clients that block images. Shared by any email that links out to a
 * hosted document (newsletters, reports, …).
 */
export function coverLinkBlock({
  url,
  accent,
  coverUrl,
  coverAlt,
  ctaText = "Read more &rarr;",
}: {
  url: string;
  /** Brand color for the button and link text. */
  accent: string;
  coverUrl?: string | null;
  /** Required when `coverUrl` is set. */
  coverAlt?: string;
  ctaText?: string;
}): string {
  const cover = coverUrl
    ? `<a href="${url}" target="_blank" style="display:block;margin:0 0 22px">
         <img src="${coverUrl}" alt="${escapeHtml(coverAlt ?? "")}" width="536"
           style="display:block;width:100%;max-width:536px;height:auto;border:1px solid #e6e0d6;border-radius:10px" />
       </a>`
    : "";
  return `${cover}
    <a href="${url}" target="_blank"
      style="display:inline-block;background:${accent};color:#ffffff;padding:14px 28px;border-radius:10px;font-size:15px;font-family:sans-serif;font-weight:600;text-decoration:none">
      ${ctaText}
    </a>
    <p style="color:#777;font-size:13.5px;line-height:1.6;margin:14px 0 22px;font-family:sans-serif;word-break:break-all">
      <a href="${url}" style="color:${accent};text-decoration:none">${url}</a>
    </p>`;
}

export function brandedEmailHtml({
  orgName,
  accent,
  siteUrl,
  subject,
  bodyText,
  bodyHtml,
  unsubscribeUrl,
  kicker,
  showTitle = true,
}: {
  orgName: string;
  /** Brand color for the header band and links, e.g. "#b5451b". */
  accent: string;
  siteUrl: string;
  /** Used for the `<title>` tag and, when `showTitle` is true, the `<h1>`. */
  subject: string;
  /** Plain text; blank-line separated paragraphs. Escaped here. Ignored when `bodyHtml` is set. */
  bodyText?: string;
  /** Pre-rendered body HTML (e.g. `paragraphHtml`/`coverLinkBlock` output spliced together). Takes priority over `bodyText`. */
  bodyHtml?: string;
  /** Omit to skip the unsubscribe footer line (e.g. transactional mail). */
  unsubscribeUrl?: string;
  /** Small line under the org name in the header (e.g. issue + date). */
  kicker?: string;
  /** Set false to omit the `<h1>` — e.g. when the subject is already restated in the body. Default true. */
  showTitle?: boolean;
}): string {
  const paragraphs = bodyHtml ?? renderParagraphs(bodyText ?? "");
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
      ${showTitle ? `<h1 style="margin:0 0 20px;font-size:24px;color:#1a1a18;line-height:1.3">${escapeHtml(subject)}</h1>` : ""}
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
