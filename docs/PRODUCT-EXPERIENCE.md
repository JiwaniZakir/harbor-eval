# Harbor Eval Canvas: Complete Product Experience

## From First Visit to Published Evaluation

---

## The Core Idea

Harbor is a visual workspace for designing evaluation tasks that find where AI models fail. You don't just write test cases in a spreadsheet -- you explore a model's weaknesses through an interactive canvas, guided by an AI agent that probes, discovers, and builds rigorous evaluation tasks.

The canvas IS the product. Every domain of evaluation (Reasoning, Safety, Instructions, etc.) is a living node on a spatial graph. You click into domains, explore milestones, watch the agent work in real-time, approve or redirect its discoveries, and ultimately publish battle-tested evaluation suites.

---

## The Full User Journey

### Act 1: Landing & Campaign Creation

#### First Visit (Empty State)

```
What the user sees:
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                                             │
│                    ╭──────────────────╮                     │
│                    │   ◇ Harbor       │                     │
│                    │                  │                     │
│                    │  Design evals    │                     │
│                    │  that actually   │                     │
│                    │  find failures.  │                     │
│                    │                  │                     │
│                    │  [Create Campaign]│                     │
│                    │                  │                     │
│                    │  or import from  │                     │
│                    │  existing suite →│                     │
│                    ╰──────────────────╯                     │
│                                                             │
│                  Warm #f1f1ee background                    │
│                  Subtle dot grid visible                    │
│                  No sidebar, no chrome                      │
└─────────────────────────────────────────────────────────────┘
```

- The canvas is empty but alive -- faint dot grid, warm background
- Single centered card with the CTA
- No sidebar, no toolbar -- nothing to distract
- The card uses `scale-in-fade` animation on load

#### Campaign Setup Wizard (5 Steps)

**Step 1: What are you evaluating?**

```
┌─────────────────────────────────────────┐
│  ● ○ ○ ○ ○                             │
│                                         │
│  What's the name of your eval campaign? │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │ GPT-4o Customer Support Agent   │    │
│  └─────────────────────────────────┘    │
│                                         │
│  Give it a name that describes what     │
│  you're stress-testing. This becomes    │
│  the center of your evaluation canvas.  │
│                                         │
│              [Back]  [Continue →]        │
└─────────────────────────────────────────┘
```

- Simple text input, autofocused
- Placeholder suggestions: "Claude Code Refactoring", "Gemini Medical QA"
- Name appears on the center node of the canvas

**Step 2: Target Model**

```
┌─────────────────────────────────────────┐
│  ● ● ○ ○ ○                             │
│                                         │
│  Which model are you evaluating?        │
│                                         │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ OpenAI  │  │Anthropic│  │ Google  │ │
│  │ GPT-4o  │  │ Claude  │  │ Gemini  │ │
│  │  ✓      │  │         │  │         │ │
│  └─────────┘  └─────────┘  └─────────┘ │
│                                         │
│  Model:  [gpt-4o          ▾]            │
│  API Key: [sk-...             ]  ← opt  │
│                                         │
│              [Back]  [Continue →]        │
└─────────────────────────────────────────┘
```

- Provider cards with logos, selectable
- Model dropdown filters by provider
- API key optional (can use ours for demo)
- This determines the "auditor" model too (cross-model by default)

**Step 3: Focus Domains**

```
┌────────────────────────────────────────────────┐
│  ● ● ● ○ ○                                    │
│                                                │
│  Which capabilities do you want to evaluate?   │
│                                                │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ ✓ Instructions│  │ ✓ Reasoning  │           │
│  │ Can it follow │  │ Multi-step   │           │
│  │ constraints?  │  │ logic chains │           │
│  │ ■■■■□ 3 tasks │  │ ■■□□□ 2 tasks│           │
│  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐           │
│  │ ✓ Safety     │  │   Knowledge  │           │
│  │ Jailbreak    │  │ Factual      │           │
│  │ resistance   │  │ accuracy     │           │
│  │ ■■□□□ 2 tasks│  │ ■■■□□ 3 tasks│           │
│  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐           │
│  │   Calibration│  │ ✓ Multilingual│           │
│  │ Uncertainty  │  │ Cross-lingual │           │
│  │ expression   │  │ transfer     │           │
│  └──────────────┘  └──────────────┘           │
│  ┌──────────────┐  ┌──────────────┐           │
│  │   Long Ctx   │  │   Tool Use   │           │
│  │ 128k+ window │  │ Function     │           │
│  │ retrieval    │  │ calling      │           │
│  └──────────────┘  └──────────────┘           │
│                                                │
│  Selected: 4 domains  (we recommend 3-5)       │
│              [Back]  [Continue →]               │
└────────────────────────────────────────────────┘
```

- 8 domain cards in a 2x4 grid, each with the domain accent color
- Click to toggle selection (checkbox + fill animation)
- Each shows domain description + preset milestone count
- Recommended: 3-5 domains for a focused campaign
- Selected domains become nodes on the canvas

**Step 4: Depth Configuration**

```
┌─────────────────────────────────────────┐
│  ● ● ● ● ○                             │
│                                         │
│  How deep should the evaluation go?     │
│                                         │
│  Thoroughness                           │
│  ├──────────●────────────────┤          │
│  Quick scan     Standard     Deep dive  │
│                                         │
│  This controls:                         │
│  • Milestones per domain: ~4            │
│  • Probes per milestone: ~3             │
│  • Sweep variants: ~10                  │
│  • Estimated time: ~30 min              │
│                                         │
│  ☐ Allow AI to discover new milestones  │
│  ☑ Auto-resolve cross-domain deps       │
│  ☐ Require manual approval for probes   │
│                                         │
│              [Back]  [Continue →]        │
└─────────────────────────────────────────┘
```

- Single slider that controls the overall depth
- Shows computed estimates that update in real-time
- Checkboxes for agent autonomy settings
- "Allow AI to discover" lets the agent add milestones it finds interesting

**Step 5: Review & Launch**

```
┌────────────────────────────────────────────┐
│  ● ● ● ● ●                                │
│                                            │
│  Ready to launch your evaluation canvas    │
│                                            │
│  ┌────────────────────────────────────┐    │
│  │ GPT-4o Customer Support Agent      │    │
│  │ Model: gpt-4o (OpenAI)             │    │
│  │ Domains: 4 (Instructions,          │    │
│  │   Reasoning, Safety, Multilingual) │    │
│  │ Milestones: ~16 (4 per domain)     │    │
│  │ Depth: Standard                    │    │
│  │ AI Discovery: Enabled              │    │
│  └────────────────────────────────────┘    │
│                                            │
│  The AI agent will begin by analyzing      │
│  each domain and discovering where your    │
│  model might fail. You'll guide the        │
│  process from the canvas.                  │
│                                            │
│        [Back]  [🚀 Launch Campaign]        │
└────────────────────────────────────────────┘
```

- Summary card with all config
- Prominent launch button with accent gradient
- Clear expectation setting about what happens next

#### The Reveal: Canvas Builds Itself

When the user clicks "Launch Campaign":

1. **Modal fades out** (200ms fade-out-blur)
2. **Center node appears** at canvas center (scale-in-fade, 300ms)
   - Shows campaign name + model logo
3. **Domain nodes appear one by one** (stagger 150ms each)
   - Each pops in at its radial position with scale-in-fade
   - Edges draw themselves from center to each domain (200ms per edge)
4. **Sidebar slides in from right** (slide-in-from-right, 300ms)
   - Shows "Good morning, Zakir" greeting
   - Roadmap card: "GPT-4o Customer Support Agent Evaluation - 0%"
5. **Chrome bar fades in** at top (fade-in, 200ms)
6. **First agent message appears** in sidebar:
   > "I've set up your evaluation canvas with 4 domains. I'll start by analyzing Instruction Following to find where GPT-4o might drop constraints. Click any domain to see its milestones."

This 2-3 second sequence is the "wow moment" -- the user goes from nothing to a fully populated spatial workspace.

---

### Act 2: Exploring the Canvas

#### The Canvas at Rest

```
┌─ Chrome ──────────────────────────────────────────────────────────────────┐
│ [ZJ] [GPT-4o Eval ▾]              [🔍] [+] [🔔] [⚙]                    │
├───────────────────────────────────────────────┬───────────────────────────┤
│                                               │ [Home] Agent  Tasks  Lib │
│           ○ Instructions                      │                          │
│              (blue, 4 milestones)             │ Good morning, Zakir      │
│                                               │                          │
│     ○ Multilingual        ○ Reasoning         │ ┌─ Roadmap ───────────┐  │
│        (teal)               (purple)          │ │ GPT-4o Customer...  │  │
│                                               │ │ ████░░░░░░░░ 14%   │  │
│               ┌─────────┐                     │ └────────────────────┘  │
│               │ GPT-4o  │                     │                          │
│               │ Customer│                     │ TASKS                    │
│               │ Support │                     │ ┌ Instructions    1d  ┐  │
│               └─────────┘                     │ ├ Reasoning       2d  ┤  │
│                                               │ ├ Safety          1d  ┤  │
│     ○ Safety              ○ Knowledge         │ └ Multilingual    2d  ┘  │
│        (red-orange)          (green)          │                          │
│                                               │ SUGGESTED NEXT           │
│           ○ Long Context                      │ ✦ Probe constraint...    │
│              (pink)                           │ ✦ Test negation ha...    │
│                                               │                          │
│  [minimap]                                    │ ┌──────────────────────┐ │
│  [controls]                                   │ │ Ask about your eval..│ │
│                                               │ └──────────────────────┘ │
└───────────────────────────────────────────────┴───────────────────────────┘
```

Each domain node on the canvas shows:

- **Domain icon** (28x28, custom SVG)
- **Domain name** (18px semibold)
- **Status indicator** (colored dot -- green=ready, amber=working, blue=probing)
- **Quick action** (dark button: "Start probing" / "View results")

The connections between center and domains are:

- Solid lines (not dashed)
- Subtle, ~10% opacity
- Optional: flowing dot particles when agent is active

#### Hovering a Domain Node

```
Domain node grows slightly (scale 1.01)
Shadow deepens
Border subtly darkens
Cursor becomes pointer
After 500ms hover: tooltip shows domain description
```

#### Clicking a Domain Node

This is the primary interaction -- it transforms the right sidebar:

```
Transition (300ms):
1. Home sidebar content fades out (opacity 0, 100ms)
2. Detail content fades in with blur (fade-in-blur, 200ms)
3. Canvas: clicked node gets accent ring glow
4. Canvas: other nodes slightly fade (opacity 0.6)
5. Canvas zooms toward selected domain (smooth 400ms)
```

---

### Act 3: Domain Detail -- Where the Real Work Happens

#### Domain Detail Sidebar

```
┌───────────────────────────────────────────────┐
│ DOMAIN DETAILS                           [✕]  │
├───────────────────────────────────────────────┤
│ ┌────────────────────────────────────────���──┐ │
│ │  🔵  Instruction Following               │ │
│ │  ████████████░░░░░░░ 65%                  │ │
│ │  3/4 milestones complete                  │ │
│ │  Agent: Probing constraint edge cases     │ │
│ └───────────────────────────────────────────┘ │
│                                               │
│ [Tasks]  [Files]  [Context]                   │
│                                               │
│ MILESTONES                                    │
│                                               │
│ ✅ Constraint Following          ── completed │
│    "Test adherence to explicit                │
│     operational constraints"                  │
│    → 3 probes passed, 1 weakness found        │
│    📎 eval_constraint_v2.toml                 │
│                                               │
│ ✅ Negation Handling             ── completed │
│    "Do-not instruction compliance"            │
│    → 2 probes, clean pass                     │
│                                               │
│ 🔄 Priority Resolution          ── probing   │
│    "Conflicting instruction ordering"         │
│    → Agent running probe 2 of 3...            │
│    ┌──────────────────────────────────────┐   │
│    │ 🤖 Testing authority hierarchy...    │   │
│    │ ░░░░░░░░████░░░░░ Probe 2/3         │   │
│    │ [Pause]  [View Live]  [Override]     │   │
│    └──────────────────────────────────────┘   │
│                                               │
│ 🔒 Implicit Instruction         ── locked     │
│    Requires: Priority Resolution              │
│                                               │
│ ── AI Discovered ──────────────────────────── │
│ 💡 Format Boundary Testing       ── new       │
│    "Agent found that GPT-4o drops             │
│     formatting rules when prompt > 2k tokens" │
│    [Accept]  [Modify]  [Dismiss]              │
│                                               │
├───────────────────────────────────────────────┤
│ CROSS-DOMAIN LINKS                            │
│ → Multilingual Transfer (Multilinguality)     │
│ → CoT Integrity (Reasoning)                   │
└───────────────────────────────────────────────┘
```

#### Milestone States & Interactions

**Locked (🔒):**

- Grayed out, shows prerequisite
- Click shows "Complete [prerequisite] first"
- Dashed border, no shadow

**Available (ready to start):**

- Full color, subtle shadow
- Click opens milestone detail OR starts agent probing
- Shows "Start" button
- Pulsing subtle glow to attract attention

**In Progress / Probing (🔄):**

- Accent-colored left border stripe
- Live progress indicator (probe X of Y)
- Agent status card embedded:
  - What the agent is doing right now
  - Progress bar
  - Control buttons: Pause, View Live, Override
- Clicking "View Live" opens the companion panel with agent chat

**Completed (✅):**

- Green checkmark
- Summary: "3 probes passed, 1 weakness found"
- Linked artifacts (eval files, reports)
- Click to expand full results

**Failed (❌):**

- Red indicator
- Error description
- "Retry" and "Skip" options

**AI Discovered (💡):**

- Special highlight (sparkle icon)
- Agent explanation of what it found
- Three-button action: Accept / Modify / Dismiss
- Accepting adds it to the milestone list
- Modifying opens an edit form
- Dismissing archives it

---

### Act 4: The Agent at Work

#### Starting a Probe

When the user clicks "Start" on a milestone (or the agent auto-starts):

**On the canvas:**

- The domain node gets a pulsing accent glow
- A small activity badge appears: "🤖 Probing..."
- Edge from center to domain gets flowing-dot animation

**In the sidebar:**

- Milestone card expands to show agent activity
- Progress bar appears: "Probe 1 of 3"

**In the companion panel (if open):**

```
┌───────────────────────────────────────────────┐
│ 🤖 Agent                                      │
│ ─────────────────────────────────────────────  │
│                                               │
│ System: Starting probe sequence for            │
│ "Constraint Following" in Instruction domain.  │
│                                               │
│ Agent: I'll test GPT-4o with a deliverable    │
│ that has 6 explicit constraints including      │
│ format rules, word limits, and conditional     │
│ inclusion. Let me design the probe...          │
│                                               │
│ ┌─ Tool Call ────────────────────────────────┐ │
│ │ 📎 batch_probe_candidates                  │ │
│ │ Domain: instruction_following              │ │
│ │ Milestone: INSTRUCTION_CONSTRAINT          │ │
│ │ Strategy: "Supply a deliverable with 5+    │ │
│ │ explicit constraints; measure which ones   │ │
│ │ the model silently drops."                 │ │
│ │ Status: ✅ Completed (2.3s)                │ │
│ │ [Expand Results ▾]                         │ │
│ └────────────────────────────────────────────┘ │
│                                               │
│ Agent: Found 2 probe candidates. The first    │
│ tests format constraint adherence, the second │
│ tests conditional logic under pressure.       │
│                                               │
│ ┌─ Probe Candidate 1 ───────────────────────┐ │
│ │ "Format Constraint Stress Test"            │ │
│ │ Hypothesis: GPT-4o drops bullet-point      │ │
│ │ formatting when given >5 constraints       │ │
│ │ simultaneously.                            │ │
│ │                                            │ │
│ │ [✓ Approve]  [✎ Edit]  [✗ Reject]         │ │
│ └────────────────────────────────────────────┘ │
│                                               │
│ ┌─ Probe Candidate 2 ───────────────────────┐ │
│ │ "Conditional Inclusion Edge Case"          │ │
│ │ Hypothesis: Model includes content that    │ │
│ │ should be excluded when condition is        │ │
│ │ nested 3+ levels deep.                     │ │
│ │                                            │ │
│ │ [✓ Approve]  [✎ Edit]  [✗ Reject]         │ │
│ └────────────────────────────────────────────┘ │
│                                               │
│ ─────────────────────────────────────────────  │
│ [Ask about this probe...]              [Send]  │
└───────────────────────────────────────────────┘
```

#### The Agent Workflow (11 Phases)

Each milestone goes through a pipeline. The user can watch, intervene, or let it auto-run:

```
Phase 1: INTAKE
  Agent reads the domain, milestone description, and probe strategy.
  Output: Understanding of what to test.
  User sees: "Analyzing milestone..."

Phase 2: WEAKNESS MAPPING
  Agent identifies specific failure modes the model might have.
  Output: WeaknessCards with hypotheses.
  User sees: Weakness cards with approve/edit/reject buttons.
  User action: Review cards, approve the promising ones.

Phase 3: PROBING
  Agent designs probe candidates -- specific test scenarios.
  Output: ProbeCandidate objects with inputs/expected outputs.
  User sees: Probe cards with test descriptions.
  User action: Approve probes to run, edit if needed.

Phase 4: DECISION
  Agent runs probes against the target model, collects results.
  Output: Decision report with pass/fail per probe.
  User sees: Live streaming results, pass/fail indicators.
  Canvas shows: Animated activity on the domain node.

Phase 5: SCAFFOLDING
  Agent builds the actual eval task structure (TOML config).
  Output: Task scaffold artifact.
  User sees: Code preview in artifact viewer.
  User action: Review the scaffold, request changes.

Phase 6: FIXTURES
  Agent generates test fixtures (input/output pairs).
  Output: JSON/CSV fixture files.
  User sees: Fixture table preview.
  User action: Add custom fixtures, edit existing.

Phase 7: VERIFIER
  Agent builds the verification logic (scoring rubric).
  Output: Verifier script.
  User sees: Rubric criteria with weights.
  User action: Adjust weights, add criteria.

Phase 8: SWEEP
  Agent runs the eval sweep across multiple variants.
  Output: Sweep results with scores per variant.
  User sees: Live progress bar, results chart.
  Canvas shows: Score updating on domain node.

Phase 9: AUDIT
  Agent reviews the sweep results for quality.
  Output: Audit report.
  User sees: Quality assessment, flagged issues.
  User action: Accept results or request iteration.

Phase 10: ITERATION (optional)
  Agent proposes improvements based on audit.
  Output: Iteration plan.
  User sees: "The agent suggests..." with diff preview.
  User action: Accept iteration or finalize.

Phase 11: PUBLISH
  Final eval task is marked complete.
  Output: Published evaluation task.
  User sees: Green checkmark, download button.
  Canvas shows: Milestone turns green, domain progress updates.
```

#### User Control Points

The user is never a passive observer. At each phase:

| Phase            | User Can...                                        |
| ---------------- | -------------------------------------------------- |
| Weakness mapping | Approve, edit, reject weakness hypotheses          |
| Probing          | Approve probes, add custom probes, skip            |
| Decision         | View live results, pause agent, override decisions |
| Scaffolding      | Edit the task TOML directly in artifact viewer     |
| Fixtures         | Add/edit/delete test cases manually                |
| Verifier         | Adjust scoring rubric weights                      |
| Sweep            | Cancel sweep, change variant count                 |
| Audit            | Accept or request re-run                           |
| Iteration        | Accept improvements or finalize as-is              |

**The Approval Gate pattern:**

```
┌──────────────────────────────────────────────┐
│ 🔔 Agent needs your input                    │
│                                              │
│ The agent found 3 weakness candidates for    │
│ "Priority Resolution". Review and approve    │
│ the ones you want to probe.                  │
│                                              │
│ ┌────────────────────────────────────────┐   │
│ │ Authority Ambiguity                    │   │
│ │ When system prompt and user prompt     │   │
│ │ disagree, which takes priority?        │   │
│ │                                        │   │
│ │ Fit score: ████████░░ 8.2/10          │   │
│ │ [✓ Approve]  [✎ Edit]  [✗ Reject]     │   │
│ └────────────────────────────────────────┘   │
│ ┌────────────────────────────────────────┐   │
│ │ Tie Breaking                           │   │
│ │ When two equally-valid interpretations │   │
│ │ exist, does the model pick randomly?   │   │
│ │                                        │   │
│ │ Fit score: ██████░░░░ 6.1/10          │   │
│ │ [✓ Approve]  [✎ Edit]  [✗ Reject]     │   │
��� └────────────────────────────────────────┘   │
│                                              │
│     [Approve All]  [Skip This Milestone]     │
└──────────────────────────────────────────────┘
```

---

### Act 5: Artifacts & Results

#### The Artifact Viewer

When the agent produces files (eval configs, scripts, fixtures), they appear in a tabbed viewer:

```
┌─ Files ──────────────────────────────────────┐
│ [eval_constraint_v2.toml] [fixtures.json]    │
│ [verifier.py] [sweep_results.csv]            │
├──────────────────────────────────────────────┤
│  # eval_constraint_v2.toml                   │
│                                              │
│  [task]                                      │
│  name = "constraint_following_stress"        │
│  domain = "instruction_following"            │
│  milestone = "INSTRUCTION_CONSTRAINT"        │
│  difficulty = "hard"                         │
│                                              │
│  [probe]                                     │
│  strategy = "multi_constraint_stress"        │
│  input_template = """                        │
│  Write a product description that:           │
│  1. Is exactly 150 words                     │
│  2. Uses bullet points for features          │
│  3. Does NOT mention competitor names        │
│  4. Includes a call-to-action                │
│  5. Uses formal tone throughout              │
│  6. Ends with a question                     │
│  """                                         │
│                                              │
│  [[fixtures]]                                │
│  ...                                         │
│                                              │
│  [Edit]  [Download]  [Copy]                  │
└──────────────────────────────────────────────┘
```

- Syntax-highlighted code viewer
- Inline editing with save
- Tab system for multiple files per milestone
- "Dirty" indicator when user edits (dot on tab)

#### Sweep Results Visualization

When a sweep completes:

```
┌─ Sweep Results ──────────────────────────────┐
│                                              │
│  Constraint Following Stress Test            │
│  10 variants, scored 0-1                     │
│                                              │
│  ┌──────────────────────────────────────┐    │
│  │ Score Distribution                    │    │
│  │  1.0 │ ██                            │    │
│  │  0.8 │ ████████                      │    │
│  │  0.6 │ ██████████████                │    │
│  │  0.4 │ ████                          │    │
│  │  0.2 │                               │    │
│  │  0.0 │ ██                            │    │
│  │      └────────────────────────       │    │
│  │        Variants                      │    │
│  └──────────────────────────────────────┘    │
│                                              │
│  Mean: 0.62  |  Median: 0.65  |  StdDev: 0.18│
│                                              │
│  ❌ 2 variants scored below threshold (0.3)  │
│  ⚠️ 3 variants showed format degradation     │
│  ✅ 5 variants passed all constraints        │
│                                              │
│  Weakness confirmed: GPT-4o drops bullet     │
│  formatting when constraint count > 5.       │
│                                              │
│  [View Full Report]  [Export CSV]             │
└──────────────────────────────────────────────┘
```

---

### Act 6: Cross-Domain Discovery

As the agent works across multiple domains, it discovers connections:

**On the canvas:**

- New dashed edges appear between domain nodes (not just center-to-domain)
- These represent cross-domain dependencies
- Hovering shows: "Multilingual Transfer affects Constraint Following"

**In the sidebar:**

- Cross-domain section at bottom of domain detail
- Clickable links to jump between domains

**Agent discovers a new milestone:**

```
Agent: While probing Safety alignment, I noticed that
GPT-4o's refusal calibration degrades significantly
when the prompt is in a non-English language. This
crosses into Multilinguality.

I've created a new milestone:
  "Cross-Lingual Refusal Consistency"
  Domain: Multilinguality
  Cross-ref: Safety & Alignment

[Accept as new milestone]  [Dismiss]  [Move to Safety instead]
```

This appears as:

1. A notification badge (🔔 +1) on the chrome bar
2. A card in the sidebar's "Suggested Next" section
3. A sparkle on the relevant domain node on the canvas

---

### Act 7: Publishing & Export

When all milestones across all domains are complete:

**Canvas state:**

```
All domain nodes show green checkmarks
Center node shows: "Campaign Complete - 100%"
Confetti animation (subtle, 2 seconds)
```

**Publish dialog:**

```
┌─────────────────────────────────────────────┐
│  🎉 Your evaluation suite is ready          │
│                                             │
│  GPT-4o Customer Support Agent Evaluation   │
│                                             │
│  4 domains evaluated                        │
│  16 milestones completed                    │
│  42 eval tasks generated                    │
│  3 critical weaknesses found                │
│                                             │
│  Export as:                                  │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐    │
│  │ Harbor  │  │  JSON   │  │ GitHub  │    │
│  │ Format  │  │ Export  │  │  Repo   │    │
│  └─────────┘  └─────────┘  └─────────┘    │
│                                             │
│  [Download All]  [Share Link]  [Close]       │
└─────────────────────────────────────────────┘
```

---

## All User Interactions Map

### Canvas Interactions

| Action                   | What Happens                                               |
| ------------------------ | ---------------------------------------------------------- |
| Click domain node        | Open domain detail in sidebar                              |
| Double-click domain node | Zoom to domain + expand milestones on canvas               |
| Hover domain node        | Scale up slightly, deepen shadow, show tooltip after 500ms |
| Click center node        | Show campaign overview / model info                        |
| Click canvas background  | Deselect all, return to home sidebar                       |
| Scroll wheel             | Zoom in/out                                                |
| Click-drag canvas        | Pan                                                        |
| Right-click canvas       | Context menu: Fit view, Reset zoom, Add note               |
| Right-click node         | Context menu: Start probing, View detail, Copy ID          |
| Drag between nodes       | (future: create manual dependency)                         |

### Sidebar Interactions

| Action                      | What Happens                               |
| --------------------------- | ------------------------------------------ |
| Click Home tab              | Show greeting, roadmap, tasks, suggestions |
| Click Agent tab             | Open companion chat panel                  |
| Click Domains tab           | List all domains with status               |
| Click Tasks tab             | Show all milestones across all domains     |
| Click Library tab           | Show all artifacts/files generated         |
| Click roadmap card          | Navigate to first incomplete domain        |
| Click task item             | Open that domain's detail                  |
| Click suggestion            | Open relevant domain + milestone           |
| Type in chat input          | Send message to agent                      |
| Click refresh (suggestions) | Agent regenerates suggestions              |
| Resize handle (left edge)   | Drag to resize sidebar width               |

### Milestone Interactions

| Action                    | What Happens                                        |
| ------------------------- | --------------------------------------------------- |
| Click locked milestone    | Show "Complete [prereq] first" message              |
| Click available milestone | Show detail + "Start" button                        |
| Click "Start" button      | Agent begins probing this milestone                 |
| Click probing milestone   | Show live agent progress                            |
| Click "Pause" on active   | Pause agent work                                    |
| Click "View Live"         | Switch sidebar to companion chat, scroll to current |
| Click "Override"          | Open manual override form                           |
| Click completed milestone | Show results summary + artifacts                    |
| Click artifact link       | Open artifact viewer                                |
| Approve weakness          | Move to probing phase                               |
| Reject weakness           | Archive it                                          |
| Edit weakness             | Open inline editor                                  |
| Approve probe             | Agent runs it                                       |
| Add custom probe          | User-authored probe form                            |

### Agent Chat Interactions

| Action                   | What Happens                        |
| ------------------------ | ----------------------------------- |
| Type + send              | Message goes to agent               |
| Click tool call card     | Expand/collapse tool call details   |
| Click "Expand Results"   | Show full tool output               |
| Approve/Reject inline    | Respond to agent's approval request |
| Click code block         | Copy to clipboard                   |
| Click artifact reference | Open artifact viewer                |
| Scroll up                | Load older messages                 |

### Chrome Bar Interactions

| Action           | What Happens                              |
| ---------------- | ----------------------------------------- |
| Click avatar     | Account menu dropdown                     |
| Click org name   | Org/campaign switcher                     |
| Click search     | Open command palette (Cmd+K)              |
| Click + (create) | New milestone / new probe / new note menu |
| Click bell       | Notification inbox popover                |
| Click gear       | Settings panel                            |

### Keyboard Shortcuts

| Keys         | Action                      |
| ------------ | --------------------------- |
| `Cmd+K`      | Command palette             |
| `Cmd+/`      | Toggle agent chat           |
| `Escape`     | Close topmost panel         |
| `1-8`        | Jump to domain 1-8          |
| `Space`      | Fit canvas to view          |
| `Cmd+Enter`  | Send chat message           |
| `Cmd+S`      | Save artifact edits         |
| `Tab`        | Navigate between UI regions |
| `Arrow keys` | Pan canvas (when focused)   |
| `+` / `-`    | Zoom in/out                 |

---

## State Machine: Domain Lifecycle

```
          ┌──────────┐
          │  LOCKED   │ (prerequisites not met)
          └─────┬────┘
                │ prerequisites completed
                ▼
          ┌──────────┐
          │ AVAILABLE │ (ready to start)
          └─────┬────┘
                │ user clicks Start / agent auto-starts
                ▼
          ┌──────────┐
          │ PROBING   │ (agent working)
          └─────┬────┘
           ╱         ╲
     user pauses    all milestones done
          │              │
          ▼              ▼
    ┌──────────┐  ┌──────────┐
    │  PAUSED  │  │REVIEWING │ (user reviews results)
    └─────┬────┘  └─────┬────┘
          │              │
     user resumes   user approves
          │              │
          ▼              ▼
    ┌──────────┐  ┌──────────┐
    │ PROBING  │  │COMPLETED │ ✓
    └──────────┘  └──────────┘
```

## State Machine: Milestone Lifecycle

```
     ┌──────────┐
     │  LOCKED   │
     └─────┬────┘
           │ prereqs met
           ▼
     ┌──────────┐
     │ AVAILABLE │
     └─────┬────┘
           │ start
           ▼
     ┌─────────────┐
     │ IN_PROGRESS  │
     └──────┬──────┘
            │
     ┌──────┼──────┐
     ▼      ▼      ▼
  PROBING BUILDING VALIDATING
     │      │      │
     └──────┼──────┘
            │
       ┌────┴────┐
       ▼         ▼
  COMPLETED    FAILED
       │         │
       │    ┌────┴────┐
       │    ▼         ▼
       │  RETRY    SKIPPED
       │    │
       │    └──→ IN_PROGRESS
       ▼
    (artifacts
     published)
```

---

## Visual Hierarchy Summary

```
Z-index layers (bottom to top):
  0   Canvas background (dot grid)
  1   Canvas edges (connections)
  2   Canvas nodes (domain cards, center node)
  5   Canvas controls (minimap, zoom buttons)
  10  Canvas overlay layer (context menu)
  20  Chrome bar (floating buttons)
  30  Right sidebar panel
  35  Detail panel (when over sidebar)
  40  Notification popover
  45  Dropdown menus
  50  Command palette overlay
  55  Modal dialogs (wizard, publish)
  60  Toast notifications
```

```
Opacity hierarchy (attention management):
  100%  Active/selected node, sidebar content
  90%   Chrome bar buttons, status text
  80%   Available domain nodes
  60%   Unselected domain nodes (when one is selected)
  50%   Secondary text, metadata
  40%   Placeholder text, muted labels
  20%   Locked nodes, disabled states
  10%   Canvas grid dots, subtle borders
  5%    Canvas background texture
```
