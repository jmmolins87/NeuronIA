# ClinvetIA Agent Guidelines

Rules and conventions for agentic coding tools operating in this repo.

## Project Snapshot

- Framework: Next.js 16 (App Router) + React 19; Server Components by default
- Language: TypeScript (strict), path alias `@/*` (see `tsconfig.json`)
- Styling: Tailwind CSS 4 + shadcn/ui (new-york); global tokens in `app/globals.css`
- Linting: ESLint v9 flat config in `eslint.config.mjs` (Next core-web-vitals + typescript)
- Theme: `next-themes` (system default + manual toggle)
- i18n: custom ES/EN provider in `components/providers/i18n-provider.tsx`
- DB: Postgres + Prisma (`prisma/schema.prisma`), client singleton in `lib/prisma.ts`

## Commands

```bash
# Install (use npm; see package-lock.json)
npm install

# Requirements
# Node: >= 20 (see package.json engines)

# Dev
npm run dev

# Build / start (Next build includes typecheck)
npm run build
npm run start

# Lint (repo) / lint one file
npm run lint
npm run lint -- --fix
npx eslint app/some/page.tsx

# Typecheck only
npx tsc -p tsconfig.json --noEmit

# Repo audits (convention enforcement)
npm run audit
npm run audit:i18n
npm run audit:inline

# Prisma
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:studio

# Tests
# No test runner configured (no tests/*.test.* and no test script).
# If you add one, require single-file + single-test filtering:
# - Vitest:     npx vitest run path/to/foo.test.ts -t "case name"
# - Jest:       npx jest path/to/foo.test.ts -t "case name"
# - Playwright: npx playwright test path/to/spec.spec.ts -g "case name"
```

## Cursor / Copilot Rules

- No Cursor rules found (`.cursor/rules/` or `.cursorrules`)
- No Copilot rules found (`.github/copilot-instructions.md`)

## TypeScript / Code Style

- Strict TS: no ignored type errors; avoid `any` (use `unknown` + narrowing)
- Prefer `interface` for object shapes; `type` for unions/intersections; use `import type` for type-only imports
- Prefer `const`; avoid mutation; keep helpers small and total
- Exported non-trivial functions/components: use explicit return types
- Keep public APIs boring: stable names, small parameter surfaces, predictable return types

## Imports

Group imports with blank lines; keep diffs minimal (do not reorder unless touching that block):

```ts
import type { Metadata } from "next"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import "./globals.css"
```

Order: type-only, React/Next, third-party, `@/` aliases, relative, then CSS.

## Formatting

- Use double quotes for strings in TS/TSX; in JS/MJS match the file you edit
- Semicolons vary (match the file)
- Avoid drive-by formatting; ESLint is the source of truth (no Prettier)

## Naming / Structure

- Components: `PascalCase`; hooks: `useThing`; functions/vars: `camelCase`; constants: `UPPER_SNAKE_CASE`
- Routes: `app/**/page.tsx`, `app/**/layout.tsx`; route handlers: `app/api/**/route.ts`
- Prefer file names that match existing neighborhood conventions (many components use kebab-case)

## Next.js / React Patterns

- Server Components by default; add `"use client"` only when needed (hooks, events, browser APIs)
- Browser APIs (`window`, `localStorage`) only inside effects or guarded checks
- Prefer `next/link` and `next/image`; keep heading order semantic
- Server-only modules: add `import "server-only"` in `lib/**` modules that must never ship to the client

## API / Data Conventions

- Validate inputs with `zod` in route handlers
- Prefer the response helpers from `lib/api/respond.ts`: `okJson()` / `errorJson()` (payload includes `{ ok: true|false }`)
- For structured failures: throw `ApiError` from `lib/api/errors.ts`, catch, and map to `errorJson`
- Do not leak secrets/tokens in responses or logs; prefer generic messages in production
- Many API routes should run in Node for Prisma/crypto: `export const runtime = "nodejs"`

## Error Handling

- Prefer early returns and explicit checks over deep nesting
- Wrap async flows in `try/catch`; return user-safe messages
- Log for debugging, but never log env secrets, auth tokens, or raw DB connection strings
- When mapping unknown errors, treat them as `unknown` and narrow intentionally

## Styling (Tailwind)

- Prefer Tailwind utilities and semantic tokens (e.g. `bg-background`, `text-foreground`, `border-border`)
- Avoid inline styles; `npm run audit:inline` will fail
- If an inline style is truly necessary, document it with `// @allowed-inline-style` and keep it minimal
- Avoid hardcoded colors in TS/TSX (`bg-[#...]`, `rgb(...)`, etc.); prefer tokens over one-off palette classes
- Prefer conditional classes via `cn()` from `lib/utils.ts`

## i18n (Critical)

- UI copy must come from `t()` (via `useTranslation()`); avoid hardcoded strings in JSX
- Locale files `locales/es.json` and `locales/en.json` must stay in sync (nested keys, dot-notation access)
- Variable interpolation uses `{{var}}`
- Run `npm run audit:i18n` after adding/modifying user-facing text
- Admin area uses `app/admin/_ui-text.ts` today; prefer migrating to shared i18n rather than adding more literals

## Environment / Secrets

- Server env is validated by `zod` in `lib/env.ts`; import `env` only from server code
- Required for most server work: `APP_URL`, `DATABASE_URL`; optional: `DATABASE_URL_UNPOOLED`
- Do not commit `.env`, `.env.local`; keep `.env.example` placeholders only

## Prisma / DB

- Use `prisma` from `lib/prisma.ts` (no ad-hoc `new PrismaClient()`)
- Use transactions for multi-step writes (`prisma.$transaction`) and pass the tx client into helpers

## Accessibility

- Icon-only buttons must have `aria-label`
- Keyboard navigation must work; respect `prefers-reduced-motion` for animations

## Git / Workflow

- Keep commits focused; Conventional Commits in English: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
