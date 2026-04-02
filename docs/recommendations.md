# Design Risk Recommendations

These are recommendations for design risks identified during the concept doc ↔ issue audit.
**All three recommendations have been accepted and incorporated into CONCEPT.md v0.5.**

---

## Recommendation 9: Cultist minimum floor vs. devotion collapse — race condition ✅ RESOLVED

**Affects:** #7 (Cultists), #9 (Devotion), #12 (Expeditions)

**Resolution:** Global cultist floor of 3 added to CONCEPT.md §6.4. Applies to all loss mechanics: devotion collapse (gateway goes offline + 5-min stun instead), expedition loss (narrowly escaped), and sacrifice (button grayed out). The Devotion keystone talent retains value by removing the stun penalty.

---

## Recommendation 10: Trifecta activation timing — too late for a "core" mechanic ✅ RESOLVED

**Affects:** #6 (Trifecta), #14 (Milestones)

**Resolution:** Phased Trifecta activation added to CONCEPT.md §5. Dependencies now introduced gradually:
1. Milestone 4 (~1:30h): first link (Gnosis costs Anima)
2. Milestone 9 (~6:30h): second link (Voltis needs Gnosis)
3. Milestone 10 (~8:00h): third link (Anima automation costs Voltis) — full triangle
4. Milestone 11 (~9:30h): Trifecta self-sustaining

Player has ~8 hours of gradually increasing complexity instead of a sudden triple-dependency dump.

---

## Recommendation 11: Discipline cooldown — define the base rate ✅ RESOLVED

**Affects:** #9 (Devotion), #11 (Research tree), #15 (Prestige/Talents), #26 (Discipline cooldown tuning)

**Resolution:** Base values added to CONCEPT.md §7:
- Per-gateway cooldown: **3 minutes**
- Global Discipline (Overseer's Rite): **5 minutes**
- Talent "50% faster": per-gateway 1.5 min, global 2.5 min

Dedicated tuning issue created as #26 for playtesting calibration.
