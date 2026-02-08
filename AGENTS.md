# ClinvetIA Agent Guidelines

Rules and conventions for agentic coding tools operating in this repo.

## Project Snapshot

- Framework: Next.js 16.1.6 (App Router); React 19.2.3; Server Components by default
- Language: TypeScript (strict) with path alias `@/*` (see `tsconfig.json`)
- Styling: Tailwind CSS 4 + shadcn/ui (new-york); tokens live in `app/globals.css`
- Linting: ESLint v9 flat config in `eslint.config.mjs` (Next core-web-vitals + TS)
- Theme: `next-themes` + CSS variables
- i18n: custom provider `components/providers/i18n-provider.tsx` with `locales/es.json` + `locales/en.json`
- DB: Postgres + Prisma (`prisma/schema.prisma`); singleton client in `lib/prisma.ts`

## Commands

```bash
# Install (use npm; repo tracks package-lock.json)
npm install

# Node version
# - package.json engines: 20.x

# Dev
npm run dev

# Build / start (build runs prisma generate)
npm run build
npm run start

# Lint
npm run lint
npm run lint -- --fix
npx eslint app/page.tsx

# Typecheck only
npx tsc -p tsconfig.json --noEmit

# Convention audits
# - i18n keys synced + heuristic hardcoded strings scan
# - inline style + hardcoded color scan
npm run audit
npm run audit:i18n
npm run audit:inline

# Prisma
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:studio

# Tests
# - No test runner is configured in this repo currently.
# - If you add one, require single-file + single-test filtering:
#   Vitest:     npx vitest run path/to/foo.test.ts -t "case name"
#   Jest:       npx jest path/to/foo.test.ts -t "case name"
#   Playwright: npx playwright test path/to/spec.spec.ts -g "case name"
```

## Cursor / Copilot Rules

- Cursor rules: none found (`.cursor/rules/` or `.cursorrules`)
- Copilot rules: none found (`.github/copilot-instructions.md`)

## Code Style (TypeScript/React)

- Strict TS: fix type errors; avoid `any` (prefer `unknown` + narrowing)
- Types: prefer `interface` for object shapes; `type` for unions/intersections
- Type-only imports: use `import type { ... }` where applicable
- Exports: add explicit return types for exported non-trivial functions/components
- Mutability: prefer `const`; keep helpers small/total; avoid hidden mutation

## Imports

- Keep diffs minimal: do not reorder imports unless you touch that block
- When editing import blocks: group with blank lines; order = type-only, React/Next, third-party, `@/`, relative, styles
- Server-only modules: keep `import "server-only"` as the very first import (see `lib/env.ts`, `lib/prisma.ts`)

## Formatting

- TS/TSX strings: double quotes
- JS/MJS strings: match the file (repo mixes styles in scripts)
- Semicolons: mixed; match the file you edit
- No Prettier config; rely on Next/ESLint defaults

## Naming / Structure

- Components: `PascalCase`; hooks: `useThing`; functions/vars: `camelCase`; constants: `UPPER_SNAKE_CASE`
- Routes: `app/**/page.tsx`, `app/**/layout.tsx`; API handlers: `app/api/**/route.ts`
- File names: follow the local neighborhood (many components use kebab-case)

## Next.js Patterns

- Default to Server Components; add `"use client"` only for hooks, event handlers, or browser APIs
- Browser APIs (`window`, `localStorage`): only in effects or guarded checks (`typeof window !== "undefined"`)
- Prefer `next/link` + `next/image` where relevant
- Root layout imports `@/lib/env` to fail-fast; never import `env` into client components

## Styling (Tailwind + shadcn/ui)

- Prefer semantic tokens (`bg-background`, `text-foreground`, `border-border`) over hardcoded colors
- Avoid inline styles; `npm run audit:inline` fails on most uses
- If inline style is truly required: add `// @allowed-inline-style` and keep the style minimal
- Use `cn()` from `lib/utils.ts` for conditional class composition

## i18n (Critical)

- UI copy: use `t("key")` via `useTranslation()`; avoid hardcoded JSX strings
- Locale files must stay in sync: `locales/es.json` and `locales/en.json` (dot-notation keys)
- Interpolation syntax: `{{var}}`
- After i18n changes: run `npm run audit:i18n` (also scans `app/`, `components/`, `hooks/`)

## Environment / Secrets

- Source of truth: `lib/env.ts` validates with zod and throws on invalid config
- Minimum required for boot: `APP_URL`, `DATABASE_URL` (see `lib/env.ts` for the full set)
- Never commit `.env`, `.env.local`, or real credentials/tokens
- Never log secrets or raw DB URLs

## API + Error Handling

- Inputs: validate with `zod` (`safeParse` + map issues to field errors)
- Responses: prefer `okJson()` / `errorJson()` from `lib/api/respond.ts`
- Structured failures: throw `ApiError` and catch with `toResponse(error)` from `lib/errors.ts`
- Runtime: for routes using Prisma/crypto/Node APIs, set `export const runtime = "nodejs"` as the first export
- Exceptions: treat caught errors as `unknown`; narrow intentionally

Example API skeleton (keep handlers small and explicit):

```ts
import { z } from "zod"
import { okJson } from "@/lib/api/respond"
import { ApiError, toResponse } from "@/lib/errors"

export const runtime = "nodejs"

const Body = z.object({ /* ... */ })

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null))
    if (!parsed.success) throw new ApiError("INVALID_INPUT", "Invalid input", { status: 400 })
    return okJson({ /* ... */ })
  } catch (e: unknown) {
    return toResponse(e)
  }
}
```

## Prisma / DB

- Use `prisma` from `lib/prisma.ts` (no ad-hoc `new PrismaClient()`)
- Use `prisma.$transaction` for multi-step writes; pass the tx client into helpers
- Deploys: run migrations (`prisma migrate deploy`); avoid `prisma db push` in production

## Accessibility

- Icon-only buttons require `aria-label`
- Keep keyboard navigation working; respect `prefers-reduced-motion`

## Git / Workflow

- Keep commits focused; Conventional Commits in English: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
