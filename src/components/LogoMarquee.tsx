/**
 * Continuously scrolling logo strip. Self-contained: ships its own <style>
 * (keyframes, hover-pause, reduced-motion fallback), so host apps need no
 * globals.css changes. Logos are rendered twice so the -50% translate loops
 * seamlessly. Cards use the host's CSS variables (--color-hairline) with
 * safe fallbacks.
 */
const CSS = `
.cc-logo-marquee {
  overflow: hidden;
  -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
  mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
}
.cc-logo-marquee-track {
  display: flex;
  gap: 16px;
  width: max-content;
  animation: cc-marquee var(--cc-marquee-duration, 40s) linear infinite;
}
.cc-logo-marquee:hover .cc-logo-marquee-track { animation-play-state: paused; }
@keyframes cc-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
@media (prefers-reduced-motion: reduce) {
  .cc-logo-marquee { overflow-x: auto; -webkit-mask-image: none; mask-image: none; }
  .cc-logo-marquee-track { animation: none; }
}
`;

export function LogoMarquee({
  logos,
  secondsPerLogo = 3,
  cardWidth = 190,
  cardHeight = 126,
}: {
  logos: Array<{ id: string; name: string; logoUrl: string; url?: string | null }>;
  secondsPerLogo?: number;
  cardWidth?: number;
  cardHeight?: number;
}) {
  if (!logos.length) return null;
  const duration = Math.max(20, logos.length * secondsPerLogo);
  return (
    <div className="cc-logo-marquee">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div
        className="cc-logo-marquee-track"
        style={{ ["--cc-marquee-duration" as string]: `${duration}s` }}
      >
        {[0, 1].map((copy) =>
          logos.map((p) => {
            const card = (
              <div
                title={p.name}
                aria-hidden={copy === 1}
                style={{
                  width: cardWidth,
                  height: cardHeight,
                  flexShrink: 0,
                  border: "1px solid var(--color-hairline, #e5e0d8)",
                  borderRadius: 12,
                  background: "#fff",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.logoUrl}
                  alt={copy === 0 ? p.name : ""}
                  style={{
                    position: "absolute",
                    inset: "14%",
                    width: "72%",
                    height: "72%",
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                />
              </div>
            );
            return p.url ? (
              <a
                key={`${copy}-${p.id}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "block" }}
              >
                {card}
              </a>
            ) : (
              <div key={`${copy}-${p.id}`}>{card}</div>
            );
          }),
        )}
      </div>
    </div>
  );
}
