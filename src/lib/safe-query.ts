/**
 * Run a Prisma query but never let it crash a build/prerender. If the database
 * is unreachable or the connection pool times out while a page is being
 * statically generated, fall back to a safe default; ISR will regenerate the
 * page with real data on the next revalidation once the DB is reachable.
 */
export async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try {
    return await p;
  } catch (e) {
    console.error(
      "[safe-query] query failed, using fallback:",
      e instanceof Error ? e.message : e,
    );
    return fallback;
  }
}
