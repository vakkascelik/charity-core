/**
 * Calendar helpers for events: parse a stored date + free-text time into a
 * concrete start/end, and emit an "Add to Google Calendar" link and an
 * RFC 5545 .ics document for a single event.
 *
 * Brand-agnostic: the ICS PRODID org name and the stable UID host are passed
 * in; the event's public URL is derived from the app's site URL (`getSiteUrl`).
 */
import { getSiteUrl } from "./site-url";

export type EventStart = { start: Date; end: Date; allDay: boolean };

export type CalEvent = {
  id: string;
  slug: string;
  title: string;
  blurb: string;
  venue: string;
  date: Date;
  time: string | null;
};

/** Public URL of an event page on the app's own site. */
function eventUrl(slug: string): string {
  return `${getSiteUrl()}/events/${slug}`;
}

/**
 * Best-effort parse of `Event.date` (stored at UTC midnight of the chosen day)
 * plus the free-text `Event.time` (e.g. "6:30pm", "18:00", "10 am") into a
 * concrete start/end. Times are treated as floating local wall-clock so that
 * calendar clients render them in the attendee's own timezone — correct for a
 * single-city audience and avoids shipping a VTIMEZONE block. Unparseable or
 * missing times fall back to an all-day entry.
 */
export function resolveEventTimes(date: Date, time: string | null): EventStart {
  const y = date.getUTCFullYear();
  const mo = date.getUTCMonth();
  const d = date.getUTCDate();
  const parsed = time ? parseClockTime(time) : null;
  if (!parsed) {
    const start = new Date(Date.UTC(y, mo, d));
    const end = new Date(Date.UTC(y, mo, d + 1));
    return { start, end, allDay: true };
  }
  const start = new Date(Date.UTC(y, mo, d, parsed.h, parsed.m));
  const end = new Date(Date.UTC(y, mo, d, parsed.h + 2, parsed.m));
  return { start, end, allDay: false };
}

function parseClockTime(raw: string): { h: number; m: number } | null {
  const m = raw
    .trim()
    .toLowerCase()
    .match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)?/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const mer = m[3]?.replace(/\./g, "");
  if (h > 23 || min > 59) return null;
  if (mer === "pm" && h < 12) h += 12;
  if (mer === "am" && h === 12) h = 0;
  return { h, m: min };
}

/** Floating local basic-format stamp: YYYYMMDDTHHMMSS (no trailing Z). */
function stampLocal(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}00`
  );
}

/** Date-only basic-format stamp: YYYYMMDD (for all-day entries). */
function stampDate(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}`;
}

/** "Add to Google Calendar" URL. */
export function googleCalendarUrl(e: CalEvent): string {
  const { start, end, allDay } = resolveEventTimes(e.date, e.time);
  const dates = allDay
    ? `${stampDate(start)}/${stampDate(end)}`
    : `${stampLocal(start)}/${stampLocal(end)}`;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates,
    details: `${e.blurb}\n\n${eventUrl(e.slug)}`,
    location: e.venue,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

/**
 * RFC 5545 VCALENDAR document for a single event (Apple/Outlook/Google import).
 * `orgName` is embedded in the PRODID; `uidDomain` namespaces the UID and must
 * be a *stable* brand domain (not the deploy host) so re-imports dedup rather
 * than duplicate.
 */
export function buildIcs(
  e: CalEvent,
  opts: { orgName: string; uidDomain: string },
): string {
  const { start, end, allDay } = resolveEventTimes(e.date, e.time);
  const dtStamp = `${stampDate(new Date())}T000000Z`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${opts.orgName}//Events//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${e.id}@${opts.uidDomain}`,
    `DTSTAMP:${dtStamp}`,
    allDay
      ? `DTSTART;VALUE=DATE:${stampDate(start)}`
      : `DTSTART:${stampLocal(start)}`,
    allDay ? `DTEND;VALUE=DATE:${stampDate(end)}` : `DTEND:${stampLocal(end)}`,
    `SUMMARY:${icsEscape(e.title)}`,
    `DESCRIPTION:${icsEscape(e.blurb)}`,
    `LOCATION:${icsEscape(e.venue)}`,
    `URL:${eventUrl(e.slug)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
}
