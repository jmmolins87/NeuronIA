# NeuronIA Agent Guidelines

Agent-focused guidance for coding in this repo. Keep changes consistent with existing patterns.

## Quick Facts

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x (strict)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Themes**: Light (Health-Tech) + Dark (Cyber Clinic) with neon accents
- **i18n**: Custom ES/EN with localStorage persistence

## Build, Lint, Test

```bash
# Dev server
npm run dev

# Production
npm run build
npm run start

# Lint
npm run lint
```

### Tests

- **No test runner configured** in this repo.
- **Single test**: N/A (add a test framework before expecting this).

## Repository Structure (Core)

- `app/` Next.js routes (App Router)
- `components/` shared UI, providers, layout pieces
- `locales/` translation JSON files
- `lib/` utilities
- `public/` static assets

## Code Style Guidelines

### TypeScript

- Strict mode is on; fix all type errors.
- Use `import type` for type-only imports.
- Prefer `interface` for object shapes, `type` for unions/intersections.
- Avoid `any`; use `unknown` or proper types.
- Add explicit return types for exported functions.

### Imports Order

```ts
import type { Metadata } from "next"

import { ThemeProvider } from "next-themes"

import { SiteShell } from "@/components/site-shell"
import { Button } from "@/components/ui/button"

import "./globals.css"
```

Order: type-only imports, library imports, absolute `@/` imports, relative imports.

### Naming

- Components: `PascalCase` (e.g., `ThemeToggle`)
- Files: components in `kebab-case`, routes use `page.tsx`/`layout.tsx`
- Functions/vars: `camelCase`
- Constants: `UPPER_SNAKE_CASE`

### Formatting

- Follow existing formatting in nearby files.
- Use ESLint as the source of truth; no Prettier config is present.
- Avoid trailing whitespace.

### React + Next.js

- Server Components by default; add `"use client"` only when needed.
- Client components are required for hooks, event handlers, or browser APIs.
- Use `<Link>` from `next/link` for internal routing.
- Use `<Image>` from `next/image` for images.
- Prefer semantic HTML and clean layout composition.

### Styling

- Tailwind utilities only; no inline styles.
- Do not hardcode colors; use tokens like `bg-background` and `text-foreground`.
- Use `cn()` from `@/lib/utils` for conditional classes.
- Mobile-first responsive classes (`sm:`, `md:`, `lg:`).

### i18n (Critical)

- All user-facing strings must come from `locales/es.json` and `locales/en.json`.
- Use `useTranslation()` and `t("key.path")` for UI text and aria labels.
- Use `{{variableName}}` in JSON and pass values to `t()`.
- Do not mix languages within the same file.

Example:

```tsx
"use client"

import { useTranslation } from "@/components/providers/i18n-provider"

export function Example() {
  const { t } = useTranslation()
  return <h1>{t("page.title")}</h1>
}
```

### Accessibility

- Provide `aria-label` for icon-only buttons.
- Keep heading hierarchy in order (h1 -> h2 -> h3).
- Use semantic elements (`header`, `main`, `section`, `nav`, `footer`).

### Error Handling

- Use try/catch for async work and surface user-friendly messages.
- Log errors in development; handle loading and error states in UI.
- Use route-level `loading.tsx` and `error.tsx` when appropriate.

### Performance

- Minimize client-side JS; keep components server-first.
- Use `dynamic()` for heavy client-only modules.

## Design Tokens (Summary)

- Color system is tokenized (oklch-based). Use semantic tokens only.
- Neon glows exist; use sparingly for CTAs and highlights.

## Path Aliases

- `@/*` maps to repo root (e.g., `@/components/ui/button`).

## Git Conventions

- Use conventional commits (e.g., `feat:`, `fix:`, `docs:`).
- Keep commits focused and in English.

## Cursor / Copilot Rules

- No `.cursor/rules`, `.cursorrules`, or `.github/copilot-instructions.md` found.
