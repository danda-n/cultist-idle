# Implementation Plan — Cultist Idle Layer 1

> Written: April 2026 | Design locked at CONCEPT.md v0.18 | Target: playable Layer 1

This document is the developer handoff. It turns the dependency map into concrete
implementation tasks with acceptance criteria, gotchas, and data references.
Read this alongside CONCEPT.md (the "what") and dependency-map.md (the "order").

---

## Pre-flight Checklist

Before writing any game code, the following must be true:

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` produces a clean bundle
- [ ] `npm run test` runs (zero tests is fine — runner must work)
- [ ] Zustand store with a minimal `GameState` type exists
- [ ] `tick(state, deltaMs)` signature is defined (even if empty)
- [ ] `localStorage` save/load round-trips without data loss

---

## Phase 0 — Foundation

### #1 Repo Bootstrap

**Goal:** Working React 19 + TS + Vite + Zustand + Tailwind v4 project with the
directory structure from CLAUDE.md.

Create these empty directories:
```
src/engine/   src/systems/   src/data/   src/types/
src/hooks/    src/ui/        src/utils/
```

Reference: CLAUDE.md §Architecture

**Done when:** `npm run dev` shows blank page, no console errors, TS compiles.

---

### #2 Engine Contracts

**Goal:** Define all TypeScript interfaces and the tick loop skeleton. No logic yet —
just the contracts everything else implements.

Key types to define in `src/types/`:
```typescript
// GameState — the single source of truth
interface GameState {
  resources: ResourceState
  cultists: CultistState
  gateways: Record<string, GatewayState>
  expeditions: ExpeditionState[]
  research: ResearchState
  artifacts: ArtifactState[]
  milestones: MilestoneState
  prestige: PrestigeState
  meta: MetaState  // run number, timestamp, version
}

// Every system returns Partial<GameState>
type SystemTick = (state: GameState, deltaMs: number) => Partial<GameState>
```

The tick orchestrator in `src/engine/gameLoop.ts`:
```typescript
function tick(state: GameState, deltaMs: number): GameState {
  // call each SystemTick in dependency order
  // merge results
  // return new state
}
```

**Gotcha:** All time stored as absolute `Date.now()` timestamps — never countdowns.
Resources measured per-millisecond internally, per-minute in UI display.

**Done when:** TS compiles with all interfaces; `tick()` exists and accepts/returns
the correct types even if it does nothing yet.

---

### #17 Save/Load Persistence

**Goal:** Every field in `GameState` serialises to/from `localStorage`. Offline
progress calculated on load.

Two functions in `src/utils/storage.ts`:
- `saveGame(state: GameState): void` — JSON.stringify to localStorage
- `loadGame(): GameState | null` — parse + migrate + offline catch-up

Offline catch-up formula: `tick(loadedState, Date.now() - loadedState.meta.lastSaved)`

**Gotcha:** The offline processor is a thin wrapper over `tick()` — not a separate
calculation. Floor logic (devotion 15%, cultist count 3) lives in `offlineProcessor`,
not in `tick()`. See CONCEPT.md §18.

**Gotcha:** Choice events queue during offline: max 10, overflow auto-resolves as
safe Return. See CONCEPT.md §18.

**Done when:** Save → close tab → reopen → state restored with correct offline
progress applied.

---

## Phase 1 — Core Resource Loop

### #3 Anima: Manual Conjuring

**Goal:** The click loop. Player clicks conjure, fills 8s bar, releases 8 Anima.
Precise Rite window: click within 1.5s of bar fill = 11 Anima instead of 8.

Data in `src/data/resources.ts`:
```typescript
const CONJURE_COST = 0;          // free
const CONJURE_BASE_ANIMA = 8;
const CONJURE_PRECISE_ANIMA = 11;
const CONJURE_PRECISE_WINDOW_MS = 1500;
const CONJURE_COOLDOWN_MS = 8000;  // Altar T1: 6000ms, T2: 4800ms
```

**Automation note:** Blood Compact (Phase 1 research node 3) automates conjuring.
Automation always fires at base 8 Anima — it cannot trigger Precise Rite.
Mark this clearly in the Blood Compact implementation.

**Narrative threshold events** (first time only, before M3):
- First 10 Anima: unlock brief flavour text panel ("Something stirs...")
- First 25 Anima: second text ("The ritual takes hold...")
- First 50 Anima: third text + hint toward Milestone 2 construct path

These gate nothing — they just ensure the pre-M3 experience isn't silent.
Implement as one-shot flags in `GameState.meta`.

**Done when:** Click conjure → bar fills over 8s → releases Anima → Precise Rite
bonus fires on timely click → automation flag blocks Precise Rite.

---

### #20 Soft Cap / Slow Overflow

**Goal:** Resources above soft cap accumulate at 10% of normal rate.

Soft caps (tunable, live in `src/data/resources.ts`):
| Resource | Soft Cap |
|----------|----------|
| Anima    | 500      |
| Gnosis   | 250      |
| Voltis   | 300      |

Production formula:
```
effectiveRate = rate × (amount < softCap ? 1.0 : 0.10)
```

Apply in the resource tick system, not in individual production sources.

**Done when:** Anima at 499 → normal rate. Anima at 501 → 10% rate. UI shows
soft cap marker on resource bar.

---

### #7 Cultist Pool + Priority

**Goal:** Cultist headcount with passive recruitment (1 every 20 min = 1/1,200,000 ms).
Players assign cultists to roles: Channel, Sacrifice, Expedition, Idle.
Global floor: count can never drop below 3 from any cause.

Data in `src/data/cultists.ts`:
```typescript
const CULTIST_RECRUIT_RATE_MS = 1_200_000;  // 20 min
const CULTIST_FLOOR = 3;
```

Priority assignment: player drags/clicks cultists between role slots. Implement
as a simple array of role assignments. The "priority" spec means: when forced to
remove from a role (e.g., expedition loss), remove from lowest-priority slot first.
Priority order (default, configurable): Idle → Sacrifice → Channel → Expedition.

**Done when:** Cultist count shown; recruitment timer ticks; assignment panel
shows roles; count never drops below 3.

---

### #8 Sacrifice Mechanic + Altar Construct

**Goal:** Each sacrificed cultist = +6 Anima/min (flat, stackable). Altar T1 reduces
conjure cooldown (8s → 6s), T2 reduces further (~4.8s). Ossuary upgrade: +9/min per
sacrifice instead of +6.

Sacrifices are the first construct interaction. Implement constructs minimally here:
a simple construct record with `type`, `tier`, and `effect`. Full construct engine
(Gateway Frame, etc.) gets fleshed out in the next step.

Data in `src/data/constructs.ts`:
```typescript
const ALTAR_T1_COOLDOWN_MS = 6000;
const ALTAR_T2_COOLDOWN_MS = 4800;
const SACRIFICE_ANIMA_PER_MIN = 6;       // +6/min per sacrifice
const OSSUARY_SACRIFICE_ANIMA_PER_MIN = 9; // replaces above when built
const CINDERMARK_DOUBLES_SACRIFICE = true; // artifact effect, handled in §13
```

**Gotcha:** Cindermark doubles all sacrifice yields retroactively. This means
the sacrifice rate modifier lives in the resource tick, checked against artifact state.

**Done when:** Sacrifice assigned cultist → Anima rate increases; Altar construct
reduces conjure cooldown; Ossuary construct upgrades sacrifice yield.

---

## Phase 2 — Gateway + Second Resource

### #10 Gateway System (Phase 2a — Planet A)

**Goal:** Build a gateway (250 Anima), assign cultist to Channel, produce Gnosis.
First gateway unlocks after M2 (Gateway Frame construct built).

Gateway state per gateway:
```typescript
interface GatewayState {
  id: string
  planet: 'A' | 'B'
  devotion: number        // 0–100%
  cultistsAssigned: number
  capacity: number        // base 1, upgradeable via #28
  channelActive: boolean
  disciplineCooldownUntil: number  // absolute timestamp
}
```

Gnosis production: Channel action generates Gnosis while active.
Per-minute rates (tunable): `src/data/gateways.ts`

**Milestone gate:** First gateway available after M2. Player must have 250 Anima.
Build action in the Constructs panel or a dedicated Gateway panel — UI decision
deferred to #16, but make the action accessible somewhere.

**Done when:** Gateway built → Channel assigned → Gnosis ticking up.

---

### #9 Devotion System

**Goal:** Per-gateway devotion meter. Decays 0.5%/min after M7. Discipline action
resets to 100%.

Decay formula (from CONCEPT.md §7):
```
devotion -= rate × (deltaMs / 60000)
```

Modifiers apply multiplicatively to `rate` before conversion.

Two distinct floors:
1. **Offline floor (meter):** 15% — devotion cannot drop below this while player is
   offline (applied in `offlineProcessor`, not `tick`)
2. **Cultist floor (count):** 3 — separate mechanic; if devotion reaches 0% online,
   cultist is stunned (§6.4), not removed (floor-of-3 still applies)

Discipline action:
- Per-gateway: 3 min cooldown, resets that gateway to 100%
- Global (Overseer's Rite talent): 5 min cooldown, resets ALL per-gateway cooldowns

**Done when:** Devotion meter visible per gateway; decays correctly; Discipline
resets it; collapse stuns cultist; offline floor holds at 15%.

---

### #11 Research Tree

**Goal:** Phase 1 linear research: 4 nodes, 180 Gnosis total.

Phase 1 nodes (in order, from `src/data/research.ts`):
| Node | Cost | Effect |
|------|------|--------|
| Conjuring Rites | 30G | Altar T2 cooldown reduction |
| The Opened Way | 40G | Gateway construction cost -20% (future runs only) |
| Blood Compact | 50G | Automates conjuring (fires at 8 Anima, no Precise Rite) |
| Dread Fortitude | 60G | Cultist devotion stun duration -50% |

**Gotcha:** "The Opened Way" -20% is non-retroactive. Apply to the gateway
construction cost check, not to already-built gateways.

**Gotcha:** Phase 2 branches (unlocked at M6 "The Branching Path") reset each
Rehearsal. Phase 1 does NOT reset — it auto-completes on run 2+.

Phase 2 branches (3 branches × 3 nodes each, 300 Gnosis per branch):
Define the data structure now even if UI isn't built — needed for save/load.

**Done when:** Research panel shows 4 nodes; Gnosis spending gates them in order;
effects apply; Phase 2 structure exists in data even if locked.

---

### #28 Gateway Capacity Upgrades

**Goal:** Per-gateway capacity purchase (direct purchase in gateway panel, not research).

Costs from `src/data/gateways.ts` (tunable):
| Tier | Capacity | Cost |
|------|----------|------|
| Base | 1 | — |
| T2 | 2 | 150A + 80G |
| T3 | 3 | 300A + 200G |

**Done when:** Gateway panel shows capacity tier; purchase button visible; capacity
increases the cultist assignment limit for that gateway.

---

## Phase 3 — Full Loop

### #10 Gateway (Phase 3b — Planet B)

**Goal:** Planet B gateway, unlocked at M9. Voltis production. Higher Voltis sustain
cost for expeditions.

Planet B expedition Voltis sustain: 8 Voltis/min (vs Planet A: 5 Voltis/min).
See CONCEPT.md §11.1.

**Done when:** Planet B gateway buildable post-M9; Voltis production ticks;
expedition Voltis drain increases.

---

### #5 Voltis Resource

**Goal:** Third resource, completing the Trifecta. Produced by Planet B Channel.

Voltis soft cap: 300 (same overflow rule as Anima/Gnosis).

**Done when:** Voltis displayed in resource bar; Trifecta triangle third segment
activates.

---

### #6 Trifecta System

**Goal:** Harmony bonus when all 3 resources above threshold for 60s+.

Thresholds (30% of soft cap by default; talent reduces to 24%):
| Resource | Threshold (default) | Threshold (talent) |
|----------|--------------------|--------------------|
| Anima    | 150 | 120 |
| Gnosis   | 75  | 60  |
| Voltis   | 90  | 72  |

Harmony bonus: +20% all production. Trifecta Resonance talent: +30% total.
Unbinding artifact doubles active bonus (+40% base, +60% with talent).

Triangular gauge: SVG, 3 segments (one per resource), GREEN > threshold / YELLOW
approaching / RED below. See `docs/ui-design.html` for SVG spec.

**Progressive reveal milestones:**
- M4: Trifecta panel appears (Planet A only — Anima + Gnosis triangle, Voltis dim)
- M7: Voltis segment activates
- M8: Harmony tracking begins
- M9: Full Trifecta active

**Done when:** Triangle renders; all 3 segments live; Harmony timer counts; bonus
applies when sustained.

---

### #12 Expedition System

**Goal:** Send 1–3 cultists on timed expeditions. Outcome: Safe Return / Choice event /
Cultist Lost. Corruption debuffs apply on Choice resolve.

Expedition timers (from CONCEPT.md §11.1):
| Planet | 1 cultist | 2 cultists | 3 cultists |
|--------|-----------|------------|------------|
| A | 20 min | 15 min | 12 min |
| B | 35 min | 26 min | 20 min |

Outcome formula (devotion snapshotted at departure):
```
lost% = max(0, (50 − devotion%) × 0.6)
choice% = 40%  (always, independent of devotion)
safe% = 100% − lost% − choice%
```

Choice event pool weights: Minor 60%, Major 30%, Rare 10%.

Corruption debuffs (5-pool): The Gnawing, Ash-Taint, The Shuddering Rite,
Veil Sickness, Voltis Drain. Max 1 active; second auto-cleanses first at half
cost (100 Gnosis). Full cleanse: 200 Gnosis.

**Expedition slots:**
- Run 1: 2 slots always. 3rd slot requires Expedition keystone (2 Boons), first
  available after M8.
- Voidwreath: adds a run-scoped temporary slot at M5 (not permanent).

**Done when:** Expedition panel shows slot count; cultist picker sends them;
timer counts down; outcome resolves; Choice events queue; corruption applies.

---

### #13 Artifacts

**Goal:** 6 ritual artifacts — 3 crafted, 3 discovered via expedition.

Crafted artifacts (costs from CONCEPT.md §12):
| Artifact | Cost | Effect |
|----------|------|--------|
| Cindermark | 200A | All sacrifice yields doubled |
| Whisperlock | 150A + 100G | Phase 2 research cost -20% |
| Unbinding | 300A + 150G + 100V | Trifecta threshold → 0%; doubles Harmony bonus |

Discovered artifacts (found via expedition loot pool):
| Artifact | Source | Effect |
|----------|--------|--------|
| Voidwreath | Planet A, M5+ | Adds run-scoped expedition slot |
| Hungering Lens | Planet A, M8+ | (dormant until M9) Expedition cultist loss chance -15% |
| Voicecaller | Planet B (standard) | Cultist passive recruitment rate +50% |

Ritual circle: 6 segments. Crafted artifact segments fill continuously with cost
progress. Discovered artifact segments fill when expedition is active (Lens: fills
on return, shows "awaiting activation" until M9).

**Gotcha:** Hungering Lens is "placed" (ritual circle segment fills) immediately
on expedition return, counting toward the M14 6-artifact check. But bonuses
activate only when Planet B opens at M9.

**Done when:** All 6 artifacts implementable; ritual circle fills; bonuses apply;
run 2+ artifact bonuses activate at game start (except Lens: requires Planet B).

---

### #29 Ritual Circle UI

**Goal:** SVG 6-segment circle visualising artifact completion. Each segment fills
as the artifact progresses.

Spec from `docs/ui-design.html`:
- SVG circle split into 6 equal arcs
- Filled = complete artifact; partially filled = progress toward cost/discovery
- Discovered artifact segment: "orbiting particle" animation while expedition active
- Hungering Lens segment: "awaiting activation" marker if M9 not yet reached
- Full circle triggers M14 Summoning sequence (auto, no button)

**Done when:** Circle renders in right panel; all 6 states visualised correctly;
M14 trigger fires when 6th segment fills.

---

## Phase 4 — Meta-Progression

### #14 Milestone System

**Goal:** 14 milestones, each with a defined trigger and unlock payload.

Full milestone table in CONCEPT.md §14. Key triggers an implementer might get wrong:
- **M2:** Gateway Frame construct built (not "50 Anima" — that was the old spec)
- **M3:** First sacrifice assigned
- **M6 "The Branching Path":** Final Phase 1 research node purchased — immediately
  unlocks Phase 2 branches
- **M8:** Blood Compact purchased AND Planet A sustained channel running AND
  net Anima rate > 0
- **M14 "The Summoning":** 6th artifact placed in ritual circle (auto-trigger, no button)

M14 Summoning event (from ~~#22~~ spec in CONCEPT.md §14):
- 5-minute ritual phase
- Resources drain into portal during this time
- Devotion collapse slows 50% (cannot fail/lose cultists during Summoning)
- Harmony bonus shortens to ~3 min during ritual
- M14 fires on completion → endgame state

**Done when:** All 14 milestones fire on correct trigger; each unlock applies
correctly; M14 Summoning sequence runs.

---

### #15 Prestige / Rehearsal

**Goal:** Rehearsal resets run, carries forward talents (Dark Boons). Player picks
boons at M8, M10, M11.

Boon counts: M8 → 2 boons, M10 → 3 boons, M11 → 3 boons (8 total per run).

On Rehearsal:
- Resets: resources, gateways, cultists (back to floor of 3), Phase 2 research
- Persists: Phase 1 research (auto-completes), artifacts, talent tree, run counter
- Phase 1 auto-complete: all 4 Phase 1 nodes are granted for free at run start

**Done when:** Rehearsal button appears post-M8; triggers correctly; run counter
increments; Phase 2 resets; Phase 1 auto-completes; boons persist.

---

### #27 Talent Tree (Dark Boons)

**Goal:** Permanent cross-run bonuses selected with Dark Boons.

Talent categories and named nodes (from CONCEPT.md §15):
- **Devotion:** Dread Vigil (-20% decay rate), Fanatic's Seal (floor → 25%)
- **Resources:** Trifecta Resonance (+10pp Harmony bonus), Anima Swell (+10% conjure)
- **Expeditions:** Expedition Keystone (3rd slot permanent), Voidwreath Keystone (permanent)
- **Threshold:** Careful Balance (threshold → 24% of soft cap)
- Other nodes as specced in CONCEPT.md §15

**Done when:** Talent tree renders; Boon points spendable; bonuses apply on run start.

---

## Phase 5 — Polish & Tuning

### #16 Main UI (Final Pass)

The UI spec lives in `docs/ui-design.html`. Key decisions to enforce:
- 3-column layout: left (systems), center (active focus/expeditions), right (ritual circle)
- Progressive disclosure: never show a panel the player hasn't unlocked
- Choice events: inline in center column, not modals
- Rehearsal: full center-column takeover
- Desktop-first: minimum 900px width; no mobile portrait for Layer 1
- Font stack: Cinzel Decorative (display), Cinzel (headings), EB Garamond (body),
  Courier Prime (numbers)
- Design tokens: all in CSS custom properties — see `ui-design.html` for full list

### #23 Recruitment Rate Calibration
Target: 1 cultist every 20 min feels natural but not ignored. Adjust `CULTIST_RECRUIT_RATE_MS`.

### #24 Soft Cap Value Tuning
Verify Anima 500 / Gnosis 250 / Voltis 300 feel right in a real run. Adjust in
`src/data/resources.ts`.

---

## Data File Map

All tunable numbers must live here — never hardcoded in system logic:

```
src/data/
  resources.ts    Anima/Gnosis/Voltis soft caps, conjure rates, overflow multiplier
  cultists.ts     Recruit rate, floor, priority order
  constructs.ts   Altar costs/cooldowns, Ossuary bonus, Gateway Frame cost
  gateways.ts     Build cost (250A), capacity tier costs, Gnosis/Voltis production rates
  research.ts     Phase 1/2 node costs and effects
  expeditions.ts  Timers, Voltis drain rates, outcome formula constants, slot caps
  artifacts.ts    Crafted costs, loot pool weights, Lens dormancy rule
  devotion.ts     Decay rate, Discipline cooldowns, floors, tick formula constants
  milestones.ts   Trigger conditions and unlock payloads (or inline in milestone system)
  prestige.ts     Boon counts per milestone, reset scope, auto-complete list
  trifecta.ts     Thresholds, Harmony bonus values, timer duration
```

---

## Acceptance Criteria for "Layer 1 Complete"

Layer 1 is complete (v1.0) when a player can:

1. Open the game fresh and click their way to first Anima
2. Build constructs (Altar, Gateway Frame) and see them take effect
3. Build a Planet A gateway, Channel Gnosis, research Phase 1
4. Send expeditions, get Choice events, handle corruption
5. Collect all 6 artifacts; ritual circle fills
6. Trigger and complete The Summoning
7. Execute a Rehearsal, spend Dark Boons, start run 2 with Phase 1 auto-completed
8. In run 2: open Planet B, get Voltis, full Trifecta active
9. Complete Layer 1 again in roughly half the time of run 1
10. Save/load works — close and reopen at any point, offline progress applies

All UI unlocks by milestone. No panel appears before its milestone fires.
