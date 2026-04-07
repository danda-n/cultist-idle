# CULTIST IDLE — Concept Document
> Version 0.14 | April 2026 | Status: Systems Locked (Layer 1) | All issues tracked in GitHub

---

## 1. Elevator Pitch

You are a small band of desperate cultists. Your demon lord is trapped beyond the veil of reality,
and only you can bring him through. Conjure Anima, open gateways to alien dimensions, keep your
cultists devoted enough to work, and assemble six Ritual Artifacts to tear open the portal.

The Summoning is the goal. Everything else is the price you pay.

Browser-based idle/incremental game. Minimal UI noise. Meaningful decisions. Dark folk-ritual atmosphere.

---

## 2. Core Design Pillars

| Pillar | What it means |
|---|---|
| **One Big Goal** | The Summoning is always visible. Every system exists to serve it. |
| **Meaningful Idle** | The game runs while you're away, but your decisions shape how fast. No pointless clicking. |
| **Trifecta Synergy** | Three resources cross-support each other. Balance is rewarded with efficiency bonuses — not required, but satisfying to achieve. |
| **Devotion as Engagement** | Cultists have a devotion meter. Neglect it and throughput suffers. Intervening is quick and atmospheric. |
| **Prestige that Feels Good** | Rehearsal happens during the run. Each attempt is faster and more competent than the last. |
| **Clean Information** | One screen. What matters now. Complexity earns its way onto the screen. |

---

## 3. Theme & Tone

- Small cult. Grimy, desperate, utterly devoted.
- Grim folk ritual — not campy horror. Candlelight. Chalk circles. Blood on stone.
- The demon lord is something vast and inhuman. Worthy of worship, not a cartoon villain.
- Tone reference: *Darkest Dungeon* meets *Cultist Simulator*.
- Every mechanic name belongs in the world. Numbers are resources. Buttons are rituals. Upgrades are forbidden knowledge.

---

## 4. Layer Structure

| Layer | Theme | Status |
|---|---|---|
| **Layer 1** | The Summoning | 🎯 In scope |
| **Layer 2** | TBD — unlocked after Summoning | 💭 Out of scope |

**Scope lock:** All design and implementation effort stays on Layer 1. Layer 2 is not designed yet.

---

## 5. The Three Resources (Trifecta)

| Resource | Name | Source | Primary use |
|---|---|---|---|
| **Essence** | **Anima** | Conjured manually; automated via cultist sacrifice | Building constructs, gateways, crafting artifacts |
| **Knowledge** | **Gnosis** | Gathered from Planet A via gateway | Research, automation unlocks, gateway efficiency |
| **Energy** | **Voltis** | Gathered from Planet B via gateway | Fuelling automation — automation costs Voltis to sustain |

**Cross-dependencies (phased activation, not all-at-once):**
- Anima automation consumes Voltis
- Voltis production benefits from Gnosis research level
- Gnosis channelling costs Anima to sustain

**Trifecta philosophy — reward balance, don't punish imbalance:**
Each resource works independently. Cross-dependencies create *costs* (Anima to channel, Voltis to automate), not *penalties*. When all three resources are above a threshold simultaneously, the player earns a **Harmony bonus** — a global production multiplier (e.g. +15-25%). Losing Harmony isn't a punishment — it's losing a bonus. The player can choose to focus on one resource and sacrifice efficiency, or maintain balance for the boost. Upgrading one resource never *breaks* anything — it just means the other two haven't caught up yet for the bonus.

**Phased introduction:**
1. **Milestone 4 (~0:45h):** First link — Gnosis channel costs Anima. Player learns "one resource feeds another." One-directional: Anima → Gnosis.
2. **Milestone 8 (~4:00h):** Second link — Gnosis research investment boosts Anima automation rate. The Anima ⟷ Gnosis loop closes: Anima fuels Gnosis channelling, and Gnosis research improves Anima output. Self-sustain between two resources becomes possible.
3. **Milestone 9 (~5:00h):** Third and fourth links — Voltis arrives. Anima automation now costs Voltis. Voltis production benefits from Gnosis research level. Full triangle active. Harmony bonus unlocks.

> **Note:** The Trifecta has four cross-connections across three resources (each resource feeds both others). The first two activate before Voltis exists. The final two activate when Voltis arrives at M9. §5 previously listed a "M7 second link" — that was a version mismatch. M7 is the Devotion Crisis; the second Trifecta link is M8.

**Soft cap — Slow Overflow:**
Above the resource cap, production slows dramatically but never fully stops. Creates a natural rhythm of spending to keep flowing. Never bricks a run. Overflow rate: ~10% of normal production above cap. Overnight idle accumulates meaningful progress without skipping 10 steps — soft cap ensures the player returns to a nudge forward, not a leap.

**Soft cap values (tunable):** Anima 500, Gnosis 250, Voltis 300. Designed to be reachable in ~2–3h of active play per resource. All values live in `src/data/` and will be adjusted during playtesting.

**Harmony bonus threshold (tunable):** Base threshold = 30% of each resource's soft cap (Anima 150, Gnosis 75, Voltis 90). All three resources must remain simultaneously above their threshold for 60+ seconds to trigger the Harmony bonus. Talent "Harmony bonus threshold lowered by 20%" reduces the multiplier to 24% of soft cap (Anima 120, Gnosis 60, Voltis 72) — a 20% relative reduction, making the bonus easier to maintain.

**Trifecta UI:** Permanent three-bar or triangular gauge always on screen. Harmony bonus status shown prominently (active/inactive + current multiplier). When one resource falls behind, the gauge shows which one — one obvious action to restore the bonus. No math, no diagnosis puzzle.

### 5.1 Anima — The Conjuring Action

Anima is the foundation resource. Before automation, the player manually conjures it via a ritual action.

**Conjure mechanics:**
- Yield: **8 Anima** per conjure
- Cooldown: **8 seconds** — a fill bar charges visually; clicking before full does nothing
- The fill bar is the ritual preparation. The click is the execution.

**Altar upgrades affect conjure speed (= cooldown reduction):**

| State | Cooldown | Anima/min |
|---|---|---|
| Base | 8s | ~60/min |
| Altar Tier 1 (+25% speed) | 6s | ~80/min |
| Altar Tier 2 (+25% stacked) | ~4.8s | ~100/min |

**Automation — Blood Compact (Phase 1 research node 3):** Conjuring fires automatically on cooldown. The player no longer needs to click. This is the first true idle transition, occurring mid Phase 1 research (~M5–M6 window), well before the full idle moment at M8.

---

## 6. Cultist System

### 6.1 Volume & Feel
- **Start:** 5–8 cultists
- **Feel:** Medium pool. Losing one is notable and recoverable, not catastrophic.
- Cultists are a headcount, not named individuals. No deep management.

### 6.2 Growth
- **Passive recruitment:** One new cultist joins every **20 minutes** (tunable). Active from game start. Slow background drip — never the primary growth source.
- **Milestone bonuses:** 2–3 cultists join at key progression moments (Gateway opens, Trifecta achieved, etc.). These are the interesting recruitment moments, not the passive rate.

### 6.3 Assignment — Priority-Based Auto-Distribution
Cultists distribute themselves automatically based on **player-set priorities**. Player never manually moves cultists.

**Priority system:**
- Player sets a ranked order of tasks: e.g. Gateway A > Expeditions > Gateway B > Idle
- Cultists fill higher-priority slots first
- Unassigned cultists (when all slots are full) contribute a small passive Anima trickle — they're not wasted
- Rebalancing priorities is an instant action, no cost

**Slots per task:**
- Each gateway has a capacity of 1–3 cultists (upgradeable)
- Each expedition requires 1–3 cultists (player chooses how many to commit)
- More cultists on a gateway = higher throughput, and higher stakes per devotion collapse (more cultists can be stunned per event). Devotion is one meter per gateway — there is no additional management complexity per cultist, but the cost of neglect scales with how many cultists are assigned.

### 6.4 Minimum Cultist Floor

**Global floor of 3 cultists.** No mechanic can reduce the cult below 3 members. This applies to all loss types:

- **Devotion collapse:** If losing a cultist would drop count below 3, the cultist is **stunned for 5 minutes** instead of lost. Their gateway slot empties — the gateway continues at reduced capacity with remaining cultists (or minimal if they were the only one). The player covers the gap by reprioritizing idle cultists. Still punishing (lost slot output, forced rebalance), but recoverable and interactive.
- **Expedition loss:** Cultists "narrowly escape" — they return empty-handed but alive.
- **Sacrifice:** Cannot sacrifice if it would drop below 3. Button grayed out with explanation.

The Devotion keystone talent ("collapse impossible — stun eliminated") still has value: it prevents the 5-minute stun and the associated slot vacancy, keeping the gateway at full capacity throughout.

**Stun mechanics:**
- Stunned cultist is shown as greyed-out in the assignment panel
- Their slot is immediately freed — another cultist can be reassigned to fill it
- After 5 minutes, the cultist auto-reassigns per the priority system
- No player action required on recovery

### 6.5 Losses
Two types — intentional and preventable (subject to floor above):

**Intentional:**
- **Sacrifice** — player manually sacrifices a cultist for permanent passive Anima production. Each sacrifice adds **+6 Anima/min** (base). Stackable — multiple sacrifices across a run are explicitly intended. M3 is the tutorial sacrifice; later ones are strategic decisions. With 5–8 starting cultists and a floor of 3, up to 5 sacrifices are possible across a run.
  - **Ossuary construct** increases per-sacrifice rate to **+9 Anima/min**
  - **Cindermark artifact** doubles total sacrifice production **retroactively** (all active sacrifices, not just future ones)
- **Expedition loss** — cultists sent on low-devotion expeditions risk not returning. 50% Anima refunded.

**Preventable:**
- **Devotion collapse** — if a gateway's devotion hits zero, the cultist assigned there abandons the cult. Lost permanently. This is the bad outcome the devotion system exists to prevent.
- Always telegraphed well in advance — devotion gauge turns red long before collapse.

### 6.6 Prestige Interaction
Each Rehearsal run preserves recruitment speed improvements. Cultists don't carry over — you rebuild the pool each run, but faster each time.

---

## 7. Devotion System

Each gateway has a **Devotion meter** (0–100%) that slowly decays over time. Devotion is strictly per-gateway — not per-cultist. As devotion falls, cultist throughput at that gateway drops proportionally.

**Decay rates:**

| Phase | Rate | 100% → 70% (discipline trigger) | 100% → 0% (collapse) |
|---|---|---|---|
| M4–M7 (slow) | 0.15%/min | ~3.3h | ~11h |
| M7+ (normal) | 0.5%/min | ~60 min | ~3.3h |
| + Warding Stones (−20%) | 0.4%/min | ~75 min | ~4.2h |
| + Heretical Wards (−15%) | 0.425%/min | ~71 min | ~3.9h |
| + Both combined | 0.34%/min | ~88 min | ~4.9h |

The player should discipline when the gauge hits ~70% — roughly every 60 min at the base normal rate. All decay modifiers are tunable starting values.

**Decay timing (phased):**
- **Milestone 4 (~0:45h):** Devotion decay begins at the slow rate (0.15%/min). The gauge visibly moves over time — the player can observe the system starting to matter.
- **Milestone 7 (~3:00h) — "Devotion Crisis":** Decay accelerates to the normal rate (0.5%/min). The player has watched devotion creep down for ~2 hours; the Crisis makes it suddenly urgent. This makes M7 feel earned, not arbitrary — the problem was always there, it just got worse.

**The Discipline action:**
- Player taps a gateway to **Discipline** its cultists — curse them, punish them, re-consecrate the site
- Resets devotion to 100%
- **Base cooldown: 3 minutes per gateway.** In a 5-min session, always available at least once. With 4-6h decay rate, needed roughly every 60-90 minutes — infrequent by design.
- Early game: per-gateway action
- Mid-game research unlock (**Overseer's Rite**): single global action disciplines all gateways at once. **5 minute cooldown** (slightly longer than per-gateway to maintain strategic tension). Using the global action resets all per-gateway cooldowns simultaneously — one action replaces N. Per-gateway Discipline does not reset the global timer.
- Talent modifier: "50% faster recharge" → per-gateway 1.5 min, global 2.5 min

**Design guardrails:**
- Decay is slow — a 5-min session always has time to act
- Devotion collapse (cultist loss) requires sustained neglect, not a brief lapse
- Trifecta imbalance and devotion decay must not both demand attention simultaneously unless player has neglected both for extended time
- The Discipline action is infrequent and atmospheric — a ritual, not a chore
- **Offline devotion floor:** During offline time, devotion cannot decay below 15% per gateway. This prevents permanent cultist loss while the player cannot intervene. On return, a gateway at 15% devotion is a clear "fix this" signal without permanent punishment. Online: the devotion meter has no floor — it can reach 0% and trigger collapse. Collapse is still subject to the cultist count floor (§6.4): at 3 cultists, the cultist is stunned, not lost. These are two different floors: the 15% offline floor protects the devotion *meter*; the floor-of-3 protects the cultist *count*.
- **Return signal:** On return from offline, any gateway below 30% devotion is flagged with a red indicator in the main UI. 30% gives the player ~30 minutes before collapse at the normal decay rate — enough time to act, clear enough to see immediately.

**Prestige interaction:** Each run unlocks permanent Devotion Upgrades — higher starting devotion, slower decay. By run 3–4 it's background noise. Never fully disappears in Layer 1.

---

## 8. Gateway System — "Pull to Passive"

### 8.1 The Channel Action (early)
Gateway is open but not self-sustaining. Player **Channels** — spends Anima for a burst of Gnosis or Voltis. Feels like reaching through a portal. Primary gathering method before automation.

**Base channel values:**
- Cost: **15 Anima** per burst
- Output: **25 Gnosis** (Planet A) or **25 Voltis** (Planet B)
- Cooldown: **60 seconds** (talent: "Channel cooldown halved" → 30 seconds)
- Devotion effect: applies to **sustained trickle only** — burst channel is always full power regardless of devotion level

### 8.2 Sustained Channel (research unlock)
Spend Gnosis to unlock a slow passive trickle from the gateway. Before Planet B: sustained channel costs only Anima. After Voltis exists: costs Voltis to sustain (this is the third Trifecta link). Sacrifices burst efficiency for idle comfort.

### 8.3 Devotion connection
Cultists maintain the channel. Their devotion level directly affects trickle rate. Neglected gateway = devotion decay = slower trickle. Discipline restores it. This is why active engagement never fully disappears — it's tending, not clicking.

### 8.4 Gateway progression
- **Planet A gateway** — becomes buildable after M3 (once sacrifice automation begins and Anima income is stable). Costs **250 Anima** to construct. M4 fires when construction completes. Purchasing "The Opened Way" (Phase 1 node 2) reduces all future gateway constructions to 200 Anima — non-retroactive (gateways already built are unaffected). In run 2+, Phase 1 auto-completes before the player can build, so the discount applies by default.
- **Planet B gateway** — discovered via Gnosis threshold (milestone 9). Produces Voltis. Enables automation.
- Further gateways possible (Layer 1 scope: 2 gateways only).

### 8.5 Gateway Expansion

Each gateway starts at capacity 1 cultist slot. Expansion is purchased directly on the gateway panel — same UI as Channel and Discipline. Paid in Anima + Gnosis. Not a construct and not a research node; it is a per-gateway investment that appears contextually in the gateway UI once the cost becomes reachable.

All costs are tunable starting values in `src/data/`.

| Upgrade | Cost | Available |
|---|---|---|
| Planet A: capacity 1 → 2 | 300 Anima + 200 Gnosis | M5 |
| Planet A: capacity 2 → 3 | 600 Anima + 400 Gnosis | M8 |
| Planet B: capacity 1 → 2 | 400 Anima + 300 Gnosis | M9+ |
| Planet B: capacity 2 → 3 | 800 Anima + 600 Gnosis | M10+ |

**Prestige:** Gateway expansion resets on Rehearsal. Gateway memory reduces expansion costs by 40% (same as constructs), capping at 70% after 3 runs.

---

## 9. Construct System

The **Altar** exists from game start as a passive structure — the site of the First Conjuring. It has no mechanical build UI at the start. At **milestone 2 (~0:10h)**, the Build System is revealed: constructs become available as the player accumulates Anima. The first available action is upgrading the Altar (Tier 1), which serves as the tutorial for the construct UI.

### 9.1 Milestone 2 Trigger
Fires when the player accumulates ~50 Anima — enough to afford the first Altar upgrade. The building panel unlocks, the Altar upgrade is highlighted as the first available action.

### 9.2 Layer 1 Constructs

All costs are tunable starting values. They belong in `src/data/` and will be adjusted during playtesting.

| Construct | Cost | Effect | Available |
|---|---|---|---|
| **Altar (Tier 1)** | 50 Anima | +25% Anima conjure speed | M2 — tutorial action |
| **Ossuary** | 120 Anima | Sacrifice yield +50% | M3 |
| **Warding Stones** | 150 Anima | Devotion decay -20% on all gateways | M4 |
| **Scrying Pool** | 175 Anima + 30 Gnosis | Research speed +25% | M5 |
| **Binding Circle** | 250 Anima + 50 Gnosis | +1 expedition cultist capacity per expedition | M6 |
| **Altar (Tier 2)** | 300 Anima + 75 Gnosis | +25% Anima conjure speed (stacks with Tier 1) | M8 |

### 9.3 Design Notes
- Constructs are permanent one-time purchases — no upkeep cost, no further upgrade tiers beyond what's listed
- Progressive disclosure: constructs appear in the build panel only when their unlock milestone has been reached
- Each construct is a meaningful spend decision (Anima or Anima+Gnosis), not idle accumulation
- **Prestige:** All constructs reset on Rehearsal. **Gateway memory reduces all construct rebuild costs by 40%** after the first completed Rehearsal (permanent, cumulative per run — capped at 70% reduction after 3 runs).

---

## 10. Research Tree

**Shape:** Linear Phase 1 (auto-completes on Rehearsal), then two branches. Phase 2 **resets each run** — the player re-chooses a path with fresh Gnosis, which is the run identity mechanic.

### Phase 1 — Linear (4 nodes, all auto-complete on Rehearsal)

| # | Name | Effect | Cost |
|---|---|---|---|
| 1 | **Conjuring Rites** | Anima conjure speed +20% | 30 Gnosis |
| 2 | **The Opened Way** | Sustained Channel unlocked; gateway construction cost -20% | 40 Gnosis |
| 3 | **Blood Compact** | Conjuring automated — fires on cooldown without clicking | 50 Gnosis |
| 4 | **Heretical Wards** | Devotion decay -15% on all gateways | 60 Gnosis |

Phase 1 total: **180 Gnosis**

### Phase 2 — Two branches (player chooses one per run)

Unlocked when Phase 1 is fully purchased. Resource-constrained — a run earns ~500 Gnosis total, leaving ~20 Gnosis surplus after Phase 1 + one branch.

| # | Automation Path | Cost | Acceleration Path | Cost |
|---|---|---|---|---|
| 1 | **Overseer's Rite** — Global Discipline action unlocked (5 min cooldown, all gateways at once) | 80 Gnosis | **Blood Accelerant** — Expedition timers -20% | 80 Gnosis |
| 2 | **Trifecta Resonance** — Harmony bonus multiplier +10% additional | 100 Gnosis | **The Hungry Gate** — Channel burst output +30%; Voltis yield per channel +30% | 100 Gnosis |
| 3 | **Eternal Compact** — Automation costs (Voltis) -20%; automated conjure rate +25% | 120 Gnosis | **The Final Veil** — All production rates +15% | 120 Gnosis |

Phase 2 branch total: **300 Gnosis each**

**Gnosis budget (verified):**
- Phase 1: 180 + Phase 2 branch: 300 = **480 Gnosis needed**
- Earnable before M8: ~500 Gnosis → ~20 surplus ✓ confirms "little to spare"

**Cost model:** Gnosis only. Instant when affordable — no queue, no timers. Nodes unlock in order; Phase 2 requires Phase 1 complete.

**Path trade-offs:**

| | **Automation Path** | **Acceleration Path** |
|---|---|---|
| Focus | Reduce manual intervention; global Discipline; Harmony boost | Raw throughput; faster expeditions; Voltis yield |
| Payoff timing | Run 2+ (Harmony consistent, Overseer's Rite saves active time) | Run 1 (immediate benefit from M5 onward) |
| Prestige synergy | Compounds well across runs | Faster individual run speed |

Both paths reach the same endgame capability. Playstyle choice, not power level. See D2 in §20 for the known payoff asymmetry risk.

---

## 11. Expedition System — "Into the Void"

### 11.1 Sending

**Unlock:** Expeditions become available when Planet A gateway opens (Milestone 4). The gateway is both the channelling site and the departure point for expeditions — the player can send cultists through it or channel from it, but cultists on an expedition are not available for gateway channelling until they return.

**Cultist commitment model:** Expeditions are launched actively by the player (tap "Send Expedition"). The player chooses how many cultists to commit (1–3) at launch time. The **priority system determines where those cultists are drawn from** — if the priority order is Expeditions > Gateway B, cultists are pulled from Gateway B's slot first to staff the expedition. On return, cultists re-fill slots according to the current priority order. The player controls the launch and the headcount; the priority system handles sourcing and recovery.

**Base expedition timers:**

| Destination | 1 cultist | 2 cultists | 3 cultists |
|---|---|---|---|
| Planet A | 20 min | 15 min | 12 min |
| Planet B | 35 min | 26 min | 20 min |

Each additional cultist reduces timer by ~25%. With 2 parallel slots and 2-cultist sends, Planet A returns every 15 min (~4 returns/hour, ~1–2 Choice events/hour). Planet B is slower with higher stakes.

"Expeditions return 25% faster" talent: Planet A → 11/8/9 min; Planet B → 26/20/15 min.

- Base expedition timer depends on destination and cultist count (more cultists = faster, per table above)
- Devotion does NOT affect expedition speed — devotion is a gateway mechanic, not an expedition mechanic. Expedition risk is determined by devotion at the *departure gateway* (snapshot at send time), affecting outcome odds only (see §11.2), not timer.
- Multiple expeditions run in parallel (base cap: 2, upgradeable to 3 via talent keystone). **Run 1 cap is always 2** — the 3rd slot requires the Expedition keystone talent (2 Boons), first available after M8 Rehearsal. This is intentional: run 1 introduces the expedition system without full parallel complexity.
- Early expeditions (before Voltis) are free. Once Voltis exists, each active expedition costs Voltis per minute to sustain the open gateway:
  - Planet A: **5 Voltis/min**
  - Planet B: **8 Voltis/min**
  - Example cost: a 15-min Planet A run = 75 Voltis; a 26-min Planet B run = ~208 Voltis
  - Running 2 parallel expeditions simultaneously doubles the drain — creates real tension against automation Voltis costs
- Runs fully in background — no required interaction while active

**Expedition destinations:**

Planet A is a single destination with one loot pool. What the pool can yield is milestone-gated:

| After | Planet A can yield |
|---|---|
| M4 | Resource caches only |
| M5 | Resource caches + Voidwreath eligible |
| M8 | Resource caches + Voidwreath + Hungering Lens eligible |

Two simultaneous expeditions to Planet A roll independently — separate parties, separate loot. If both return eligible for the same artifact and the slot is already filled, the duplicate rolls a resource cache instead.

After M9: player chooses destination per expedition — **Planet A** (Gnosis/resource focus) or **Planet B** (Voltis/rarer loot). Both slots can target different planets simultaneously.

### 11.2 Return Outcomes

**Probability model:** The Choice rate is fixed at 40% regardless of devotion. Lost probability is devotion-gated — impossible above 50% devotion, scaling linearly to 30% at 0% devotion. Clean find takes the remainder.

Formula: `lost% = max(0, (50 − devotion%) × 0.6)`

| Devotion at snapshot | Lost % | Choice % | Clean % |
|---|---|---|---|
| 100%–50% | 0% | 40% | 60% |
| 40% | 6% | 40% | 54% |
| 25% | 15% | 40% | 45% |
| 10% | 24% | 40% | 36% |
| 0% | 30% | 40% | 30% |

Cultist count does not affect outcome odds — speed only. Both planets use the same formula; Planet B's risk comes from longer timers and higher stakes loot, not a different probability curve. All values are tunable starting points.

| Outcome | Trigger | Result |
|---|---|---|
| **Clean find** | Devotion ≥ 50% (or luck above) | Artifact or resource cache, no complications |
| **The Choice** | ~40% of returns (devotion-independent) | Player presented with a decision (see §11.3) |
| **Lost** | Devotion < 50%; probability scales to 30% at 0% | Cultists don't return. 50% Anima refund. |

### 11.3 The Choice — Tiered Pool (~25 total)

Choices are drawn from a weighted pool. Minor choices appear often, major occasionally, rare choices are memorable surprises. Players will not see the same choice repeatedly enough to anticipate it.

**Floor interaction:** Choices that would cause cultist loss are greyed out (unselectable) when the cult is at the floor of 3, consistent with the sacrifice button behavior (§6.4). The choice is presented with the floor-breaking option visible but disabled, with a one-line explanation ("Your cult cannot spare anyone").

**Draw weights (tunable):** Minor 60%, Major 30%, Rare 10%. Target frequency: ~1 rare choice per 10 expedition returns on average.

**Minor choices (~12 in pool) — small tradeoffs, quick decisions:**
- *"Your cultists found a shortcut. Rush back now (50% faster, lose 10% loot) or take the full route."*
- *"Something is following them. Spend 50 Anima to ward it off or risk a corrupted return."*
- *"One cultist pocketed a shard. Punish them (lose 1 devotion reset charge) or let it go (they keep it — bonus Gnosis)."*
- *"The gateway flickers. Recall now (safe, half loot) or hold the channel open (full loot, costs 30 Voltis)."*
- *"A local entity offers trade — 80 Gnosis for your entire Voltis cache from this expedition."*

**Major choices (~8 in pool) — meaningful tradeoffs:**
- *"Voidwreath found but it pulses with wrong energy. Cleanse now (costs 200 Gnosis) or take it corrupted."* → Corrupted = artifact counts, Gnosis production -15% until cleansed
- *"One cultist wants to stay behind. Let them go (lose 1 cultist permanently, gain +1 expedition speed bonus forever) or bring everyone home."* [greyed out at floor of 3]
- *"Unknown relic found. Carry it back (slows next expedition 30%) or leave it."* → Unknown relic is either bonus resource cache or minor setback — revealed on arrival
- *"The gateway is destabilising. Abort (safe return, no artifact) or push through (artifact guaranteed, cultists risk not returning)."*

**Rare choices (~5 in pool) — dramatic, memorable:**
- *"Your cultists stumbled into a ritual already in progress. Disrupt it (massive Gnosis gain, but next expedition timer doubled) or withdraw silently."*
- *"A cultist claims to have spoken with something. Their eyes are wrong. Keep them (small chance they've gained forbidden knowledge — bonus research point) or cast them out (lose 1 cultist, lose the risk)."* [cast out greyed out at floor of 3]
- *"The dimension is collapsing. All cultists can make it back but the gateway burns out permanently — or one cultist stays to hold it, lost forever, gateway survives."* [sacrifice option greyed out at floor of 3]

### 11.4 Corruption Mechanic

Corruption is active in Layer 1. When a corrupted artifact is taken, one debuff from the list below is applied at random. Max one active corruption at a time.

**Debuff pool (one drawn randomly on corrupt):**

| Name | Effect |
|---|---|
| **The Gnawing** | Gnosis production −15% |
| **Ash-Taint** | Anima production −10% |
| **The Shuddering Rite** | Discipline cooldown +25% |
| **Veil Sickness** | Expedition timers +20% |
| **Voltis Drain** | Voltis production −15% |

**Cleansing cost: 200 Gnosis** (flat, any debuff). Always visible on the artifact panel with cost shown upfront.

- Second corruption auto-cleanses the first at half cost (100 Gnosis), then applies the new debuff
- "Natural production floor" = 0/min. No debuff can push a resource production rate below zero. If a debuff would do so, the rate is capped at 0 — but the debuff still displays as active in the UI and the full 200 Gnosis cleansing cost still applies
- The Voidwreath major choice ("Cleanse now (costs 200 Gnosis)") uses the standard cleansing cost

---

## 12. The Six Ritual Artifacts

3 crafted, 3 discovered. Each artifact is a **gamechanging reward** — not just a cost for story progress. Completing an artifact should feel like a power spike that opens new strategic options.

| # | Name | Type | Cost | Reward on completion | Unlocks after |
|---|---|---|---|---|---|
| 1 | **Cindermark** | Crafted | Anima-heavy | Passive Anima production +30%, cultist sacrifice yields doubled | Milestone 3 |
| 2 | **Voidwreath** | Discovered | Planet A expedition | Gnosis channel efficiency +40%, unlocks a third expedition slot temporarily | Milestone 5 |
| 3 | **Whisperlock** | Crafted | Gnosis + Anima | Research speed +50%, Phase 1 nodes auto-complete on Rehearsal | Milestone 6 |
| 4 | **Hungering Lens** | Discovered | Planet A expedition (M8) | Voltis soft cap doubled, automation costs -25% | Milestone 8 |
| 5 | **Unbinding** | Crafted | All three trifecta resources | Harmony bonus doubled (e.g. +30-50%), Trifecta threshold lowered | Milestone 9 |
| 6 | **Voicecaller** | Discovered | Full trifecta expedition at high threshold | All production rates +20%, Devotion decay halved permanently | Milestone 11 |

**Crafted artifacts:** Spend resources in defined ratios. Cost requires planning — player may need to temporarily redirect production. This is a designed spike of active engagement. The reward makes the sacrifice worth it.

**Cost progress bar:** All crafted artifacts display a progress bar showing current resource % toward completion cost (e.g., "12% of Anima required"). This sets expectations without editorializing — seeing progress motivates resource allocation without requiring explanation. Always visible on the artifact panel.

**Discovered artifacts:** Send cultists on an expedition. They return with the artifact, a Choice event, or partial loot. Expedition for a discovered artifact has higher stakes than a standard resource run. Higher risk, but the reward justifies the gamble.

**Hungering Lens — dormancy note:** This artifact is found via Planet A expedition (available M8) but its bonuses require Voltis, which doesn't exist until M9. On completion, the artifact screen shows the reward with a marker: *"Awaiting activation — requires Planet B gateway."* Bonuses activate automatically when Planet B is first opened at M9. On expedition return, the ritual circle segment fills immediately — the Lens is "placed" for all purposes, including the M14 six-artifact check. The segment displays the "awaiting activation" marker until M9. Counts toward M11 (first artifact completed) immediately on expedition return, regardless of activation state. When carried into a Rehearsal run, the "awaiting activation" state lasts ~1 hour until Planet B reopens — this is intentional.

**Artifact rewards persist through Rehearsal.** Completed artifacts (and their bonuses) survive prestige. This means each run accumulates permanent power — artifacts are the tangible trophies that make Rehearsal feel worthwhile.

**Artifact screen:** Always accessible. Locked slots show silhouettes, vague requirement hints, AND a preview of the reward. The player should always know what they're working toward. Filling a slot triggers a visual moment — the ritual circle advances. One flavour line per artifact on reveal (content pass TBD).

---

## 13. Talent System — "Dark Boons"

### 13.1 Earning Points
Talent points (called **Dark Boons**) are earned through **Rehearsal** — prestige mid-run.

| Rehearsal checkpoint | Boons earned |
|---|---|
| After milestone 8 (idle moment) | 2 Boons |
| After milestone 10 (full Trifecta) | 3 Boons |
| After milestone 11 (first artifact) | 3 Boons |

Boons accumulate across runs. By run 3–4, player has 6–9 total Boons to allocate.

### 13.2 Spending
Boons are spent **between runs** at the Rehearsal screen. Most nodes cost 1 Boon. Keystones cost 2–3. ~12 nodes total in the tree.

### 13.3 Talent Categories

**Devotion (4 nodes)**
- Cultists start at 80% devotion each run
- Discipline action recharges 50% faster
- Devotion never drops below 30%
- *(Keystone, 2pts)* Devotion collapse impossible — cultists refuse to leave, gateway stays online, stun penalty eliminated

**Channelling (3 nodes)**
- Channel burst gives +50% output (Gnosis or Voltis)
- Sustained Channel costs 30% less Voltis
- Channel cooldown halved (60s base → 30s)

**Expedition (3 nodes)**
- Expeditions return 25% faster
- Failed expeditions return full Anima cost
- *(Keystone, 2pts)* Can run 3 parallel expeditions instead of 2

**Trifecta (2 nodes)**
- Harmony bonus threshold lowered by 20% (easier to maintain)
- Voltis overflow converts to Anima at 50% rate

---

## 14. Milestones (14 across ~10–12 hours)

Each is a moment — flavour, visual beat, arrival feeling. Early milestones are deliberately compressed — the player should hit a new system every 10-20 minutes in the first hour. Pacing slows as complexity grows.

| # | Name | What it unlocks | First-run timing |
|---|---|---|---|
| 1 | **The First Conjuring** | Core loop begins | ~0:02 |
| 2 | **The First Construct** | Build system revealed; first Altar upgrade available | ~0:10 |
| 3 | **The Sacrifice** | First sacrifice performed; passive Anima production begins (+6/min base); Cindermark craftable; Ossuary buildable; gateway becomes buildable (250 Anima) | ~0:25 |
| 4 | **The Gateway Opens** | Gateway construction complete; Planet A accessible; expedition system unlocks; first Trifecta link (Gnosis costs Anima); devotion decay begins (slow); Warding Stones buildable | ~0:45 |
| 5 | **First Gnosis** | Research system unlocks; Scrying Pool buildable | ~1:15 |
| 6 | **The Branching Path** | Phase 1 complete; Phase 2 branches unlock; Whisperlock craftable; Binding Circle buildable | ~2:00 |
| 7 | **Devotion Crisis** | Devotion decay accelerates to normal rate; Discipline action introduced (if not used yet) | ~3:00 |
| 8 | **The Idle Moment** | Anima + Gnosis self-sustain; Hungering Lens expedition available; second Trifecta link; Rehearsal available; Altar Tier 2 buildable | ~4:00 |
| 9 | **The Discovery** | Planet B found; Voltis production begins; third + fourth Trifecta links; Harmony bonus available; Unbinding craftable | ~5:00 |
| 10 | **The Trifecta** | Full idle loop active; Rehearsal available | ~6:30 |
| 11 | **The First Artifact** | First artifact completed (any of the 6); ritual circle stirs; Voicecaller expedition available; Rehearsal available | ~7:30 |
| 12 | **The Hunt** | All remaining artifact unlock conditions now reachable; final pursuit phase begins | ~8:30 |
| 13 | **The Gathering** | 4+ artifacts completed; final push | ~9:30 |
| 14 | **THE SUMMONING** | 6th artifact placed → 5-minute ritual phase begins → demon lord arrives | ~10–12h |

### 14.1 Milestone Trigger Conditions

Every milestone needs an explicit programmatic trigger. Time estimates are approximate — triggers are condition-based, not time-based.

| # | Trigger condition |
|---|---|
| 1 | Game start |
| 2 | ~50 Anima accumulated |
| 3 | Player performs first sacrifice |
| 4 | Gateway construction complete — player pays 250 Anima and confirms build (gateway is visible/buildable from M3 onward) |
| 5 | First 25 Gnosis gathered (any source) |
| 6 | Phase 1 research tree fully purchased (all 4 nodes bought) |
| 7 | Any gateway devotion drops below 60% for the first time |
| 8 | Blood Compact research purchased (conjuring automated) AND sustained channel active AND net Anima rate (sacrifice passive − sustained channel Anima cost) > 0 |
| 9 | Gnosis crosses the Planet B discovery threshold (specific Gnosis total, defined in `src/data/`) |
| 10 | All three resources simultaneously above Harmony threshold for 60+ seconds |
| 11 | First artifact completed (any of the 6) |
| 12 | All 5 remaining artifact unlock milestones have been reached (i.e. all are now pursuable, not necessarily completed) |
| 13 | 4 artifacts completed |
| 14 | All 6 artifacts completed |

> **Milestone 2 note:** The Altar exists from game start as a passive structure (the site of the First Conjuring). At M2, the Build System becomes interactive — the Altar upgrade is the tutorial action that teaches the construct panel. M2 fires on a small Anima threshold (~50 Anima), not a player action.

> **Milestone 5 note:** Voidwreath enters the Planet A loot pool at M5 (when the research system unlocks). This is a pool-level gate — there is no separate "Voidwreath expedition" type to unlock. Any Planet A expedition can return Voidwreath once M5 is reached. Before M5, Planet A expeditions yield resource caches only.

> **Milestone 7 note:** Devotion decay has been happening slowly since M4 — the Crisis is not a new mechanic appearing but an existing one accelerating. The player has seen the gauge moving for ~2 hours. M7 makes it urgent.

> **Milestone 11 note:** This triggers on the *first completed artifact*, regardless of which one. While Cindermark is craftable from milestone 3, its resource cost is tuned so that completion realistically occurs around this timing window. If a player manages to complete one earlier through aggressive play, the milestone fires early — that's a reward, not a bug.

> **Milestone 14 — The Summoning ritual:**
> Placing the 6th artifact auto-triggers the ritual — no separate button. A 5-minute phase begins:
> - All three resources drain visibly into the portal (the systems the player built are consuming themselves for the final act)
> - Devotion must stay above 0% on active gateways. Gateway collapse slows the ritual by 50% until disciplined — cannot fail, only be delayed
> - Active Harmony bonus reduces the timer to ~3 minutes
> - M14 fires on ritual *completion*, not artifact placement
> - Narrative moment on completion: demon lord arrives, Layer 1 complete
>
> The ritual cannot be cancelled or failed permanently. The final minutes should feel like the game cheering the player across the finish line.

> **Milestone 12 note:** "All 6 artifacts visible" was previous language — corrected. The artifact screen shows silhouettes for all 6 slots from the start (§12). M12 fires when all 5 remaining artifacts become pursuable (their unlock milestone conditions are met), signalling to the player that nothing is gated anymore — only time and resources stand between them and the Summoning.

---

## 15. Prestige — "The Rehearsal"

Player triggers Rehearsal at checkpoints (milestones 8, 10, or 11). Sacrifices progress for permanent Boons and bonuses. Choose when to Rehearse — earlier means fewer Boons but a faster restart; later means more Boons and possibly a completed artifact that carries forward.

**What resets:** All resources, constructs, gateways, incomplete artifacts.

**What persists:**
- **Completed artifacts** — survive Rehearsal and count toward the Summoning permanently
- Dark Boon points (accumulated, spent at Rehearsal screen)
- Talent unlocks (permanent — including all Devotion talent nodes)
- **All Phase 1 research nodes auto-complete** on the next run
- **Production multiplier: +15% to all resource production per completed Rehearsal** (permanent, cumulative — e.g. after 3 Rehearsals, +45% to all production)
- Gateway memory — Planet A/B locations known, construct rebuild costs reduced by 40% (permanent after first Rehearsal, caps at 70% after 3 runs)

> **Design note:** Completed artifacts persisting across Rehearsal is a core motivator. It gives every run a tangible trophy and makes the Summoning achievable through accumulated effort across multiple prestige cycles. Players should always feel "I kept something" after a Rehearsal.

> **Artifact bonus activation:** All persisted artifact bonuses activate at game start in subsequent runs — no gate, no delay. The player feels powerful from turn 1. Exception: Hungering Lens bonuses still require Planet B to be open (its own built-in condition, unchanged by this rule).

**Run start summary:** On each new run, a brief summary shows: "The cult remembers: +X% production. Research auto-completed: Y nodes. Construct costs reduced: Z%." Boons available to spend. No explanation needed — numbers tell the story.

**First Rehearsal (M8):** Carries no artifacts (none yet completed). Rewards: 2 Boons + +15% production memory + all Phase 1 research auto-complete + 40% cheaper constructs. This combination meaningfully compresses run 2 — the research shortcuts alone save 45–60 minutes in early game. If at least one artifact is completed before Rehearsing (possible for aggressive players), it persists as well.

**Run duration targets:**

| Run | Rehearse at | Target duration | Notes |
|---|---|---|---|
| 1 | M8 (earliest) | ~10–12h first run | Spend ~4h, then reset |
| 2 (after M8 Rehearsal) | — | ~6–8h | No artifact, but +15% prod + shortcuts |
| 2 (after M10/M11 Rehearsal) | — | ~4–5h | Likely 1 artifact persists |
| 3 | — | ~1.5–2h | 1–2 artifacts + 2 rounds of multipliers |
| 4+ | — | ~30–45 min | |
| Eventually | — | Fully automated | Layer 1 complete |

---

## 16. UI/UX

**Always visible:**
- Anima / Gnosis / Voltis amounts + per-minute rates
- Trifecta health gauge (three bars — red = needs attention)
- Cultist count + assignment summary
- Devotion status per active gateway (small colour indicators)
- Summoning progress — **ritual circle**: 6 segments, one per artifact. Each crafted artifact's segment fills continuously as resources accumulate toward its cost (mirrors the cost progress bar). Each discovered artifact's segment fills when its expedition is active, completing on return. The circle is always moving whenever any crafted artifact is being funded. No separate mechanic — it IS the artifact system visualised.
- Artifact slots — X of 6 complete

**Progressive disclosure:**
- New systems appear only when interactable
- One-time contextual tooltip per system on first appearance
- No tab requires explanation — name tells you what's inside

**Information rules:**
- If a number doesn't tell the player what to *do*, it's not prominent
- Production shown as per-minute
- Negative states use colour, not popups
- Player never needs a second screen to understand what's wrong

---

## 17. Session Design

### Short session (5–10 min)
- At least one meaningful decision available
- Visible forward progress since last session
- At most one thing needing attention (devotion OR trifecta, not both)

### Long idle (overnight)
- Resources at soft cap — production slowed, nothing wasted
- Devotion decayed to floor (15% minimum offline) — clear visual, one obvious fix waiting
- Possibly a completed expedition — artifact or Choice event waiting
- A milestone reached or clearly close

### The handoff feeling
Closing the game: *"the cult is working, I'll check back later."* Not anxiety. Trifecta imbalance never worsens faster than overnight.

---

## 18. Engine Architecture Decisions

### Offline Tick Model
`tick(state, deltaMs)` is a **pure function** — identical behavior regardless of online/offline status. This is the core architecture rule (see CLAUDE.md).

Edge cases are handled by a separate **offline post-processor** that wraps the tick for catch-up:
- **Devotion floor (15%):** Applied after all ticks resolve, not inside tick. Online play has no floor — active neglect still risks collapse.
- **Choice events queued:** Expedition completing offline cannot present an interactive Choice. The offline processor queues these for display when the player returns. **Max 5 queued events** — displayed one at a time on return. If the queue would exceed 5, overflow events auto-resolve as "Return" (safe, no loot, no choice presented). Player receives a single notification: "X expedition outcomes were resolved automatically while you were away."
- **Soft cap math:** Handled *inside* `tick()` via time-to-cap calculation and overflow rate for the remainder — no offline branching needed.

Architecture:
```
tick(state, deltaMs)            → pure, same online and offline
offlineProcessor(state, deltaMs) → wraps tick, applies floors, queues events
```

This preserves the CLAUDE.md tick contract while cleanly solving all three edge cases. See #2 (Engine contracts) and #17 (Save/load).

---

## 19. What to Carry from PoEidler

### Copy directly
| Item | Notes |
|---|---|
| Tech stack | React 19 + TypeScript 6 + Vite 8 + Zustand 5 + Tailwind CSS v4 |
| `package.json` | Same deps — adjust name/version only |
| `eslint.config.js`, `tsconfig*.json`, `vite.config.ts` | Copy verbatim |
| Vitest config | Copy config, leave test files |
| `.github/workflows` | Copy CI verbatim |
| `CLAUDE.md` + `docs/agent-rules.md` | Bring `current-state.md` handoff pattern |
| `scripts/gitstats.ps1` | Bring it |

### Study and adapt
| Item | What to take |
|---|---|
| `upgradeEngine.ts` | The shape: upgrade definition → cost scaling → effect application. Rewrite with new data model. |

### Leave behind
| Item | Why |
|---|---|
| `maps.ts`, `mapDevice.ts`, `MapPreparationPanel.tsx` | Map system is the core design mistake. Don't port concept or code. |
| `gameEngine.ts` | New loop is structurally different. Rewrite from scratch. |
| All `src/components/` | Visual redesign from scratch. "Less Is More" from day one. |

### Architectural rule
In PoEidler, content (`maps.ts`, 781 lines) dwarfed the engine (`gameEngine.ts`, 315 lines).
**In the new game: define engine contracts first, fill content data after.**
Game loop, resource tick, devotion decay, and research tree interfaces get written before a single resource value is hardcoded.

---

## 20. Open Questions (Remaining)

**Design risks (watch during playtesting):**

| # | Risk | Notes |
|---|---|---|
| D1 | **Pre-M3 early game thinness** — 25 min with conjuring as primary action. Two notable moments (M2 Altar, M3 sacrifice) but thin connective tissue. Only a problem if conjuring feedback is weak. Needs strong animation/sound/fill response to feel atmospheric rather than tedious. | Implementation risk, not design fix |
| D2 | **Research branch payoff asymmetry** — Acceleration path pays off immediately (faster expeditions, higher Voltis yield from M5/M9 onward). Automation path pays off later (Overseer's Rite, Harmony boost only meaningful once full Trifecta is active at M9+). In run 1, Acceleration may be the obvious choice. Intentional if Automation is the "comfort" choice for runs 2–4 when Harmony is consistently maintained. Verify the Automation path is genuinely compelling from run 2 onward, not just theoretically equal. | Verify during balance pass |

**Unresolved (need playtesting to confirm):**

| # | Question | Priority | Status |
|---|---|---|---|
| 1 | **Rehearsal checkpoint positions** — now milestones 8/10/11; needs playtesting | Medium | Proposed |
| 2 | **Expedition success rate formula** — proposed formula in #25 | Medium | Proposed — needs playtesting |
| 3 | **Cultist passive recruitment rate** — proposed 1 per 20 min base in #23 | Medium | Proposed — needs playtesting |
| 4 | **Resource soft cap values** — proposed values in #24 | Low | Proposed — needs playtesting |
| 5 | **Choice pool — complete the 25** — 10 seeded above, 15 more to write during implementation | Low (content) | Open |
| 6 | **Artifact flavour text** — one line per artifact for reveal moment | Low (content) | Open |
| 7 | **Artifact reward balance** — reward values need tuning to feel gamechanging without breaking progression | Medium | Proposed — needs playtesting |
| 8 | **Harmony bonus values** — base multiplier and Trifecta threshold need calibration | Medium | Proposed — needs playtesting |
| ~~D1~~ | ~~The Summoning has no spec~~ | ~~High~~ | Resolved — 6th artifact auto-triggers 5-min ritual; devotion-slowed but cannot fail; Harmony shortens to ~3 min; spec in §14 M14 note |
| ~~D2~~ | ~~Ritual circle fill undefined~~ | ~~High~~ | Resolved — 6 segments, one per artifact; crafted = fills with cost progress; discovered = fills on active expedition; spec in §16 |
| ~~D3~~ | ~~Hungering Lens dormancy~~ | ~~Medium~~ | Resolved — intentional; "awaiting Planet B" shown in UI; activates at M9; counts toward M11 immediately; spec in §12 |
| ~~D6~~ | ~~Planet A expedition destinations~~ | ~~Medium~~ | Resolved — single destination, milestone-gated artifact eligibility; two simultaneous expeditions fine; Planet B available from M9; spec in §11.1 |
| ~~G1~~ | ~~Devotion normal rate missing~~ | ~~High~~ | Resolved — 0.5%/min after M7; decay table in §7 |
| ~~G2~~ | ~~Expedition outcome probabilities undefined~~ | ~~High~~ | Resolved — lost% = max(0, (50−devotion)×0.6); Choice always 40%; table in §11.2 |
| ~~G3~~ | ~~Expedition Voltis sustain cost missing~~ | ~~High~~ | Resolved — Planet A: 5 Voltis/min, Planet B: 8 Voltis/min; spec in §11.1 |
| ~~G4~~ | ~~Corruption scope contradictory~~ | ~~High~~ | Resolved — corruption is in Layer 1; 5-debuff pool, 200 Gnosis cleanse; spec in §11.4 |
| ~~G5~~ | ~~"Cultist automation" node effect unclear~~ | ~~High~~ | Resolved — it's Blood Compact (Phase 1 node 3, automates conjuring); spec in §10 |
| ~~G6~~ | ~~"Devotion upgrade tier" duplicates talents~~ | ~~Medium~~ | Resolved — removed from §15 persistence list; covered by "Talent unlocks (permanent)" |
| ~~B1~~ | ~~Conjuring mechanic undefined~~ | ~~High~~ | Resolved — 8 Anima/8s cooldown; speed = cooldown reduction; Blood Compact automates it; spec in §5.1 |
| ~~B2~~ | ~~Sacrifice mechanics undefined~~ | ~~High~~ | Resolved — +6 Anima/min per sacrifice, stackable, multiple intended; Ossuary → +9/min; Cindermark doubles retroactively; spec in §6.5 |
| ~~B3~~ | ~~Gateway construction cost missing~~ | ~~High~~ | Resolved — 250 Anima; buildable from M3; research node 2 gives -20%; spec in §8.4 |
| ~~B4~~ | ~~Expedition timers undefined~~ | ~~High~~ | Resolved — Planet A: 20/15/12 min; Planet B: 35/26/20 min; spec in §11.1 |
| ~~B5~~ | ~~Research tree structure incomplete~~ | ~~High~~ | Resolved — 4 Phase 1 nodes + 3 nodes per Phase 2 branch; all named with costs; Sustained Channel in node 2, Overseer's Rite in Automation branch node 1; spec in §10 |
| ~~B6~~ | ~~Gateway capacity upgrade has no home~~ | ~~High~~ | Resolved — per-gateway direct purchase in gateway panel (not construct/research); costs in §8.5 |
| ~~M1~~ | ~~Research Gnosis budget broken~~ | ~~High~~ | Resolved — Phase 1 (180) + branch (300) = 480, earnable ~500; verified in §10 |
| ~~Q3~~ | ~~Construct system vs milestone 2 trigger~~ | ~~High~~ | Resolved — Altar exists at start; M2 reveals build UI; first action is Altar Tier 1 upgrade (§9, §14) |
| ~~Q5~~ | ~~Choice events vs floor of 3~~ | ~~High~~ | Resolved — floor-breaking options greyed out with explanation, consistent with sacrifice button (§11.3) |
| ~~Q6~~ | ~~Channel action values undefined~~ | ~~High~~ | Resolved — 15 Anima cost, 25 output, 60s cooldown, devotion affects sustained only (§8.1) |
| ~~Q7~~ | ~~Construct system needs a spec~~ | ~~High~~ | Resolved — full construct list in §9.2 |
| ~~Q9~~ | ~~Research tree cost model undefined~~ | ~~High~~ | Resolved — Gnosis only, instant, Phase 1: 30–75 each, Phase 2: 100–150 each, ~400 per branch (§10) |
| ~~Q10~~ | ~~Stunned cultist mechanics incomplete~~ | ~~High~~ | Resolved — cultist stunned 5 min, slot freed, gateway continues at reduced capacity, auto-reassigns on recovery (§6.4) |
| ~~Q13~~ | ~~When does devotion decay start?~~ | ~~High~~ | Resolved — slow decay from M4, accelerates at M7 Crisis event (§7, §14) |
| ~~Q14~~ | ~~First Rehearsal preserves nothing tangible~~ | ~~Medium~~ | Resolved — intentional; 2 Boons + +15% prod + research shortcuts + cost reductions are meaningful; UI shows run-start summary (§15) |
| ~~Q15~~ | ~~Sacrifice + Cindermark new-player trap~~ | ~~Medium~~ | Resolved — cost progress bar on all crafted artifacts + always-visible reward preview (§12) |
| ~~Q16~~ | ~~Offline tick model~~ | ~~High~~ | Resolved — pure tick + offline post-processor; floors/queues handled outside tick (§18) |
| ~~9~~ | ~~Discipline cooldown base rate~~ | ~~High~~ | Resolved — 3 min per-gateway, 5 min global (§7, #26) |
| ~~10~~ | ~~Trifecta activation timing~~ | ~~High~~ | Resolved — phased at milestones 4/7/8/9 (§5) |
| ~~11~~ | ~~Cultist minimum floor vs. devotion collapse~~ | ~~High~~ | Resolved — global floor of 3 (§6.4) |
| ~~12~~ | ~~Expedition devotion speed scaling~~ | ~~High~~ | Resolved — removed; devotion affects outcome odds only, not speed (§11.1) |
| ~~13~~ | ~~Trifecta punishes imbalance~~ | ~~High~~ | Resolved — Harmony bonus rewards balance instead (§5) |
| ~~14~~ | ~~Early pacing too slow~~ | ~~High~~ | Resolved — compressed milestones 1-5 into first 75 min (§14) |
| ~~15~~ | ~~Artifacts are just costs~~ | ~~High~~ | Resolved — each artifact grants gamechanging reward (§12) |

---

## 21. Success Criteria for Layer 1

- [ ] New player understands the goal within 30 seconds — no tutorial wall
- [ ] Every milestone feels like an arrival, not a number ticking over
- [ ] Trifecta enters self-sustaining loop without player intervention
- [ ] Breaking the trifecta is visually obvious and fixable in under 60 seconds
- [ ] A Rehearsal run is faster and more satisfying than the previous one
- [ ] Devotion system creates engagement without anxiety
- [ ] 5-minute session always has a decision and visible progress
- [ ] Overnight idle returns to discovery, not wasted accumulation
- [ ] The Summoning feels like an event — not a button press
- [ ] No number on screen requires explanation
- [ ] At least one expedition Choice per run feels genuinely surprising

---

*All systems tracked as GitHub issues (#1–#26). See `dependency-map.md` for implementation order.*
*All new-issues.md questions resolved as of v0.7. Implementation may begin.*
