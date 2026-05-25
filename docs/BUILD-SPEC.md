# Harbor Eval Canvas: Comprehensive Build Specification
## For PM Agent / Implementation Agent

> Synthesized from deep audits of: **Cofounder.co** (primary target), **dub.co** (code patterns), **Linear** (animation/typography), **Resend** (minimalism), **tldraw** (canvas UX)
>
> Generated: 2026-05-25 | Audit data: 448 CSS variables, 630 custom properties, 74 computed element styles, 3 full CSS extractions

---

## Table of Contents
1. [Product Overview](#1-product-overview)
2. [Architecture Blueprint](#2-architecture-blueprint)
3. [Design System Specification](#3-design-system-specification)
4. [Layout System](#4-layout-system)
5. [Component Specifications](#5-component-specifications)
6. [Canvas System](#6-canvas-system)
7. [Animation System](#7-animation-system)
8. [Interaction Patterns](#8-interaction-patterns)
9. [Page-by-Page Specifications](#9-page-by-page-specifications)
10. [Implementation Roadmap](#10-implementation-roadmap)
11. [Quality Checklist](#11-quality-checklist)

---

## 1. Product Overview

### What Harbor Eval Canvas Is
A visual, canvas-based platform for designing and running AI model evaluation campaigns. Users create evaluation "campaigns" that contain domains (e.g., Reasoning, Safety, Multilingual), each with milestones and probes. An AI agent assists in building and running evaluations.

### Core Screens
1. **Canvas View** - Radial node graph showing domains around a center model node
2. **Home Sidebar** - Right panel with greeting, roadmap progress, tasks, suggestions
3. **Domain Detail** - Expanded view of a single domain with milestones and probes
4. **Agent Chat** - Companion panel for AI interaction
5. **Campaign Setup** - Wizard for creating new evaluation campaigns
6. **Settings** - Configuration and preferences
7. **Command Palette** - Quick search/action (Cmd+K)

### Visual Identity
- **Warm, approachable** - Not cold/corporate. Think "research lab notebook" meets "modern SaaS"
- **Canvas-first** - The graph IS the product, not a feature
- **Light theme only** - Warm beige background, white cards, purple accent
- **Font**: Figtree (Google Fonts) - friendly, rounded, good at small sizes
- **Personality**: Intelligent, calm, trustworthy

---

## 2. Architecture Blueprint

### Tech Stack
```
Framework:     Next.js 16+ (App Router, Turbopack)
Canvas:        React Flow (@xyflow/react)
State:         Zustand (5 stores)
Styling:       Tailwind CSS v4
Components:    shadcn/ui base + custom
Animations:    CSS keyframes + Tailwind animate
Icons:         Lucide React
Toasts:        Sonner
```

### File Structure
```
app/
  layout.tsx          # Root: html, fonts, providers
  page.tsx            # Main workspace page
  globals.css         # Design tokens + base styles

components/
  canvas/             # React Flow nodes, edges, controls
  companion/          # AI agent chat panel
  domain/             # Domain detail components
  layout/             # Shell: sidebar, topbar, panels
  milestone/          # Milestone cards and detail
  studio/             # Settings, wizard, command palette
  ui/                 # Base components (button, badge, etc.)

lib/
  stores/             # Zustand stores
  domain/             # Domain definitions and logic
  types.ts            # TypeScript types
  utils.ts            # Utilities
```

### Store Architecture
```
project-store    → Campaign metadata (name, model, settings)
domain-store     → Domain states, milestones, probes, suggestions
canvas-store     → React Flow nodes/edges, viewport, selection
agent-store      → Agent messages, status, tool calls
ui-store         → Panel states, active tab, focus, modals
```

### Page Layout (Target Architecture)
```
┌─────────────────────────────────────────────────────────────┐
│ Floating Chrome Bar (transparent, pointer-events-none)       │
│  [Avatar] [Org▾] .............. [Search] [+] [🔔4] [⚙]     │
├─────────────────────────────────────────────┬───────────────┤
│                                             │  Right Sidebar │
│                                             │  460px         │
│           Canvas (React Flow)               │  ┌───────────┐│
│           Full viewport behind sidebar      │  │Tab Bar     ││
│                                             │  │Home|Agent..││
│     ┌──────┐                                │  ├───────────┤│
│     │Center│    ○ Domain      ○ Domain      │  │           ││
│     │Model │                                │  │ Scrollable ││
│     └──────┘    ○ Domain      ○ Domain      │  │ Content    ││
│                                             │  │           ││
│           ○ Domain      ○ Domain            │  ├───────────┤│
│                                             │  │Chat Input  ││
│     [Minimap]                               │  └───────────┘│
│     [Controls]                              │  my-2 mr-2    │
└─────────────────────────────────────────────┴───────────────┘
```

---

## 3. Design System Specification

### Color Tokens

#### Surface Hierarchy
```css
/* Cofounder exact values (from Playwright extraction) */
--bg:                    #f1f1ee;    /* Canvas/page background */
--bg-warm:               #edede9;    /* Slightly darker warm */
--bg-card:               #ffffff;    /* Card surfaces */
--bg-card-secondary:     #fcfcf9;    /* Secondary cards (Cofounder: --background-l150) */
--bg-sidebar:            #f5f5f2;    /* Sidebar background (Cofounder: aside bg) */
--bg-sidebar-inner:      #fbfbf8;    /* Inner sidebar section (Cofounder: section bg) */
--bg-elevated:           #ecece9;    /* Cofounder: --background-l-negative-50 */
--bg-dropdown:           #fefefb;    /* Dropdown menus */
--bg-raised:             #f8f8f6;    /* Raised surfaces */
--bg-overlay:            rgba(0, 0, 0, 0.5);
--bg-inverted:           #4f4f4f;    /* Dark buttons (Cofounder exact) */
```

#### Foreground Scale
```css
/* Cofounder: #202020 base with opacity steps */
--foreground:            #202020;
--foreground-90:         #202020e6;   /* ~90% */
--foreground-80:         #202020cc;
--foreground-70:         #202020b3;
--foreground-60:         #20202099;
--foreground-50:         #20202080;
--foreground-40:         #20202066;
--foreground-30:         #2020204d;
--foreground-20:         #20202033;
--foreground-15:         #20202026;
--foreground-10:         #2020201a;
--foreground-8:          #20202014;
--foreground-5:          #2020200d;
--foreground-3:          #20202008;
--foreground-inverse:    #ffffff;
```

#### Border Scale
```css
/* Cofounder: pure black with opacity */
--border:                #0000001a;   /* 10% - default */
--border-8:              #00000014;   /* 8% - subtle */
--border-5:              #0000000d;   /* 5% - very subtle */
--border-strong:         #0003;       /* 20% - emphasis */
```

#### Accent Colors
```css
--accent:                #7b5cf0;     /* Brand purple */
--accent-hover:          #6a4de0;
--accent-muted:          rgba(123, 92, 240, 0.12);
--accent-glow:           rgba(123, 92, 240, 0.2);
```

#### Domain Accent Colors (8 Domains)
```css
--domain-instruction:    #4087f2;    /* Blue */
--domain-reasoning:      #8a72e5;    /* Purple */
--domain-safety:         #f46746;    /* Red-orange */
--domain-knowledge:      #80a740;    /* Green */
--domain-calibration:    #b16a27;    /* Amber */
--domain-multilingual:   #3aafa9;    /* Teal */
--domain-longcontext:    #e8596c;    /* Pink */
--domain-tooluse:        #6c63ff;    /* Indigo */
```

#### Status Colors
```css
--status-success:        #16a34a;
--status-warning:        #ca8a04;
--status-error:          #dc2626;
--status-info:           #2563eb;
--status-probing:        var(--accent);
```

### Typography

#### Font Stack
```css
--font-sans:   Figtree, "Figtree Fallback", system-ui, sans-serif;
--font-mono:   "JetBrains Mono", "Fira Code", ui-monospace, monospace;
```

#### Type Scale (Cofounder-matched + Linear-inspired)
```
Page Title:     24px / 600 / 1.2 / -0.3px tracking
                (Cofounder: "Good morning, Zakir" heading)

Section Title:  18px / 600 / 1.2 / leading-[1.2]
                (Cofounder: department name in cards)

Card Title:     15px / 600 / 1.33 / normal tracking
                (Cofounder: h3 in sidebar cards)

Body:           14px / 400 / 1.5 / normal
                (Cofounder/dub: standard body text)

Small:          13px / 500 / 1.38 / normal
                (Cofounder: button labels, secondary info)

Caption:        11px / 400 / 1.36 / normal
                (Cofounder: timestamps, metadata)

Mono Label:     9px / 400 / 1.0 / 0.12em tracking / uppercase
                (Cofounder: uses "Departure Mono" for status labels;
                 we use JetBrains Mono equivalent)

Mono Code:      13px / 400 / 1.5
                (Code blocks, IDs)
```

### Shadows (Cofounder Exact)
```css
/* Card shadow - multi-layer for depth */
--shadow-card: 
  inset 0 0 0 1px #fff,
  0 0 0 1px rgba(0,0,0,0.08),
  0 0 20px rgba(0,0,0,0.03),
  0 23px 28px rgba(0,0,0,0.02);

/* Button shadows */
--shadow-button-sm:
  inset 0 0.75px 0 0 #fff,
  inset 0 0 0.36px 1.07px #fff,
  0 3px 3px rgba(0,0,0,0.02);

--shadow-button-md:
  inset 0 0.75px 0 0 #fff,
  inset 0 0 0.36px 1.07px #fff,
  0 1px 2px rgba(0,0,0,0.08),
  0 3px 3px rgba(0,0,0,0.03);

/* Department node (from Cofounder computed styles) */
--shadow-dept-node:
  rgba(0,0,0,0.05) 0 0 0 1px inset,
  rgb(255,255,255) 0 1px 0 0 inset,
  rgba(0,0,0,0.03) 0 0 20px 0,
  rgba(0,0,0,0.02) 0 65px 45px 0,
  rgba(0,0,0,0.02) 0 50px 35px 0,
  rgba(0,0,0,0.01) 0 40px 25px 0,
  inset 0 0 0 1px var(--department-workspace-inset-highlight);

/* Sidebar */
--shadow-sidebar:
  0 0 0 1px rgba(0,0,0,0.06),
  0 4px 16px rgba(0,0,0,0.04);
```

### Border Radius Scale
```css
--radius-xs:    4px;
--radius-sm:    6px;
--radius-md:    8px;
--radius-lg:    11px;     /* Cofounder: department card inner corners */
--radius-xl:    12px;     /* Sidebar, main panels */
--radius-2xl:   16px;     /* Large cards */
--radius-3xl:   22px;     /* Department workspace outer shell */
--radius-full:  9999px;   /* Pills, badges */
```

### Spacing Scale
```
4px   (1)   - Icon gap, tight padding
6px   (1.5) - Badge padding, small gap
8px   (2)   - Element gap, input padding
10px  (2.5) - Cofounder sidebar section gaps
12px  (3)   - Card inner padding, nav gaps
16px  (4)   - Section padding, card body
20px  (5)   - Major gaps
22px  (5.5) - Cofounder sidebar horizontal padding
24px  (6)   - Panel padding
32px  (8)   - Section spacing
```

---

## 4. Layout System

### Viewport Structure (Cofounder Match)

#### Top-level
```
Full viewport: 100vw x 100vh
├── Canvas: absolute inset-0 (full viewport)
└── Overlay: absolute inset-0 z-40 pointer-events-none
    ├── Chrome Bar: top, floating, pointer-events-auto per button
    └── Side Panel: right, 460px, my-2 mr-2, pointer-events-auto
```

#### Chrome Bar (Floating Toolbar)
Source: Cofounder `canvas-toolbar` at (0, 68)
```
Position:       fixed top, overlaying canvas
Height:         ~48px visual, no background fill
Background:     transparent (each button is its own glass pill)
Button style:   bg-foreground-3, border-[0.5px] border-foreground-10,
                backdrop-filter: blur(20px), rounded-[6px], h-[28px]
Contains:       [Avatar+Org] .... [Upgrade] [Dark] [Roadmap] [Search] [Inbox]
Padding:        px-4 pt-2
pointer-events: none on container, auto on each button
```

#### Right Sidebar
Source: Cofounder computed (2092, 76) - 460x1356px
```
Width:          460px (CSS var --companion-width)
Position:       right side, floating
Margin:         my-2 mr-2 (8px gaps top/right/bottom)
Height:         calc(100vh - 16px) approximately
Background:     rgb(245, 245, 242) = #f5f5f2
Corner radius:  12px (all corners, floating element)
Shadow:         shadow-outset-100 (subtle depth)
Backdrop:       backdrop-blur-xl
Overflow:       hidden on outer, scroll on inner

Inner structure:
  ├── Tab Bar: px-[22px] pt-4 pb-[10px]
  │   └── Pill tabs: [Home] [Agent] [Company] [Tasks] [Library]
  │       Active: bg-foreground-5 border-foreground-5
  │       Inactive: text-foreground-60 hover:text-foreground-80
  │       Size: h-6 px-2 py-1, text-sm font-medium
  ├── Content Section: flex-1 overflow-y-auto
  │   ├── Greeting: "Good morning, Zakir"
  │   ├── Roadmap Card: gradient bg, progress bar
  │   ├── Tasks List: domain cards
  │   ├── Suggested Next: sparkle icon items
  │   └── Archived Tasks
  └── Chat Input: border-t, sticky bottom
      └── Input bar + submit button
```

#### Canvas Area
Source: Cofounder `.react-flow` at (0, 68) - 2560x1372px
```
Position:       absolute, fills viewport
Top offset:     68px (below the minimal topbar zone)
Background:     rgb(241, 241, 238) = #f1f1ee (same as page bg)
Dot grid:       1px dots, ~20px spacing, ~5% opacity
Contains:       center model node + domain nodes in radial layout
Minimap:        bottom-left, semi-transparent
Controls:       bottom-left (above minimap)
```

---

## 5. Component Specifications

### 5.1 Chrome Bar Buttons
```
Each button is an independent glass element:
  height:        28px
  padding:       pl-[3px] pr-1.5 (avatar btn) or px-2 (icon btn)
  background:    rgba(32,32,32, 0.03) = var(--foreground-3)
  border:        0.5px solid rgba(32,32,32, 0.1) = var(--foreground-10)
  border-radius: 6px
  backdrop:      blur(20px)
  transition:    colors

Avatar button specifically:
  Contains: 20x20 rounded-full avatar + org name text
  Text: font-sans text-[14px] font-semibold truncate
```

### 5.2 Sidebar Tab Bar
```
Container: flex items-center gap-2, relative
Background pill (active indicator):
  absolute, transitions left+width with duration-200 ease-in-out
  border border-foreground-5 bg-foreground-5 rounded
  Animates to match active tab position/width

Tab button:
  h-6 px-2 py-1 rounded
  text-sm font-medium leading-none
  Active:   text-foreground, z-10
  Inactive: text-foreground-60, hover:text-foreground-80
  Cursor:   pointer
```

### 5.3 Roadmap Progress Card
Source: Cofounder sidebar "Harboreval Roadmap 14%"
```
Container:
  w-full rounded-[var(--radius-xl)] p-4
  background: linear-gradient(135deg, #7b5cf0 0%, #5c8cfc 50%, #3aafa9 100%)
  cursor: pointer
  transition: shadow hover:shadow-md

Title:
  text-[14px] font-semibold text-white/90
  leading-[18px] truncate
  drop-shadow: 0 1px 2px rgba(0,0,0,0.35)

Progress bar:
  mt-3 flex items-center gap-2
  Track: h-1.5 flex-1 rounded-full bg-white/20 overflow-hidden
  Fill:  h-full rounded-full bg-white/80 transition-all duration-500
  Label: text-[13px] font-medium text-white/80 tabular-nums
```

### 5.4 Task List Item
Source: Cofounder sidebar active tasks
```
Container:
  flex w-full items-center gap-3
  rounded-[var(--radius-lg)] bg-[var(--bg)] p-3
  transition-colors hover:bg-[var(--bg-elevated)]
  cursor: pointer

Icon container:
  h-8 w-8 shrink-0 rounded-lg
  bg: domain accent color at 12% opacity
  Contains: 12x12 rounded-full dot in domain accent

Content:
  min-w-0 flex-1
  Title: text-[14px] font-medium text-foreground truncate
  Sub:   text-[12px] text-foreground-50

Right:
  Duration label: text-[12px] text-foreground-40 tabular-nums
  OR Badge: status badge (probing, reviewing, etc.)
```

### 5.5 Domain Node (Canvas Card)
Source: Cofounder department nodes, computed 165x52px at canvas scale
```
Cofounder's actual department node is SMALL on canvas:
  Native size at 0.11x scale = ~1500x472px native → 165x52px rendered
  This means the card is designed at high resolution and scaled down

Our domain node should be:
  Visible size:    ~180-200px wide on canvas
  Background:      var(--bg-elevated) = #ecece9 (Cofounder: bg-background-l-negative-50)
  Border-radius:   22px outer shell (Cofounder: rounded-[22px])
  Shadow:          var(--shadow-dept-node) (complex multi-layer)
  Padding:         12px (p-3)

Header row:
  Icon: 28x28 rounded-[5px], border border-foreground-5, bg-background-l0
        Custom SVG icon per domain, text-foreground
  Title: text-lg (18px) font-semibold leading-[1.2] text-foreground-90 truncate

Status indicator (agent ready):
  Pill: rounded-xl, bg-[department-workspace-glass], backdrop-blur
  Contains: 5px dot (sky-400 = ready, amber = working) + icon + text

Action button:
  h-auto, shrink-0
  bg: var(--bg-inverted) = #4f4f4f
  text: white/85
  text-[14px] font-medium
  rounded, px-3 py-1.5
```

### 5.6 Center Model Node
```
Larger than domain nodes, represents the AI model being evaluated
  Size:          94x55px rendered (Cofounder's cofounderNode)
  Contains:      Model name + logo
  Style:         Same card surface but slightly elevated
  Connections:   Edges radiate out to each domain node
```

### 5.7 Connection Edges
```
Source: Cofounder uses custom SVG with animated particles

Our implementation:
  Type:          Custom React Flow edge
  Stroke:        rgba(32,32,32, 0.1) = 1px
  Style:         Solid (not dashed) - Cofounder uses solid lines
  Animation:     Optional: flowing dots along the edge
  Curvature:     Bezier, smooth
  Arrow:         None (Cofounder doesn't use arrowheads)
```

### 5.8 Button Component (dub.co-inspired CVA)
```tsx
Variants:
  primary:    bg-inverted text-white border-black
              hover: ring-4 ring-border-subtle
  secondary:  bg-bg-card text-foreground border-border-subtle
              hover: bg-bg-raised
  outline:    bg-transparent text-foreground-70 border-transparent
              hover: bg-foreground-5
  accent:     bg-accent text-white border-accent
              hover: bg-accent-hover ring-4 ring-accent-muted
  danger:     bg-status-error text-white
              hover: ring-4 ring-red-100

Base classes:
  h-10 rounded-lg border px-3 text-sm font-medium
  transition-all duration-150
  flex items-center justify-center gap-2
  disabled: opacity-50 cursor-not-allowed
```

### 5.9 Badge Component
```tsx
Base:  rounded-full border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap

Variants:
  default:    border-foreground-20 text-foreground-60
  probing:    border-accent bg-accent-muted text-accent
  success:    border-green-200 bg-green-50 text-green-700
  warning:    border-amber-200 bg-amber-50 text-amber-700
  error:      border-red-200 bg-red-50 text-red-700
  info:       border-blue-200 bg-blue-50 text-blue-700
  gradient:   bg-gradient-to-r from-accent to-blue-500 text-white border-transparent
```

### 5.10 Command Palette (Cmd+K)
Source: dub.co pattern + Linear style
```
Overlay:     fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
Container:   max-w-[640px] mx-auto mt-[20vh]
             bg-white rounded-xl shadow-elevated
             border border-border-subtle

Search input:
  h-12 px-4 border-b border-border-subtle
  text-[15px] placeholder:text-foreground-40

Results:
  max-h-[400px] overflow-y-auto p-2
  Each item: h-10 px-3 rounded-lg flex items-center gap-3
             hover:bg-bg-raised
             Active: bg-bg-elevated

Keyboard:
  ↑↓ navigate, Enter select, Esc close
  Show keyboard shortcuts as small badges
```

### 5.11 Detail Panel (Domain Expanded)
```
Container:
  width: var(--detail-panel-width) = 460px (replaces sidebar)
  Same floating treatment as home sidebar
  Slide-in-from-right animation (200ms ease)

Header:
  h-12 px-4 flex items-center justify-between
  border-b border-border-subtle
  Title: text-[11px] font-semibold uppercase tracking-[1px] text-foreground-60
  Close: ghost icon button

Content: flex-1 overflow-y-auto p-4
  Domain header card (gradient bg, icon, progress)
  Milestone list (card items)
  Suggested probes
  Cross-domain dependencies

Mobile: Vaul drawer (slide up from bottom)
  rounded-t-[10px] border-t border-border-subtle
```

### 5.12 Notification Inbox
Source: Cofounder "4 agent updates" popover
```
Trigger:
  Button with relative badge count (absolute -top-0.5 -right-0.5)
  Badge: h-4 w-4 rounded-full bg-accent text-[9px] font-bold text-white

Popover:
  w-[380px] rounded-xl bg-white shadow-elevated border border-border-subtle
  Header: px-4 py-3, "Notifications" + mark-all-read button
  List: max-h-[400px] overflow-y-auto
  Item: px-4 py-3 hover:bg-bg-raised border-b border-border-subtle
        Contains: icon + title + description + timestamp
```

### 5.13 Campaign Setup Wizard
```
Modal: centered, max-w-[560px]
  bg-white rounded-2xl shadow-elevated
  Animated step transitions (fade-in-blur)

Steps:
  1. Name your campaign (text input)
  2. Select model (model selector grid)
  3. Choose domains (multi-select cards)
  4. Configure (threshold sliders)
  5. Review & Launch (summary)

Progress: dot indicators at top, animated between steps
Navigation: Back + Continue buttons, keyboard support
```

---

## 6. Canvas System

### React Flow Configuration
```tsx
{
  nodeTypes: {
    centerModel: CenterModelNode,
    domain: DomainNode,
    milestone: MilestoneNode,         // shown when domain expanded
    agentActivity: AgentActivityNode,  // live agent work indicator
  },
  edgeTypes: {
    domainConnection: DomainConnection,
    dependencyEdge: DependencyEdge,
  },
  
  // Canvas settings
  minZoom: 0.1,
  maxZoom: 2,
  defaultViewport: { x: center, y: center, zoom: 0.8 },
  fitView: true,
  fitViewOptions: { padding: 0.2 },
  
  // Background
  <Background variant="dots" gap={20} size={1} color="rgba(32,32,32,0.05)" />
  
  // Controls position
  <CanvasControls position="bottom-left" />
  <CanvasMiniMap position="bottom-left" below controls />
}
```

### Radial Layout Algorithm
```
Center node: (0, 0)
Domain nodes: distributed evenly on a circle
  Radius: 400px (adjustable)
  Angle: (index / totalDomains) * 2 * Math.PI - Math.PI/2
  Position: (radius * cos(angle), radius * sin(angle))

When domain is selected/expanded:
  Animate other nodes to make room
  Selected node zooms to show milestones
```

### Node Interaction States
```
Default:     shadow-card, cursor-pointer
Hovered:     shadow-card-hover, slight scale(1.01), border-color transition
Selected:    shadow-card-selected (accent ring), scale(1)
Active:      Pulsing accent glow (agent working on this domain)
Disabled:    opacity-50, cursor-not-allowed
```

---

## 7. Animation System

### Core Animations (from dub.co + Cofounder + Linear)

```css
/* Panel appear (dub.co: fade-in-blur) */
@keyframes fade-in-blur {
  0%   { opacity: 0; filter: blur(4px); }
  50%  { opacity: 0.5; filter: blur(0px); }
  100% { opacity: 1; filter: blur(0px); }
}

/* Node appear (dub.co: scale-in-fade) */
@keyframes scale-in-fade {
  0%   { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* Slide transitions (dub.co timing) */
@keyframes slide-up-fade {
  0%   { opacity: 0; transform: translateY(2px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* Panel slide-in */
@keyframes slide-in-from-right {
  0%   { transform: translateX(100%); }
  100% { transform: translateX(0); }
}

/* Edge flow (dots moving along connections) */
@keyframes edge-flow {
  0%   { stroke-dashoffset: 24; }
  100% { stroke-dashoffset: 0; }
}

/* Agent activity pulse */
@keyframes agent-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(123, 92, 240, 0.4); }
  50%      { box-shadow: 0 0 0 8px rgba(123, 92, 240, 0); }
}

/* Loading spinner (dub.co) */
@keyframes spinner {
  0%   { opacity: 1; }
  100% { opacity: 0; }
}
```

### Timing Functions
```css
/* Standard easing (dub.co) */
--ease-out:          cubic-bezier(0.16, 1, 0.3, 1);      /* popover, tooltip */
--ease-in-out:       cubic-bezier(0.87, 0, 0.13, 1);      /* accordion */
--ease-spring:       cubic-bezier(0.34, 1.56, 0.64, 1);   /* bounce effect */

/* Duration scale */
--duration-fast:     150ms;   /* hover states, button press */
--duration-normal:   200ms;   /* panel transitions */
--duration-slow:     400ms;   /* page transitions, slide */
--duration-blur:     500ms;   /* fade-in-blur effect */
```

### Interaction Animations
```
Button press:       translateY(1px), 50ms
Button hover:       ring-4 appear, 150ms
Card hover:         shadow increase + border darken, 200ms
Tab switch:         Background pill slides (left/width), 200ms ease-in-out
Panel open:         slideInFromRight, 200ms ease
Panel close:        slideOutToRight, 200ms ease
Node appear:        scale-in-fade, 200ms ease-out, stagger 50ms per node
Toast appear:       slide-up-fade, 400ms cubic-bezier(0.16, 1, 0.3, 1)
Modal appear:       scale-in (0.95→1) + fade-in, 200ms
Command palette:    scale-in-fade, 200ms
Canvas zoom:        smooth (React Flow default)
```

---

## 8. Interaction Patterns

### Keyboard Shortcuts
```
Cmd+K         → Command palette
Cmd+/         → Toggle agent chat
Escape        → Close topmost panel/modal
Arrow keys    → Navigate canvas (when focused)
Tab           → Move between sidebar sections
1-8           → Jump to domain 1-8
Space         → Fit view to canvas
```

### Canvas Interactions
```
Click node           → Open domain detail in sidebar
Double-click node    → Zoom to node + expand milestones
Click canvas         → Deselect, close detail panel
Scroll               → Zoom in/out
Drag                 → Pan canvas
Cmd+drag             → Multi-select
Right-click          → Context menu (copy, share, expand, etc.)
```

### Sidebar Interactions
```
Tab click            → Switch sidebar content (with animated indicator)
Task click           → Open domain detail (replace sidebar content)
Roadmap card click   → Navigate to first domain
Suggestion click     → Open relevant domain
Chat submit          → Send to agent, show typing indicator
Resize handle        → Drag to resize sidebar width
```

### Panel Transitions
```
HomeSidebar → DetailPanel:  slide content left, new slides in from right
DetailPanel → CompanionPanel: crossfade with slight scale
Any → CommandPalette: overlay scale-in-fade
```

---

## 9. Page-by-Page Specifications

### 9.1 Canvas Home (Default View)
```
When:    Project loaded, no domain selected
Shows:   Canvas with radial nodes + Home sidebar
Sidebar: Greeting, Roadmap card, Tasks, Suggested Next, Archived, Chat input
Canvas:  8 domain nodes around center model node
Chrome:  Avatar, org name, search, create, notifications, settings
```

### 9.2 Domain Selected
```
When:    User clicks a domain node
Shows:   Canvas (domain highlighted) + Detail sidebar
Sidebar: Domain header, Milestones list, Probes, Dependencies
Canvas:  Selected node has accent ring, others slightly faded
Transition: Home sidebar content slides out, detail slides in
```

### 9.3 Agent Chat Active
```
When:    User opens companion panel (Cmd+/ or tab)
Shows:   Canvas + Chat sidebar
Sidebar: Message list (scrollable), Input area (sticky bottom)
Messages: User bubbles (right), Agent bubbles (left) with markdown
Tool calls: Expandable cards showing agent tool invocations
```

### 9.4 Campaign Setup
```
When:    No project exists OR user clicks "New Campaign"
Shows:   Modal wizard over canvas (or empty state)
Steps:   5-step wizard with progress dots
Animation: fade-in-blur between steps
```

### 9.5 Settings
```
When:    Settings icon clicked or nav tab
Shows:   Settings view in detail panel
Layout:  Left nav (220px) + content area
Sections: General, Model, Domains, Appearance, API
Style:   inset-surface cards for each section
```

### 9.6 Empty State
```
When:    No project loaded
Shows:   Full canvas area with centered empty state
Content: Illustration + "Create your first evaluation campaign" + CTA button
Style:   Subtle, inviting, with fade-in animation
```

---

## 10. Implementation Roadmap

### Phase 1: Layout Restructure (Critical Path)
**Goal: Match Cofounder's layout architecture**

```
1. [ ] Convert TopBar → floating chrome bar
       - Remove solid header background
       - Make each button an independent glass pill
       - Set pointer-events-none on container, auto on buttons
       - h-[28px] per button, rounded-[6px], backdrop-blur

2. [ ] Convert sidebar to floating panel
       - Add my-2 mr-2 margin (floating gaps)
       - Add rounded-[12px] all corners
       - Change bg to #f5f5f2 (var(--bg-sidebar))
       - Add backdrop-blur-xl
       - Add shadow-outset-100

3. [ ] Move nav tabs INTO sidebar
       - Remove tabs from TopBar
       - Add tab bar as first element in sidebar
       - Implement animated pill indicator (sliding bg)
       - Tabs: Home | Agent | Domains | Tasks | Library

4. [ ] Make canvas full-viewport
       - Remove topbar height subtraction
       - Canvas absolute inset-0
       - Sidebar overlay (not pushing canvas)

5. [ ] Add inner section to sidebar
       - Outer: bg-sidebar, rounded-xl
       - Inner content section: bg-sidebar-inner, rounded-[10px], mx-[2px]
```

### Phase 2: Component Polish
**Goal: Match dub.co component quality**

```
6. [ ] Upgrade Button component (CVA variants)
       - Add ring-4 hover pattern
       - Add disabled tooltip support
       - Add loading spinner state
       - Add keyboard shortcut display

7. [ ] Upgrade Badge component
       - Add gradient variant
       - Add rainbow variant
       - Ensure mono-font for status labels

8. [ ] Add missing animations to globals.css
       - fade-in-blur
       - scale-in-fade
       - slide-up-fade (with proper timing)
       - accordion-down/up
       - spinner, blink

9. [ ] Add AnimatedSizeContainer component
       - Auto-animate height changes in panels
       - Used for expanding/collapsing sections

10.[ ] Add LoadingSpinner + LoadingDots
       - Consistent loading states
       - Used in buttons, panels, agent status
```

### Phase 3: Canvas Polish
**Goal: Match Cofounder's canvas quality**

```
11.[ ] Redesign domain nodes
       - Match Cofounder's 22px radius, multi-layer shadow
       - Icon + title header row
       - Status pill with dot indicator
       - Action button (dark bg)
       - Proper scaling behavior

12.[ ] Redesign center model node
       - Distinct from domain nodes
       - Model name + logo
       - Connection hub styling

13.[ ] Upgrade edge connections
       - Solid lines (not dashed)
       - Optional edge-flow animation
       - Proper bezier curvature
       - No arrowheads

14.[ ] Canvas background
       - Verify dot grid: 20px gap, 1px dots, 5% opacity
       - Match warm background color

15.[ ] Canvas controls styling
       - Match floating glass aesthetic
       - Proper shadow and backdrop-blur
```

### Phase 4: Panel Content Polish
**Goal: Match Cofounder's sidebar content quality**

```
16.[ ] Roadmap progress card
       - Gradient background (purple→blue→teal)
       - Drop shadow on text
       - Animated progress bar

17.[ ] Task list items
       - Domain icon containers
       - Duration labels (not milestone counts)
       - Proper hover states

18.[ ] Suggested next section
       - Sparkle icons
       - Chevron-right affordance
       - Refresh button

19.[ ] Chat input area
       - Sticky bottom with border-top
       - Agent badge prefix
       - Submit button
       - Placeholder text

20.[ ] Detail panel
       - Domain header with gradient
       - Milestone cards
       - Tab system (Tasks | Files | Context)
```

### Phase 5: Interaction & Animation
**Goal: Linear/dub-level animation quality**

```
21.[ ] Sidebar tab animated indicator
       - Sliding background pill
       - transition left+width, 200ms ease-in-out

22.[ ] Panel transition animations
       - slide-in-from-right for panels
       - fade-in-blur for content changes
       - scale-in-fade for modals

23.[ ] Node interaction states
       - Hover: shadow increase + scale(1.01)
       - Selected: accent ring animation
       - Active: pulse glow

24.[ ] Staggered node appearance
       - Nodes fade in one-by-one on canvas build
       - 50ms stagger between nodes
       - scale-in-fade animation

25.[ ] Keyboard navigation
       - Arrow keys for canvas
       - Tab through sidebar items
       - Escape to close
       - Number keys for domains
```

### Phase 6: Responsive & Edge Cases
```
26.[ ] Mobile layout
       - Sidebar becomes bottom sheet (Vaul drawer)
       - Chrome bar becomes hamburger menu
       - Canvas touch gestures

27.[ ] Empty states
       - Campaign not created
       - No milestones yet
       - No agent responses

28.[ ] Error states
       - Network errors
       - Agent failures
       - Invalid configurations

29.[ ] Performance
       - Virtualize long lists
       - Lazy load detail content
       - Optimize canvas for 100+ nodes
```

---

## 11. Quality Checklist

### Visual Quality (check against Cofounder screenshots)
- [ ] Background color matches: #f1f1ee
- [ ] Sidebar bg matches: #f5f5f2 with 12px radius
- [ ] Sidebar inner section: #fbfbf8 with 10px radius
- [ ] Chrome bar buttons: 28px tall, glass effect, 6px radius
- [ ] Card shadows: multi-layer, not single drop shadow
- [ ] Button inset shadows: white highlight on top edge
- [ ] Domain nodes: 22px radius outer shell
- [ ] Font: Figtree renders correctly at all sizes
- [ ] Mono font: JetBrains Mono for labels/codes
- [ ] Accent purple: #7b5cf0 used consistently
- [ ] Domain colors: all 8 domain accents correct
- [ ] Border opacity: ~10% black, not gray
- [ ] No glass-border/glass-bg legacy classes remain

### Interaction Quality (check against Linear/dub)
- [ ] All buttons have hover state change within 150ms
- [ ] Panels animate in/out (not instant)
- [ ] Tab switching has animated indicator
- [ ] Canvas nodes have hover/selected/active states
- [ ] Command palette opens/closes smoothly
- [ ] Toasts appear with slide-up-fade
- [ ] Loading states present (spinner/dots)
- [ ] Keyboard shortcuts all functional

### Code Quality
- [ ] Zero TypeScript errors
- [ ] No console warnings in dev
- [ ] All components use design tokens (no hardcoded colors)
- [ ] Zustand stores properly memoized (no infinite loops)
- [ ] React Flow nodeTypes/edgeTypes defined outside render
- [ ] All animations use CSS (not JS intervals)
- [ ] Tailwind classes use design system variables

### Performance
- [ ] First paint < 1s
- [ ] Canvas renders 8 nodes without jank
- [ ] Sidebar scrolls at 60fps
- [ ] No layout shift on panel open/close
- [ ] Images lazy loaded
- [ ] Fonts preloaded

---

## Appendix A: Exact Cofounder Measurements

From Playwright computed styles extraction (2560x1440 viewport):

```
Body:           2560x1440, bg rgb(241,241,238), font Figtree 16px/400
Main:           2560x1372 at (0,68), transparent bg
Sidebar:        460x1356 at (2092,76), bg rgb(245,245,242), radius 12px
Sidebar inner:  456x1304 at (2094,126), bg rgb(251,251,248), radius 10px
React Flow:     2560x1372 at (0,68), transparent bg
Dept node:      165x52 rendered (native ~1500px wide, scaled 0.11x)
Center node:    94x55 rendered
Dept card bg:   rgb(236,236,233) with complex shadow
Avatar span:    28x28, bg rgb(28,111,217) = blue
Dept title:     18px/600 Figtree (text-lg font-semibold)
H3 in cards:    15px/600 Figtree
Mono labels:    9px Departure Mono (we use JetBrains)
```

## Appendix B: Exact dub.co Measurements

From Playwright + repo analysis:

```
Body:           bg rgb(250,250,250) #fafafa, font Inter 16px/400
Sidebar:        304px = 64px icon col + 240px nav area, bg neutral-200
Content:        bg-white, lg:rounded-xl, scrollable
Nav buttons:    14px/500 Inter
H1 (marketing): 48px/500 Satoshi
H2:             36-48px/500 Satoshi  
Body:           14px/400 Inter
Button:         h-10, rounded-lg, border, ring-4 on hover
Badge:          rounded-full, border, px-2, text-xs/500
Modal:          rounded-xl on desktop, rounded-t-[10px] drawer on mobile
Animations:     fade-in-blur 0.5s, scale-in-fade 0.2s, slide-up-fade 0.4s
```

## Appendix C: Key File References

| Concept | Cofounder (inspect) | dub.co (source) | Harbor (implement) |
|---------|--------------------|-----------------|--------------------|
| Layout grid | `canvas-overlay` + `canvas-side-panel` | `apps/web/ui/layout/main-nav.tsx` | `app/page.tsx` |
| Sidebar nav | `data-side-panel-tabs` | `apps/web/ui/layout/sidebar/sidebar-nav.tsx` | `components/layout/home-sidebar.tsx` |
| Color tokens | Playwright CSS vars (448) | `packages/tailwind-config/themes.css` | `app/globals.css` |
| Button | `canvas-chrome-blur` class | `packages/ui/src/button.tsx` | `components/ui/button.tsx` |
| Badge | Cofounder status pills | `packages/ui/src/badge.tsx` | `components/ui/badge.tsx` |
| Modal/Panel | Department workspace expand | `packages/ui/src/modal.tsx` | `components/layout/detail-panel.tsx` |
| Animations | CSS keyframes in main CSS | `packages/tailwind-config/tailwind.config.ts` | `app/globals.css` |
| Font config | HTML `<link>` preloads | `apps/web/styles/fonts.ts` | `app/layout.tsx` |
| Node design | `department-workspace-home-panel` | (no equivalent) | `components/canvas/domain-node.tsx` |
| Canvas | React Flow with custom nodes | (no equivalent) | `components/canvas/canvas-shell.tsx` |
