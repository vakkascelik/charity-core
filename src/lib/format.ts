/**
 * Locale/currency-parameterized formatters shared by the charity apps. Brand
 * values (locale, currency) are passed in by the caller — each app binds its
 * own in `src/lib/utils.ts`. `fmtDuration` and `slugify` are locale-independent.
 */
export function fmtDate(date: Date | string, locale: string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function fmtMoney(
  value: number | string,
  locale: string,
  currency: string,
): string {
  const n = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export function fmtNumber(n: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(n);
}

export function fmtDuration(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ${s % 60}s`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
