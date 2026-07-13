import type { ReactNode } from "react";

export function Eyebrow({
  children,
  color = "var(--color-primary)",
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginBottom: 18,
      }}
    >
      <span
        style={{ width: 28, height: 2, background: color, display: "inline-block" }}
      />
      <span className="caption-uc" style={{ color }}>
        {children}
      </span>
    </div>
  );
}
