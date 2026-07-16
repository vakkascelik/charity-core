/** CSV export for the admin screens. Excel-safe by construction. */

// Excel and Sheets evaluate a cell that opens with any of these as a formula.
// Subscriber and RSVP names arrive from public forms, so a hostile signup could
// otherwise land a live formula in a file an admin double-clicks.
const FORMULA = /^[=+\-@\t\r]/;

// Byte-order mark, spelled by code point on purpose: a literal U+FEFF is an
// invisible character that editors and linters strip without anyone noticing.
const BOM = String.fromCharCode(0xfeff);

function cell(value: unknown): string {
  const s = String(value ?? "");
  const safe = FORMULA.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * RFC 4180 rows, prefixed with a UTF-8 BOM. Without the BOM Excel decodes the
 * file as its local codepage regardless of the charset header — which turns
 * every macron and every Turkish name in the list into mojibake.
 */
export function toCsv(header: string[], rows: unknown[][]): string {
  const body = [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  return `${BOM}${body}`;
}

export function csvResponse(filename: string, csv: string): Response {
  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}

/** `<prefix>-subscribers-2026-07-09.csv` — `prefix` is the app's brand slug. */
export function stampedFilename(stem: string, prefix: string): string {
  return `${prefix}-${stem}-${new Date().toISOString().slice(0, 10)}.csv`;
}
