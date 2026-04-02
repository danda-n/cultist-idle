# New Issues to Create

These issues were identified during the concept doc ↔ issue tracker audit (April 2026).
Copy each section into a new GitHub issue.

---

## Issue: Construct / Building system (referenced by Milestone 2)

**Labels:** `core-loop`, `foundation`

### Description

Milestone 2 ("The First Construct") unlocks at ~0:20 and references a building system. Constructs are also mentioned as an Anima sink in §5 and as something that resets on Rehearsal in §14. But there is no issue defining what constructs are, how they work, or what they cost.

This is one of the earliest systems a player encounters — it needs a spec.

### What the concept doc tells us

- Anima is used for "building constructs, gateways, crafting artifacts" (§5)
- Milestone 2 at ~0:20 reveals "Building system" (§13)
- Constructs reset on Rehearsal (§14)
- Gateway construction cost is reduced by research (§9 Phase 1)

### What's missing — needs design decisions

- What IS a construct? Is it a gateway prerequisite? A production building? A passive buff?
- How many construct types exist in Layer 1?
- What are the Anima costs?
- Is there a build time or are constructs instant?
- Do constructs have upgrade tiers?
- How do constructs interact with the priority system — do cultists need to be assigned to them?

### Proposed minimal design (for discussion)

Constructs are the physical infrastructure the cult builds. In Layer 1:
- **Altar** — the conjuring station. Exists from game start. Upgradeable for faster Anima conjuring.
- **Gateway Frame** — must be built before a gateway can be opened. Planet A frame costs Anima only. Planet B frame costs Anima + Gnosis.
- **Ritual Circle segments** — built as artifacts are placed. Visual progression toward the Summoning.

Constructs are instant (spend resources, get the thing). No build timers — the idle waiting is already handled by resource accumulation.

### Acceptance criteria

- [ ] Construct types defined with costs
- [ ] Milestone 2 triggers on first construct completion
- [ ] Constructs reset on Rehearsal (gateway memory reduces rebuild cost)
- [ ] Construct state persisted in save/load (#17)

### Dependencies

- Blocked by: #2 (Engine contracts)
- Blocks: #10 (Gateway system — gateway requires construct), #14 (Milestones — milestone 2 trigger)

---

## Issue: Soft cap / Slow Overflow mechanic

**Labels:** `core-loop`, `foundation`, `trifecta`

### Description

The concept doc §5 defines a critical resource mechanic: above the resource cap, production slows to ~10% of normal rate but never fully stops. This affects every system in the game — resource tick, offline progress, trifecta balance, session design.

Currently no issue tracks the implementation of this mechanic. Issue #17 (Save/Load) references "up to soft cap" but doesn't define the cap behavior itself.

### Spec from concept doc

- Each resource (Anima, Gnosis, Voltis) has a cap value
- Below cap: normal production rate
- Above cap: production drops to ~10% of normal ("Slow Overflow")
- Production never fully stops — player is never bricked
- Creates natural rhythm: spend to stay below cap, keep production flowing
- Cap values are per-resource and may differ

### Design decisions needed

- Initial cap values for each resource (concept doc §18 Q4 flags this as needing playtesting)
- Does the cap increase via research? Via prestige? Both?
- Is the transition from 100% → 10% instant at cap, or is there a gradual curve?
- How does the soft cap interact with the Trifecta nudge? (nudge shifts production, but if one resource is at cap, shifting production TO it is wasteful)

### Proposed approach

- Hard cutoff at cap: above = 10% rate, below = 100% rate. No gradual curve — keep it simple and legible.
- Initial caps: start low (forces early spending decisions), increase via research tree nodes
- Trifecta nudge should NOT shift production toward a capped resource
- Soft cap values visible in UI so player knows when they're approaching

### Acceptance criteria

- [ ] Each resource has a configurable cap value
- [ ] Production rate drops to 10% above cap
- [ ] Production never reaches 0
- [ ] Offline progress (#17) respects soft cap during elapsed time calculation
- [ ] Trifecta gauge (#6) accounts for soft cap state
- [ ] Cap values are data-driven (easy to tune via playtesting)

### Dependencies

- Blocked by: #2 (Engine contracts), #5 (Resource system)
- Blocks: #6 (Trifecta balance — nudge must respect cap), #17 (Save/Load — offline progress must apply cap)

---

## Issue: Corruption cleansing action — UI and mechanic

**Labels:** `expedition`, `artifacts`, `ui`

### Description

Issue #12 (Expeditions) describes corruption as an outcome — a corrupted artifact applies a debuff that is "always visible, always fixable — cleansing cost shown upfront at all times." But there is no issue for the actual cleansing interaction: where does the player trigger it, what does it cost, and what does the UI look like?

### Spec from concept doc (§10.4)

- Corrupted artifact applies one debuff (e.g. -15% production rate, +20% Discipline cooldown)
- Debuff always visible, always fixable
- Cleansing cost shown upfront at all times
- Maximum one corrupted artifact active at a time
- Second corruption auto-cleanses the first at half cost
- No corruption can reduce a resource below its natural production floor

### What's missing

- Where does the cleanse action live? Artifact screen? A dedicated panel?
- What resource is the cleansing cost paid in? (The Voidwreath example uses 200 Gnosis, but is that always the case?)
- Is there a cooldown or confirmation step for cleansing?
- What visual feedback does the player get when they cleanse?
- How does corruption interact with the Rehearsal? (If a corrupted artifact persists, does the corruption persist too? Or does Rehearsal cleanse it for free?)

### Proposed design

- Cleanse action lives on the **Artifact screen** — each artifact slot shows corruption status and a "Cleanse" button with cost when applicable
- Cleansing cost scales with the debuff severity: minor debuffs cost less, major debuffs cost more
- Cost is always in Gnosis (thematically: knowledge purifies corruption)
- Cleansing is instant — no timer, no cooldown. The cost IS the gate.
- Visual: corruption shown as a pulsing dark overlay on the artifact slot. Cleansing plays a brief "purification" animation.
- **Rehearsal does NOT auto-cleanse.** Completed artifacts persist, and so does their corruption. This creates a meaningful decision: cleanse now (spend Gnosis) or carry it into the next run.

### Acceptance criteria

- [ ] Cleanse action accessible from artifact screen
- [ ] Cost displayed upfront at all times while corruption is active
- [ ] Cleansing removes debuff immediately
- [ ] Only one corruption active at a time (second auto-cleanses first at half cost)
- [ ] Corruption persists through Rehearsal on completed artifacts
- [ ] Corruption state persisted in save/load (#17)

### Dependencies

- Blocked by: #12 (Expedition system — corruption source), #13 (Artifacts — artifact screen)
- Related: #16 (Main UI — where cleansing action appears)

---

## Issue: The Summoning — endgame event (Milestone 14)

**Labels:** `core-loop`, `ui`, `milestone`

### Description

Milestone 14 ("THE SUMMONING") is the climax of the entire game — the payoff for 12-15 hours of play across multiple Rehearsal runs. The concept doc §19 states it should "feel like an event, not a button press." There is no issue for implementing this finale.

### What we know

- Triggers when all 6 Ritual Artifacts are complete
- Represents the completion of Layer 1
- Should be a visual and atmospheric event, not just a number incrementing
- Layer 2 is out of scope — so this is currently the end state

### What's missing

- What happens visually when the last artifact is placed?
- Is there an animation sequence? A reveal? Text?
- How long should the "event" last before settling into the end state?
- What does the player see AFTER the Summoning? Stats screen? A prestige into Layer 2 teaser? A "congratulations, your cult succeeded" moment?
- Can the player continue playing after Summoning (e.g., for speedrun attempts)?
- Does the Summoning require a player action (a final ritual button), or does it auto-trigger?

### Proposed design

- **Trigger:** When the 6th artifact is completed, the ritual circle UI element begins a final animation
- **Player action:** A "Begin the Summoning" button appears — this is the one moment the player should feel agency over the climax
- **The event:** 10-15 second cinematic sequence — the ritual circle ignites, the portal tears open, flavour text scrolls ("He is here. He was always here. You have merely opened His eyes.")
- **End state:** Summary screen showing run count, total time, artifacts collected, Dark Boons spent. Option to start Layer 2 (placeholder for now) or "Begin a New Cult" (full reset for speedrun challenge)
- **Post-Summoning:** Player can continue with a fully automated Layer 1 as a sandbox, or reset

### Acceptance criteria

- [ ] Summoning triggers when all 6 artifacts are complete
- [ ] Player must confirm the final action (not auto-triggered)
- [ ] Visual event sequence plays (minimum: animation + flavour text)
- [ ] Summary/stats screen appears after event
- [ ] Post-Summoning state is defined (sandbox, reset option, or Layer 2 placeholder)
- [ ] Summoning state persisted — once completed, it stays completed (#17)

### Dependencies

- Blocked by: #13 (Artifacts — all 6 must be trackable), #14 (Milestones — milestone 14 trigger), #16 (Main UI — where event renders)
- This is the terminal node — nothing depends on it

---

## Issue: Balancing pass — recruitment rate calibration

**Labels:** `tuning`, `cultists`
**Priority:** Medium

### Description

Concept doc §18 Q3: "Cultist passive recruitment rate — X minutes per cultist. Needs calibration."

The recruitment rate directly affects how punishing cultist losses feel, how fast the player recovers from sacrifice or expedition failure, and how the cult grows across a run.

### Variables to calibrate

- Base recruitment interval (minutes per new cultist)
- How recruitment speed improves via research tree
- How recruitment speed improves via prestige (§6.5)
- Milestone bonus cultist counts (2-3 at key moments)

### Constraints

- Start of run: 5-8 cultists. By milestone 8 (~5:30h) player should have ~12-15.
- Sacrifice at milestone 3 (~0:45) should feel weighty — losing 1 of ~6-7 matters.
- By Trifecta (~9:30h) player needs enough cultists for 2 gateways + expeditions (~8-10 assigned).
- Prestige runs should feel faster — recruitment rate bonus should be noticeable by run 2.

### Proposed starting values (for playtesting)

- Base rate: 1 cultist per 20 minutes
- Research improvement: -25% interval (1 per 15 min)
- Prestige bonus: -10% per run (cumulative)
- Milestone bonuses: +2 at milestone 4 (gateway), +2 at milestone 11 (trifecta), +3 at milestone 13 (the hunt)

### Acceptance criteria

- [ ] Recruitment rate is data-driven (config, not hardcoded)
- [ ] Playtesting confirms: sacrifice at milestone 3 feels meaningful, not crippling
- [ ] By milestone 8, player has enough cultists for 1 gateway + occasional expedition
- [ ] Run 2 recruitment feels noticeably faster than run 1

---

## Issue: Balancing pass — resource soft cap values

**Labels:** `tuning`, `trifecta`
**Priority:** Low (implementation time)

### Description

Concept doc §18 Q4: "Resource soft cap values — at what absolute amount does slowdown kick in? Needs playtesting."

### Variables to calibrate

- Anima soft cap (early game value, late game value)
- Gnosis soft cap
- Voltis soft cap
- Whether caps scale with progression (research, prestige) or are fixed

### Constraints

- Cap must be high enough that active players don't hit it during normal play
- Cap must be low enough that overnight idle doesn't accumulate infinite resources
- Trifecta balance: all three caps should create roughly equivalent "time to fill" at normal production rates

### Proposed starting values

- Anima: 500 (early), scaling to 2000 via research
- Gnosis: 300, scaling to 1500
- Voltis: 200, scaling to 1000
- Overflow rate: 10% of normal production above cap (as per concept doc)

### Acceptance criteria

- [ ] All cap values are data-driven
- [ ] Overnight idle (~8h) fills to cap but doesn't feel wasteful on return
- [ ] Active play rarely hits cap during normal production/spending rhythm
- [ ] Caps scale with progression so late-game doesn't feel artificially constrained

---

## Issue: Balancing pass — expedition success formula

**Labels:** `tuning`, `expedition`
**Priority:** Medium

### Description

Concept doc §18 Q2: "Expedition success rate formula — what variables feed it beyond devotion? Cultist count? Talent bonuses?"

### Variables to define

- Base success rate
- Devotion modifier (linear? curved?)
- Cultist count modifier (sending 3 vs 1)
- Talent bonus modifiers (expedition talent tree nodes)
- Does expedition type matter? (resource run vs artifact hunt)

### Constraints

- Low devotion (<30%) = "Lost" outcome (concept doc §10.2)
- ~40% of returns should trigger a Choice event
- High devotion + good odds = "Clean find"
- Artifact expeditions should have higher stakes than resource runs

### Proposed formula

```
baseRate = 0.60  // 60% clean find base
devotionBonus = devotion * 0.3  // 0-30% bonus from devotion (100% devotion = +30%)
cultistBonus = (cultistCount - 1) * 0.05  // +5% per additional cultist beyond the first
talentBonus = expeditionTalentLevel * 0.05  // +5% per talent node

successRate = min(0.95, baseRate + devotionBonus + cultistBonus + talentBonus)
choiceRate = 0.40  // flat 40% of non-lost returns
lostThreshold = 0.30  // devotion below 30% = lost

if devotion < lostThreshold:
    outcome = "Lost"
elif random() < choiceRate:
    outcome = "Choice"
elif random() < successRate:
    outcome = "Clean find"
else:
    outcome = "Choice"  // fallback — Choices are always interesting
```

For artifact expeditions: `baseRate = 0.40` (lower base, higher stakes).

### Acceptance criteria

- [ ] Formula is data-driven and configurable
- [ ] Devotion below 30% reliably triggers Lost outcome
- [ ] ~40% of non-lost returns are Choices (verify over 50+ runs)
- [ ] Sending more cultists noticeably improves odds
- [ ] Talent bonuses stack correctly

---

## Issue: Balancing pass — Discipline cooldown definition

**Labels:** `tuning`, `devotion`
**Priority:** High

### Description

The concept doc and issue #9 describe Discipline as "infrequent and atmospheric" but never define a base cooldown. The talent tree has a node that makes Discipline recharge 50% faster, but 50% faster than *what*?

Without this value, the core promise — "5-minute session always has time to act" — is untestable.

### Variables to define

- Base Discipline cooldown (per-gateway)
- Global Discipline cooldown (Overseer's Rite — research unlock)
- Talent bonus: "Discipline recharges 50% faster" modifies which value?

### Constraints

- Devotion decays from 100% → 0% in ~4-6 hours (from issue #9)
- 5-minute session must have time to Discipline if needed
- Discipline should be infrequent — at most once per 5-10 min session
- By run 3-4, devotion should be "background noise" (concept doc §7)

### Proposed values

- Base per-gateway cooldown: **3 minutes**
- This means in a 5-min session, you can always Discipline at least once
- With 4-6h decay, you'd need to Discipline roughly every 60-90 minutes to keep devotion healthy — fitting the "infrequent" goal
- Global Discipline (Overseer's Rite): **5 minute cooldown** (covers all gateways, slightly longer than per-gateway)
- Talent "50% faster": reduces per-gateway from 3 min → 1.5 min, global from 5 min → 2.5 min

### Acceptance criteria

- [ ] Base cooldown defined and data-driven
- [ ] 5-minute session always has Discipline available if devotion needs it
- [ ] Discipline frequency matches "infrequent, atmospheric" goal (~once per session)
- [ ] Talent bonus correctly modifies cooldown
- [ ] Overseer's Rite global cooldown feels appropriate for managing 2 gateways
