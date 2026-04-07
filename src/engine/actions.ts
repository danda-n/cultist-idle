import type { GameState, ConstructType } from '../types'
import { getConjureCooldown } from '../utils/conjureHelpers'
import {
  ALTAR_T1_COST_ANIMA,
  ALTAR_T2_COST_ANIMA,
  OSSUARY_COST_ANIMA,
  GATEWAY_FRAME_COST_ANIMA,
} from '../data/constructs'
import { CULTIST_FLOOR } from '../data/cultists'
import {
  GATEWAY_BUILD_COST_ANIMA,
  GATEWAY_CAPACITY_T2_COST_ANIMA,
  GATEWAY_CAPACITY_T2_COST_GNOSIS,
  GATEWAY_CAPACITY_T3_COST_ANIMA,
  GATEWAY_CAPACITY_T3_COST_GNOSIS,
} from '../data/gateways'
import { DISCIPLINE_COOLDOWN_MS } from '../data/devotion'
import { RESEARCH_NODES } from '../data/research'

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

/**
 * Build a Planet A gateway.
 * Requires M2 (Gateway Frame built) and enough Anima.
 * Max 1 Planet A gateway in Phase 2.
 * The Opened Way research grants a 20% discount (non-retroactive).
 */
export function buildGatewayAction(state: GameState, now: number): GameState {
  if (!state.milestones.reached.m2) return state

  // Only one Planet A gateway in Phase 2
  const planetACount = Object.values(state.gateways).filter(g => g.planet === 'A').length
  if (planetACount >= 1) return state

  const openedWayPurchased = state.research.nodes['theOpenedWay']?.purchased === true
  const cost = Math.floor(GATEWAY_BUILD_COST_ANIMA * (openedWayPurchased ? 0.8 : 1.0))

  if (state.resources.anima < cost) return state

  const id = 'gw_' + now

  return {
    ...state,
    resources: {
      ...state.resources,
      anima: state.resources.anima - cost,
    },
    gateways: {
      ...state.gateways,
      [id]: {
        id,
        planet: 'A',
        devotion: 100,
        cultistsAssigned: 0,
        capacity: 1,
        channelActive: false,
        disciplineCooldownUntil: 0,
        stunUntil: 0,
      },
    },
  }
}

/**
 * Toggle the channel rite on/off for a gateway.
 * - Enabling: requires an idle cultist and no active stun.
 * - Disabling: removes all channel assignments for this gateway.
 */
export function toggleChannelAction(state: GameState, gatewayId: string, now: number): GameState {
  const gw = state.gateways[gatewayId]
  if (!gw) return state

  if (gw.channelActive) {
    // Disable channel: remove all channel assignments for this gateway
    const assignments = state.cultists.assignments.filter(
      a => !(a.role === 'channel' && a.gatewayId === gatewayId)
    )
    return {
      ...state,
      cultists: { ...state.cultists, assignments },
      gateways: {
        ...state.gateways,
        [gatewayId]: { ...gw, channelActive: false },
      },
    }
  }

  // Enable channel: need an idle cultist and no stun
  if (gw.stunUntil > now) return state

  const idleCount = state.cultists.count - state.cultists.assignments.length
  if (idleCount <= 0) return state

  const newId = String(state.meta.nextCultistId)
  const newAssignment = {
    cultistId: newId,
    role: 'channel' as const,
    gatewayId,
  }

  return {
    ...state,
    meta: { ...state.meta, nextCultistId: state.meta.nextCultistId + 1 },
    cultists: {
      ...state.cultists,
      assignments: [...state.cultists.assignments, newAssignment],
    },
    gateways: {
      ...state.gateways,
      [gatewayId]: { ...gw, channelActive: true },
    },
  }
}

/**
 * Invoke Discipline on a gateway: reset devotion to 100%, start cooldown, clear stun.
 * Does NOT auto-restart channeling — player must toggle channel on again.
 */
export function disciplineAction(state: GameState, gatewayId: string, now: number): GameState {
  const gw = state.gateways[gatewayId]
  if (!gw) return state
  if (gw.disciplineCooldownUntil >= now) return state

  return {
    ...state,
    gateways: {
      ...state.gateways,
      [gatewayId]: {
        ...gw,
        devotion: 100,
        disciplineCooldownUntil: now + DISCIPLINE_COOLDOWN_MS,
        stunUntil: 0,
      },
    },
  }
}

/**
 * Purchase a research node.
 * - Validates Gnosis cost
 * - Phase 1: requires previous node to be purchased (by order)
 * - Phase 2: requires M6
 * - Blood Compact: sets meta.conjureAutomated = true
 */
export function purchaseResearchNodeAction(state: GameState, nodeId: string): GameState {
  const node = RESEARCH_NODES.find(n => n.id === nodeId)
  if (!node) return state

  if (state.resources.gnosis < node.cost) return state

  // Phase ordering check for phase 1
  if (node.phase === 1) {
    const phase1Nodes = RESEARCH_NODES
      .filter(n => n.phase === 1)
      .sort((a, b) => a.order - b.order)
    const nodeIndex = phase1Nodes.findIndex(n => n.id === nodeId)
    if (nodeIndex > 0) {
      const prevNode = phase1Nodes[nodeIndex - 1]
      if (!state.research.nodes[prevNode.id]?.purchased) return state
    }
  }

  // Phase 2 requires M6
  if (node.phase === 2) {
    if (!state.milestones.reached.m6) return state
  }

  // Already purchased
  if (state.research.nodes[nodeId]?.purchased) return state

  const newNode = {
    id: nodeId,
    phase: node.phase,
    branch: node.branch,
    purchased: true,
  }

  let meta = state.meta
  // Blood Compact effect: automate conjuring
  if (nodeId === 'bloodCompact') {
    meta = { ...state.meta, conjureAutomated: true }
  }

  return {
    ...state,
    resources: {
      ...state.resources,
      gnosis: state.resources.gnosis - node.cost,
    },
    research: {
      ...state.research,
      nodes: {
        ...state.research.nodes,
        [nodeId]: newNode,
      },
    },
    meta,
  }
}

/**
 * Upgrade a gateway's capacity to tier 2 or 3.
 * Costs Anima and Gnosis. Requires current capacity < target tier.
 */
export function upgradeGatewayCapacityAction(
  state: GameState,
  gatewayId: string,
  tier: 2 | 3
): GameState {
  const gw = state.gateways[gatewayId]
  if (!gw) return state
  if (gw.capacity >= tier) return state

  const costAnima = tier === 2 ? GATEWAY_CAPACITY_T2_COST_ANIMA : GATEWAY_CAPACITY_T3_COST_ANIMA
  const costGnosis = tier === 2 ? GATEWAY_CAPACITY_T2_COST_GNOSIS : GATEWAY_CAPACITY_T3_COST_GNOSIS

  if (state.resources.anima < costAnima) return state
  if (state.resources.gnosis < costGnosis) return state

  return {
    ...state,
    resources: {
      ...state.resources,
      anima: state.resources.anima - costAnima,
      gnosis: state.resources.gnosis - costGnosis,
    },
    gateways: {
      ...state.gateways,
      [gatewayId]: { ...gw, capacity: tier },
    },
  }
}

// Re-export CULTIST_FLOOR for use in actions
export { CULTIST_FLOOR }
