# Issue Dependency Map

> Last updated: April 2026 | Covers all 25 open GitHub issues (#1–#26, #18 closed)

---

## Dependency Table

Legend:
- **Blocked by** = cannot start until dependency is complete
- **Soft dep** = benefits from but doesn't strictly require
- **Blocks** = other issues waiting on this one

| Issue | Title | Blocked by | Soft dep | Blocks |
|-------|-------|------------|----------|--------|
| #1 | Repo bootstrap | — | — | Everything |
| #2 | Engine contracts | — | — | Everything |
| #17 | Save/load persistence | #2 | — | All gameplay systems |
| #3 | Anima: manual conjuring | #2, #17 | — | #4, #5, #6, #7, #8, #10, #19, #20 |
| #4 | Gnosis: Planet A gathering | #10 | #3 | #6, #11 |
| #5 | Voltis: Planet B gathering | #10 | #4 | #6 |
| #20 | Soft cap / Slow Overflow | #2, #3 | — | #6, #17 (offline calc) |
| #7 | Cultist pool + priority | #2, #17 | #3 | #8, #9, #12 |
| #8 | Cultist sacrifice | #3, #7 | — | #14 (milestone 3 trigger) |
| #19 | Construct / Building system | #2, #3 | — | #10, #14 (milestone 2) |
| #10 | Gateway system | #3, #19 | #7 | #4, #5, #9, #11, #12, #6 |
| #9 | Devotion system | #7, #10 | — | #12 |
| #11 | Research tree | #3, #10 | #9 | #6 (nudge), #12 |
| #6 | Trifecta cross-deps + UI | #3, #4, #5, #10, #11, #20 | — | #14 (milestone 11) |
| #12 | Expedition system | #7, #9, #10 | #11 | #13, #21 |
| #13 | Six Ritual Artifacts | #3, #12 | #6 | #21, #22 |
| #21 | Corruption cleansing | #12, #13 | — | — |
| #14 | Milestone system | #3, #7, #8, #9, #10, #11, #6, #12, #13 | — | #15, #22 |
| #15 | Prestige / Rehearsal | #14 | All gameplay | — |
| #16 | Main UI | Soft dep on all | — | — |
| #22 | The Summoning (endgame) | #13, #14 | #16 | — |

### Tuning issues (parallelisable, need gameplay systems in place)

| Issue | Title | Depends on |
|-------|-------|------------|
| #23 | Balancing: recruitment rate | #7 (Cultists) |
| #24 | Balancing: soft cap values | #20 (Soft cap) |
| #25 | Balancing: expedition formula | #12 (Expeditions) |
| #26 | Balancing: Discipline cooldown | #9 (Devotion) |

---

## Recommended Implementation Order

### Phase 0 — Foundation (no gameplay yet)
1. **#1 — Repo bootstrap** (copy tooling from PoEidler)
2. **#2 — Engine contracts** (interfaces, tick loop, state shape)
3. **#17 — Save/load** (persistence + offline progress skeleton)

### Phase 1 — Core resource loop
4. **#3 — Anima resource** (manual conjuring, click loop)
5. **#20 — Soft cap / Slow Overflow** (implement alongside resources, not after)
6. **#7 — Cultist pool** (headcount, passive recruitment, priority assignment)
7. **#8 — Sacrifice mechanic** (first Anima automation source)
8. **#19 — Construct / Building system** (Altar, Gateway Frame — gates the next phase)

### Phase 2 — Gateway + second resource
9. **#10 — Gateway system** (Planet A gateway, Channel action, Gnosis production)
10. **#4 — Gnosis resource** (Planet A gathering — part of gateway implementation)
11. **#9 — Devotion system** (decay, Discipline, collapse — now gateways exist to attach it to)
12. **#11 — Research tree** (Phase 1 linear — depends on Gnosis existing)

### Phase 3 — Full loop
13. **#10 (continued)** — Planet B gateway, Voltis production
14. **#5 — Voltis resource** (Planet B gathering — completes Trifecta triangle)
15. **#6 — Trifecta** (cross-dependencies activate at milestones 4/9/10, balance UI)
16. **#12 — Expedition system** (send cultists, return outcomes, Choice pool)
17. **#13 — Artifacts** (6 ritual artifacts, crafting + discovered)
18. **#21 — Corruption cleansing** (artifact screen interaction)

### Phase 4 — Meta-progression
19. **#14 — Milestone system** (14 milestones with triggers — needs all gameplay systems in place)
20. **#15 — Prestige / Rehearsal** (reset logic, Dark Boons, talent tree)
21. **#22 — The Summoning** (endgame event, final milestone, visual sequence)

### Phase 5 — Polish & Tuning
22. **#16 — Main UI** (progressive disclosure, session design — iterative throughout but final pass here)
23. **#23 — Recruitment rate calibration**
24. **#24 — Soft cap value tuning**
25. **#25 — Expedition success formula tuning**
26. **#26 — Discipline cooldown tuning**

---

## Critical Path

The longest dependency chain is:

```
#2 Engine → #17 Save → #3 Anima → #19 Construct → #10 Gateways → #9 Devotion → #12 Expeditions → #13 Artifacts → #14 Milestones → #15 Prestige → #22 Summoning
```

This is 11 steps. Parallelisation is possible:
- Cultist system (#7, #8) can be built alongside Anima (#3)
- Research tree (#11) can be built alongside devotion (#9) once gateways exist
- Gnosis (#4) and Voltis (#5) are part of gateway implementation (#10)
- UI (#16) is iterative throughout
- Tuning (#23–#26) is continuous, not a single phase

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
         │       │
         ▼       │
      #19 Construct
         │       │
         ▼       │
      #10 Gateways ◄────────┘
         │
    ┌────┼────┬────┐
    ▼    ▼    ▼    ▼
  #4   #9   #11   #6 Trifecta
  Gno  Dev  Res      │
  #5    │    │       │
  Vol   ▼    ▼       │
      #12 Expeditions
        │
        ▼
      #13 Artifacts ──→ #21 Corruption
        │
        ▼
      #14 Milestones
        │
        ▼
      #15 Prestige
        │
        ▼
      #22 Summoning (endgame)

Tuning (parallel): #23 #24 #25 #26
```
