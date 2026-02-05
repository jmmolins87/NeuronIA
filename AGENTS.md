# ClinvetIA Agent Guidelines

Essential repository rules for agentic coding tools operating in this repo.

## Project Snapshot

- Framework: Next.js 16 (App Router); React 19; Server Components by default
- Language: TypeScript (strict) with path alias `@/*`
- Styling: Tailwind CSS 4 + shadcn/ui (new-york); tokens in `app/globals.css`
- Theme: `next-themes` (system default + manual toggle)
- i18n: custom ES/EN provider; locale persisted in `localStorage` key `clinvetia-locale`
- Icons/fonts: `lucide-react`, Geist Sans/Mono

## Commands

```bash
# Install
npm install

# Dev
npm run dev

# Build / run prod (Next build includes typecheck)
npm run build
npm run start

# Lint (ESLint flat config)
npm run lint

# Repo audits (enforced conventions)
npm run audit          # runs audit:i18n + audit:inline
npm run audit:i18n     # locales sync + hardcoded-string heuristic scan
npm run audit:inline   # inline-style + hardcoded-color heuristic scan

# Typecheck only (not in package.json, but useful)
npx tsc -p tsconfig.json --noEmit

# Tests
# No test runner is configured yet.
# When tests are added, provide `npm test` and support single-file runs via:
# npm test -- path/to/test-file
```

## Cursor / Copilot Rules

- No Cursor rules found (`.cursor/rules/` or `.cursorrules`)
- No GitHub Copilot instructions found (`.github/copilot-instructions.md`)

If any of the files above are added later, treat them as authoritative.

## Code Style (TypeScript)

- Strict mode: no ignored type errors; avoid `any` (use `unknown` + narrowing)
- Prefer `interface` for object shapes; `type` for unions/intersections
- Use `import type` for type-only imports
- Exported functions/components: prefer explicit return types when non-trivial
- Prefer small, pure helpers; keep UI components mostly presentational

## Imports Order

```ts
import type { Metadata } from "next"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import "./globals.css"
```

## Formatting

- Strings: double quotes
- Semicolons: this repo is mixed; match the file you are editing
- Keep diffs minimal; do not reformat unrelated code

## Naming Conventions

- Components: `PascalCase` (e.g. `ThemeToggle`)
- Functions/vars: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Files:
  - Routes: `app/**/page.tsx`, `app/**/layout.tsx`
  - Components: kebab-case where applicable (many existing files are `.tsx` with kebab)

## React / Next.js Patterns

- Server Components by default; add `"use client"` only when needed (hooks, events, browser APIs)
- Avoid accessing `window`/`localStorage` outside effects or without guards
- Use semantic HTML and keep heading order consistent
- Prefer `next/link` for navigation; use `next/image` when adding images

## Styling Rules (Tailwind)

- Prefer Tailwind utilities; avoid new CSS unless the design system needs a new token/utility
- Do not hardcode colors (no `bg-[#...]`, `rgb(...)`, etc.); use semantic tokens (`bg-background`, `text-foreground`, `border-border`, etc.)
- Conditional classes: use `cn()` from `lib/utils.ts`
- Inline styles: generally disallowed; `npm run audit:inline` will fail.
  - If you must use inline styles for a legitimate dynamic case, keep it minimal and add `// @allowed-inline-style` near it.

## i18n Rules (Critical)

- All user-facing strings in UI must come from `t()` (no hardcoded copy in components)
- Locales: `locales/es.json` and `locales/en.json` (nested objects; keys via dot notation)
- Run `npm run audit:i18n` after adding/modifying strings

```tsx
"use client"

import { useTranslation } from "@/components/providers/i18n-provider"

export function Example() {
  const { t } = useTranslation()
  return <span>{t("common.close")}</span>
}
```

## Error Handling

- Wrap async work in `try/catch`; show user-friendly messages
- Log for debugging, but never leak secrets/tokens
- Prefer early returns and exhaustive checks over deeply nested conditionals

## Accessibility

- `aria-label` required for icon-only buttons
- Keyboard navigation must work for menus/dialogs/sheets
- Respect `prefers-reduced-motion` for JS-driven animations and scroll effects

## Git / Workflow

- Commit messages: Conventional Commits in English (`feat:`, `fix:`, `refactor:`, `docs:`, `chore:`)
- Keep commits focused; avoid bundling formatting-only changes with behavior changes
