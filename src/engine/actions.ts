import type { GameState, ConstructType, ArtifactState } from '../types'
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
  GATEWAY_PLANET_B_BUILD_COST_ANIMA,
  GATEWAY_PLANET_B_BUILD_COST_GNOSIS,
} from '../data/gateways'
import { DISCIPLINE_COOLDOWN_MS } from '../data/devotion'
import { RESEARCH_NODES } from '../data/research'
import { ARTIFACT_CONFIGS } from '../data/artifacts'
import {
  EXPEDITION_TIMERS,
  EXPEDITION_SLOTS_DEFAULT,
  EXPEDITION_SLOTS_MAX,
  CORRUPTION_CLEANSE_FULL_GNOSIS,
} from '../data/expeditions'

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
 * Add one channeling cultist to a gateway (up to its capacity).
 * - Requires: idle cultist, no stun, channelingCount < capacity.
 * - Sets channelActive=true if it was false.
 */
export function addChannelerAction(state: GameState, gatewayId: string, now: number): GameState {
  const gw = state.gateways[gatewayId]
  if (!gw) return state
  if (gw.stunUntil > now) return state

  const channelingCount = state.cultists.assignments.filter(
    a => a.role === 'channel' && a.gatewayId === gatewayId
  ).length
  if (channelingCount >= gw.capacity) return state

  const idleCount = state.cultists.count - state.cultists.assignments.length
  if (idleCount <= 0) return state

  const newId = String(state.meta.nextCultistId)
  return {
    ...state,
    meta: { ...state.meta, nextCultistId: state.meta.nextCultistId + 1 },
    cultists: {
      ...state.cultists,
      assignments: [
        ...state.cultists.assignments,
        { cultistId: newId, role: 'channel' as const, gatewayId },
      ],
    },
    gateways: {
      ...state.gateways,
      [gatewayId]: { ...gw, channelActive: true },
    },
  }
}

/**
 * Remove one channeling cultist from a gateway.
 * - Sets channelActive=false when the last channeler is removed.
 */
export function removeChannelerAction(state: GameState, gatewayId: string): GameState {
  const gw = state.gateways[gatewayId]
  if (!gw) return state

  const idx = state.cultists.assignments.findLastIndex(
    a => a.role === 'channel' && a.gatewayId === gatewayId
  )
  if (idx === -1) return state

  const assignments = [
    ...state.cultists.assignments.slice(0, idx),
    ...state.cultists.assignments.slice(idx + 1),
  ]

  const remainingCount = assignments.filter(
    a => a.role === 'channel' && a.gatewayId === gatewayId
  ).length

  return {
    ...state,
    cultists: { ...state.cultists, assignments },
    gateways: {
      ...state.gateways,
      [gatewayId]: { ...gw, channelActive: remainingCount > 0 },
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

/**
 * Send an expedition to Planet A or B.
 * - Requires appropriate milestone (M4 for A, M9 for B)
 * - Requires idle cultists
 * - Requires available expedition slots
 * - Requires 1–3 cultists
 */
export function sendExpeditionAction(
  state: GameState,
  planet: 'A' | 'B',
  cultistCount: number,
  now: number
): GameState {
  // Milestone requirement
  if (planet === 'A' && !state.milestones.reached.m4) return state
  if (planet === 'B' && !state.milestones.reached.m9) return state

  // Cultist count validation
  const validCount = Math.max(1, Math.min(3, cultistCount)) as 1 | 2 | 3
  if (validCount !== cultistCount) return state

  // Available slots
  const voidwreathObtained = state.artifacts.some(a => a.id === 'voidwreath' && a.obtained && !a.dormant)
  const maxSlots = voidwreathObtained ? EXPEDITION_SLOTS_MAX : EXPEDITION_SLOTS_DEFAULT
  const pendingCount = state.expeditions.filter(e => e.outcome === 'pending').length
  if (pendingCount >= maxSlots) return state

  // Idle cultist check
  const idleCount = state.cultists.count - state.cultists.assignments.length
  if (idleCount < cultistCount) return state

  // Compute duration using pre-computed timer table
  const duration = EXPEDITION_TIMERS[planet][validCount]

  // Snapshot devotion: average of gateways on that planet (or 100 if none)
  const planetGateways = Object.values(state.gateways).filter(g => g.planet === planet)
  const devotionSnapshot = planetGateways.length > 0
    ? planetGateways.reduce((sum, g) => sum + g.devotion, 0) / planetGateways.length
    : 100

  // Create expedition ID
  const expeditionId = `exp_${now}_${state.meta.nextExpeditionId}`

  // Assign idle cultists
  const newAssignments = [...state.cultists.assignments]
  let nextCultistId = state.meta.nextCultistId
  for (let i = 0; i < cultistCount; i++) {
    newAssignments.push({
      cultistId: String(nextCultistId++),
      role: 'expedition',
      expeditionId,
    })
  }

  return {
    ...state,
    meta: {
      ...state.meta,
      nextCultistId,
      nextExpeditionId: state.meta.nextExpeditionId + 1,
    },
    cultists: {
      ...state.cultists,
      assignments: newAssignments,
    },
    expeditions: [
      ...state.expeditions,
      {
        id: expeditionId,
        planet,
        cultistIds: newAssignments
          .filter(a => a.expeditionId === expeditionId)
          .map(a => a.cultistId),
        devotionSnapshot,
        completesAt: now + duration,
        outcome: 'pending',
      },
    ],
  }
}

/**
 * Resolve a choice event for an expedition.
 * Applies option effects and releases cultist assignments.
 */
export function resolveChoiceAction(
  state: GameState,
  expeditionId: string,
  optionId: string,
  now: number
): GameState {
  const expIdx = state.expeditions.findIndex(e => e.id === expeditionId)
  if (expIdx === -1) return state

  const exp = state.expeditions[expIdx]
  if (exp.outcome !== 'choice') return state
  if (!exp.choiceEvent) return state
  if (exp.choiceEvent.resolvedOptionId) return state

  let anima = state.resources.anima
  let gnosis = state.resources.gnosis
  let voltis = state.resources.voltis
  let cultistCount = state.cultists.count

  const choiceId = exp.choiceEvent.id

  // Apply option effects
  if (choiceId === 'c1' && optionId === 'take') {
    anima += 60
  }
  if (choiceId === 'c2' && optionId === 'trade') {
    gnosis += 30
  }
  if (choiceId === 'c3' && optionId === 'hold') {
    anima += 80
    gnosis += 40
    voltis = Math.max(0, voltis - 30)
  }
  if (choiceId === 'c3' && optionId === 'recall') {
    anima += 40
  }
  if (choiceId === 'c4' && optionId === 'trade') {
    gnosis += 80
    voltis = 0
  }
  if (choiceId === 'c5' && optionId === 'sacrifice') {
    anima += 50
  }
  if (choiceId === 'c6' && optionId === 'absorb') {
    gnosis += 150
    // Lose one cultist (floor at CULTIST_FLOOR)
    cultistCount = Math.max(CULTIST_FLOOR, cultistCount - 1)
  }

  // Release cultist assignments for this expedition
  const assignments = state.cultists.assignments.filter(a => a.expeditionId !== expeditionId)

  // Update expedition with resolved option
  const updatedExp = {
    ...exp,
    choiceEvent: {
      ...exp.choiceEvent,
      resolvedOptionId: optionId,
    },
    outcome: 'safe' as const,
  }

  const expeditions = [
    ...state.expeditions.slice(0, expIdx),
    updatedExp,
    ...state.expeditions.slice(expIdx + 1),
  ]

  void now // used for future timestamp tracking

  return {
    ...state,
    resources: { ...state.resources, anima, gnosis, voltis },
    cultists: { ...state.cultists, count: cultistCount, assignments },
    expeditions,
  }
}

/**
 * Craft an artifact.
 * - Validates milestone, resources, and that it's not already obtained
 * - Deducts resources, sets artifact to obtained
 */
export function craftArtifactAction(
  state: GameState,
  artifactId: string,
  now: number
): GameState {
  void now

  const config = ARTIFACT_CONFIGS.find(a => a.id === artifactId)
  if (!config) return state
  if (config.source !== 'crafted') return state
  if (!config.cost) return state

  // Milestone unlock check
  const unlockMilestone = config.discoveryUnlocksAtMilestone
  if (unlockMilestone && !state.milestones.reached[unlockMilestone as keyof typeof state.milestones.reached]) {
    return state
  }

  // Already obtained
  if (state.artifacts.some(a => a.id === artifactId && a.obtained)) return state

  // Resource check
  const { anima: costAnima = 0, gnosis: costGnosis = 0, voltis: costVoltis = 0 } = config.cost
  if (state.resources.anima < costAnima) return state
  if (state.resources.gnosis < costGnosis) return state
  if (state.resources.voltis < costVoltis) return state

  // Deduct resources
  const newResources = {
    ...state.resources,
    anima: state.resources.anima - costAnima,
    gnosis: state.resources.gnosis - costGnosis,
    voltis: state.resources.voltis - costVoltis,
  }

  // Update or create artifact state
  const newArtifact: ArtifactState = {
    id: config.id as ArtifactState['id'],
    source: 'crafted',
    progress: 1,
    obtained: true,
    dormant: false,
  }

  const existingIdx = state.artifacts.findIndex(a => a.id === artifactId)
  const artifacts = existingIdx >= 0
    ? [
        ...state.artifacts.slice(0, existingIdx),
        newArtifact,
        ...state.artifacts.slice(existingIdx + 1),
      ]
    : [...state.artifacts, newArtifact]

  return {
    ...state,
    resources: newResources,
    artifacts,
  }
}

/**
 * Build a Planet B gateway.
 * Requires M8 (Blood Compact active) and enough resources.
 * Max 1 Planet B gateway.
 */
export function buildPlanetBGatewayAction(state: GameState, now: number): GameState {
  // Require M8 (Blood Compact — gateway discovery trigger)
  if (!state.milestones.reached.m8) return state

  // Max 1 Planet B gateway
  const planetBCount = Object.values(state.gateways).filter(g => g.planet === 'B').length
  if (planetBCount >= 1) return state

  if (state.resources.anima < GATEWAY_PLANET_B_BUILD_COST_ANIMA) return state
  if (state.resources.gnosis < GATEWAY_PLANET_B_BUILD_COST_GNOSIS) return state

  const id = 'gw_b_' + now

  return {
    ...state,
    resources: {
      ...state.resources,
      anima: state.resources.anima - GATEWAY_PLANET_B_BUILD_COST_ANIMA,
      gnosis: state.resources.gnosis - GATEWAY_PLANET_B_BUILD_COST_GNOSIS,
    },
    gateways: {
      ...state.gateways,
      [id]: {
        id,
        planet: 'B',
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
 * Cleanse the active corruption.
 * Requires: corruption.active !== null and enough Gnosis.
 */
export function cleanseCorruptionAction(state: GameState): GameState {
  if (state.corruption.active === null) return state
  if (state.resources.gnosis < CORRUPTION_CLEANSE_FULL_GNOSIS) return state

  return {
    ...state,
    resources: {
      ...state.resources,
      gnosis: state.resources.gnosis - CORRUPTION_CLEANSE_FULL_GNOSIS,
    },
    corruption: {
      active: null,
      cleanseProgress: 0,
    },
  }
}

// Re-export CULTIST_FLOOR for use in actions
export { CULTIST_FLOOR }
