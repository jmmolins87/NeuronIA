# ClinvetIA Agent Guidelines

Rules and conventions for agentic coding tools operating in this repo.

## Project Snapshot

- Framework: Next.js 16.1.x (App Router) + React 19.2.x; Server Components by default
- Language: TypeScript (strict); path alias `@/*` (see `tsconfig.json`)
- Styling: Tailwind CSS 4 + shadcn/ui (new-york); design tokens live in `app/globals.css`
- Linting: ESLint v9 flat config in `eslint.config.mjs` (Next core-web-vitals + TypeScript)
- Theme: `next-themes` (system default + manual toggle)
- i18n: custom ES/EN provider in `components/providers/i18n-provider.tsx`
- DB: Postgres + Prisma (`prisma/schema.prisma`), client singleton in `lib/prisma.ts`

## Commands

```bash
# Install (use npm; repo tracks package-lock.json)
npm install

# Requirements
# Node: >= 20 (package.json engines)

# Dev
npm run dev

# Build / start (Next build includes typecheck)
npm run build
npm run start

# Lint (repo) / lint one file / autofix
npm run lint
npm run lint -- --fix
npx eslint app/page.tsx

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
# No test runner is configured (no test script + no *.test/*spec files).
# If you add one, require single-file + single-test filtering:
# - Vitest:     npx vitest run path/to/foo.test.ts -t "case name"
# - Jest:       npx jest path/to/foo.test.ts -t "case name"
# - Playwright: npx playwright test path/to/spec.spec.ts -g "case name"
```

## Cursor / Copilot Rules

- Cursor: none found (`.cursor/rules/` or `.cursorrules`)
- Copilot: none found (`.github/copilot-instructions.md`)

## TypeScript / Code Style

- Strict TS: fix type errors; avoid `any` (use `unknown` + narrowing)
- Prefer `interface` for object shapes; `type` for unions/intersections; use `import type` for type-only imports
- Prefer `const`; keep helpers small and total; avoid hidden mutation
- Exported non-trivial functions/components: add explicit return types

## Imports

- Keep diffs minimal: do not reorder imports unless you must touch that block
- When you do touch it: group with blank lines; order = type-only, React/Next, third-party, `@/`, relative, CSS
- Server-only modules: keep `import "server-only"` as the very first import

## Formatting

- Strings: use double quotes in TS/TSX; in JS/MJS match the file
- Semicolons: mixed in this repo; match the file you edit
- No Prettier config; let ESLint/Next dictate formatting

## Naming / Structure

- Components: `PascalCase`; hooks: `useThing`; functions/vars: `camelCase`; constants: `UPPER_SNAKE_CASE`
- Routes: `app/**/page.tsx`, `app/**/layout.tsx`; route handlers: `app/api/**/route.ts`
- File names: follow the local neighborhood (many components use kebab-case)

## Next.js / React Patterns

- Server Components by default; add `"use client"` only for hooks, events, or browser APIs
- Browser APIs (`window`, `localStorage`) only inside effects or guarded checks
- Prefer `next/link` and `next/image`; keep semantic headings in order
- Root layout imports `@/lib/env` to fail-fast on invalid env; do not import env into client components

## API / Data Conventions

- Validate inputs with `zod` (typically `safeParse` + field mapping)
- Prefer `lib/api/respond.ts` helpers: `okJson(body)` and `errorJson(code, message, { status, fields })`
- For structured failures: throw `ApiError` from `lib/errors.ts` and handle with `toResponse(error)`
- Route handlers that use Prisma/crypto should run in Node: `export const runtime = "nodejs"`

## Error Handling

- Prefer early returns and explicit checks over deep nesting
- Wrap async flows in `try/catch`; in API routes return `toResponse(error)`
- Treat caught errors as `unknown`; narrow intentionally
- Never log secrets (env vars, tokens) or raw DB URLs

## Styling (Tailwind)

- Prefer Tailwind utilities + semantic tokens (`bg-background`, `text-foreground`, `border-border`)
- Avoid inline styles; `npm run audit:inline` will fail
- If an inline style is unavoidable, document it with `// @allowed-inline-style`
- Avoid hardcoded colors in TS/TSX (`bg-[#...]`, `rgb(...)`); prefer tokens
- Use `cn()` from `lib/utils.ts` for conditional classes

## i18n (Critical)

- UI copy should come from `t()` (via `useTranslation()`); avoid hardcoded JSX strings
- Locale files `locales/es.json` and `locales/en.json` must stay in sync (dot-notation keys)
- Interpolation uses `{{var}}`
- Run `npm run audit:i18n` after i18n changes; it also heuristically scans `app/` and `components/`

## Environment / Secrets

- `lib/env.ts` is the source of truth for required env vars; it validates via `zod` and throws on boot
- Required today: `APP_URL`, `DATABASE_URL`; optional/recommended: `DATABASE_URL_UNPOOLED`
- `.env.example` may list placeholders not yet wired; verify before relying on them
- Never commit `.env`, `.env.local`, or real credentials

## Prisma / DB

- Use `prisma` from `lib/prisma.ts` (no ad-hoc `new PrismaClient()`)
- Use transactions for multi-step writes (`prisma.$transaction`) and pass the tx client into helpers
- Production deploys must run migrations (`prisma migrate deploy`); avoid `prisma db push` in prod

## Accessibility

- Icon-only buttons must have `aria-label`
- Keyboard navigation must work; respect `prefers-reduced-motion`

## Git / Workflow

- Keep commits focused; Conventional Commits in English: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`
