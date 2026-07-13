/** A row of big-number stat tiles, e.g. "20+ Years of service". */
export function StatGrid({
  stats,
  columns,
  valueSize = 42,
  labelSize = 13,
  tabletTwoCol = false,
}: {
  stats: { id: string; value: string; label: string }[];
  columns: number;
  /** Font size of the number, e.g. 40 for a contained card, 42 for a full-bleed band. */
  valueSize?: number;
  labelSize?: number;
  /** Step down to 2 columns on tablet widths instead of collapsing straight to 1. */
  tabletTwoCol?: boolean;
}) {
  return (
    <div
      className={`grid-${columns}${tabletTwoCol ? ` grid-${columns}-md` : ""}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 24,
        textAlign: "center",
      }}
    >
      {stats.map((s) => (
        <div key={s.id}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: valueSize,
              fontWeight: 600,
              color: "var(--color-primary)",
              lineHeight: 1,
            }}
          >
            {s.value}
          </div>
          <div
            style={{
              fontSize: labelSize,
              color: "var(--color-muted)",
              marginTop: 8,
              textWrap: "balance",
            }}
          >
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
