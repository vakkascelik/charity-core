import type { CSSProperties, ReactNode } from "react";
import { Pill } from "../Pill";

export const card: CSSProperties = {
  background: "var(--color-canvas)",
  border: "1px solid var(--color-hairline)",
  borderRadius: 14,
  padding: 22,
};

export const linkBtn: CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  color: "var(--color-primary)",
  fontSize: 13,
  fontWeight: 600,
  textDecoration: "none",
};

export const tbl: CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: 8,
};

export const th: CSSProperties = {
  textAlign: "left",
  fontSize: 11.5,
  letterSpacing: "0.6px",
  textTransform: "uppercase",
  color: "var(--color-muted)",
  padding: "8px 12px",
  fontWeight: 600,
};

export const td: CSSProperties = {
  padding: "13px 12px",
  fontSize: 14,
  color: "var(--color-body)",
};

export function PageTitle({
  title,
  sub,
  action,
}: {
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 24,
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h3 style={{ fontSize: 30 }}>{title}</h3>
        {sub && (
          <p
            style={{
              color: "var(--color-muted)",
              marginTop: 6,
              fontSize: 15,
            }}
          >
            {sub}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function CardHead({
  title,
  right,
}: {
  title: string;
  right?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
      }}
    >
      <h5
        style={{
          fontFamily: "var(--font-body)",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--color-ink)",
        }}
      >
        {title}
      </h5>
      {right}
    </div>
  );
}

const STATUS_TONES: Record<string, "teal" | "amber" | "cream" | "coral"> = {
  Received: "teal",
  "On track": "teal",
  Active: "teal",
  Upcoming: "teal",
  succeeded: "teal",
  Partial: "amber",
  Pending: "amber",
  pending: "amber",
  Inactive: "cream",
  Past: "cream",
  failed: "coral",
};

export function StatusBadge({ status }: { status: string }) {
  return <Pill tone={STATUS_TONES[status] ?? "cream"}>{status}</Pill>;
}
