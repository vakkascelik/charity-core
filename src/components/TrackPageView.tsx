"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Same-origin page-view beacon. Posts the current path to `endpoint` on every
 * client navigation and renders nothing. Admin and API routes are never
 * tracked. Uses navigator.sendBeacon so the request survives page unload,
 * falling back to a keepalive fetch where sendBeacon is unavailable. Both stay
 * same-origin, so the site's `connect-src 'self'` CSP needs no change.
 */
export function TrackPageView({
  endpoint = "/api/track",
}: {
  endpoint?: string;
}) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    const body = JSON.stringify({
      path: pathname,
      referrer: document.referrer || null,
    });

    try {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon?.(endpoint, blob)) return;
    } catch {
      // fall through to fetch
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [pathname, endpoint]);

  return null;
}
