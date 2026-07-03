/**
 * Tiny SVG charts ported from the prototype. No runtime dependencies.
 * Server-renderable.
 */

export function LineChart({
  data,
  labels,
  color = "var(--color-primary)",
  height = 200,
  dots = true,
}: {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
  dots?: boolean;
}) {
  if (data.length === 0) return null;
  const w = 640;
  const h = height;
  const pad = 28;
  const max = Math.max(1, Math.max(...data) * 1.1);
  const x = (i: number) =>
    pad + (i * (w - pad * 2)) / Math.max(1, data.length - 1);
  const y = (v: number) =>
    h - pad - ((v - 0) / (max - 0)) * (h - pad * 2);
  const pts = data.map((v, i) => [x(i), y(v)] as const);
  const path = pts.map((p, i) => (i ? "L" : "M") + p[0] + " " + p[1]).join(" ");
  const area =
    path +
    ` L ${x(data.length - 1)} ${h - pad} L ${x(0)} ${h - pad} Z`;
  const gradId = `lg-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line
          key={g}
          x1={pad}
          x2={w - pad}
          y1={h - pad - g * (h - pad * 2)}
          y2={h - pad - g * (h - pad * 2)}
          stroke="var(--color-hairline)"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {dots &&
        pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={color} />
        ))}
      {labels.map((l, i) => (
        <text
          key={i}
          x={x(i)}
          y={h - 8}
          fontSize="10"
          fill="var(--color-muted)"
          textAnchor="middle"
        >
          {l}
        </text>
      ))}
    </svg>
  );
}

export function BarChart({
  data,
  labels,
  color = "var(--color-accent-teal)",
  height = 200,
}: {
  data: number[];
  labels: string[];
  color?: string;
  height?: number;
}) {
  const w = 640;
  const h = height;
  const pad = 28;
  const max = Math.max(1, Math.max(...data) * 1.1);
  const bw = ((w - pad * 2) / data.length) * 0.6;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - pad * 2);
        const x =
          pad +
          (i * (w - pad * 2)) / data.length +
          ((w - pad * 2) / data.length - bw) / 2;
        return (
          <g key={i}>
            <rect
              x={x}
              y={h - pad - bh}
              width={bw}
              height={bh}
              rx="4"
              fill={color}
              opacity="0.85"
            />
            <text
              x={x + bw / 2}
              y={h - 8}
              fontSize="10"
              fill="var(--color-muted)"
              textAnchor="middle"
            >
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

type Segment = { label: string; value: number; color: string };

export function Donut({
  segments,
  size = 150,
}: {
  segments: Segment[];
  size?: number;
}) {
  const r = 56;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let off = 0;
  return (
    <svg viewBox="0 0 150 150" style={{ width: size, height: size }}>
      <circle
        cx="75"
        cy="75"
        r={r}
        fill="none"
        stroke="var(--color-surface-card)"
        strokeWidth="18"
      />
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const el = (
          <circle
            key={i}
            cx="75"
            cy="75"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="18"
            strokeDasharray={`${len} ${c - len}`}
            strokeDashoffset={-off}
            transform="rotate(-90 75 75)"
            strokeLinecap="butt"
          />
        );
        off += len;
        return el;
      })}
      <text
        x="75"
        y="71"
        fontSize="22"
        fontWeight="700"
        fill="var(--color-ink)"
        textAnchor="middle"
        fontFamily="var(--font-display)"
      >
        {total}
      </text>
      <text
        x="75"
        y="90"
        fontSize="9"
        fill="var(--color-muted)"
        textAnchor="middle"
      >
        total
      </text>
    </svg>
  );
}

export function Legend({
  items,
  suffix = "",
}: {
  items: Segment[];
  suffix?: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map((s) => (
        <div
          key={s.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 9,
            fontSize: 13.5,
          }}
        >
          <span
            style={{
              width: 11,
              height: 11,
              borderRadius: 3,
              background: s.color,
            }}
          />
          <span style={{ color: "var(--color-body)" }}>{s.label}</span>
          <strong style={{ color: "var(--color-ink)", marginLeft: "auto" }}>
            {s.value}
            {suffix}
          </strong>
        </div>
      ))}
    </div>
  );
}
