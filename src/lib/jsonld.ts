/**
 * Brand-agnostic schema.org (JSON-LD) builders shared by the charity apps.
 * Each returns a plain object; render it with `<JsonLd data={...} />`.
 *
 * Brand values (org name, locale, currency) are passed in — the org-identity
 * builder (`organizationJsonLd`) and the app's `ORG_FALLBACK` stay app-local,
 * since they carry the logo path and fallback copy.
 */
import { getSiteUrl, absoluteUrl } from "./site-url";

/** schema.org WebSite — declares the canonical site name for sitelinks. */
export function websiteJsonLd(opts: { name: string; locale: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    url: getSiteUrl(),
    name: opts.name,
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    inLanguage: opts.locale,
  };
}

/** schema.org NewsArticle for a news post. `orgName` is the author fallback. */
export function articleJsonLd(
  a: {
    title: string;
    description: string;
    slug: string;
    imageUrl?: string | null;
    publishedAt: string | Date;
    author?: string | null;
  },
  orgName: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: a.title,
    description: a.description,
    image: a.imageUrl ? [a.imageUrl] : undefined,
    datePublished: new Date(a.publishedAt).toISOString(),
    dateModified: new Date(a.publishedAt).toISOString(),
    author: { "@type": a.author ? "Person" : "Organization", name: a.author ?? orgName },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(`/news/${a.slug}`) },
  };
}

/** schema.org Event for an event page. `orgName`/`currency` are brand values. */
export function eventJsonLd(
  e: {
    title: string;
    description: string;
    slug: string;
    imageUrl?: string | null;
    date: string | Date;
    venue?: string | null;
    status?: string | null;
    ticketed?: boolean;
    price?: number | null;
    /** Off-site booking page (Humanitix etc.) — used as the offer URL. */
    registrationUrl?: string | null;
  },
  opts: { orgName: string; currency: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: e.title,
    description: e.description,
    image: e.imageUrl ? [e.imageUrl] : undefined,
    startDate: new Date(e.date).toISOString(),
    eventStatus:
      e.status === "Past"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    ...(e.venue
      ? { location: { "@type": "Place", name: e.venue, address: e.venue } }
      : {}),
    organizer: { "@type": "Organization", name: opts.orgName, url: getSiteUrl() },
    url: absoluteUrl(`/events/${e.slug}`),
    ...(e.ticketed || e.registrationUrl
      ? {
          offers: {
            "@type": "Offer",
            price: e.price ?? 0,
            priceCurrency: opts.currency,
            url: e.registrationUrl ?? absoluteUrl(`/events/${e.slug}`),
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

/** schema.org BreadcrumbList — improves the URL path shown in search results. */
export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}
