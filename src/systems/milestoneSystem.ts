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

  if (!changed) return {}

  return {
    milestones: {
      ...state.milestones,
      reached,
    },
  }
}
