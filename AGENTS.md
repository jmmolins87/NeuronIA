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
npm run dev          # Dev server → http://localhost:3000
npm run build        # Production build (requires type-check pass)
npm run start        # Serve production build (run build first)
npm run lint         # ESLint check (flat config v9.x)

# Testing
# ⚠️ No test framework configured yet - TBD in future phases
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
- **Files**: 
  - Routes/pages: lowercase (`page.tsx`, `layout.tsx`)
  - Components: kebab-case (`theme-toggle.tsx`, `site-shell.tsx`)
  - Config: lowercase (`next.config.ts`)
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
- **Server Components by default** - Only use `"use client"` when:
  - Event handlers (onClick, onChange, etc.)
  - React hooks (useState, useEffect, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Third-party libraries using hooks
- Prefer composition over prop drilling
- Use semantic HTML (`header`, `main`, `footer`, `nav`, `section`)

### Accessibility
- Always include `aria-label` for icon-only buttons
- Use semantic HTML elements
- Include `sr-only` text for screen readers
- Maintain heading hierarchy (h1 → h2 → h3)

### Error Handling
- Use try-catch for async operations
- Provide user-friendly error messages
- Log errors in development
- Use error boundaries for component errors

## Theme System (NEON Palette)

All colors use **oklch** color space.

### Light Mode Colors
- `--primary`: NEON GREEN (#00FF9A equivalent)
- `--accent`: NEON YELLOW for highlights
- `--gradient-from`: Neon green
- `--gradient-to`: Neon blue
- Scroll button uses `--gradient-to` (blue) on hover

### Dark Mode Colors
- `--primary`: Brighter NEON GREEN
- `--accent`: Brighter NEON YELLOW
- Enhanced glow effects

### Neon Glow Utilities
```tsx
// Use sparingly for CTAs and highlights
<div className="glow-sm">Small glow</div>
<div className="glow-primary">Primary glow</div>
<h1 className="text-glow-primary">Neon text</h1>
<div className="dark:glow-primary">Dark mode only</div>
```

### Usage Guidelines
```tsx
// ✅ Correct
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

## Path Aliases
- `@/*` maps to root directory
- Example: `@/components/ui/button` → `<root>/components/ui/button.tsx`

## Next.js Specific
- Use `metadata` export for SEO
- Use `generateStaticParams` for dynamic routes
- Server Actions prefix with `"use server"`
- Use `<Link>` from `next/link` for navigation
- Use `<Image>` from `next/image` for images

## Project Structure
```
app/                    # App Router pages + layouts
components/
├── ui/                # shadcn/ui components
├── providers/         # React context (theme, i18n)
└── [feature].tsx      # Feature components
locales/               # es.json, en.json
lib/                   # Utilities (utils.ts)
public/                # Static assets
```

## Available Libraries
- **UI**: next-themes, shadcn/ui, lucide-react
- **Animation** (future): animejs, three, p5, lottie-react, lenis
- **Utilities**: mousetrap, chalk

## Git Workflow
- Commit messages in English
- Follow conventional commits: `feat:`, `fix:`, `docs:`, etc.
- Keep commits atomic and focused

## Common Gotchas
1. **Hydration errors**: Use `suppressHydrationWarning` on `<html>` for theme
2. **Client components**: Don't forget `"use client"` directive
3. **Images**: Always use `next/image` with proper width/height
4. **CSS variables**: Define in both `:root` and `.dark` selectors
5. **i18n**: ALL text must come from translation files
6. **Neon effects**: Use sparingly (2-3 glows max per viewport)

## ESLint Configuration
- ESLint 9.x flat config
- `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- Ignored: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Development Phases
- **Phase 1-5**: ✅ Complete (setup, theme, i18n, neon palette, visual WOW)
- **Phase 6+**: Pending (advanced animations, interactions)
