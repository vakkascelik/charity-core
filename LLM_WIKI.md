# LLM Wiki — charity-core

> Agent-facing guide to this repo. Read this before editing. It encodes the
> architecture, conventions, and non-obvious constraints so you don't have to
> rediscover them. Written for LLM coding agents.

## TL;DR (read this first)

1. **This is a source-only shared library** — no build, no publish. It holds the
   brand-agnostic logic used by the charity web apps (PIF, Raindrops).
2. **Consumed as an npm git dependency**, not a submodule:
   `"charity-core": "github:vakkascelik/charity-core"`. Host apps compile the
   raw `.ts`/`.tsx` via Next `transpilePackages`.
3. **Everything here must stay brand-agnostic and env-configured.** No org names,
   colors, locales, currencies, Prisma client, or app `auth` imports. If a module
   needs those, it belongs in the app, not here.
4. **A change here ships to both apps only after** they re-lock the dependency
   (`npm install charity-core@github:vakkascelik/charity-core`).
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

`package.json` exists only so npm can install the repo as a dependency. There is
no `main`/build; `files: ["src"]` ships the source.

## How host apps consume it

```jsonc
// app package.json
"dependencies": { "charity-core": "github:vakkascelik/charity-core" }
// app next.config.mjs
transpilePackages: ["charity-core"]
// app tsconfig.json
"paths": { "@core/*": ["./node_modules/charity-core/src/*"] }
// usage
import { useHoneypot } from "@core/components/Honeypot";
import { publicFormGuard } from "@core/lib/rate-limit";
```

The exact commit is pinned in each app's `package-lock.json`; Railway's `npm ci`
fetches it — **no `.git` is needed at build time** (see Gotchas).

## Update workflow

```
1. Edit a module here → verify: it's still brand-agnostic + env-only.
2. git commit + git push (this repo).
3. In EACH app: npm install charity-core@github:vakkascelik/charity-core
   → re-locks package-lock.json to the new commit.
4. Verify: npx tsc --noEmit && npx next build  (in the app).
5. Commit package.json + package-lock.json in the app, push.
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

- **Why npm, not a git submodule:** Railway's Railpack builder copies the repo
  tree into the build container **without `.git`**, so `git submodule update`
  fails (`fatal: not a git repository`). An npm git dependency needs no `.git`.
- **No DB / no brand here.** This package must never import a Prisma client, the
  app's `auth`, or hardcode brand strings. Those differ per app
  (PIF = NZD/en-NZ/Auckland; Raindrops = USD/en-US/San Antonio).
- **Untranspiled source.** Files ship as `.ts`/`.tsx`; they only work in a host
  that lists `charity-core` in `transpilePackages`. Don't add a build step.
- **Push after commit** (project rule across all repos).
