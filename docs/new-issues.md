# Open Design Questions

Living document tracking unresolved gameplay questions and logic issues.
**All questions must be resolved or explicitly deferred before implementation of the affected system.**

---

## Logic Contradictions

### ~~Q1: Expeditions available before their dependencies exist~~ ✅ RESOLVED
**Resolution (v0.6):** Early expeditions (before Voltis) are free — Voltis cost activates when Voltis exists. Devotion snapshot at departure gateway determines outcome odds. Before devotion system activates (milestone 7), devotion defaults to 100% (no risk). Updated in §10.1.

### ~~Q2: "The Idle Moment" can't work without Voltis~~ ✅ RESOLVED
**Resolution (v0.6):** Sustained Channel costs only Anima before Voltis exists. Voltis sustain cost activates when Voltis production begins (milestone 9). Milestone 8 "idle moment" is now at ~4:00h with Anima + Gnosis self-sustaining via Anima-cost-only sustained channel. Timeline compressed in §13.

### Q3: Construct system vs milestone 2 trigger — BLOCKS #19
**Affects:** #19 (Constructs), #14 (Milestones), Milestone 2

#19 proposes "Altar exists from game start." Milestone 2 (0:20) is "The First Construct — Building system revealed." If Altar already exists, what does the player build at minute 20?

**Needs answer:**
- a) Altar does NOT exist from start — player builds it at milestone 2
- b) Altar exists but can be UPGRADED — first upgrade triggers milestone 2
- c) Different construct entirely (e.g. a Sanctum, a Ritual Circle foundation)

### ~~Q4: Voicecaller unlock milestone contradiction~~ ✅ RESOLVED
**Resolution (v0.6):** Voicecaller now unlocks at milestone 11 (first artifact completed). Milestone table and artifact table aligned in §11 and §13.

### Q5: Choice events that remove cultists vs floor of 3 — BLOCKS #12
**Affects:** #12 (Expeditions), #7 (Cultists)

Several Choice events permanently remove cultists ("One cultist wants to stay behind"). The global floor of 3 (§6.4) must interact with these.

**Needs answer:**
- a) Choices that would break the floor simply don't appear in the pool
- b) The "lose cultist" option is grayed out with explanation
- c) Floor protection applies — cultist "narrowly escapes" instead

---

## Underspecified Systems

### Q6: Channel action values undefined — BLOCKS #10
**Affects:** #10 (Gateways), #15 (Prestige — Channelling talents)

The Channel burst action (§8.1) has no defined values:
- Anima cost per channel?
- Gnosis/Voltis returned per channel?
- Cooldown duration? (Talent says "Channel cooldown halved" — half of what?)
- Does devotion affect burst channel output, or only sustained trickle?

**Needs answer:** Base Channel values (cost, output, cooldown). These are tunable but need starting values like Discipline got.

### Q7: Construct system needs a spec — BLOCKS #19
**Affects:** #19 (Constructs), #14 (Milestones)

This is one of the earliest systems (~0:20) but the least specified. The GitHub issue only has a "proposed" design. Before implementation we need:
- Complete list of construct types in Layer 1
- Costs for each
- Whether constructs have upgrade tiers
- Exact milestone 2 trigger condition
- How constructs interact with prestige (gateway memory reduces rebuild cost — by how much?)

### ~~Q8: Base parallel expedition cap not in expedition spec~~ ✅ RESOLVED
**Resolution (v0.6):** Base cap of 2 parallel expeditions (global, not per-planet) now documented in §10.1. Talent keystone upgrades to 3.

### Q9: Research tree cost model undefined — BLOCKS #11
**Affects:** #11 (Research tree)

Phase 2 "can't fully pursue both paths at once" — what enforces this?
- Gnosis cost per node? How steep?
- Time cost? Gnosis production rate vs research cost?
- Is there a research queue, or is research instant when you can afford it?

**Needs answer:** Research node cost structure and what makes the two-path choice meaningful.

### Q10: Stunned cultist mechanics incomplete — BLOCKS #7, #9
**Affects:** #7 (Cultists), #9 (Devotion)

When floor protection triggers (§6.4), the cultist is "stunned for 5 minutes." But:
- Where does the stunned cultist go? Removed from all tasks? Counts as idle?
- Is their gateway slot freed for another cultist to fill?
- Does the gateway go offline for 5 minutes too, or just the cultist?
- After stun ends, does the cultist auto-reassign via priority system?

### ~~Q11: Which devotion applies to expeditions?~~ ✅ RESOLVED
**Resolution (v0.6):** Devotion no longer affects expedition speed — only outcome odds. Departure gateway devotion is snapshot at send time. Updated in §10.1. Devotion is per-gateway, not per-cultist — clarified in §7.

### ~~Q12: Trifecta nudge frequency~~ ✅ RESOLVED
**Resolution (v0.6):** Trifecta nudge mechanic removed entirely. Replaced with Harmony bonus model — balance is rewarded with a production multiplier, not enforced via auto-correction. Automation path now boosts the Harmony multiplier instead. Updated in §5, §9, §12.3.

---

## Timeline / Sequence Gaps

### Q13: When does devotion decay actually start? — BLOCKS #9
**Affects:** #9 (Devotion), #14 (Milestones)

Gateway opens at milestone 4 (~0:45h). Devotion Crisis is milestone 7 (~3:00h). ~2.25 hours apart. Options:
- a) Devotion decay starts at milestone 4 — by milestone 7 it's dropped noticeably, which IS the crisis
- b) Devotion starts at 100% and doesn't decay until milestone 7 introduces the mechanic
- c) Devotion exists from milestone 4 but decays very slowly at first, accelerating at milestone 7

Option (a) means the player discovers a problem retroactively. Option (b) means the system silently changes behavior. Option (c) is the smoothest but most complex.

### Q14: First Rehearsal preserves nothing tangible — INFO
**Affects:** #15 (Prestige)

With compressed timeline: earliest Rehearsal at milestone 8 (~4:00h, 1 Boon). First artifact at milestone 11 (~7:30h). Rehearsal at milestone 10 (~6:30h, 2 Boons) still precedes first artifact. So first Rehearsal carries zero artifacts — Boons are the only tangible reward.

**Needs answer:** Is this intentional? If so, should the UI set expectations? ("Your Boons will carry forward. Artifacts completed in future runs will persist too.")

### Q15: Sacrifice + Cindermark creates a potential new-player trap — INFO
**Affects:** #8 (Sacrifice), #13 (Artifacts)

At milestone 3 (~0:25), the player sacrifices a cultist (losing production) and Cindermark becomes craftable (Anima-heavy). But Cindermark realistically completes at ~7:30h. Now that Cindermark gives a +30% Anima boost and doubled sacrifice yields, the reward preview should motivate the player. But they might still dump resources prematurely.

**Needs answer:** Is there UI guidance? (e.g. cost bar showing "12% affordable" to set expectations, plus the reward preview)

---

## Technical Concerns

### Q16: Offline tick model vs online/offline divergence — BLOCKS #2, #17
**Affects:** #2 (Engine contracts), #17 (Save/load)

CLAUDE.md rule: `tick(deltaMs)` must produce identical results regardless of call frequency. But:
- **Devotion floor:** 15% offline, no floor online. Tick function can't know which mode.
- **Choice events:** Expedition completing offline can't present a Choice — must queue it.
- **Soft cap transition:** Large deltaMs needs to calculate time-to-cap, then overflow rate for remainder.

**Needs answer:** Adopt one of:
- a) `tick(deltaMs, isOffline)` — offline flag passed in, systems branch on it
- b) Pure tick with post-processing — tick runs identically, then an offline wrapper applies floors/queues
- c) Relax the rule — offline uses a separate "catch-up" function that calls tick in chunks

This is an architecture decision that must be made before #2 Engine contracts.

---

## Resolved (from previous audit)

| # | Question | Resolution |
|---|----------|------------|
| R1 | Discipline cooldown base rate | 3 min per-gateway, 5 min global (§7, #26) |
| R2 | Trifecta activation timing | Phased at milestones 4/9/10 (§5) |
| R3 | Cultist minimum floor vs devotion collapse | Global floor of 3 (§6.4) |
| R4 | All 8 missing issues created | #19–#26 on GitHub |
