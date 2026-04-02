# Design Risk Recommendations

These are recommendations for design risks identified during the concept doc ↔ issue audit.
These do NOT need new issues — they need design decisions added to existing issues.

---

## Recommendation 9: Cultist minimum floor vs. devotion collapse — race condition

**Affects:** Issue #7 (Cultists), Issue #9 (Devotion)

### The problem

Issue #12 adds a minimum cultist floor of 3 for expeditions (the "narrowly escaped" mechanic). Issue #9 says devotion collapse removes a cultist permanently. But neither issue addresses what happens when both systems try to remove cultists simultaneously.

**Scenario:** Player has 4 cultists. 2 assigned to Gateway A, 2 to Gateway B. Both gateways hit 0% devotion in the same tick (possible during long offline, or if player actively ignores both). Do both cultists collapse? That drops the count to 2 — below the expedition floor and potentially below a functional minimum.

### Recommendation

Add a **global cultist floor of 3** (not just expedition-specific). This floor applies to ALL cultist loss mechanics:

- **Devotion collapse:** If losing a cultist would drop count below 3, the gateway goes offline instead (matching the Devotion keystone talent behavior, but free). The cultist stays but is stunned/unavailable for 5 minutes. This is still punishing but recoverable.
- **Expedition loss:** Already handled by #12's "narrowly escaped" mechanic.
- **Sacrifice:** Cannot sacrifice if it would drop below 3. Button grayed out with explanation.

This means the Devotion keystone talent ("collapse impossible, gateway goes offline") still has value: it prevents the 5-minute stun penalty entirely.

### Where to add this

Add a "Minimum cultist floor" section to issue #7 (Cultist pool) and cross-reference from #9 (Devotion) and #12 (Expeditions).

---

## Recommendation 10: Trifecta activation timing — too late for a "core" mechanic

**Affects:** Issue #6 (Trifecta), Issue #14 (Milestones)

### The problem

Issue #6 says Trifecta cross-dependencies activate "post milestone 10" (~8:00h). Milestone 11 triggers when the Trifecta is balanced (~9:30h). That gives the player only ~1.5 hours to learn, understand, and stabilize the most important resource mechanic in the game — in a 12-15h first run.

The concept doc describes the Trifecta as a "core design pillar" and the game's identity. Introducing it at 53% of the way through the run and resolving it at 63% doesn't give it room to breathe.

### Recommendation

**Phase the Trifecta in gradually instead of a hard activation at milestone 10:**

1. **Milestone 4 (Gateway A opens, ~1:30h):** First dependency appears — Gnosis channel costs Anima. Player learns "one resource feeds another." This is a TWO-way dependency, not yet the full triangle.

2. **Milestone 9 (Planet B found, ~6:30h):** Second dependency appears — Voltis production needs Gnosis research level. Now two of three links are active. Player sees the pattern forming.

3. **Milestone 10 (First Voltis, ~8:00h):** Third and final dependency activates — Anima automation costs Voltis. Full triangle closed. The Trifecta gauge lights up with all three links.

4. **Milestone 11 (~9:30h):** Trifecta is self-sustaining. Player has had ~8 hours of gradually increasing complexity, not a sudden triple-dependency dump.

This matches the concept doc's "progressive disclosure" design principle (§15) — new systems appear only when interactable, and complexity earns its way onto the screen.

### Where to add this

Update issue #6 (Trifecta) acceptance criteria to reflect phased activation. Update issue #14 (Milestones) to include the intermediate dependency triggers at milestones 4 and 9.

---

## Recommendation 11: Discipline cooldown — define the base rate

**Affects:** Issue #9 (Devotion), Issue #11 (Research tree), Issue #15 (Prestige/Talents)

### The problem

The Discipline action has no defined cooldown anywhere — not in the concept doc, not in issue #9. The talent tree references "50% faster recharge" but there's no base to modify.

### Recommendation

**Base per-gateway Discipline cooldown: 3 minutes.**

Reasoning:
- Devotion decays 100% → 0% in ~4-6 hours (from issue #9)
- At 3 min cooldown, player needs to Discipline roughly once per 60-90 minutes to keep devotion healthy
- This matches "infrequent and atmospheric" — a ritual, not a chore
- A 5-min session always has Discipline available (3 min < 5 min)
- With talent (+50% faster → 1.5 min cooldown), devotion becomes genuinely low-maintenance

**Global Discipline (Overseer's Rite): 5 minute cooldown.**
- Covers all gateways, slightly longer than per-gateway to maintain some strategic tension
- With talent: 2.5 min cooldown — trivial for experienced players, as intended

### Where to add this

Add "Base Discipline cooldown: 3 minutes" to issue #9 (Devotion system) under the Discipline action section. Cross-reference in issue #11 (Research tree) where Overseer's Rite is defined, and in issue #15 (Prestige) where the talent modifier is defined.

A dedicated tuning issue for this is included in new-issues.md.
