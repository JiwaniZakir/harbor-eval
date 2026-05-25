# Harbor Eval

[![CI](https://github.com/JiwaniZakir/harbor-eval/actions/workflows/ci.yml/badge.svg)](https://github.com/JiwaniZakir/harbor-eval/actions/workflows/ci.yml)
[![CodeQL](https://github.com/JiwaniZakir/harbor-eval/actions/workflows/codeql.yml/badge.svg)](https://github.com/JiwaniZakir/harbor-eval/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Visual AI evaluation platform. Design evals that find where models fail.**

Harbor Eval is a canvas-based workspace for designing and running AI model evaluation campaigns. Explore a model's weaknesses through an interactive spatial graph, guided by an AI agent that probes, discovers, and builds rigorous evaluation tasks.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| UI | React 19, Radix UI, Tailwind CSS v4 |
| Canvas | React Flow (@xyflow/react) |
| State | Zustand |
| Animation | Motion (Framer Motion) |
| AI | Vercel AI SDK (OpenAI, Anthropic, Google) |
| Database | PostgreSQL + Drizzle ORM |
| Testing | Vitest + Testing Library |
| CI/CD | GitHub Actions + Vercel |

## Quick Start

```bash
# Clone
git clone https://github.com/JiwaniZakir/harbor-eval.git
cd harbor-eval

# Install
npm install

# Set up hooks
npm run prepare

# Configure environment
cp .env.example .env.local
# Edit .env.local with your API keys

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run typecheck` | TypeScript type checking |
| `npm run lint` | ESLint |
| `npm run format` | Prettier formatting |
| `npm run check` | All quality checks |
| `npm run test` | Run unit tests |
| `npm run test:watch` | Tests in watch mode |

## Architecture

```
app/                    # Next.js App Router pages & API routes
components/
  ui/                   # Radix-based primitive components
  canvas/               # React Flow canvas (nodes, edges, controls)
  layout/               # Chrome bar, sidebar, panels
  domain/               # Domain-specific components
  milestone/            # Milestone cards and detail views
  companion/            # AI agent chat panel
  studio/               # Artifacts, setup wizard, command palette
lib/
  types.ts              # All TypeScript type definitions
  utils.ts              # Utility functions
  stores/               # Zustand state stores
  domain/               # 8 evaluation domains + milestones
  agent/                # Agent runtime, tools, prompts
  ai/                   # AI SDK integration, probe engine
  db/                   # Drizzle schema and client
  harbor/               # Harbor eval format adapters
tests/                  # Vitest unit & integration tests
```

## Design System

Warm, research-lab aesthetic with Cofounder.co-level polish:

- **Background**: `#f1f1ee` (warm beige)
- **Cards**: `#ffffff` with subtle shadows
- **Accent**: `#7b5cf0` (purple)
- **Font**: Figtree (Google Fonts)
- **Light theme only**

## CI/CD Pipeline

- **CI**: Type check, lint, format, test, build on every PR
- **Deploy**: Auto-deploy to Vercel on main merge
- **Security**: CodeQL analysis weekly + on PR
- **Hooks**: Pre-commit (typecheck + lint), commit-msg (conventional commits), pre-push (build)

## Contributing

1. Fork and create a feature branch
2. Follow conventional commits: `feat(scope): description`
3. Ensure `npm run check` and `npm run test` pass
4. Submit a PR

## License

MIT
