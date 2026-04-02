# Issue Dependency Map

> Last updated: April 2026 | Covers all 17 existing issues + new issues from audit

---

## Dependency Table

Legend:
- **Blocked by** = cannot start until dependency is complete
- **Soft dep** = benefits from but doesn't strictly require
- **Blocks** = other issues waiting on this one

| Issue | Title | Blocked by | Soft dep | Blocks |
|-------|-------|------------|----------|--------|
| #2 | Engine contracts | — | — | Everything |
| #17 | Save/load persistence | #2 | — | All gameplay systems |
| #5 | Resource system (Anima) | #2, #17 | — | #6, #7, #8, #10, Soft Cap |
| #7 | Cultist pool + priority | #2, #17 | #5 | #8, #9, #12 |
| #8 | Cultist sacrifice | #5, #7 | — | #14 (milestone 3 trigger) |
| Construct | Construct/Building system | #2, #5 | — | #10, #14 (milestone 2) |
| Soft Cap | Soft cap / Slow Overflow | #2, #5 | — | #6, #17 (offline calc) |
| #10 | Gateway system | #5, Construct | #7 | #9, #11, #12, #6 |
| #9 | Devotion system | #7, #10 | — | #12 |
| #11 | Research tree | #5, #10 | #9 | #6 (nudge), #12 |
| #6 | Trifecta cross-deps + UI | #5, #10, #11, Soft Cap | — | #14 (milestone 11) |
| #12 | Expedition system | #7, #9, #10 | #11 | #13, Corruption |
| #13 | Six Ritual Artifacts | #5, #12 | #6 | Corruption, Summoning |
| Corruption | Corruption cleansing | #12, #13 | — | — |
| #14 | Milestone system | #5, #7, #8, #9, #10, #11, #6, #12, #13 | — | #15, Summoning |
| #15 | Prestige / Rehearsal | #14 | All gameplay | — |
| #16 | Main UI | Soft dep on all | — | — |
| Summoning | The Summoning endgame | #13, #14 | #16 | — |

---

## Recommended Implementation Order

### Phase 0 — Foundation (no gameplay yet)
1. **#2 — Engine contracts** (interfaces, tick loop, state shape)
2. **#17 — Save/load** (persistence + offline progress skeleton)

### Phase 1 — Core resource loop
3. **#5 — Resource system** (Anima conjuring, manual click loop)
4. **Soft Cap — Slow Overflow** (implement alongside resources, not after)
5. **#7 — Cultist pool** (headcount, passive recruitment, priority assignment)
6. **#8 — Sacrifice mechanic** (first Anima automation source)
7. **Construct — Building system** (Altar, Gateway Frame — gates the next phase)

### Phase 2 — Gateway + second resource
8. **#10 — Gateway system** (Planet A gateway, Channel action, Gnosis production)
9. **#9 — Devotion system** (decay, Discipline, collapse — now gateways exist to attach it to)
10. **#11 — Research tree** (Phase 1 linear — depends on Gnosis existing)

### Phase 3 — Full loop
11. **#10 (continued)** — Planet B gateway, Voltis production
12. **#6 — Trifecta** (cross-dependencies activate, balance UI)
13. **#12 — Expedition system** (send cultists, return outcomes, Choice pool)
14. **#13 — Artifacts** (6 ritual artifacts, crafting + discovered)
15. **Corruption — Cleansing action** (artifact screen interaction)

### Phase 4 — Meta-progression
16. **#14 — Milestone system** (14 milestones with triggers — needs all gameplay systems in place)
17. **#15 — Prestige / Rehearsal** (reset logic, Dark Boons, talent tree)
18. **Summoning — Endgame event** (final milestone, visual sequence)

### Phase 5 — Polish
19. **#16 — Main UI** (progressive disclosure, session design — iterative throughout but final pass here)
20. **Tuning passes** (recruitment rate, soft cap values, expedition formula, Discipline cooldown)

---

## Critical Path

The longest dependency chain is:

```
#2 Engine → #17 Save → #5 Resources → #10 Gateways → #9 Devotion → #12 Expeditions → #13 Artifacts → #14 Milestones → #15 Prestige → Summoning
```

This is 10 steps. Parallelisation is possible:
- Cultist system (#7, #8) can be built alongside resources (#5)
- Research tree (#11) can be built alongside devotion (#9) once gateways exist
- UI (#16) is iterative throughout
- Tuning is a continuous process, not a single phase

---

## Visual Dependency Graph

```
#2 Engine ──→ #17 Save/Load
                 │
         ┌───────┼───────────┐
         ▼       ▼           ▼
      #5 Resources    #7 Cultists
         │       │           │
         │       ▼           ▼
         │    Soft Cap    #8 Sacrifice
         │       │
         ▼       │
      Construct  │
         │       │
         ▼       │
      #10 Gateways ◄────────┘
         │
    ┌────┼────┐
    ▼    ▼    ▼
  #9   #11   #6 Trifecta
  Dev  Res      │
    │    │      │
    ▼    ▼      │
  #12 Expeditions
    │
    ▼
  #13 Artifacts ──→ Corruption Cleansing
    │
    ▼
  #14 Milestones
    │
    ▼
  #15 Prestige
    │
    ▼
  Summoning (endgame)
```
