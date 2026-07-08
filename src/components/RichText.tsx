import React from "react";

/**
 * Markdown-lite body renderer for admin-authored long text (news, events,
 * statements). Supports exactly what the admin "markdown" fields promise:
 * paragraphs separated by blank lines, `**bold**`, `[text](url)` links and
 * bare http(s) URLs — rendered as real React elements, no innerHTML.
 */

// [text](url) | bare URL | **bold**
const INLINE =
  /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>"\])]+)|\*\*([^*]+?)\*\*/g;

const linkStyle: React.CSSProperties = {
  color: "var(--color-primary)",
  fontWeight: 600,
  textDecoration: "underline",
  textUnderlineOffset: 3,
  overflowWrap: "anywhere",
};

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={linkStyle}>
      {children}
    </a>
  );
}

function renderInline(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  INLINE.lastIndex = 0;
  while ((m = INLINE.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] && m[2]) {
      out.push(<ExtLink key={m.index} href={m[2]}>{m[1]}</ExtLink>);
    } else if (m[3]) {
      // Trailing punctuation next to a bare URL belongs to the sentence.
      const url = m[3].replace(/[.,;:!?'"”]+$/, "");
      out.push(<ExtLink key={m.index} href={url}>{url}</ExtLink>);
      if (url.length < m[3].length) out.push(m[3].slice(url.length));
    } else if (m[4]) {
      out.push(<strong key={m.index}>{m[4]}</strong>);
    }
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function RichText({
  text,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  const paragraphs = text.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return (
    <div style={style}>
      {paragraphs.map((p, i) => (
        <p
          key={i}
          style={{ whiteSpace: "pre-wrap", margin: i === 0 ? 0 : "1em 0 0" }}
        >
          {renderInline(p)}
        </p>
      ))}
    </div>
  );
}
