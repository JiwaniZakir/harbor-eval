# Harbor Eval - Agent Instructions

## Project Overview

Harbor Eval is a visual AI evaluation platform built with Next.js 16, React 19, TypeScript, Tailwind CSS v4, React Flow, and Zustand.

## Architecture

### Directory Structure

- `app/` - Next.js App Router (pages, API routes, layout)
- `components/ui/` - Radix-based primitive components (Button, Card, Badge, etc.)
- `components/canvas/` - React Flow canvas (CenterModelNode, DomainNode, DomainEdge)
- `components/layout/` - ChromeBar, Sidebar
- `components/domain/` - DomainDetailPanel, milestone views
- `components/companion/` - AgentChat
- `components/studio/` - SetupWizard, CommandPalette
- `lib/types.ts` - All TypeScript type definitions
- `lib/utils.ts` - Utility functions (cn, generateId, slugify, etc.)
- `lib/stores/` - Zustand stores (ui-store, project-store, domain-store)
- `lib/domain/` - 8 evaluation domains, 32 milestones, taxonomy
- `tests/` - Vitest unit tests

### Key Patterns

- **CSS Variables for tokens** - All colors, spacing, shadows use CSS custom properties in globals.css
- **CVA for component variants** - Button, Badge use class-variance-authority
- **Zustand with persist** - State persisted to localStorage
- **React Flow** - Canvas with custom node types (center, domain) and edge types (domain)

### Design System

- Light theme only, warm beige background (#f1f1ee)
- Figtree font (Google Fonts)
- Brand accent: #7b5cf0 (purple)
- 8 domain accent colors
- Shadows, radius, spacing all via CSS variables
- Animations: scale-in-fade, fade-in-blur, slide-in-from-right, etc.

## Commands

```bash
npm run dev        # Development server
npm run build      # Production build
npm run typecheck  # TypeScript check
npm run lint       # ESLint
npm run test       # Vitest unit tests
npm run check      # All quality checks
```

## Conventions

- Conventional commits: `feat(scope): description`
- Strict TypeScript
- Prettier formatting (2 spaces, double quotes, trailing commas)
- Components use forwardRef pattern for UI primitives
- "use client" directive for interactive components
