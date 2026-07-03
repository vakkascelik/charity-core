/** "Auckland, youth , Women" | ["Auckland"] → clean, deduped string[] */
export function normalizeLabels(v: unknown): string[] {
  const arr = Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [];
  return [...new Set(arr.map((s) => String(s).trim()).filter(Boolean))];
}
