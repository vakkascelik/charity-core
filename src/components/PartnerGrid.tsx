/**
 * Static grid of partner cards — logo, name and an optional description.
 *
 * Replaces {@link LogoMarquee} wherever partners carry a blurb: a description
 * that slides past can't be read. Host apps group the rows (e.g. local vs
 * international) and render one grid per group with its own heading.
 *
 * Self-contained like LogoMarquee: ships its own <style> for the hover lift and
 * line clamp, so it needs no globals.css changes and no client JS. The
 * responsive 3/2/1 column steps come from the host's `.grid-3-md` utility.
 */
const CSS = `
.cc-partner-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-hairline, #e5e0d8);
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-canvas, #fff);
  transition: transform 160ms ease-out, box-shadow 160ms ease-out;
}
a.cc-partner-card { text-decoration: none; color: inherit; }
a.cc-partner-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(0,0,0,0.09);
}
.cc-partner-logo {
  height: 116px;
  background: #fff;
  border-bottom: 1px solid var(--color-hairline, #e5e0d8);
  display: grid;
  place-items: center;
  padding: 18px 22px;
}
.cc-partner-logo img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
}
`;

export type PartnerCard = {
  id: string;
  name: string;
  logoUrl: string;
  url?: string | null;
  blurb?: string | null;
};

export function PartnerGrid({ partners }: { partners: PartnerCard[] }) {
  if (!partners.length) return null;
  return (
    <div
      className="grid-3-md"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 24,
        alignItems: "stretch",
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {partners.map((p) => {
        const inner = (
          <>
            <div className="cc-partner-logo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.logoUrl} alt={p.name} />
            </div>
            <div style={{ padding: "18px 20px 20px" }}>
              <div
                style={{
                  fontSize: 16.5,
                  fontWeight: 600,
                  color: "var(--color-ink)",
                  lineHeight: 1.35,
                }}
              >
                {p.name}
              </div>
              {p.blurb && (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: "var(--color-muted)",
                  }}
                >
                  {p.blurb}
                </p>
              )}
              {p.url && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: "var(--color-primary)",
                  }}
                >
                  Visit website →
                </div>
              )}
            </div>
          </>
        );
        return p.url ? (
          <a
            key={p.id}
            className="cc-partner-card"
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {inner}
          </a>
        ) : (
          <div key={p.id} className="cc-partner-card">
            {inner}
          </div>
        );
      })}
    </div>
  );
}
