import { Eyebrow } from "./Eyebrow";

/** An "our story" section: eyebrow + heading over a row of year milestones. */
export function Timeline({
  eyebrow,
  eyebrowColor,
  heading,
  milestones,
}: {
  eyebrow: string;
  eyebrowColor?: string;
  heading: string;
  milestones: { id: string; year: string; title: string; body: string }[];
}) {
  return (
    <>
      <Eyebrow color={eyebrowColor}>{eyebrow}</Eyebrow>
      <h2 style={{ marginBottom: 48 }}>{heading}</h2>
      <div
        className={`grid-${milestones.length}`}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${milestones.length}, 1fr)`,
          gap: 32,
        }}
      >
        {milestones.map((m) => (
          <div key={m.id}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 44,
                fontWeight: 600,
                color: "var(--color-primary)",
              }}
            >
              {m.year}
            </div>
            <div
              style={{
                height: 1,
                background: "var(--color-hairline)",
                margin: "16px 0",
              }}
            />
            <h4 style={{ fontSize: 22 }}>{m.title}</h4>
            <p style={{ marginTop: 10, fontSize: 15 }}>{m.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
