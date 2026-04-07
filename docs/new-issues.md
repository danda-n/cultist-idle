# Open Design Questions

Living document tracking unresolved gameplay questions and logic issues.
**All questions must be resolved or explicitly deferred before implementation of the affected system.**

> **Status as of v0.7:** All blocking questions resolved. Implementation may begin.

---

## Logic Contradictions

### ~~Q1: Expeditions available before their dependencies exist~~ ✅ RESOLVED
**Resolution (v0.6):** Early expeditions (before Voltis) are free — Voltis cost activates when Voltis exists. Devotion snapshot at departure gateway determines outcome odds. Before devotion system activates (milestone 7), devotion defaults to 100% (no risk). Updated in §10.1.

### ~~Q2: "The Idle Moment" can't work without Voltis~~ ✅ RESOLVED
**Resolution (v0.6):** Sustained Channel costs only Anima before Voltis exists. Voltis sustain cost activates when Voltis production begins (milestone 9). Milestone 8 "idle moment" is now at ~4:00h with Anima + Gnosis self-sustaining via Anima-cost-only sustained channel. Timeline compressed in §13.

### ~~Q3: Construct system vs milestone 2 trigger~~ ✅ RESOLVED
**Resolution (v0.7):** Altar exists from game start as a passive structure (no build UI). At M2, the Build System is revealed. First available action is Altar Tier 1 upgrade — this is the tutorial action for the construct UI. M2 fires on ~50 Anima threshold. Full construct list spec added in §9. Updated in §9, §14.

### ~~Q4: Voicecaller unlock milestone contradiction~~ ✅ RESOLVED
**Resolution (v0.6):** Voicecaller now unlocks at milestone 11 (first artifact completed). Milestone table and artifact table aligned in §11 and §13.

### ~~Q5: Choice events that remove cultists vs floor of 3~~ ✅ RESOLVED
**Resolution (v0.7):** Floor-breaking options are greyed out (unselectable) with a one-line explanation ("Your cult cannot spare anyone"). Consistent with sacrifice button behavior (§6.4). Updated in §11.3.

---

## Underspecified Systems

### ~~Q6: Channel action values undefined~~ ✅ RESOLVED
**Resolution (v0.7):** Base channel values defined — costs 15 Anima, returns 25 Gnosis (or Voltis), 60-second cooldown. Devotion affects sustained trickle only; burst channel is always full power. Updated in §8.1.

### ~~Q7: Construct system needs a spec~~ ✅ RESOLVED
**Resolution (v0.7):** Full construct system specified in new §9: 6 constructs across Layer 1, unlock milestones, costs (tunable), effects. Prestige interaction: 40% cost reduction after first Rehearsal, caps at 70% after 3 runs. Updated in §9, §14.

### ~~Q8: Base parallel expedition cap not in expedition spec~~ ✅ RESOLVED
**Resolution (v0.6):** Base cap of 2 parallel expeditions (global, not per-planet) now documented in §10.1. Talent keystone upgrades to 3.

### ~~Q9: Research tree cost model undefined~~ ✅ RESOLVED
**Resolution (v0.7):** Gnosis-only cost. Research is instant when affordable — no queue, no timers. Phase 1 nodes: 30–75 Gnosis each. Phase 2 branch nodes: 100–150 Gnosis each. Total per branch: ~400 Gnosis. A first run before M8 earns ~450–550 Gnosis — enough for Phase 1 + one full branch. Two-path choice is economic constraint, not artificial lock. Updated in §10.

### ~~Q10: Stunned cultist mechanics incomplete~~ ✅ RESOLVED
**Resolution (v0.7):** Stun (floor protection trigger) mechanics — cultist is greyed out in assignment panel for 5 min; their slot is freed immediately (can be reassigned); gateway continues at reduced capacity with remaining cultists; cultist auto-reassigns per priority system when stun expires. Gateway does NOT go offline — player covers the gap by reprioritizing (an interesting decision, not dead time). Updated in §6.4.

### ~~Q11: Which devotion applies to expeditions?~~ ✅ RESOLVED
**Resolution (v0.6):** Devotion no longer affects expedition speed — only outcome odds. Departure gateway devotion is snapshot at send time. Updated in §10.1. Devotion is per-gateway, not per-cultist — clarified in §7.

### ~~Q12: Trifecta nudge frequency~~ ✅ RESOLVED
**Resolution (v0.6):** Trifecta nudge mechanic removed entirely. Replaced with Harmony bonus model — balance is rewarded with a production multiplier, not enforced via auto-correction. Automation path now boosts the Harmony multiplier instead. Updated in §5, §9, §12.3.

---

## Timeline / Sequence Gaps

### ~~Q13: When does devotion decay actually start?~~ ✅ RESOLVED
**Resolution (v0.7):** Option C. Decay starts at M4 (slow rate, ~1.5%/10 min). M7 "Devotion Crisis" is an event that accelerates decay to its normal rate — the problem was always there, it became urgent. Player has seen the gauge moving for ~2 hours; Crisis feels earned not arbitrary. Updated in §7, §14.

### ~~Q14: First Rehearsal preserves nothing tangible~~ ✅ RESOLVED
**Resolution (v0.7):** Intentional, but designed to feel worthwhile. M8 Rehearsal gives 2 Boons (increased from 1) + +15% production multiplier (explicit, permanent) + all Phase 1 research auto-complete + 40% cheaper constructs. Research shortcuts alone save 45–60 min in run 2. Run 2 duration: 6–8h after M8 Rehearsal, 4–5h after M10/11 Rehearsal with artifact. Boon table revised (M8: 2, M10: 3, M11: 3). UI shows "The cult remembers:" run-start summary. Updated in §15.

### ~~Q15: Sacrifice + Cindermark creates a potential new-player trap~~ ✅ RESOLVED
**Resolution (v0.7):** All crafted artifacts display a cost progress bar showing current resource % toward completion. Combined with the always-visible reward preview (already in §12), this sets expectations without editorializing. Applied to all 3 crafted artifacts. Updated in §12.

---

## Technical Concerns

### ~~Q16: Offline tick model vs online/offline divergence~~ ✅ RESOLVED
**Resolution (v0.7):** Option B — pure tick + offline post-processor. `tick(state, deltaMs)` is pure and identical in all modes. `offlineProcessor(state, deltaMs)` wraps it: applies 15% devotion floor post-tick, queues Choice events for display on return. Soft cap math is inside `tick()` via time-to-cap calculation — no offline branching. Architecture documented in §18. Updated in §18, CLAUDE.md.

---

## Resolved (from previous audit)

| # | Question | Resolution |
|---|----------|------------|
| R1 | Discipline cooldown base rate | 3 min per-gateway, 5 min global (§7, #26) |
| R2 | Trifecta activation timing | Phased at milestones 4/7/8/9 (§5) |
| R3 | Cultist minimum floor vs devotion collapse | Global floor of 3 (§6.4) |
| R4 | All 8 missing issues created | #19–#26 on GitHub |
