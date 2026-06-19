# charity-core

Shared server/UI logic for the charity web apps (PIF, Raindrop Foundation, and
future scaffolds). This is **source-only** — there is no build step and no
published package. Consuming apps mount it as a git submodule and compile the
`.ts`/`.tsx` files directly.

## What lives here

| Path | Purpose |
|------|---------|
| `src/lib/site-url.ts` | Resolve the canonical site URL from env |
| `src/lib/email.ts` | `sendEmail` (Resend) + `escapeHtml` + `notifyAddress` |
| `src/lib/rate-limit.ts` | Per-IP rate limit + honeypot guard for public forms |
| `src/lib/unsubscribe.ts` | Signed HMAC unsubscribe tokens + URLs |
| `src/lib/supabase-storage.ts` | Server-side uploads to Supabase Storage |
| `src/components/JsonLd.tsx` | schema.org JSON-LD renderer |
| `src/components/Honeypot.tsx` | `useHoneypot()` hidden-field spam trap |

Everything here is brand-agnostic and configured through environment variables.

## How apps consume it

1. Add as a submodule at `core/`:
   ```
   git submodule add https://github.com/vakkascelik/charity-core.git core
   ```
2. Add the path alias to `tsconfig.json`:
   ```json
   "paths": { "@/*": ["./src/*"], "@core/*": ["./core/src/*"] }
   ```
3. Import: `import { sendEmail } from "@core/lib/email";`

## Updating

Change a file here → commit + push this repo. Then in each app:
```
git submodule update --remote core
git add core && git commit -m "Bump charity-core" && git push
```
Railway builds with `git submodule update --init --recursive`, so the pinned
commit is fetched at deploy time.

## Required env in every consuming app

- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_NOTIFICATIONS_TO`
- `AUTH_SECRET` (signs unsubscribe tokens)
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
