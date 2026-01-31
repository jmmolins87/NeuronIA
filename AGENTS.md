# NeuronIA Agent Guidelines

This document provides essential information for AI coding agents working on the NeuronIA project.

## Project Overview

**Project**: NeuronIA - AI-powered Business Automation Platform  
**Framework**: Next.js 16 (App Router)  
**Language**: TypeScript 5.x (strict mode)  
**Styling**: Tailwind CSS 4.x + shadcn/ui  
**Themes**: Health-Tech (Light) + Cyber Clinic (Dark) con paleta NEÓN  
**Theme System**: next-themes (system default + manual toggle with persistence)  
**i18n**: Custom implementation with ES/EN support (localStorage persistence)

## Build & Development Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Create production build
npm run start        # Run production server (requires build first)

# Code Quality
npm run lint         # Run ESLint checks

# Testing
# No test framework configured yet - TBD in future phases
```

## Project Structure

```
neuronia-app/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with ThemeProvider + I18nProvider
│   ├── page.tsx           # Home page
│   ├── solucion/          # Solution page
│   ├── roi/               # ROI calculator page
│   ├── escenarios/        # Use cases page
│   ├── como-funciona/     # How it works page
│   ├── metodologia/       # Methodology page
│   ├── faqs/              # FAQs page
│   ├── reservar/          # Book demo page
│   └── contacto/          # Contact page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── providers/         # React context providers
│   │   ├── theme-provider.tsx  # Theme context
│   │   └── i18n-provider.tsx   # i18n context + useTranslation hook
│   ├── header.tsx         # Site header (sticky, responsive)
│   ├── footer.tsx         # Site footer
│   ├── site-shell.tsx     # Layout wrapper (Header + children + Footer)
│   ├── theme-toggle.tsx   # Dark/light mode toggle
│   └── language-switcher.tsx  # Language switcher (ES/EN)
├── locales/               # Translation files
│   ├── es.json           # Spanish translations
│   └── en.json           # English translations
├── lib/                   # Utility functions
└── public/                # Static assets (logo, images, etc.)
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - All type errors must be resolved
- Use `import type` for type-only imports
- Prefer interfaces for object types, types for unions/intersections
- Use explicit return types for exported functions
- Avoid `any` - use `unknown` or proper typing instead
- Use readonly for props that shouldn't be mutated

### Imports Order

```typescript
// 1. Type imports from libraries
import type { Metadata } from "next"

// 2. Library imports
import { ThemeProvider } from "next-themes"

// 3. Absolute imports from project (using @/ alias)
import { Button } from "@/components/ui/button"
import { SiteShell } from "@/components/site-shell"

// 4. Relative imports
import "./globals.css"
```

### Naming Conventions

- **Components**: PascalCase (e.g., `SiteShell`, `ThemeToggle`)
- **Files**: 
  - Routes/pages: lowercase (e.g., `page.tsx`, `layout.tsx`)
  - Components: kebab-case (e.g., `theme-toggle.tsx`, `site-shell.tsx`)
  - Config files: lowercase (e.g., `next.config.ts`)
- **Functions**: camelCase (e.g., `getUserData`, `calculateROI`)
- **Variables**: camelCase (e.g., `isLoading`, `userData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `API_URL`)
- **CSS Variables**: kebab-case with double dash (e.g., `--primary`, `--card-foreground`)

### Styling

- **ONLY use Tailwind utility classes** - No inline styles allowed
- **NO hardcoded colors in JSX** - Use CSS variables/tokens
- Use semantic color tokens (e.g., `bg-background`, `text-foreground`)
- Prefer composition: `className="flex items-center gap-2"`
- Use `cn()` utility from `@/lib/utils` for conditional classes
- Responsive design: mobile-first approach with `sm:`, `md:`, `lg:` breakpoints

### React Patterns

- **Server Components by default** - Only use `"use client"` when needed
- Client components required for:
  - Event handlers (onClick, onChange, etc.)
  - React hooks (useState, useEffect, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Third-party libraries that use hooks
- Use `React.use()` for async data in Server Components
- Prefer composition over prop drilling
- Use proper semantic HTML elements

### Accessibility

- Always include `aria-label` for icon-only buttons
- Use semantic HTML (`header`, `main`, `footer`, `nav`, `section`)
- Ensure focus states are visible (handled by Tailwind)
- Include `sr-only` text for screen readers when needed
- Maintain proper heading hierarchy (h1 → h2 → h3)

### Error Handling

- Use try-catch for async operations
- Provide user-friendly error messages
- Log errors to console in development
- Use error boundaries for component-level errors
- Handle loading and error states in UI

### Performance

- Use `next/image` for all images (automatic optimization)
- Lazy load components when appropriate with `dynamic()`
- Minimize client-side JavaScript (prefer Server Components)
- Use `loading.tsx` and `error.tsx` for route-level states

## Design Tokens (CSS Variables)

All colors use **oklch** color space for better perceptual uniformity.

### Health-Tech Theme (Light)
Clean, professional with controlled neon accents:
- `--background`: Almost white with cool tint
- `--foreground`: Deep navy-blue (high contrast)
- `--primary`: **NEON GREEN** (from logo #00FF9A)
- `--accent`: **NEON YELLOW** for highlights
- `--secondary`: Light teal tones
- `--muted`: Subtle grays for disabled states
- `--border`: Light borders with cyan hint
- `--ring`: Neon green focus ring
- `--glow`: Neon green for glow effects
- `--section-alt`: Alternate section background

### Cyber Clinic Theme (Dark)
Deep dark with vibrant neon accents and subtle glow:
- `--background`: Deep navy-blue, almost black
- `--foreground`: Off-white with cyan hint
- `--primary`: **NEON GREEN** (brighter for dark bg)
- `--accent`: **NEON YELLOW** (brighter for dark bg)
- `--secondary`: Dark teal surfaces
- `--muted`: Dark grays for disabled states
- `--border`: Cyan-tinted borders
- `--ring`: Bright neon green focus ring
- `--glow`: Neon green glow (more visible in dark)
- `--section-alt`: Alternate dark section

### Neon Glow Utilities
Use sparingly for CTAs and highlights:
```tsx
// Box shadow glows
<div className="glow-sm">Small glow</div>
<div className="glow-md">Medium glow</div>
<div className="glow-lg">Large glow</div>
<div className="glow-primary">Primary color glow</div>
<div className="glow-accent">Accent color glow</div>

// Text shadow glows
<h1 className="text-glow-primary">Neon text</h1>
<h1 className="text-glow-accent">Accent neon text</h1>

// Conditional glow (only in dark mode)
<Button className="dark:glow-primary">CTA</Button>
```

### Usage Guidelines
```tsx
// ✅ Correct - Using CSS variables
<div className="bg-background text-foreground border-border">
<Button className="bg-primary text-primary-foreground">CTA</Button>
<h1 className="text-primary dark:text-glow-primary">Destacado</h1>

// ✅ Correct - Conditional glow in dark mode
<div className="dark:glow-sm">Card with subtle glow</div>

// ❌ Wrong - No inline styles
<div style={{ backgroundColor: '#ffffff' }}>

// ❌ Wrong - No hardcoded hex
<div className="bg-[#00FF9A]">

// ❌ Wrong - Excessive glow (use sparingly!)
<div className="glow-lg glow-primary glow-accent">
```

### Neon Usage Best Practices
**USE neon for:**
- Primary CTAs and buttons
- Active navigation states
- Focus rings (automatic)
- Hero headings highlights
- Badges and status indicators
- Card borders on hover

**AVOID neon for:**
- Body text and paragraphs
- Large background areas
- Multiple simultaneous elements
- Small text (<14px)
- More than 2-3 glows per viewport

## Path Aliases

- `@/*` maps to root directory
- Example: `@/components/ui/button` → `<root>/components/ui/button.tsx`

## Internationalization (i18n)

**CRITICAL**: ALL user-facing text MUST use i18n - NO hardcoded strings allowed.

### Using Translations

```tsx
"use client"

import { useTranslation } from "@/components/providers/i18n-provider"

export function MyComponent() {
  const { t, locale, setLocale } = useTranslation()

  return (
    <div>
      <h1>{t("page.title")}</h1>
      <p>{t("footer.copyright", { year: "2024" })}</p>
      <button onClick={() => setLocale("en")}>English</button>
    </div>
  )
}
```

### Translation Files

- **Location**: `/locales/es.json` and `/locales/en.json`
- **Structure**: Nested JSON with dot notation keys
- **Variables**: Use `{{variableName}}` syntax in JSON, pass object to `t()`

### Rules

- ✅ ALL text must come from translation files
- ✅ Use `t("key.path")` for all user-facing strings
- ✅ Include aria-labels and screen reader text
- ❌ NO hardcoded strings (except internal keys/IDs)
- ❌ NO mixing languages in same file

### Common Keys

- `nav.*` - Navigation links
- `common.*` - Shared UI elements (buttons, labels)
- `aria.*` - Accessibility labels
- `theme.*` - Theme toggle labels
- `language.*` - Language switcher labels
- `errors.*` - Error messages
- `[page].*` - Page-specific content

## Environment & Configuration

- **Default language**: Spanish (es)
- **Supported languages**: Spanish (es), English (en)
- **Language persistence**: localStorage (`neuronia-locale`)
- **Theme**: System preference by default, manual toggle available
- **Target**: ES2017+ browsers
- **Module system**: ESNext with bundler resolution

## Next.js Specific

- Use `metadata` export for SEO in pages/layouts
- Use `generateStaticParams` for dynamic routes
- Server Actions prefix with `"use server"`
- Route handlers in `route.ts` files
- Use `<Link>` from `next/link` for internal navigation
- Use `<Image>` from `next/image` for images

## Available Libraries (Installed)

**UI & Styling:**
- next-themes
- shadcn/ui (Button, Card, Input, Separator, Sheet, Sonner)
- lucide-react (icons)

**Animation & Graphics (for future phases):**
- animejs
- three + @types/three
- p5 + @types/p5
- lottie-react
- lenis (smooth scrolling)

**Utilities:**
- mousetrap + @types/mousetrap (keyboard shortcuts)
- chalk (Node.js terminal colors for scripts)

## Git Workflow

- Commit messages in English, clear and concise
- Follow conventional commits: `feat:`, `fix:`, `docs:`, etc.
- Keep commits atomic and focused

## Phase Development

This project follows a phased approach:
- **Phase 1**: Base setup, routing, theme, components scaffold ✅
- **Phase 2**: Neon palette implementation, glow effects ✅
- **Phase 3**: i18n ES/EN implementation, localStorage persistence ✅
- **Phase 4**: Dynamic claims (theme-based), clinical care messaging ✅
- **Phase 5+**: Content, animations, interactive features (pending)

## Common Gotchas

1. **Hydration errors**: Ensure `suppressHydrationWarning` on `<html>` for theme
2. **Client components**: Don't forget `"use client"` directive when needed
3. **Image imports**: Always use `next/image` with proper width/height
4. **CSS variables**: Must be defined in both `:root` and `.dark` selectors
5. **Path aliases**: Use `@/` prefix consistently for cleaner imports

## ESLint Configuration

Using ESLint 9.x flat config with:
- `eslint-config-next/core-web-vitals` (performance best practices)
- `eslint-config-next/typescript` (TypeScript rules)

**Ignored files:**
- `.next/`, `out/`, `build/`, `next-env.d.ts`

## Questions?

- Check Next.js 16 docs: https://nextjs.org/docs
- shadcn/ui docs: https://ui.shadcn.com
- Tailwind CSS 4 docs: https://tailwindcss.com/docs
