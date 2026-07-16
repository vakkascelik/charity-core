import Link from "next/link";
import { Pill } from "./Pill";
import { Icon } from "./Icon";

export type EventCardData = {
  slug: string;
  title: string;
  date: Date | string;
  venue: string;
  category: string;
  imageUrl?: string | null;
  ticketed: boolean;
  price?: number | string | null;
};

export function EventCard({
  e,
  format,
  locale,
}: {
  e: EventCardData;
  /** Brand money formatter, e.g. the app's `fmtMoney`. */
  format: (n: number) => string;
  /** BCP-47 locale for the month label, e.g. the app's `charity.config` locale. */
  locale: string;
}) {
  const d = typeof e.date === "string" ? new Date(e.date) : e.date;
  const img = e.imageUrl ?? "";
  return (
    <Link
      href={`/events/${e.slug}`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <article
        style={{
          cursor: "pointer",
          borderRadius: 14,
          overflow: "hidden",
          border: "1px solid var(--color-hairline)",
          background: "var(--color-canvas)",
          height: "100%",
        }}
      >
        <div
          style={{
            height: 170,
            backgroundImage: `url(${img})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative",
            backgroundColor: "var(--color-surface-card)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              background: "var(--color-canvas)",
              borderRadius: 10,
              padding: "6px 12px",
              textAlign: "center",
              lineHeight: 1,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                fontFamily: "var(--font-display)",
                color: "var(--color-ink)",
              }}
            >
              {d.getDate()}
            </div>
            <div
              className="caption-uc"
              style={{ fontSize: 10, color: "var(--color-primary)" }}
            >
              {d.toLocaleDateString(locale, { month: "short" })}
            </div>
          </div>
          {e.ticketed && (
            <div style={{ position: "absolute", top: 14, right: 14 }}>
              <Pill tone="amber">
                {format(Number(e.price ?? 0))} · Ticketed
              </Pill>
            </div>
          )}
        </div>
        <div style={{ padding: 22 }}>
          <Pill tone="teal">{e.category}</Pill>
          <h4 style={{ marginTop: 12, fontSize: 21 }}>{e.title}</h4>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 12,
              color: "var(--color-muted)",
              fontSize: 13.5,
              alignItems: "center",
            }}
          >
            <Icon name="pin" size={15} /> {e.venue}
          </div>
        </div>
      </article>
    </Link>
  );
}
