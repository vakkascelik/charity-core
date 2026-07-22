/**
 * Admin-entered video links (YouTube and friends) on events, news posts, etc.
 *
 * Public pages **link out** rather than embed. Two reasons, both learned the
 * hard way elsewhere in this codebase: the app's CSP allows no YouTube
 * `frame-src` and no `i.ytimg.com` in `img-src`, so an iframe or a thumbnail
 * would render as an empty box; and linking keeps YouTube's cookies off the
 * site entirely. Don't "improve" this into an embed without widening the CSP.
 */

/** Well-known video hosts, so the button can say "Watch on YouTube". */
const HOSTS: Array<[RegExp, string]> = [
  [/^(.*\.)?(youtube\.com|youtu\.be|youtube-nocookie\.com)$/, "YouTube"],
  [/^(.*\.)?vimeo\.com$/, "Vimeo"],
  [/^(.*\.)?(facebook\.com|fb\.watch)$/, "Facebook"],
];

/**
 * Accept only absolute http(s) URLs; everything else (javascript:, data:,
 * a bare "youtube.com/watch…", typos) becomes null so the link never renders.
 */
export function cleanVideoUrl(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  if (!/^https?:\/\//i.test(s)) return null;
  try {
    return new URL(s).toString();
  } catch {
    return null;
  }
}

/** "YouTube" / "Vimeo" / the bare hostname — the label for the watch button. */
export function videoHostLabel(url: string): string {
  try {
    const host = new URL(url).hostname.toLowerCase();
    for (const [re, label] of HOSTS) if (re.test(host)) return label;
    return host.replace(/^www\./, "");
  } catch {
    return "video";
  }
}
