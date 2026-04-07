import type { GameState } from '../types'

/**
 * Checks and triggers Phase 1 milestones (M1, M2, M3).
 * Milestones are one-shot; once reached they stay reached.
 *
 * M1: resources.anima >= 10 (first time)
 * M2: constructs['gatewayFrame']?.built === true (first time)
 * M3: any cultist assignment with role === 'sacrifice' (first time)
 */
export function milestoneSystem(
  state: GameState,
  _deltaMs: number,
  _now: number
): Partial<GameState> {
  const reached = { ...state.milestones.reached }
  let changed = false

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

  if (!changed) return {}

  return {
    milestones: {
      ...state.milestones,
      reached,
    },
  }
}
