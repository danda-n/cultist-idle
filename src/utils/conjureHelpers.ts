import type { GameState } from '../types'
import {
  CONJURE_COOLDOWN_MS,
  CONJURE_ALTAR_T1_COOLDOWN_MS,
  CONJURE_ALTAR_T2_COOLDOWN_MS,
} from '../data/resources'

/**
 * Returns the current conjure cooldown in ms based on altar tier built.
 * - Altar T2 (requires altar built + conjuringRites research): 4800ms
 * - Altar T1: 6000ms
 * - Base: 8000ms
 */
export function getConjureCooldown(state: GameState): number {
  const altar = state.constructs['altar']
  if (altar?.built) {
    if (
      altar.tier === 2 &&
      state.research.nodes['conjuringRites']?.purchased === true
    ) {
      return CONJURE_ALTAR_T2_COOLDOWN_MS
    }
    return CONJURE_ALTAR_T1_COOLDOWN_MS
  }
  return CONJURE_COOLDOWN_MS
}
