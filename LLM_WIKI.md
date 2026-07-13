# LLM Wiki — charity-core

> Agent-facing guide to this repo. Read this before editing. It encodes the
> architecture, conventions, and non-obvious constraints so you don't have to
> rediscover them. Written for LLM coding agents.

## TL;DR (read this first)

1. **This is a source-only shared library** — no build, no publish. It holds the
   brand-agnostic logic used by the charity web apps (PIF, Raindrops).
2. **Vendored in each app as a git subtree at `core/`** (not a submodule, not
   an npm dependency). Apps import via the `@core/*` alias → `./core/src/*`.
3. **Everything here must stay brand-agnostic and env-configured.** No org names,
   colors, locales, currencies, Prisma client, or app `auth` imports. If a module
   needs those, it belongs in the app, not here.
4. **A change ships via subtree:** edit `core/` in an app → `npm run push:core`
   → other apps `npm run sync:core`. (Editing this repo directly also works —
   apps then just `npm run sync:core`.)
5. **Verify before pushing:** the consuming apps must still `npx tsc --noEmit`
   and `next build` clean. This repo has no build of its own to test against, so
   test through a host app.

## What lives here

| Path | Purpose | Depends on |
|------|---------|-----------|
| `src/lib/site-url.ts` | Canonical site URL from env (`NEXT_PUBLIC_SITE_URL` …) | — |
| `src/lib/rate-limit.ts` | Per-IP rate limit + honeypot guard for public forms | `next/server` |
| `src/lib/unsubscribe.ts` | Signed HMAC unsubscribe tokens + URLs (`AUTH_SECRET`) | `site-url`, `crypto` |
| `src/lib/supabase-storage.ts` | Server-side uploads to Supabase Storage `media` bucket | env |
| `src/lib/labels.ts` | `normalizeLabels()` — comma string / array → clean deduped string[] | — |
| `src/lib/pdf.ts` | `compressPdf()` — lossless PDF re-serialise (object streams) | `pdf-lib` (peer) |
| `src/lib/email-template.ts` | `brandedEmailHtml()` + `escapeHtml()` — brand-parameterized HTML email wrapper; `showTitle:false` skips the `<h1>` when the subject is already restated in the body, `bodyHtml` takes pre-rendered HTML instead of auto-paragraphed `bodyText`; `paragraphHtml()` (single styled `<p>`) and `coverLinkBlock()` (optional cover image + accent CTA button + plain-URL fallback, for "read the full thing online" emails like newsletters/reports) are exported so callers can splice custom blocks into the body and pass the result as `bodyHtml` | — |
| `src/lib/email.ts` | `sendEmail()` — Resend transport; caller supplies the brand `from` | env (`RESEND_*`) |
| `src/lib/ai.ts` | `draftStructured(args, requiredKeys)` — one structured Claude call (`claude-opus-4-8`, adaptive thinking, `output_config.format` JSON schema) returning a tagged `{ok}` outcome; `aiConfigured()` guard; `guidanceLine()`. Each admin `/generate` route = a system prompt + schema | `@anthropic-ai/sdk` (peer, **optional** — dormant until an app imports it) |
| `src/lib/stripe.ts` | `getStripe()` cached client + `stripeConfigured()` | `stripe` (peer) |
| `src/lib/safe-query.ts` | `safe(promise, fallback)` — swallow DB errors during prerender/ISR | — |
| `src/lib/revalidate.ts` | `revalidatePublic()` — drop the ISR cache under the root layout | `next/cache` |
| `src/lib/format.ts` | `fmtDate`/`fmtMoney`/`fmtNumber` (locale/currency as args) + `fmtDuration`/`slugify` | — |
| `src/components/JsonLd.tsx` | schema.org JSON-LD `<script>` renderer (XSS-safe) | react |
| `src/components/Honeypot.tsx` | `useHoneypot()` hidden-field spam trap | react |
| `src/components/LogoMarquee.tsx` | Auto-scrolling logo strip (self-contained `<style>`, hover-pause, reduced-motion) | react |
| `src/components/Icon.tsx` | SVG icon set (path registry; pure geometry) | react |
| `src/components/Btn.tsx` | Button — kinds/sizes themed via app CSS vars (`--color-*`) | react, `./Icon` |
| `src/components/Pill.tsx` | Tag pill — tones themed via app CSS vars (`--pill-*-bg/-fg`, see below) | react |
| `src/components/Eyebrow.tsx` | Small kicker label above a heading (accent rule + uppercase caption); `color` prop, defaults to `--color-primary` | react |
| `src/components/StatGrid.tsx` | Row of big-number stat tiles (`{id,value,label}[]`), e.g. "20+ Years of service". `columns`, `valueSize`/`labelSize`, `tabletTwoCol` (steps to 2 cols at the `980px` breakpoint instead of collapsing straight to 1 — relies on the host app's `.grid-N`/`.grid-N-md` CSS utility classes, e.g. PIF's `globals.css`) | react |
| `src/components/Timeline.tsx` | "Our story" section: `Eyebrow` + `<h2>` heading over an N-column row of `{id,year,title,body}` milestones, column count = `milestones.length` | react, `./Eyebrow` |
| `src/components/admin/CrudView.tsx` | Generic admin CRUD table+form; formats via `useFormat()`. Optional `rowHref`/`rowHrefIcon`/`rowHrefTitle` add a per-row link button (before Edit) to a related detail page — e.g. an event's attendee list. `rowHref` is a **URL template string** with `:key` placeholders (e.g. `"/admin/events/:id/rsvps"`), filled from the row — **not** a function: CrudView is a Client Component, so props from a Server Component must be serialisable. Optional `aiAssist` (`{endpoint, fields[], hint?, placeholder?}`) adds a "Draft with AI" box to the edit drawer — POSTs `{instruction, ...currentFieldValues}` to `endpoint` and merges returned field keys into the form. Field type `"questions"` renders `QuestionsEditor` | primitives, `./format-context`, `./QuestionsEditor` |
| `src/components/admin/primitives.tsx` | Admin table/card style consts + `PageTitle`/`CardHead`/`StatusBadge` | `../Pill` |
| `src/components/admin/ImageInput.tsx` | Single + gallery image upload widgets | `../Icon` |
| `src/components/admin/QuestionsEditor.tsx` | Builder for per-record custom form questions (CrudView field type `"questions"`): `[{label, type: text\|select\|yesno, required, options?}]`. App API routes must sanitise on save | `../Icon`, `../Btn` |
| `src/components/RichText.tsx` | Markdown-lite body renderer (server-safe, no innerHTML): blank-line paragraphs, `**bold**`, `[text](url)` + bare-URL links (new tab). For admin-authored long text (news/events bodies) | react |
| `src/components/admin/charts.tsx` | Admin chart primitives (self-contained SVG) | react |
| `src/components/admin/format-context.tsx` | `FormatProvider`/`useFormat()` — injects locale/currency-bound `fmtDate`/`fmtMoney` into admin components | `../../lib/format` |
| `src/components/admin/ui-feedback.tsx` | `AdminFeedbackProvider` + `useToast()`/`useConfirm()` — non-blocking toasts and an async confirm dialog to replace `alert()`/`confirm()`. Brand-agnostic (status colours read app CSS vars with neutral fallbacks). **Not yet wired** — wrap the admin root in `<AdminFeedbackProvider>` to enable | react |

**Two contracts the host app must satisfy:**
- **Pill CSS vars.** `Pill` reads `--pill-coral-bg`, `--pill-teal-bg`, `--pill-amber-bg`,
  `--pill-amber-fg`, `--pill-dark-bg` from the app's global stylesheet. Define them
  per brand (PIF's live in `src/app/globals.css`).
- **FormatProvider.** `CrudView` (and anything calling `useFormat()`) needs a
  `<FormatProvider locale currency>` ancestor. The app's `AdminShell` supplies it
  from `charity.config` (`locale`/`currency`). Without a provider it falls back to
  a neutral `en-US`/`USD`.
- **`.grid-N` / `.grid-N-md` CSS utilities.** `StatGrid` and `Timeline` set
  `className="grid-N"` (mobile: collapse to 1 column) and, opt-in via
  `tabletTwoCol`, `grid-N-md` (tablet: 2 columns). The app's global stylesheet
  must define these breakpoints (PIF's live in `src/app/globals.css`) or the
  grids just won't collapse on small screens — the components still render fine,
  it's a responsive-only dependency.

`package.json` is retained for metadata only; there is no `main`/build — apps
compile the source directly from their `core/` subtree.

## How host apps consume it (git subtree — since 2026-07)

This repo is vendored INSIDE each app as a **git subtree** at `core/`
(the shop-template pattern; works on Railway because files are physically in
the app repo — submodules do NOT work there, and the previous npm git
dependency required a separate re-lock step).

```jsonc
// app tsconfig.json
"paths": { "@core/*": ["./core/src/*"] }
// app package.json scripts
"sync:core": "git subtree pull --prefix=core core main --squash",
"push:core": "git subtree push --prefix=core core main"
// one-time app setup
git remote add core https://github.com/vakkascelik/charity-core.git
git subtree add --prefix=core core main --squash
// usage
import { useHoneypot } from "@core/components/Honeypot";
import { publicFormGuard } from "@core/lib/rate-limit";
```

**Workflow:** edit files under `core/` in whichever app you're working in,
commit as usual, run `npm run push:core` to publish here; other apps run
`npm run sync:core` to pick it up. **Nothing org-specific may land here** —
no names, colors, URLs, Prisma, or app `auth` imports; pass brand values as
parameters (see `email-template.ts`).

## Update workflow

```
1. Edit files under core/ in the app you're working in (or here directly).
2. Verify in the app: npx tsc --noEmit (and next build for bigger changes).
3. Commit in the app, git push (the app repo), then: npm run push:core
4. In the OTHER app: npm run sync:core → commit the merge → push.
```

## Guidelines for agents (Karpathy)

- **Think before coding.** State assumptions; if a module you're adding isn't
  brand-agnostic, stop — it belongs in the app, not here.
- **Simplicity first.** Minimum code. No speculative config/abstractions.
- **Surgical changes.** Match surrounding style. Don't refactor untouched code.
  Only remove orphans your own change created.
- **Goal-driven.** Success = both apps typecheck and build against the new commit.
  That is the loop; don't declare done until a host app verifies.

## Gotchas / hard constraints

- **Why subtree, not a git submodule:** Railway's Railpack builder copies the
  repo tree into the build container **without `.git`**, so `git submodule
  update` fails (`fatal: not a git repository`). A subtree's files are
  physically part of the app repo — nothing to resolve at build time.
- **No DB / no brand here.** This package must never import a Prisma client, the
  app's `auth`, or hardcode brand strings. Those differ per app
  (PIF = NZD/en-NZ/Auckland; Raindrops = USD/en-US/San Antonio).
- **Untranspiled source.** Files are `.ts`/`.tsx` compiled by the host app's
  Next build via the `core/` subtree. Don't add a build step.
- **Push after commit** (project rule across all repos).
