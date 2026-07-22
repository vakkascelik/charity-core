/**
 * Partner scopes. The About page renders one grid per scope, so the column has
 * to hold one of exactly two values — the admin select offers both, but the API
 * is what actually guarantees it (a stray value would silently drop a partner
 * out of the International grid and into Local).
 */
export const PARTNER_SCOPES = ["Local", "International"] as const;
export type PartnerScope = (typeof PARTNER_SCOPES)[number];

/** Coerce an admin-supplied scope to a known value; anything else is Local. */
export function partnerScope(v: unknown): PartnerScope {
  return v === "International" ? "International" : "Local";
}

/** Split a partner list into the two About-page groups, order preserved. */
export function groupByScope<T extends { scope: string }>(partners: T[]) {
  return {
    local: partners.filter((p) => partnerScope(p.scope) === "Local"),
    international: partners.filter(
      (p) => partnerScope(p.scope) === "International",
    ),
  };
}
