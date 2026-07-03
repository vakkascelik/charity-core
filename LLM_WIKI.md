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
| `src/lib/email-template.ts` | `brandedEmailHtml()` + `escapeHtml()` — brand-parameterized HTML email wrapper | — |
| `src/components/JsonLd.tsx` | schema.org JSON-LD `<script>` renderer (XSS-safe) | react |
| `src/components/Honeypot.tsx` | `useHoneypot()` hidden-field spam trap | react |
| `src/components/LogoMarquee.tsx` | Auto-scrolling logo strip (self-contained `<style>`, hover-pause, reduced-motion) | react |

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
