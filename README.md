# ClinvetIA

Plataforma de automatización inteligente con IA para transformar negocios.

## 🚀 Phase 1 - ✅ Completado

Setup base con Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui y next-themes.

## 📋 Quick Start

### Instalación
```bash
npm install
```

### Desarrollo
```bash
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Build de Producción
```bash
npm run build
npm run start
```

### Linting
```bash
npm run lint
```

## 🛠️ Stack Técnico

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5.x (strict mode)
- **Styling**: Tailwind CSS 4.x
- **UI Components**: shadcn/ui (New York style)
- **Theming**: next-themes
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono

### Librerías para Animación (Phase 2+)
- animejs
- three.js
- p5.js
- lottie-react
- lenis

## 📁 Estructura del Proyecto

```
clinvetia-app/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout con ThemeProvider
│   ├── page.tsx           # Home page
│   └── [routes]/          # 9 páginas de contenido
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── providers/         # React providers
│   ├── header.tsx         # Header sticky
│   ├── footer.tsx         # Footer
│   ├── site-shell.tsx     # Layout wrapper
│   ├── theme-toggle.tsx   # Dark/light toggle
│   └── language-switcher.tsx
├── lib/                   # Utilidades
└── public/                # Assets estáticos
```

## 📚 Documentación

- **[AGENTS.md](./AGENTS.md)** - Guía para agentes de IA
- **[PHASE-1-CHECKLIST.md](./PHASE-1-CHECKLIST.md)** - Checklist de verificación
- **[PHASE-1-SUMMARY.md](./PHASE-1-SUMMARY.md)** - Resumen de Phase 1

## ✨ Características

### Theming
- ✅ Sistema light/dark con persistencia
- ✅ CSS variables (oklch color space)
- ✅ Toggle manual + detección de sistema

### Navegación
- ✅ Header sticky y responsive
- ✅ Menú móvil (Sheet drawer)
- ✅ 11 rutas funcionales
- ✅ Footer con enlaces organizados

### UI
- ✅ 6 componentes shadcn/ui instalados
- ✅ Accesibilidad base implementada
- ✅ Responsive design

## 🎯 Próximos Pasos (Phase 2)

1. Internacionalización (ES/EN)
2. Paleta de colores neon
3. Contenido real en todas las páginas
4. Animaciones y visualizaciones 3D
5. Calculadora ROI interactiva
6. Formularios de contacto/reserva

## 🔗 Links Útiles

- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Status**: Phase 1 Completado ✅  
**Build**: Exitoso ✅  
**Lint**: Sin errores ✅
