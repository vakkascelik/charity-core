export function Progress({
  value,
  goal,
  color = "var(--color-primary)",
  format,
}: {
  value: number;
  goal: number;
  color?: string;
  /** Brand money formatter, e.g. the app's `fmtMoney`. */
  format: (n: number) => string;
}) {
  const pct = Math.min(100, Math.round((value / goal) * 100));
  return (
    <div>
      <div
        style={{
          height: 8,
          background: "var(--color-surface-card)",
          borderRadius: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: pct + "%",
            height: "100%",
            background: color,
            borderRadius: 9999,
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 8,
          fontSize: 13.5,
        }}
      >
        <strong style={{ color: "var(--color-ink)" }}>{format(value)}</strong>
        <span style={{ color: "var(--color-muted)" }}>
          of {format(goal)} · {pct}%
        </span>
      </div>
    </div>
  );
}
