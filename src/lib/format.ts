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

/**
 * Picks a slug not already in `taken`, appending -2, -3… as needed. Titles
 * repeat across years ("Community Iftar"), and a slug collision would
 * otherwise surface as an opaque unique-constraint failure on save.
 */
export function uniqueSlug(base: string, taken: Set<string> | string[]): string {
  const used = taken instanceof Set ? taken : new Set(taken);
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}
