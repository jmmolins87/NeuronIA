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

### Imports Order
```typescript
// 1. Type imports from libraries
import type { Metadata } from "next"

// 2. Library imports
import { ThemeProvider } from "next-themes"

// 3. Absolute imports (using @/ alias)
import { Button } from "@/components/ui/button"

// 4. Relative imports
import "./globals.css"
```

### Naming Conventions
- **Components**: PascalCase (`SiteShell`, `ThemeToggle`)
- **Files**: Routes/pages: lowercase (`page.tsx`), Components: kebab-case (`theme-toggle.tsx`), Config: lowercase (`next.config.ts`)
- **Functions**: camelCase (`getUserData`, `calculateROI`)
- **Variables**: camelCase (`isLoading`, `userData`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `API_URL`)
- **CSS Variables**: kebab-case (`--primary`, `--card-foreground`)

### Styling
- **ONLY use Tailwind utility classes** - No inline styles
- **NO hardcoded colors** - Use CSS variables/tokens
- Use semantic tokens: `bg-background`, `text-foreground`
- Use `cn()` from `@/lib/utils` for conditional classes
- Mobile-first: `sm:`, `md:`, `lg:` breakpoints

### React Patterns
- **Server Components by default** - Only use `"use client"` when: event handlers, React hooks, browser APIs, or hook-based libraries
- Prefer composition over prop drilling
- Use semantic HTML (`header`, `main`, `footer`, `nav`, `section`)

### Accessibility & Error Handling
- Always include `aria-label` for icon-only buttons
- Maintain heading hierarchy (h1 → h2 → h3)
- Use try-catch for async operations with user-friendly error messages
- Use error boundaries for component errors

### Formatting
- Double quotes, template strings for interpolation
- Destructure props, optional chaining (`?.`), nullish coalescing (`??`)

## Theme System (NEON Palette)

All colors use **oklch** color space.

- **Light Mode**: NEON GREEN primary, NEON YELLOW accent
- **Dark Mode**: Brighter NEON GREEN/YELLOW + enhanced glow effects
- **Neon Glow Classes**: `glow-sm`, `glow-primary`, `text-glow-primary`, `dark:glow-primary`
- **Usage**: Use sparingly (2-3 glows max per viewport)

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
- **Structure**: Nested JSON with dot notation
- **Variables**: `{{variableName}}` in JSON, pass object to `t()`
- **Common keys**: `nav.*`, `common.*`, `aria.*`, `theme.*`, `errors.*`

## Path Aliases & Structure
- `@/*` maps to root: `@/components/ui/button` → `<root>/components/ui/button.tsx`
- **app/**: App Router pages + layouts
- **components/**: UI components (ui/, providers/, features)
- **locales/**: es.json, en.json
- **lib/**: Utilities (utils.ts)

## Next.js & Libraries
- Use `metadata` export, `<Link>`, `<Image>`, Server Actions with `"use server"`
- **UI**: next-themes, shadcn/ui, lucide-react
- **Animation**: animejs, three, p5, lottie-react, lenis
- **Utilities**: mousetrap, chalk

## Animation System

**Hooks**: `useRevealOnView`, `useStagger`, `useParallax`, `useLenis`

**Anime.js Pattern**:
```typescript
const { animate } = await import("animejs")
animate(element, { opacity: [0, 1], translateY: [distance, 0], duration: 800, ease: "out-cubic" })
```

**CRITICAL - Accessibility**: ALL animations MUST respect `prefers-reduced-motion` (Lenis OFF, Anime.js instant, Parallax disabled, Lottie paused)

## Git & Workflow
- Commit messages in English using conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Keep commits atomic and focused

## Common Gotchas
1. **Hydration errors**: Use `suppressHydrationWarning` on `<html>` for theme
2. **Client components**: Don't forget `"use client"` directive
3. **Images**: Always use `next/image` with proper width/height
4. **CSS variables**: Define in both `:root` and `.dark` selectors
5. **i18n**: ALL text must come from translation files
6. **Neon effects**: Use sparingly (2-3 glows max per viewport)
