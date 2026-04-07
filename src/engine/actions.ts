import type { GameState, ConstructType } from '../types'
import { getConjureCooldown } from '../utils/conjureHelpers'
import {
  ALTAR_T1_COST_ANIMA,
  ALTAR_T2_COST_ANIMA,
  OSSUARY_COST_ANIMA,
  GATEWAY_FRAME_COST_ANIMA,
} from '../data/constructs'
import { CULTIST_FLOOR } from '../data/cultists'

/**
 * Player clicks the conjure button.
 * - If a bar is already active: no-op.
 * - Otherwise: starts a new conjure bar.
 */
export function clickConjureAction(state: GameState, now: number): GameState {
  if (state.meta.conjureActive) return state

  const cooldown = getConjureCooldown(state)
  return {
    ...state,
    meta: {
      ...state.meta,
      conjureActive: true,
      conjureCompletesAt: now + cooldown,
    },
  }
}

/**
 * Assign one idle cultist to sacrifice.
 * Requires: at least one idle cultist (count - assignments.length > 0).
 * Idle means count > FLOOR + number already assigned, to preserve the floor.
 */
export function assignSacrificeAction(state: GameState): GameState {
  const idleCount = state.cultists.count - state.cultists.assignments.length
  // Must keep at least CULTIST_FLOOR total (floor applies to count, not idle)
  // We can assign as long as there's an idle cultist above 0
  if (idleCount <= 0) return state

  const newId = String(state.meta.nextCultistId)
  const newAssignment = { cultistId: newId, role: 'sacrifice' as const }

  return {
    ...state,
    meta: { ...state.meta, nextCultistId: state.meta.nextCultistId + 1 },
    cultists: {
      ...state.cultists,
      assignments: [...state.cultists.assignments, newAssignment],
    },
  }
}

/**
 * Remove one sacrificed cultist (returns to idle).
 * Requires: at least one sacrifice assignment exists.
 */
export function unassignSacrificeAction(state: GameState): GameState {
  const idx = state.cultists.assignments.findLastIndex(a => a.role === 'sacrifice')
  if (idx === -1) return state

  const assignments = [
    ...state.cultists.assignments.slice(0, idx),
    ...state.cultists.assignments.slice(idx + 1),
  ]

  return {
    ...state,
    cultists: { ...state.cultists, assignments },
  }
}

/**
 * Build (or upgrade) a construct.
 * Deducts resources and creates/updates the construct entry.
 *
 * Altar T2 requires:
 *   - constructs['altar']?.built === true
 *   - research.nodes['conjuringRites']?.purchased === true
 */
export function buildConstructAction(
  state: GameState,
  type: ConstructType,
  tier: 1 | 2 = 1
): GameState {
  const cost = getConstructCost(type, tier)
  if (cost === null) return state // unknown construct/tier

  if (state.resources.anima < cost) return state // not enough resources

  // Validate prerequisites
  if (type === 'altar' && tier === 2) {
    if (!state.constructs['altar']?.built) return state
    if (!state.research.nodes['conjuringRites']?.purchased) return state
  }

  // Can't rebuild something already at this tier
  const existing = state.constructs[type]
  if (existing?.built && existing.tier >= tier) return state

  return {
    ...state,
    resources: {
      ...state.resources,
      anima: state.resources.anima - cost,
    },
    constructs: {
      ...state.constructs,
      [type]: {
        type,
        tier,
        built: true,
      },
    },
  }
}

function getConstructCost(type: ConstructType, tier: 1 | 2): number | null {
  if (type === 'altar') {
    if (tier === 1) return ALTAR_T1_COST_ANIMA
    if (tier === 2) return ALTAR_T2_COST_ANIMA
  }
  if (type === 'ossuary' && tier === 1) return OSSUARY_COST_ANIMA
  if (type === 'gatewayFrame' && tier === 1) return GATEWAY_FRAME_COST_ANIMA
  return null
}

// Re-export CULTIST_FLOOR for use in actions
export { CULTIST_FLOOR }
