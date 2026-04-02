# Open Design Questions

Living document tracking unresolved gameplay questions and logic issues.
**All questions must be resolved or explicitly deferred before implementation of the affected system.**

---

## Logic Contradictions

### Q1: Expeditions available before their dependencies exist — BLOCKS #12
**Affects:** #12 (Expeditions), #9 (Devotion), #5 (Voltis), Milestones 5-9

Voidwreath expedition is available at milestone 5 (~2:30h). But:
- Expeditions cost Voltis to sustain (§10.1) — Voltis doesn't exist until milestone 10 (~8:00h)
- Expedition outcomes depend on devotion — Devotion isn't introduced until milestone 7 (~4:30h)

**Needs answer:** Do early expeditions (milestones 5-9) work differently? Options:
- a) Expeditions before Voltis are free but slower
- b) Expeditions before Voltis cost Anima instead
- c) Voidwreath expedition isn't actually available until milestone 10 (move it)
- d) Devotion defaults to 100% before the devotion system activates (no decay, no risk)

### Q2: "The Idle Moment" can't work without Voltis — BLOCKS #10, #14
**Affects:** #10 (Gateways), #14 (Milestones), Milestone 8

Milestone 8 (~5:30h): "Anima + Gnosis self-sustain." But Sustained Channel costs Voltis (§8.2), which doesn't exist until milestone 10. §8.2 hints "Costs Voltis to sustain (once Planet B is open)" — implying free before, but never confirmed.

**Needs answer:** What does Sustained Channel cost before Voltis?
- a) Free before Planet B — Voltis cost activates at milestone 10 (second Trifecta link)
- b) Costs Anima before Voltis, switches to Voltis later
- c) Sustained Channel isn't available until milestone 10 (move idle moment later)

### Q3: Construct system vs milestone 2 trigger — BLOCKS #19
**Affects:** #19 (Constructs), #14 (Milestones), Milestone 2

#19 proposes "Altar exists from game start." Milestone 2 (0:20) is "The First Construct — Building system revealed." If Altar already exists, what does the player build at minute 20?

**Needs answer:**
- a) Altar does NOT exist from start — player builds it at milestone 2
- b) Altar exists but can be UPGRADED — first upgrade triggers milestone 2
- c) Different construct entirely (e.g. a Sanctum, a Ritual Circle foundation)

### Q4: Voicecaller unlock milestone contradiction — BLOCKS #13
**Affects:** #13 (Artifacts), #14 (Milestones)

Artifact table says Voicecaller unlocks after Milestone 12. Milestone 13 says "Voicecaller expedition available." Both can't be right.

**Needs answer:** Is Voicecaller available at milestone 12 or 13?

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

### Q8: Base parallel expedition cap not in expedition spec — BLOCKS #12
**Affects:** #12 (Expeditions)

The talent keystone says "3 instead of 2" — implying base cap is 2. This is never stated in §10. Also unclear: is the cap per-planet or global?

**Needs answer:** Document base expedition cap (2) in §10. Clarify: 2 total, or 2 per planet?

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

### Q11: Which devotion applies to expeditions? — BLOCKS #12
**Affects:** #12 (Expeditions), #9 (Devotion)

Devotion is per-gateway. Expedition speed "scales with devotion level" (§10.1). But:
- Which gateway's devotion? The one the expedition departed from?
- Is it a snapshot at departure time, or does it track the gateway's live devotion?
- If the gateway's devotion drops during an expedition, does the expedition slow down mid-trip?

### Q12: Trifecta nudge frequency — BLOCKS #6, #11
**Affects:** #6 (Trifecta), #11 (Research tree — Automation path)

Talent says "Trifecta auto-nudge twice per hour instead of once." Base is once per hour. But:
- Trifecta can break within a single 5-minute session
- A once-per-hour nudge would be irrelevant by the time it fires
- Is this nudge meant to be a minor background assist (player still fixes manually), or is it supposed to meaningfully prevent imbalance?

**Needs answer:** Either confirm once/hour is intentional (nudge is flavour, not a fix) or define a faster base rate.

---

## Timeline / Sequence Gaps

### Q13: When does devotion decay actually start? — BLOCKS #9
**Affects:** #9 (Devotion), #14 (Milestones)

Gateway opens at milestone 4 (~1:30h). Devotion Crisis is milestone 7 (~4:30h). Three hours apart. Options:
- a) Devotion decay starts at milestone 4 — by milestone 7 it's dropped to ~25-50%, which IS the crisis
- b) Devotion starts at 100% and doesn't decay until milestone 7 introduces the mechanic
- c) Devotion exists from milestone 4 but decays very slowly at first, accelerating at milestone 7

Option (a) means the player discovers a problem retroactively. Option (b) means the system silently changes behavior. Option (c) is the smoothest but most complex.

### Q14: First Rehearsal preserves nothing tangible — INFO
**Affects:** #15 (Prestige)

First Rehearsal (milestone 11, ~9:30h) gives 2 Boons. First artifact completion is milestone 12 (~10:30h). So the first Rehearsal carries zero artifacts — Boons are the only tangible reward. The "completed artifacts persist" feature doesn't pay off until run 2+.

**Needs answer:** Is this intentional? If so, should the UI set expectations? ("Your Boons will carry forward. Artifacts completed in future runs will persist too.")

### Q15: Sacrifice + Cindermark creates a potential new-player trap — INFO
**Affects:** #8 (Sacrifice), #13 (Artifacts)

At milestone 3 (~0:45), the player sacrifices a cultist (losing production) and Cindermark becomes craftable (Anima-heavy). But Cindermark realistically completes at ~10:30h. A new player might pour Anima into Cindermark thinking it's achievable soon.

**Needs answer:** Is there UI guidance? (e.g. cost bar showing "12% affordable" to set expectations)

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
