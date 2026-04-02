# CLAUDE.md — Agent Rules for Cultist Idle

## Project Context

Browser-based idle/incremental game. React 18 + TypeScript + Vite + Zustand + Tailwind v4.
Full design: `docs/CONCEPT.md` (v0.5). Implementation order: `docs/dependency-map.md`. 25 open GitHub issues (#1–#26).

## Core Rules

1. **Engine contracts first, content data after.** Never hardcode a game value in system logic. All tunable numbers live in `src/data/`.
2. **Every system is a pure function of state + deltaMs.** Systems receive the current game state and elapsed time, return new state. No side effects inside system logic.
3. **Save/load is not optional.** Every new piece of state must be serializable and included in the persistence layer from day one.
4. **Offline progress uses the same tick function.** `tick(deltaMs)` must produce identical results whether called 60 times per second or once with 8 hours of elapsed time.
5. **Progressive disclosure in UI.** Never render a system the player hasn't unlocked. Check milestone state before showing any panel.

## Architecture

```
src/engine/    → Game loop, tick orchestration, offline catch-up
src/systems/   → One file per system (resources, devotion, gateways, etc.)
src/data/      → Static config: costs, rates, thresholds, choice pools
src/types/     → Shared TypeScript interfaces (GameState, Resource, etc.)
src/hooks/     → React hooks binding Zustand store to UI
src/ui/        → Layout and pages
src/utils/     → Formatting, math helpers, localStorage wrapper
```

## Conventions

- File names: `camelCase.ts` for modules, `PascalCase.tsx` for components
- One system per file in `src/systems/`
- All time values stored as absolute timestamps (Date.now()), not countdowns
- Resources measured per-minute in UI, per-millisecond internally
- Tests go next to source files: `resourceSystem.test.ts` beside `resourceSystem.ts`

## Design Constraints (cross-doc, not obvious from any single file)

- **Global cultist floor of 3** — no mechanic (sacrifice, devotion collapse, expedition loss) can reduce below this
- **Offline devotion floor at 15%** — prevents permanent cultist loss while player is away
- **Trifecta phases in gradually** at milestones 4 → 9 → 10, not all at once
- **Discipline cooldown:** 3 min per-gateway base, 5 min global (Overseer's Rite)
- **Max 1 active corruption** — second corruption auto-cleanses first at half cost
- **Thematic naming:** every mechanic name belongs in the game world. Numbers are resources, buttons are rituals, upgrades are forbidden knowledge. This applies to UI text, function names visible to players, and tooltip copy.

## Build Commands

```bash
npm run dev            # Start dev server
npm run build          # Production build
npm run test           # Run all tests
npx vitest run <file>  # Run a single test file
npm run lint           # Lint
```

## Workflow Rules

- **Commit and push after every change.** Each meaningful code or doc change gets its own commit pushed to the remote. Do not batch unrelated changes.
- **Keep docs and issues in sync.** When implementation changes affect design (new decisions, resolved questions, changed constraints), update the relevant docs (`CONCEPT.md`, `dependency-map.md`, `CLAUDE.md`) and GitHub issues. Close issues when complete. Update the Current State section below.

## Current State

See `docs/dependency-map.md` for implementation phases. Update this section as work progresses.

**Phase:** Pre-development (scaffolding)
**Next:** #1 Repo bootstrap → #2 Engine contracts → #17 Save/load
