# CULTIST IDLE — Concept Document
> Version 0.5 | April 2026 | Status: Systems Locked (Layer 1) | All issues tracked in GitHub

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
| **Trifecta Balance** | Three resources cross-support each other. Imbalance is a designed mechanic — obvious to spot, satisfying to fix. |
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
- Anima production needs Voltis (automation consumes it)
- Voltis production needs Gnosis (research drives gateway efficiency)
- Gnosis production needs Anima (cultists need Anima to sustain the channel)

**Phased introduction:**
1. **Milestone 4 (~1:30h):** First link — Gnosis channel costs Anima. Player learns "one resource feeds another."
2. **Milestone 9 (~6:30h):** Second link — Voltis production needs Gnosis research level. Two of three links active.
3. **Milestone 10 (~8:00h):** Third link — Anima automation costs Voltis. Full triangle closed. Trifecta gauge lights up.
4. **Milestone 11 (~9:30h):** Trifecta self-sustaining. Player has had ~8 hours of gradually increasing complexity.

**Soft cap — Slow Overflow:**
Above the resource cap, production slows dramatically but never fully stops. Creates a natural rhythm of spending to keep flowing. Never bricks a run. Overflow rate: ~10% of normal production above cap.

**Trifecta UI:** Permanent three-bar or triangular gauge always on screen. Below sustain threshold = turns red. Fix is always one obvious action. No math, no diagnosis puzzle.

---

## 6. Cultist System

### 6.1 Volume & Feel
- **Start:** 5–8 cultists
- **Feel:** Medium pool. Losing one is notable and recoverable, not catastrophic.
- Cultists are a headcount, not named individuals. No deep management.

### 6.2 Growth
- **Passive recruitment:** One new cultist joins every X minutes (slow background drip)
- **Milestone bonuses:** 2–3 cultists join at key progression moments (Gateway opens, Trifecta achieved, etc.)
- Recruitment rate can be improved via the research tree

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
- More cultists on a gateway = higher throughput but more devotion surface to manage

### 6.4 Minimum Cultist Floor

**Global floor of 3 cultists.** No mechanic can reduce the cult below 3 members. This applies to all loss types:

- **Devotion collapse:** If losing a cultist would drop count below 3, the gateway goes offline instead. The cultist stays but is stunned/unavailable for 5 minutes. Still punishing, but recoverable.
- **Expedition loss:** Cultists "narrowly escape" — they return empty-handed but alive.
- **Sacrifice:** Cannot sacrifice if it would drop below 3. Button grayed out with explanation.

The Devotion keystone talent ("collapse impossible, gateway goes offline") still has value: it prevents the 5-minute stun penalty entirely.

### 6.5 Losses
Two types — intentional and preventable (subject to floor above):

**Intentional:**
- **Sacrifice** — player manually sacrifices a cultist for a permanent passive Anima boost. Significant early-game decision.
- **Expedition loss** — cultists sent on low-devotion expeditions risk not returning. 50% Anima refunded.

**Preventable:**
- **Devotion collapse** — if a gateway's devotion hits zero, the cultist assigned there abandons the cult. Lost permanently. This is the bad outcome the devotion system exists to prevent.
- Always telegraphed well in advance — devotion gauge turns red long before collapse.

### 6.6 Prestige Interaction
Each Rehearsal run preserves recruitment speed improvements. Cultists don't carry over — you rebuild the pool each run, but faster each time.

---

## 7. Devotion System

Each gateway has a **Devotion meter** (0–100%) that slowly decays over time. As devotion falls, cultist throughput at that gateway drops proportionally.

**The Discipline action:**
- Player taps a gateway to **Discipline** its cultists — curse them, punish them, re-consecrate the site
- Resets devotion to 100%
- **Base cooldown: 3 minutes per gateway.** In a 5-min session, always available at least once. With 4-6h decay rate, needed roughly every 60-90 minutes — infrequent by design.
- Early game: per-gateway action
- Mid-game research unlock (**Overseer's Rite**): single global action disciplines all gateways at once. **5 minute cooldown** (slightly longer than per-gateway to maintain strategic tension).
- Talent modifier: "50% faster recharge" → per-gateway 1.5 min, global 2.5 min

**Design guardrails:**
- Decay is slow — a 5-min session always has time to act
- Devotion collapse (cultist loss) requires sustained neglect, not a brief lapse
- Trifecta imbalance and devotion decay must not both demand attention simultaneously unless player has neglected both for extended time
- The Discipline action is infrequent and atmospheric — a ritual, not a chore
- **Offline devotion floor:** During offline time, devotion cannot decay below 15%. This prevents permanent cultist loss while the player cannot intervene. On return, devotion at 15% is a clear "fix this" signal without permanent punishment. Online play has no floor — sustained active neglect still risks collapse.

**Prestige interaction:** Each run unlocks permanent Devotion Upgrades — higher starting devotion, slower decay. By run 3–4 it's background noise. Never fully disappears in Layer 1.

---

## 8. Gateway System — "Pull to Passive"

### 8.1 The Channel Action (early)
Gateway is open but not self-sustaining. Player **Channels** — spends Anima for a burst of Gnosis or Voltis. Feels like reaching through a portal. Primary gathering method before automation.

### 8.2 Sustained Channel (research unlock)
Spend Gnosis to unlock a slow passive trickle from the gateway. Costs Voltis to sustain (once Planet B is open). Sacrifices burst efficiency for idle comfort.

### 8.3 Devotion connection
Cultists maintain the channel. Their devotion level directly affects trickle rate. Neglected gateway = devotion decay = slower trickle. Discipline restores it. This is why active engagement never fully disappears — it's tending, not clicking.

### 8.4 Gateway progression
- **Planet A gateway** — unlocked at milestone 4. Produces Gnosis. Devotion-sensitive.
- **Planet B gateway** — discovered via Gnosis threshold (milestone 9). Produces Voltis. Enables automation.
- Further gateways possible (Layer 1 scope: 2 gateways only).

---

## 9. Research Tree

**Shape:** Linear opening, branches earned at a Gnosis threshold (~40% of first-run total).

### Phase 1 — Linear (early game)
No real choices. Just unlocks the next system:
- Conjuring speed
- Gateway construction cost reduction
- Cultist automation unlock
- Devotion decay reduction (tier 1)

### Phase 2 — Two paths (mid-game branch)
Player chooses a run identity. Resource-constrained — can't fully pursue both at once.

| | **Automation Path** | **Acceleration Path** |
|---|---|---|
| Focus | Reduce manual intervention; global Discipline unlock; Trifecta nudge assist | Boost production rates; faster gateway travel; higher Voltis yield |
| Trade-off | Slower raw output, cleaner idle | Higher ceiling, more active attention needed |
| Prestige synergy | Compounds well across runs | Faster individual run speed |

Both paths reach the same endgame capability. Playstyle choice, not power level.

**Trifecta balance (Automation path unlock):** Soft nudge only — if one resource dips below threshold, production marginally shifts to compensate. Does not fully auto-balance. Player still needs to intervene for significant imbalances. Nudge is visible so player knows it's working.

---

## 10. Expedition System — "Into the Void"

### 10.1 Sending
- Assign 1–3 cultists via priority system
- Timer scales with devotion level — devoted cultists move faster
- Multiple expeditions run in parallel, each costs Voltis to sustain the open gateway
- Runs fully in background — no required interaction while active

### 10.2 Return Outcomes

| Outcome | Trigger | Result |
|---|---|---|
| **Clean find** | High devotion + good odds | Artifact or resource cache, no complications |
| **The Choice** | ~40% of returns | Player presented with a decision (see §10.3) |
| **Lost** | Low devotion run | Cultists don't return. 50% Anima refund. |

### 10.3 The Choice — Tiered Pool (~25 total)

Choices are drawn from a weighted pool. Minor choices appear often, major occasionally, rare choices are memorable surprises. Players will not see the same choice repeatedly enough to anticipate it.

**Minor choices (~12 in pool) — small tradeoffs, quick decisions:**
- *"Your cultists found a shortcut. Rush back now (50% faster, lose 10% loot) or take the full route."*
- *"Something is following them. Spend 50 Anima to ward it off or risk a corrupted return."*
- *"One cultist pocketed a shard. Punish them (lose 1 devotion reset charge) or let it go (they keep it — bonus Gnosis)."*
- *"The gateway flickers. Recall now (safe, half loot) or hold the channel open (full loot, costs 30 Voltis)."*
- *"A local entity offers trade — 80 Gnosis for your entire Voltis cache from this expedition."*

**Major choices (~8 in pool) — meaningful tradeoffs:**
- *"Voidwreath found but it pulses with wrong energy. Cleanse now (costs 200 Gnosis) or take it corrupted."* → Corrupted = artifact counts, Gnosis production -15% until cleansed
- *"One cultist wants to stay behind. Let them go (lose 1 cultist permanently, gain +1 expedition speed bonus forever) or bring everyone home."*
- *"Unknown relic found. Carry it back (slows next expedition 30%) or leave it."* → Unknown relic is either bonus resource cache or minor setback — revealed on arrival
- *"The gateway is destabilising. Abort (safe return, no artifact) or push through (artifact guaranteed, cultists risk not returning)."*

**Rare choices (~5 in pool) — dramatic, memorable:**
- *"Your cultists stumbled into a ritual already in progress. Disrupt it (massive Gnosis gain, but next expedition timer doubled) or withdraw silently."*
- *"A cultist claims to have spoken with something. Their eyes are wrong. Keep them (small chance they've gained forbidden knowledge — bonus research point) or cast them out (lose 1 cultist, lose the risk)."*
- *"The dimension is collapsing. All cultists can make it back but the gateway burns out permanently — or one cultist stays to hold it, lost forever, gateway survives."*

### 10.4 Corruption Mechanic
- Corrupted artifact applies one debuff from a defined list (e.g. -15% on one production rate, +20% Discipline cooldown)
- Debuff always visible, always fixable — cleansing cost shown upfront at all times
- Maximum **one corrupted artifact active** at a time
- Second corruption auto-cleanses the first at half cost
- No corruption can reduce a resource below its natural production floor
- Scales with later layers — parked for Layer 1 scope

---

## 11. The Six Ritual Artifacts

3 crafted, 3 discovered. Visually grouped by acquisition type. Player always knows at a glance what kind of effort each requires.

| # | Name | Type | Primary requirement | Unlocks after |
|---|---|---|---|---|
| 1 | **Cindermark** | Crafted | Anima-heavy | Milestone 3 |
| 2 | **Voidwreath** | Discovered | Planet A expedition | Milestone 5 |
| 3 | **Whisperlock** | Crafted | Gnosis + Anima | Milestone 6 |
| 4 | **Hungering Lens** | Discovered | Planet B exploration | Milestone 10 |
| 5 | **Unbinding** | Crafted | All three trifecta resources | Milestone 11 |
| 6 | **Voicecaller** | Discovered | Full trifecta at high threshold | Milestone 12 |

**Crafted artifacts:** Spend resources in defined ratios. Cost requires planning — player may need to temporarily redirect production. This is a designed spike of active engagement.

**Discovered artifacts:** Send cultists on an expedition. They return with the artifact, a Choice event, or partial loot. Expedition for a discovered artifact has higher stakes than a standard resource run.

**Artifact screen:** Always accessible. Locked slots show silhouettes and vague requirement hints. Filling a slot triggers a visual moment — the ritual circle advances. One flavour line per artifact on reveal (content pass TBD).

---

## 12. Talent System — "Dark Boons"

### 12.1 Earning Points
Talent points (called **Dark Boons**) are earned through **Rehearsal** — prestige mid-run.

| Rehearsal checkpoint | Boons earned |
|---|---|
| After milestone 8 (first idle moment) | 1 Boon |
| After milestone 11 (Trifecta balanced) | 2 Boons |
| After milestone 13 (all artifacts visible) | 3 Boons |

Boons accumulate across runs. By run 3–4, player has 4–6 total Boons to allocate.

### 12.2 Spending
Boons are spent **between runs** at the Rehearsal screen. Most nodes cost 1 Boon. Keystones cost 2–3. ~12 nodes total in the tree.

### 12.3 Talent Categories

**Devotion (4 nodes)**
- Cultists start at 80% devotion each run
- Discipline action recharges 50% faster
- Devotion never drops below 30%
- *(Keystone, 2pts)* Devotion collapse impossible — cultists refuse to leave, but collapsed gateway goes offline instead

**Channelling (3 nodes)**
- Channel burst gives +50% Anima
- Sustained Channel costs 30% less Voltis
- Channel cooldown halved

**Expedition (3 nodes)**
- Expeditions return 25% faster
- Failed expeditions return full Anima cost
- *(Keystone, 2pts)* Can run 3 parallel expeditions instead of 2

**Trifecta (2 nodes)**
- Trifecta auto-nudge twice per hour instead of once
- Voltis overflow converts to Anima at 50% rate

---

## 13. Milestones (14 across ~12–15 hours)

Each is a moment — flavour, visual beat, arrival feeling.

| # | Name | What it unlocks | First-run timing |
|---|---|---|---|
| 1 | **The First Conjuring** | Core loop begins | ~0:05 |
| 2 | **The First Construct** | Building system revealed | ~0:20 |
| 3 | **The Sacrifice** | First automation; Cindermark craftable | ~0:45 |
| 4 | **The Gateway Opens** | Planet A accessible | ~1:30 |
| 5 | **First Gnosis** | Research system unlocks; Voidwreath expedition available | ~2:30 |
| 6 | **The First Research** | First meaningful choice; Whisperlock craftable | ~3:30 |
| 7 | **Devotion Crisis** | Devotion system introduced naturally | ~4:30 |
| 8 | **The Idle Moment** | Anima + Gnosis self-sustain; Rehearsal available | ~5:30 |
| 9 | **The Discovery** | Planet B found; Voltis teased | ~6:30 |
| 10 | **First Voltis** | Automation affordable; Hungering Lens expedition available | ~8:00 |
| 11 | **The Trifecta** | Full idle loop; Unbinding craftable; Rehearsal available | ~9:30 |
| 12 | **The First Artifact** | First artifact completed (any of the 6); ritual circle stirs | ~10:30 |

> **Milestone 12 note:** This triggers on the *first completed artifact*, regardless of which one. While Cindermark is craftable from milestone 3, its resource cost is tuned so that completion realistically occurs around this timing window. If a player manages to complete one earlier through aggressive play, the milestone fires early — that's a reward, not a bug. Subsequent artifact completions do not re-trigger this milestone.
| 13 | **The Hunt** | All 6 artifacts visible; Voicecaller expedition available; Rehearsal available | ~11:30 |
| 14 | **THE SUMMONING** | Layer 1 complete | ~13–15h |

---

## 14. Prestige — "The Rehearsal"

Player triggers Rehearsal at checkpoints (milestones 8, 11, or 13). Sacrifices progress for permanent Boons and bonuses.

**What resets:** All resources, constructs, gateways, incomplete artifacts.

**What persists:**
- **Completed artifacts** — survive Rehearsal and count toward the Summoning permanently
- Dark Boon points (accumulated, spent at Rehearsal screen)
- Talent unlocks (permanent)
- Devotion upgrade tier
- Research shortcuts (some early linear nodes auto-complete)
- Production multipliers — small % per run ("the cult remembers")
- Gateway memory — Planet A/B locations known, build cost reduced

> **Design note:** Completed artifacts persisting across Rehearsal is a core motivator. It gives every run a tangible trophy and makes the Summoning achievable through accumulated effort across multiple prestige cycles. Players should always feel "I kept something" after a Rehearsal.

**Run duration targets:**

| Run | Target |
|---|---|
| 1 | ~12–15 hours |
| 2 | ~5–6 hours |
| 3 | ~2 hours |
| 4+ | ~30–45 min |
| Eventually | Layer 1 fully automated |

---

## 15. UI/UX

**Always visible:**
- Anima / Gnosis / Voltis amounts + per-minute rates
- Trifecta health gauge (three bars — red = needs attention)
- Cultist count + assignment summary
- Devotion status per active gateway (small colour indicators)
- Summoning progress — ritual circle, always filling
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

## 16. Session Design

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

## 17. What to Carry from PoEidler

### Copy directly
| Item | Notes |
|---|---|
| Tech stack | React 18 + TypeScript + Vite + Zustand + Tailwind v4 |
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

## 18. Open Questions (Remaining)

| # | Question | Priority | Status |
|---|---|---|---|
| 1 | **Rehearsal checkpoint exact positions** — milestones 8/11/13 feel right but need playtesting | High | Open |
| 2 | **Expedition success rate formula** — proposed formula in #25 | Medium | Proposed — needs playtesting |
| 3 | **Cultist passive recruitment rate** — proposed 1 per 20 min base in #23 | Medium | Proposed — needs playtesting |
| 4 | **Resource soft cap values** — proposed values in #24 | Low | Proposed — needs playtesting |
| 5 | **Choice pool — complete the 25** — 10 seeded above, 15 more to write during implementation | Low (content) | Open |
| 6 | **Artifact flavour text** — one line per artifact for reveal moment | Low (content) | Open |
| ~~7~~ | ~~Discipline cooldown base rate~~ | ~~High~~ | Resolved — 3 min per-gateway, 5 min global (§7, #26) |
| ~~8~~ | ~~Trifecta activation timing~~ | ~~High~~ | Resolved — phased at milestones 4/9/10 (§5) |
| ~~9~~ | ~~Cultist minimum floor vs. devotion collapse~~ | ~~High~~ | Resolved — global floor of 3 (§6.4) |

---

## 19. Success Criteria for Layer 1

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

*Next steps: Resolve remaining Open Questions §18 → per-module system specs → implementation kickoff.*
*All systems tracked as GitHub issues (#1–#26). See `dependency-map.md` for implementation order.*
