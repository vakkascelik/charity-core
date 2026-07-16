export function PageHeader({
  kicker,
  title,
  sub,
  img,
}: {
  kicker: string;
  title: string;
  sub?: string;
  img?: string;
}) {
  return (
    <section
      style={{
        position: "relative",
        background: "var(--color-surface-dark)",
        color: "#fff",
        overflow: "hidden",
      }}
    >
      {img && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.55,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--color-surface-dark) 45%, transparent), color-mix(in srgb, var(--color-surface-dark) 72%, transparent))",
        }}
      />
      <div
        className="wrap"
        style={{ position: "relative", paddingTop: 90, paddingBottom: 64 }}
      >
        <span
          className="caption-uc"
          style={{ color: "var(--color-accent-teal-soft)" }}
        >
          {kicker}
        </span>
        <h1 style={{ color: "#fff", marginTop: 16, maxWidth: 760 }}>
          {title}
        </h1>
        {sub && (
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 19,
              marginTop: 18,
              maxWidth: 600,
            }}
          >
            {sub}
          </p>
        )}
      </div>
    </section>
  );
}
