import type { CSSProperties, ReactNode } from "react";

type Tone = "cream" | "coral" | "teal" | "amber" | "dark";

export function Pill({
  children,
  tone = "cream",
}: {
  children: ReactNode;
  tone?: Tone | string;
}) {
  const tones: Record<Tone, CSSProperties> = {
    cream: {
      background: "var(--color-surface-card)",
      color: "var(--color-ink)",
    },
    coral: {
      background: "var(--pill-coral-bg)",
      color: "var(--color-primary-active)",
    },
    teal: {
      background: "var(--pill-teal-bg)",
      color: "var(--color-accent-teal)",
    },
    amber: { background: "var(--pill-amber-bg)", color: "var(--pill-amber-fg)" },
    dark: { background: "var(--pill-dark-bg)", color: "var(--color-on-dark)" },
  };
  const t = (tones as Record<string, CSSProperties>)[tone] ?? tones.cream;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "5px 13px",
        borderRadius: 9999,
        fontSize: 12.5,
        fontWeight: 600,
        letterSpacing: "0.2px",
        ...t,
      }}
    >
      {children}
    </span>
  );
}
