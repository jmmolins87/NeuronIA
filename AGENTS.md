# NeuronIA Agent Guidelines

Essential information for AI coding agents working on the NeuronIA project.

## Project Overview

**Project**: NeuronIA - AI-powered Business Automation Platform  
**Framework**: Next.js 16 (App Router) - Server Components by default  
**Language**: TypeScript 5.x (strict mode enabled)  
**Styling**: Tailwind CSS 4.x + shadcn/ui (new-york style)  
**Themes**: Health-Tech (Light) + Cyber Clinic (Dark) with NEON accent palette  
**Theme System**: next-themes (system default + manual toggle, localStorage persistence)  
**i18n**: Custom ES/EN implementation (localStorage: `neuronia-locale`)  
**Icons**: lucide-react  
**Fonts**: Geist Sans + Geist Mono

## Commands

```bash
# Development
npm run dev              # Dev server → http://localhost:3000
npm run build            # Production build (requires type-check pass)
npm run start            # Serve production build (run build first)
npm run lint             # ESLint check (flat config v9.x)

# Auditing & Quality
npm run audit            # Run all audits (i18n + inline styles)
npm run audit:i18n       # Check for hardcoded strings
npm run audit:inline     # Check for inline styles

# Testing
# ⚠️ No test framework configured yet - TBD in future phases
# When tests are added, follow this pattern:
# npm test              # Run all tests
# npm test <file>       # Run single test file
```

## Code Style Guidelines

### TypeScript
- **Strict mode enabled** - All type errors must be resolved
- Use `import type` for type-only imports
- Prefer interfaces for objects, types for unions/intersections
- Explicit return types for exported functions
- Avoid `any` - use `unknown` or proper typing
- Use `readonly` for immutable props
- Target: ES2017, JSX: react-jsx

### Imports Order
```typescript
// 1. Type imports (library first, then internal)
import type { Metadata } from "next"
import type { MyType } from "@/types"

// 2. Library imports (React/Next first, then third-party)
import * as React from "react"
import { ThemeProvider } from "next-themes"

// 3. Absolute imports - using @/ alias (internal code)
import { Button } from "@/components/ui/button"
import { useTranslation } from "@/components/providers/i18n-provider"

// 4. Relative imports (styles last)
import "./globals.css"
```

### Naming Conventions
- **Components**: PascalCase (`SiteShell`, `ThemeToggle`)
- **Files**: 
  - Routes/pages: lowercase (`page.tsx`, `layout.tsx`)
  - Components: kebab-case (`theme-toggle.tsx`, `floating-particles.tsx`)
  - Config: lowercase (`next.config.ts`, `eslint.config.mjs`)
- **Functions**: camelCase (`getUserData`, `calculateROI`)
- **Variables**: camelCase (`isLoading`, `userData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_URL`, `LOCALE_STORAGE_KEY`)
- **CSS Variables**: kebab-case (`--primary`, `--card-foreground`)
- **Types/Interfaces**: PascalCase (`TranslationValue`, `I18nContextType`)

### Styling
- **ONLY use Tailwind utility classes** - No inline styles (except imperatively set via JS)
- **NO hardcoded colors** - Use CSS variables/tokens
- Use semantic tokens: `bg-background`, `text-foreground`, `text-primary`
- Use `cn()` from `@/lib/utils` for conditional classes
- Mobile-first: `sm:`, `md:`, `lg:`, `2xl:`, `3xl:` breakpoints
- Custom variants: Use Tailwind 4's `@custom-variant` for dark mode

### React Patterns
- **Server Components by default** - Only use `"use client"` when:
  - Event handlers needed
  - React hooks (useState, useEffect, useContext, etc.)
  - Browser APIs (localStorage, window, document)
  - Hook-based libraries (next-themes, custom providers)
- Prefer composition over prop drilling
- Use semantic HTML (`header`, `main`, `footer`, `nav`, `section`, `article`)
- Use React.memo for expensive components
- Use useCallback/useMemo appropriately

### Error Handling
- Wrap async operations in try-catch blocks
- Provide user-friendly error messages
- Use error boundaries for component errors
- Log errors for debugging but sanitize before showing to users

### Accessibility
- Always include `aria-label` for icon-only buttons
- Maintain heading hierarchy (h1 → h2 → h3, never skip levels)
- Use `suppressHydrationWarning` sparingly (only for theme/locale on html/body)
- Ensure keyboard navigation works
- Test with screen readers when possible

### Formatting
- Double quotes for strings
- Template literals for string interpolation
- Destructure props in function signatures
- Optional chaining (`?.`) for nullable access
- Nullish coalescing (`??`) for default values
- Semicolons optional but be consistent within files

## Theme System (NEON Palette)

All colors use **oklch** color space for consistent perceptual brightness.

- **Light Mode**: NEON GREEN primary, NEON YELLOW accent
- **Dark Mode**: Brighter NEON GREEN/YELLOW + enhanced glow effects
- **Neon Glow Classes**: `glow-sm`, `glow-primary`, `text-glow-primary`, `dark:glow-primary`
- **Usage**: Use sparingly (2-3 glows max per viewport to avoid overwhelming UI)

```tsx
// ✅ Correct - Use CSS variables
<div className="bg-background text-foreground">
<Button className="bg-primary text-primary-foreground">CTA</Button>

// ❌ Wrong - No inline styles or hardcoded colors
<div style={{ backgroundColor: '#ffffff' }}>
<div className="bg-[#00FF9A]">
```

## Internationalization (i18n)

**CRITICAL**: ALL user-facing text MUST use i18n - NO hardcoded strings.

```tsx
"use client"
import { useTranslation } from "@/components/providers/i18n-provider"

export function MyComponent() {
  const { t, locale, setLocale } = useTranslation()
  return <h1>{t("page.title")}</h1>
}
```

- **Location**: `/locales/es.json` and `/locales/en.json`
- **Structure**: Nested JSON with dot notation (`nav.home`, `common.loading`)
- **Variables**: `{{variableName}}` in JSON, pass object to `t()`: `t("welcome", { name: "John" })`
- **Common keys**: `nav.*`, `common.*`, `aria.*`, `theme.*`, `errors.*`
- **Default locale**: Spanish (`es`)
- **Storage**: `localStorage` key: `neuronia-locale`

## Path Aliases & Structure

- `@/*` maps to project root
- Example: `@/components/ui/button` → `<root>/components/ui/button.tsx`

```
neuronia-app/
├── app/                           # Next.js App Router
│   ├── layout.tsx                # Root layout with providers
│   ├── page.tsx                  # Home page
│   ├── globals.css               # Global styles + theme variables
│   └── [routes]/page.tsx         # Feature pages
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── providers/                # React context providers
│   ├── animations/               # Animation components
│   ├── canvas/                   # Three.js/P5.js components
│   └── [features]/               # Feature-specific components
├── lib/
│   └── utils.ts                  # cn() and utilities
├── locales/
│   ├── es.json                   # Spanish translations
│   └── en.json                   # English translations
├── public/                       # Static assets
└── scripts/                      # Build/audit scripts
```

## Next.js & Libraries

### Next.js Patterns
- Use `metadata` export for SEO (Server Components only)
- Use `<Link>` for navigation (prefetches automatically)
- Use `<Image>` for optimized images (always specify width/height)
- Use Server Actions with `"use server"` directive
- Dynamic imports for code splitting: `const { animate } = await import("animejs")`

### Key Libraries
- **UI**: next-themes, @radix-ui, shadcn/ui, lucide-react
- **Animation**: animejs, three, p5, lottie-react, lenis
- **Styling**: tailwindcss 4.x, tailwind-merge, clsx, class-variance-authority
- **Utils**: mousetrap (keyboard shortcuts), chalk (CLI colors)

## Animation System

### Custom Hooks
- `useRevealOnView` - Reveal elements on scroll
- `useStagger` - Stagger child animations
- `useParallax` - Parallax scroll effects
- `useLenis` - Access Lenis smooth scroll instance

### Anime.js Pattern
```typescript
// Dynamic import to avoid SSR issues
const { default: animate } = await import("animejs")
animate({
  targets: element,
  opacity: [0, 1],
  translateY: [20, 0],
  duration: 800,
  easing: "easeOutCubic"
})
```

### CRITICAL - Accessibility
ALL animations MUST respect `prefers-reduced-motion`:
- Lenis smooth scroll: Disabled when `prefers-reduced-motion: reduce`
- Anime.js: Set duration to 0 or skip animations
- Parallax effects: Disabled entirely
- Lottie: Pause animations or show static frame
- Check with: `window.matchMedia("(prefers-reduced-motion: reduce)").matches`

## ESLint Configuration

- **Config**: Flat config (v9.x) in `eslint.config.mjs`
- **Extends**: `eslint-config-next/core-web-vitals`, `eslint-config-next/typescript`
- **Run**: `npm run lint` (scans entire project)
- **No inline config**: Use `eslint-disable-next-line` sparingly with justification

## Git & Workflow

- **Commit format**: Conventional Commits in English
  - `feat:` - New features
  - `fix:` - Bug fixes
  - `docs:` - Documentation changes
  - `refactor:` - Code refactoring
  - `style:` - Code style/formatting
  - `test:` - Test additions/changes
  - `chore:` - Build process, dependencies
- **Branch naming**: `feature/`, `fix/`, `docs/`, `refactor/`
- Keep commits atomic and focused on a single concern

## Common Gotchas

1. **Hydration errors**: Use `suppressHydrationWarning` on `<html>` and `<body>` for theme/locale
2. **Client components**: Don't forget `"use client"` directive when using hooks/events
3. **Images**: Always use `next/image` with explicit width/height or fill + relative parent
4. **CSS variables**: Define in both `:root` and `.dark` selectors in globals.css
5. **i18n**: ALL user-visible text must come from translation files, not hardcoded
6. **Neon effects**: Use sparingly (2-3 glows max per viewport) to avoid sensory overload
7. **Imports**: Use `import type` for types to optimize bundle size
8. **Animations**: Always check and respect `prefers-reduced-motion`
9. **localStorage**: Check `typeof window !== "undefined"` before accessing
10. **Path aliases**: Always use `@/` prefix, never relative imports across multiple levels
