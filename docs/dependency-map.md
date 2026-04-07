# Issue Dependency Map

> Last updated: April 2026 | **Status: CURRENT** | Covers issues #1–#29. Closed (design resolved): #18, #19, #21, #22, #25, #26. Open: 23.
> Issues files: [v0.8-issues-resolved.md](v0.8-issues-resolved.md) · [v0.11-issues-resolved.md](v0.11-issues-resolved.md)

---

## Dependency Table

Legend:
- **Blocked by** = cannot start until dependency is complete
- **Soft dep** = benefits from but doesn't strictly require
- **Blocks** = other issues waiting on this one
- ~~strikethrough~~ = closed on GitHub; implementation scope noted inline

| Issue | Title | Blocked by | Soft dep | Blocks |
|-------|-------|------------|----------|--------|
| #1 | Repo bootstrap | — | — | Everything |
| #2 | Engine contracts | — | — | Everything |
| #17 | Save/load persistence | #2 | — | All gameplay systems |
| #3 | Anima: manual conjuring | #2, #17 | — | #4, #5, #6, #7, #8, #10, #20 |
| #4 | Gnosis: Planet A gathering | #10 | #3 | #6, #11 |
| #5 | Voltis: Planet B gathering | #10 | #4 | #6 |
| #20 | Soft cap / Slow Overflow | #2, #3 | — | #6, #17 (offline calc) |
| #7 | Cultist pool + priority | #2, #17 | #3 | #8, #9, #12 |
| #8 | Cultist sacrifice | #3, #7 | — | #14 (milestone 3 trigger) |
| ~~#19~~ | ~~Construct / Building system~~ | — | — | — |
| #10 | Gateway system | #3 | #7 | #4, #5, #9, #11, #12, #6, #28 |
| #28 | Gateway capacity upgrades | #10 | #11 | — |
| #9 | Devotion system | #7, #10 | — | #12 |
| #11 | Research tree | #3, #10 | #9 | #6 (nudge), #12 |
| #6 | Trifecta cross-deps + UI | #3, #4, #5, #10, #11, #20 | — | #14 (milestone 11) |
| #12 | Expedition system | #7, #9, #10 | #11 | #13 |
| #13 | Six Ritual Artifacts | #3, #12 | #6 | #29, #14 |
| ~~#21~~ | ~~Corruption cleansing~~ | — | — | — |
| #29 | Ritual circle UI | #13 | — | #22 |
| #14 | Milestone system | #3, #7, #8, #9, #10, #11, #6, #12, #13 | — | #15, #22 |
| #15 | Prestige / Rehearsal | #14 | All gameplay | #27 |
| #27 | Talent tree (Dark Boons) | #15 | — | — |
| #16 | Main UI | Soft dep on all | — | — |
| ~~#22~~ | ~~The Summoning (endgame)~~ | — | — | — |

**Closed issue implementation notes:**
- ~~#19~~ Constructs: Altar, Gateway Frame, Ossuary are constructs — implement as part of #10 (Gateway) and #8 (Sacrifice). No separate issue needed.
- ~~#21~~ Corruption: debuff application lives in #12 (Expeditions); cleansing lives in #13 (Artifacts). Spec is in §11.4.
- ~~#22~~ The Summoning: endgame event triggers from #14 (Milestones) M14. Implement as part of #14 or a sub-task.
- ~~#25~~ Expedition formula: locked in §11.2. Tuning happens during #12 implementation.
- ~~#26~~ Discipline cooldown: locked in §7. Tuning happens during #9 implementation.

### Tuning issues (parallelisable, need gameplay systems in place)

| Issue | Title | Depends on |
|-------|-------|------------|
| #23 | Balancing: recruitment rate | #7 (Cultists) |
| #24 | Balancing: soft cap values | #20 (Soft cap) |

---

## Recommended Implementation Order

### Phase 0 — Foundation (no gameplay yet)
1. **#1 — Repo bootstrap** (React 19 + TS + Vite + Zustand + Tailwind v4 scaffold)
2. **#2 — Engine contracts** (GameState interface, tick loop, state shape, deltaMs)
3. **#17 — Save/load** (localStorage persistence + offline progress skeleton)

### Phase 1 — Core resource loop
4. **#3 — Anima resource** (manual conjuring, Precise Rite timing bonus, narrative threshold events)
5. **#20 — Soft cap / Slow Overflow** (implement alongside resources, not after)
6. **#7 — Cultist pool** (headcount, passive recruitment 1/20 min, priority assignment)
7. **#8 — Sacrifice mechanic + Altar construct** (first Anima automation; Altar T1/T2 as constructs)
8. **#10 (partial) — Construct system + Gateway Frame** (Altar is a construct; implement construct engine here; Gateway Frame unlocks Phase 2)

### Phase 2 — Gateway + second resource
9. **#10 (continued) — Gateway system** (Planet A gateway, Channel action, Gnosis production, per-gateway panel)
10. **#4 — Gnosis resource** (Planet A gathering — activates as part of gateway implementation)
11. **#9 — Devotion system** (decay 0.5%/min, Discipline action, collapse, per-gateway floors)
12. **#11 — Research tree** (Phase 1 linear nodes: Conjuring Rites, The Opened Way, Blood Compact, Dread Fortitude)
13. **#28 — Gateway capacity upgrades** (per-gateway capacity purchase, Anima + Gnosis costs)

### Phase 3 — Full loop
14. **#10 (continued)** — Planet B gateway, Voltis production
15. **#5 — Voltis resource** (Planet B gathering — completes Trifecta triangle)
16. **#6 — Trifecta** (cross-dependencies activate at milestones 4/7/8/9, balance UI, triangular gauge)
17. **#12 — Expedition system** (cultist picker, outcome formula, Choice events, corruption debuffs — includes ~~#21~~ corruption cleansing spec)
18. **#13 — Artifacts** (6 ritual artifacts: 3 crafted, 3 discovered; costs from §12 — includes ~~#21~~ corruption cleansing UI)
19. **#29 — Ritual circle UI** (6-segment SVG circle, bottleneck progress bar, "awaiting activation" state)

### Phase 4 — Meta-progression
20. **#14 — Milestone system** (14 milestones with triggers — needs all gameplay systems; includes ~~#22~~ Summoning event at M14)
21. **#15 — Prestige / Rehearsal** (reset logic, Dark Boons selection, Phase 2 research reset)
22. **#27 — Talent tree** (persistent Dark Boons: keystone slots, named talents, run-permanent bonuses)

### Phase 5 — Polish & Tuning
23. **#16 — Main UI** (progressive disclosure pass, animation, session design — iterative throughout but final pass here)
24. **#23 — Recruitment rate calibration**
25. **#24 — Soft cap value tuning**

---

## Critical Path

The longest dependency chain is:

```
#2 Engine → #17 Save → #3 Anima → #10 Gateways → #9 Devotion → #12 Expeditions → #13 Artifacts → #29 Ritual Circle → #14 Milestones → #15 Prestige → #27 Talents
```

This is 11 steps. Parallelisation is possible:
- Cultist system (#7, #8) can be built alongside Anima (#3)
- Soft cap (#20) alongside first resource (#3)
- Research tree (#11) alongside devotion (#9) once gateways exist
- Gateway capacity (#28) alongside or just after research tree (#11)
- Gnosis (#4) and Voltis (#5) are part of gateway implementation (#10)
- Trifecta (#6) activates progressively — build alongside Phase 3 resources
- UI (#16) is iterative throughout
- Tuning (#23, #24) is continuous, not a single phase

---

## Visual Dependency Graph

```
#1 Bootstrap
#2 Engine ──→ #17 Save/Load
                 │
         ┌───────┼───────────┐
         ▼       ▼           ▼
      #3 Anima        #7 Cultists
         │       │           │
         │       ▼           ▼
         │    #20 Soft Cap  #8 Sacrifice
         │                   │
         ▼                   ▼
      Constructs ◄───── Altar (#8/#10)
      (Gateway Frame)
         │
         ▼
      #10 Gateways
         │
    ┌────┼────┬────┐
    ▼    ▼    ▼    ▼
  #4   #9   #11   #28
  Gno  Dev  Res   Cap
  #5    │    │
  Vol   ▼    ▼
      #12 Expeditions ──→ Corruption (spec §11.4)
        │
        ▼
      #13 Artifacts ──→ #29 Ritual Circle
        │                     │
        └──────────┬──────────┘
                   ▼
                #14 Milestones ──→ Summoning (spec §14 M14)
                   │
                   ▼
                #15 Prestige
                   │
                   ▼
                #27 Talents

Trifecta (#6): activates across #3/#4/#5/#10/#11/#20
UI (#16): iterative throughout
Tuning (parallel): #23 #24
```
