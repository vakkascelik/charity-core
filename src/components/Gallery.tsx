// A simple responsive photo grid for the public site. Renders nothing when
// there are no images, so callers can pass an empty/uninitialised array safely.

export function Gallery({
  images,
  caption,
}: {
  images?: string[] | null;
  caption?: string;
}) {
  const list = (images ?? []).filter(Boolean);
  if (list.length === 0) return null;
  return (
    <section style={{ marginTop: 40 }}>
      {caption && (
        <h3 style={{ fontSize: 20, marginBottom: 16 }}>{caption}</h3>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        {list.map((src, i) => (
          <a
            key={src + i}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              aspectRatio: "4 / 3",
              borderRadius: 12,
              overflow: "hidden",
              backgroundImage: `url(${src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "1px solid var(--color-hairline)",
            }}
            aria-label={`Photo ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
