import type { GameState } from '../types'

const SUMMONING_DURATION_MS = 5 * 60 * 1000

/**
 * Checks and triggers milestones M1–M14.
 * Milestones are one-shot; once reached they stay reached.
 */
export function milestoneSystem(
  state: GameState,
  _deltaMs: number,
  now: number
): Partial<GameState> {
  const reached = { ...state.milestones.reached }
  let changed = false
  let summoningStartedAt = state.milestones.summoningStartedAt
  let summoningProgress = state.milestones.summoningProgress

  // M1: First 10 Anima
  if (!reached.m1 && state.resources.anima >= 10) {
    reached.m1 = true
    changed = true
  }

  // M2: Gateway Frame built
  if (!reached.m2 && state.constructs['gatewayFrame']?.built === true) {
    reached.m2 = true
    changed = true
  }

  // M3: First sacrifice assignment
  if (!reached.m3 && state.cultists.assignments.some(a => a.role === 'sacrifice')) {
    reached.m3 = true
    changed = true
  }

  // M4: First Planet A gateway built
  if (!reached.m4 && Object.values(state.gateways).some(g => g.planet === 'A')) {
    reached.m4 = true
    changed = true
  }

  // M5: First Gnosis gathered
  if (!reached.m5 && state.resources.gnosis > 0) {
    reached.m5 = true
    changed = true
  }

  // M6: Dread Fortitude purchased (last Phase 1 research node)
  if (!reached.m6 && state.research.nodes['dreadFortitude']?.purchased === true) {
    reached.m6 = true
    changed = true
  }

  // M7: 50 Gnosis gathered
  if (!reached.m7 && state.resources.gnosis >= 50) {
    reached.m7 = true
    changed = true
  }

  // M8: Blood Compact active (conjuring automated)
  if (!reached.m8 && state.meta.conjureAutomated === true) {
    reached.m8 = true
    changed = true
  }

  // M9: Planet B gateway built
  if (!reached.m9 && Object.values(state.gateways).some(g => g.planet === 'B')) {
    reached.m9 = true
    changed = true
  }

  // M10: Harmony bonus achieved
  if (!reached.m10 && state.trifecta.harmonyActive) {
    reached.m10 = true
    changed = true
  }

  // M11: First artifact obtained
  if (!reached.m11 && state.artifacts.some(a => a.obtained)) {
    reached.m11 = true
    changed = true
  }

  // M12: All artifact unlock milestones reached
  if (
    !reached.m12 &&
    reached.m3 && reached.m5 && reached.m6 && reached.m8 && reached.m9 && reached.m11
  ) {
    reached.m12 = true
    changed = true
  }

  // M13: 4+ artifacts obtained
  if (!reached.m13 && state.artifacts.filter(a => a.obtained).length >= 4) {
    reached.m13 = true
    changed = true
  }

  // M14: All 6 artifacts obtained → start Summoning
  if (!reached.m14 && state.artifacts.filter(a => a.obtained).length >= 6) {
    reached.m14 = true
    changed = true
    if (summoningStartedAt === 0) {
      summoningStartedAt = now
    }
  }

  // Summoning progress (5 min ritual after M14)
  if (summoningStartedAt > 0 && summoningProgress < 1) {
    const elapsed = now - summoningStartedAt
    const newProgress = Math.min(elapsed / SUMMONING_DURATION_MS, 1)
    if (newProgress !== summoningProgress) {
      summoningProgress = newProgress
      changed = true
    }
  }

  if (!changed) return {}

  return {
    milestones: {
      ...state.milestones,
      reached,
      summoningStartedAt,
      summoningProgress,
    },
  }
}
