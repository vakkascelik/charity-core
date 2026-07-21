import { NextResponse } from "next/server";

/**
 * Turns a thrown error inside an admin route handler into JSON the UI can show.
 *
 * Without this, an unhandled Prisma error escapes as a bare 500 with an *empty*
 * body, so the admin drawer can only render "Save failed:" with nothing after
 * the colon — the operator gets no idea which field was wrong. These routes are
 * admin-only, so echoing the underlying message back is a fair trade for being
 * able to diagnose a bad save without reading server logs.
 */
export function apiError(e: unknown): NextResponse {
  const msg = e instanceof Error ? e.message : String(e);
  const code = (e as { code?: string } | null)?.code;

  if (code === "P2002") {
    const target = (e as { meta?: { target?: string[] | string } }).meta?.target;
    const field = Array.isArray(target) ? target.join(", ") : target ?? "value";
    return NextResponse.json(
      { error: `Another record already uses this ${field}.` },
      { status: 409 },
    );
  }
  if (code === "P2025") {
    return NextResponse.json(
      { error: "That record no longer exists — it may have been deleted." },
      { status: 404 },
    );
  }

  // PrismaClientValidationError dumps the entire query into `message`; pull out
  // the one line that names the offending field.
  const missing = msg.match(/Argument `(\w+)` is missing/);
  if (missing) {
    return NextResponse.json(
      { error: `${missing[1]} is required.` },
      { status: 400 },
    );
  }
  const invalid = msg.match(/Invalid value for argument `(\w+)`/);
  if (invalid) {
    return NextResponse.json(
      { error: `${invalid[1]} has an invalid value.` },
      { status: 400 },
    );
  }

  console.error("[admin api]", e);
  return NextResponse.json(
    { error: msg || "Something went wrong saving this record." },
    { status: 500 },
  );
}
