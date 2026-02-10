# ClinvetIA Agent Guidelines

**Purpose**: Rules and conventions for AI coding agents operating in this repository.

## Project Snapshot

- **Framework**: Next.js 16.1.6 (App Router) + React 19.2.3
  - Default to Server Components; add `"use client"` only when needed
- **Language**: TypeScript (strict mode); path alias `@/*` resolves to project root
- **Styling**: Tailwind CSS 4 + shadcn/ui (new-york variant)
  - CSS variables & theme tokens: `app/globals.css`
- **Linting**: ESLint v9 (flat config) with Next.js core-web-vitals + TypeScript rules
- **Theme**: `next-themes` with system detection + manual toggle
- **i18n**: Custom context provider (`components/providers/i18n-provider.tsx`)
  - Locales: `locales/es.json` (default) + `locales/en.json`
  - Translation keys use dot-notation; must stay in sync
- **Database**: Postgres + Prisma ORM
  - Schema: `prisma/schema.prisma`
  - Client singleton: `lib/prisma.ts` (uses PrismaPg adapter)
- **Node Version**: 25.5.0 (enforced in `package.json` engines)

## Commands Reference

```bash
# Installation
npm install                         # Use npm (tracks package-lock.json)

# Development
npm run dev                         # Start dev server (port 3000)
npm run build                       # Production build (runs prisma generate)
npm run start                       # Start production server

# Code Quality
npm run lint                        # Run ESLint
npm run lint -- --fix               # Auto-fix linting issues
npx eslint app/page.tsx             # Lint single file
npx tsc -p tsconfig.json --noEmit   # Type-check without emitting

# Convention Audits (Critical: Run before commits)
npm run audit                       # Run all audits (i18n + inline styles)
npm run audit:i18n                  # Check i18n key sync + hardcoded strings
npm run audit:inline                # Scan for inline styles (fails build)

# Database (Prisma)
npm run prisma:generate             # Generate Prisma client
npm run prisma:migrate:dev          # Create & apply migration (dev)
npm run prisma:migrate:deploy       # Apply migrations (production)
npm run prisma:studio               # Open Prisma Studio GUI

# Admin System
npm run admin:bootstrap             # Create super admin user (interactive)
npm run db:start                    # Start local Postgres (Docker)
npm run db:stop                     # Stop local Postgres
npm run db:reset                    # Reset local database

# Testing
# No test runner configured yet. When adding:
# - Must support single-file filtering: npx vitest run path/to/file.test.ts
# - Must support single-test filtering: -t "test name"
# Example: npx vitest run lib/utils.test.ts -t "calculates total"
```

## External Configuration Rules

**Cursor Rules**: None (checked `.cursor/rules/`, `.cursorrules`)  
**Copilot Rules**: None (checked `.github/copilot-instructions.md`)  
**Prettier**: Not configured; follow Next.js/ESLint defaults

## Code Style

### TypeScript
- Strict mode: fix type errors; avoid `any` (prefer `unknown` + narrowing)
- Types: prefer `interface` for object shapes; `type` for unions/intersections
- Type-only imports: use `import type { ... }` where applicable
- Exports: add explicit return types for exported non-trivial functions/components

### Imports
- Keep diffs minimal: do not reorder imports unless you touch that block
- When editing import blocks: group with blank lines; order = type-only, React/Next, third-party, `@/`, relative, styles
- Server-only modules: keep `import "server-only"` as the very first import (see `lib/env.ts`, `lib/prisma.ts`)

### Formatting
- TS/TSX strings: double quotes
- JS/MJS strings: match the file (repo mixes styles in scripts)
- Semicolons: mixed; match the file you edit
- No Prettier config; rely on Next/ESLint defaults

### Naming / Structure
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
- Minimum required for boot: `APP_URL`, `DATABASE_URL`, `ADMIN_SESSION_SECRET`, `ADMIN_BOOTSTRAP_PASSWORD`
- Never commit `.env`, `.env.local`, or real credentials/tokens
- Never log secrets or raw DB URLs

## API + Error Handling

- Inputs: validate with `zod` (`safeParse` + map issues to field errors)
- Responses: prefer `okJson()` / `errorJson()` from `lib/api/respond.ts`
- Structured failures: throw `ApiError` and catch with `toResponse(error)` from `lib/errors.ts`
- Runtime: for routes using Prisma/crypto/Node APIs, set `export const runtime = "nodejs"` as the first export
- Exceptions: treat caught errors as `unknown`; narrow intentionally
- Field errors: map zod issues to `{ fields: Record<string, string> }` for form validation feedback

Example API skeleton:

```ts
import { z } from "zod"
import { okJson } from "@/lib/api/respond"
import { ApiError, toResponse } from "@/lib/errors"

export const runtime = "nodejs"

const Body = z.object({ email: z.string().email() })

function zodToFields(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {}
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_"
    if (!fields[key]) fields[key] = issue.message
  }
  return fields
}

export async function POST(req: Request) {
  try {
    const parsed = Body.safeParse(await req.json().catch(() => null))
    if (!parsed.success) {
      throw new ApiError("INVALID_INPUT", "Invalid input", {
        status: 400,
        fields: zodToFields(parsed.error)
      })
    }
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
