# ClinvetIA Agent Guidelines

Essential repository rules for agentic coding tools operating in this repo.

## Project Snapshot

- Framework: Next.js 16 (App Router) + React 19; Server Components by default
- Language: TypeScript (strict) with path alias `@/*` (see `tsconfig.json`)
- Styling: Tailwind CSS 4 + shadcn/ui (new-york); Tailwind is configured in CSS (`app/globals.css`)
- Linting: ESLint flat config (`eslint.config.mjs`), based on `eslint-config-next`
- Theme: `next-themes` (system default + manual toggle)
- i18n: custom ES/EN provider (`components/providers/i18n-provider.tsx`); locale stored in `localStorage` key `clinvetia-locale`
- Icons/fonts: `lucide-react`, Geist Sans/Mono
- DB: Postgres + Prisma (`prisma/schema.prisma`)

## Commands

```bash
# Install
npm install
# Dev
npm run dev
# Build / run prod (Next build includes typecheck)
npm run build
npm run start
# Lint (add `-- --fix` to autofix)
npm run lint
# Typecheck only (not in package.json, but useful)
npx tsc -p tsconfig.json --noEmit
# Repo audits (enforced conventions)
npm run audit          # runs audit:i18n + audit:inline
npm run audit:i18n     # locales sync + hardcoded-string heuristic scan
npm run audit:inline   # inline-style + hardcoded-color heuristic scan
# Prisma
npm run prisma:generate
npm run prisma:migrate:dev
npm run prisma:migrate:deploy
npm run prisma:studio
# Tests
# No test runner is configured yet (no `test` script in `package.json`).
# If you add one, keep single-file + name filtering (example: `npm test -- path/to/foo.test.ts -t "case name"`).
```

## Cursor / Copilot Rules

- No Cursor rules found (`.cursor/rules/` or `.cursorrules`) and no Copilot rules found (`.github/copilot-instructions.md`)

## Code Style (TypeScript)

- Strict mode: no ignored type errors; avoid `any` (use `unknown` + narrowing)
- Prefer `interface` for object shapes; `type` for unions/intersections
- Use `import type` for type-only imports
- Keep helpers small and pure; avoid mutating inputs
- Prefer `const` over `let`; keep functions total when possible
- Exported non-trivial functions/components: prefer explicit return types

## Imports Order

```ts
import type { Metadata } from "next"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import "./globals.css"
```

- Group imports with a blank line between: type-only, React/Next, third-party, local `@/`, relative, then CSS.
- Keep diffs minimal: do not reorder imports across a file unless you are already touching that block.

## Formatting

- Strings: double quotes; semicolons are mixed (match the file you are editing)
- Keep diffs minimal; avoid reformatting unrelated code; ESLint is the source of truth (no Prettier)

## Naming Conventions

- Components: `PascalCase` (e.g. `ThemeToggle`)
- Functions/vars: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files:
  - Routes: `app/**/page.tsx`, `app/**/layout.tsx`
  - Components: kebab-case where applicable (many existing files are `.tsx` with kebab)

## API / Data Conventions

- Route handlers live in `app/api/**/route.ts`; validate inputs with `zod`
- Use `okJson()` / `errorJson()` from `lib/api/respond.ts` (response includes `{ ok: true|false }`)
- For structured failures in server code, use `ApiError` from `lib/api/errors.ts` and map to `errorJson`
- Never leak secrets/tokens in API responses or logs; use generic messages in production
- Most API routes run on `export const runtime = "nodejs"` (Prisma, crypto, etc.)

## React / Next.js Patterns

- Server Components by default; add `"use client"` only when needed (hooks, events, browser APIs)
- Avoid accessing `window`/`localStorage` outside effects or without guards
- Use semantic HTML and keep heading order consistent
- Prefer `next/link` for navigation; use `next/image` when adding images
- Server-only modules: add `import "server-only"` to files in `lib/**` that must never be imported by client components.

## Styling Rules (Tailwind)

- Prefer Tailwind utilities; only add CSS when a reusable token/utility is needed (see `app/globals.css`)
- Do not hardcode colors in TS/TSX (no `bg-[#...]`, `rgb(...)`, etc.); use semantic tokens (`bg-background`, `text-foreground`, `border-border`, etc.)
- Conditional classes: use `cn()` from `lib/utils.ts`
- Inline styles in React are generally disallowed; `npm run audit:inline` will fail
- Exception: React Email templates under `lib/email/templates/**` use inline styles by design

## i18n Rules (Critical)

- All user-facing strings in UI must come from `t()` (no hardcoded copy in components)
- Locales: `locales/es.json` and `locales/en.json` (nested objects; keys via dot notation)
- Variable interpolation uses `{{var}}` (see `components/providers/i18n-provider.tsx`)
- Run `npm run audit:i18n` after adding/modifying strings
- Admin area currently uses `app/admin/_ui-text.ts` constants; prefer migrating to shared i18n over adding more scattered literals.

## Error Handling

- Wrap async work in `try/catch`; show user-friendly messages
- Log for debugging, but never leak secrets/tokens
- Prefer early returns and exhaustive checks over deeply nested conditionals
- API errors: in production, prefer generic messages (see patterns in `app/api/**/route.ts`).

## Environment / Secrets

- Env is validated in `lib/env.ts` via `zod`; import `env` only from server code.
- `lib/env.ts` validates at module import time; missing required env vars can fail `next build` during page-data collection.
- Minimum required for builds that import Prisma: `DATABASE_URL` (or `POSTGRES_PRISMA_URL`) plus `APP_URL`.
- Optional but recommended for migrations: `DATABASE_URL_UNPOOLED` (or `POSTGRES_URL_NON_POOLING`).
- Never commit secret files: `.env`, `.env.local` (use `.env.example` as the shareable template).
- `.env.example` must contain placeholders only (no real tokens/DB URLs).
- Do not print or return secrets in API responses, logs, or thrown errors.

## Prisma / DB

- Use `prisma` from `lib/prisma.ts` (do not instantiate `new PrismaClient()` in random modules).
- Prefer transactions for multi-step writes (`prisma.$transaction`), passing a tx client into helpers.
- Keep DB constraints and enums in `prisma/schema.prisma` as the source of truth.

## Accessibility

- `aria-label` required for icon-only buttons; keyboard navigation must work; respect `prefers-reduced-motion`

## Git / Workflow

- Commit messages: Conventional Commits in English (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`); keep commits focused
