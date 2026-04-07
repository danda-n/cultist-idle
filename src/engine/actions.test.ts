import { describe, it, expect } from 'vitest'
import {
  buildGatewayAction,
  toggleChannelAction,
  disciplineAction,
  purchaseResearchNodeAction,
  upgradeGatewayCapacityAction,
  sendExpeditionAction,
  resolveChoiceAction,
  craftArtifactAction,
  buildPlanetBGatewayAction,
} from './actions'
import { createInitialState } from './initialState'
import type { GameState, GatewayState, ExpeditionState, ArtifactState, ChoiceEvent } from '../types'
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
import { DEVOTION_COLLAPSE_STUN_MS } from '../data/devotion'
import { CULTIST_FLOOR } from '../data/cultists'

const NOW = 100_000

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides }
}

function withM2(state: GameState): GameState {
  return {
    ...state,
    milestones: {
      ...state.milestones,
      reached: { ...state.milestones.reached, m2: true },
    },
  }
}

function makeGateway(overrides: Partial<GatewayState> = {}): GatewayState {
  return {
    id: 'gw_test',
    planet: 'A',
    devotion: 100,
    cultistsAssigned: 0,
    capacity: 1,
    channelActive: false,
    disciplineCooldownUntil: 0,
    stunUntil: 0,
    ...overrides,
  }
}

// ============================================================
// buildGatewayAction
// ============================================================
describe('buildGatewayAction', () => {
  it('does nothing when M2 not reached', () => {
    const state = makeState({
      resources: { anima: 300, gnosis: 0, voltis: 0 },
    })
    const next = buildGatewayAction(state, NOW)
    expect(next).toBe(state)
  })

  it('does nothing when not enough Anima', () => {
    const state = withM2(makeState({
      resources: { anima: 100, gnosis: 0, voltis: 0 },
    }))
    const next = buildGatewayAction(state, NOW)
    expect(next).toBe(state)
  })

  it('builds a gateway and deducts Anima', () => {
    const state = withM2(makeState({
      resources: { anima: 300, gnosis: 0, voltis: 0 },
    }))
    const next = buildGatewayAction(state, NOW)
    expect(next.resources.anima).toBe(300 - GATEWAY_BUILD_COST_ANIMA)
    const gws = Object.values(next.gateways)
    expect(gws).toHaveLength(1)
    expect(gws[0].planet).toBe('A')
    expect(gws[0].devotion).toBe(100)
    expect(gws[0].capacity).toBe(1)
    expect(gws[0].stunUntil).toBe(0)
  })

  it('does not allow building a second Planet A gateway', () => {
    const state = withM2(makeState({
      resources: { anima: 600, gnosis: 0, voltis: 0 },
      gateways: {
        existing: makeGateway({ id: 'existing', planet: 'A' }),
      },
    }))
    const next = buildGatewayAction(state, NOW)
    expect(next).toBe(state)
  })

  it('applies 20% discount when The Opened Way is purchased', () => {
    const state = withM2(makeState({
      resources: { anima: 300, gnosis: 0, voltis: 0 },
      research: {
        nodes: {
          theOpenedWay: { id: 'theOpenedWay', phase: 1, purchased: true },
        },
      },
    }))
    const discountedCost = Math.floor(GATEWAY_BUILD_COST_ANIMA * 0.8)
    const next = buildGatewayAction(state, NOW)
    expect(next.resources.anima).toBe(300 - discountedCost)
  })
})

// ============================================================
// toggleChannelAction
// ============================================================
describe('toggleChannelAction', () => {
  it('does nothing for unknown gateway', () => {
    const state = makeState()
    const next = toggleChannelAction(state, 'nonexistent', NOW)
    expect(next).toBe(state)
  })

  it('assigns an idle cultist and enables channel when activating', () => {
    const state = makeState({
      gateways: { gw_test: makeGateway({ id: 'gw_test', channelActive: false }) },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [],
      },
    })
    const next = toggleChannelAction(state, 'gw_test', NOW)
    expect(next.gateways['gw_test'].channelActive).toBe(true)
    const channelAssignments = next.cultists.assignments.filter(
      a => a.role === 'channel' && a.gatewayId === 'gw_test'
    )
    expect(channelAssignments).toHaveLength(1)
  })

  it('does not activate when no idle cultists', () => {
    const state = makeState({
      gateways: { gw_test: makeGateway({ id: 'gw_test', channelActive: false }) },
      cultists: {
        ...createInitialState().cultists,
        count: 3,
        // all 3 cultists already assigned
        assignments: [
          { cultistId: '1', role: 'sacrifice' },
          { cultistId: '2', role: 'sacrifice' },
          { cultistId: '3', role: 'sacrifice' },
        ],
      },
    })
    const next = toggleChannelAction(state, 'gw_test', NOW)
    expect(next).toBe(state)
  })

  it('does not activate when stunned', () => {
    const state = makeState({
      gateways: {
        gw_test: makeGateway({ id: 'gw_test', channelActive: false, stunUntil: NOW + 60_000 }),
      },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [],
      },
    })
    const next = toggleChannelAction(state, 'gw_test', NOW)
    expect(next).toBe(state)
  })

  it('disables channel and removes channel assignments when deactivating', () => {
    const state = makeState({
      gateways: { gw_test: makeGateway({ id: 'gw_test', channelActive: true }) },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [
          { cultistId: '1', role: 'channel', gatewayId: 'gw_test' },
        ],
      },
    })
    const next = toggleChannelAction(state, 'gw_test', NOW)
    expect(next.gateways['gw_test'].channelActive).toBe(false)
    expect(next.cultists.assignments.filter(a => a.gatewayId === 'gw_test')).toHaveLength(0)
  })
})

// ============================================================
// disciplineAction
// ============================================================
describe('disciplineAction', () => {
  it('does nothing for unknown gateway', () => {
    const state = makeState()
    const next = disciplineAction(state, 'nonexistent', NOW)
    expect(next).toBe(state)
  })

  it('resets devotion to 100% and sets cooldown', () => {
    const state = makeState({
      gateways: {
        gw_test: makeGateway({ id: 'gw_test', devotion: 30, disciplineCooldownUntil: 0 }),
      },
    })
    const next = disciplineAction(state, 'gw_test', NOW)
    expect(next.gateways['gw_test'].devotion).toBe(100)
    expect(next.gateways['gw_test'].disciplineCooldownUntil).toBe(NOW + DISCIPLINE_COOLDOWN_MS)
  })

  it('clears stun on discipline', () => {
    const state = makeState({
      gateways: {
        gw_test: makeGateway({
          id: 'gw_test',
          devotion: 0,
          stunUntil: NOW + DEVOTION_COLLAPSE_STUN_MS,
          disciplineCooldownUntil: 0,
        }),
      },
    })
    const next = disciplineAction(state, 'gw_test', NOW)
    expect(next.gateways['gw_test'].stunUntil).toBe(0)
    expect(next.gateways['gw_test'].devotion).toBe(100)
  })

  it('does nothing when on cooldown', () => {
    const state = makeState({
      gateways: {
        gw_test: makeGateway({ id: 'gw_test', devotion: 30, disciplineCooldownUntil: NOW + 1000 }),
      },
    })
    const next = disciplineAction(state, 'gw_test', NOW)
    expect(next).toBe(state)
  })

  it('does not auto-restart channeling', () => {
    const state = makeState({
      gateways: {
        gw_test: makeGateway({ id: 'gw_test', devotion: 0, channelActive: false, disciplineCooldownUntil: 0 }),
      },
    })
    const next = disciplineAction(state, 'gw_test', NOW)
    expect(next.gateways['gw_test'].channelActive).toBe(false)
  })
})

// ============================================================
// purchaseResearchNodeAction
// ============================================================
describe('purchaseResearchNodeAction', () => {
  it('does nothing for unknown node', () => {
    const state = makeState({
      resources: { anima: 0, gnosis: 100, voltis: 0 },
    })
    const next = purchaseResearchNodeAction(state, 'unknown_node')
    expect(next).toBe(state)
  })

  it('does nothing when not enough Gnosis', () => {
    const state = makeState({
      resources: { anima: 0, gnosis: 5, voltis: 0 },
    })
    const next = purchaseResearchNodeAction(state, 'conjuringRites')
    expect(next).toBe(state)
  })

  it('purchases first phase 1 node and deducts Gnosis', () => {
    const state = makeState({
      resources: { anima: 0, gnosis: 50, voltis: 0 },
    })
    const next = purchaseResearchNodeAction(state, 'conjuringRites')
    // conjuringRites costs 30 Gnosis
    expect(next.resources.gnosis).toBe(50 - 30)
    expect(next.research.nodes['conjuringRites']?.purchased).toBe(true)
  })

  it('does not purchase second node when first not purchased', () => {
    const state = makeState({
      resources: { anima: 0, gnosis: 100, voltis: 0 },
    })
    const next = purchaseResearchNodeAction(state, 'theOpenedWay')
    expect(next).toBe(state)
  })

  it('allows purchasing second node when first is purchased', () => {
    const state = makeState({
      resources: { anima: 0, gnosis: 100, voltis: 0 },
      research: {
        nodes: { conjuringRites: { id: 'conjuringRites', phase: 1, purchased: true } },
      },
    })
    const next = purchaseResearchNodeAction(state, 'theOpenedWay')
    // theOpenedWay costs 40 Gnosis
    expect(next.resources.gnosis).toBe(100 - 40)
    expect(next.research.nodes['theOpenedWay']?.purchased).toBe(true)
  })

  it('sets conjureAutomated when Blood Compact is purchased', () => {
    const state = makeState({
      resources: { anima: 0, gnosis: 100, voltis: 0 },
      research: {
        nodes: {
          conjuringRites: { id: 'conjuringRites', phase: 1, purchased: true },
          theOpenedWay: { id: 'theOpenedWay', phase: 1, purchased: true },
        },
      },
    })
    const next = purchaseResearchNodeAction(state, 'bloodCompact')
    expect(next.meta.conjureAutomated).toBe(true)
    expect(next.research.nodes['bloodCompact']?.purchased).toBe(true)
  })

  it('does not purchase phase 2 nodes before M6', () => {
    const state = makeState({
      resources: { anima: 0, gnosis: 200, voltis: 0 },
    })
    const next = purchaseResearchNodeAction(state, 'dominion1')
    expect(next).toBe(state)
  })

  it('allows purchasing phase 2 nodes after M6', () => {
    const state = {
      ...makeState({
        resources: { anima: 0, gnosis: 200, voltis: 0 },
      }),
      milestones: {
        ...createInitialState().milestones,
        reached: { ...createInitialState().milestones.reached, m6: true },
      },
    }
    const next = purchaseResearchNodeAction(state, 'dominion1')
    expect(next.research.nodes['dominion1']?.purchased).toBe(true)
  })

  it('does not re-purchase an already purchased node', () => {
    const state = makeState({
      resources: { anima: 0, gnosis: 100, voltis: 0 },
      research: {
        nodes: { conjuringRites: { id: 'conjuringRites', phase: 1, purchased: true } },
      },
    })
    const next = purchaseResearchNodeAction(state, 'conjuringRites')
    expect(next).toBe(state)
  })
})

// ============================================================
// upgradeGatewayCapacityAction
// ============================================================
describe('upgradeGatewayCapacityAction', () => {
  it('does nothing for unknown gateway', () => {
    const state = makeState()
    const next = upgradeGatewayCapacityAction(state, 'nonexistent', 2)
    expect(next).toBe(state)
  })

  it('upgrades to tier 2 and deducts Anima + Gnosis', () => {
    const state = makeState({
      resources: {
        anima: GATEWAY_CAPACITY_T2_COST_ANIMA + 50,
        gnosis: GATEWAY_CAPACITY_T2_COST_GNOSIS + 20,
        voltis: 0,
      },
      gateways: { gw_test: makeGateway({ id: 'gw_test', capacity: 1 }) },
    })
    const next = upgradeGatewayCapacityAction(state, 'gw_test', 2)
    expect(next.gateways['gw_test'].capacity).toBe(2)
    expect(next.resources.anima).toBe(50)
    expect(next.resources.gnosis).toBe(20)
  })

  it('upgrades to tier 3 and deducts Anima + Gnosis', () => {
    const state = makeState({
      resources: {
        anima: GATEWAY_CAPACITY_T3_COST_ANIMA + 50,
        gnosis: GATEWAY_CAPACITY_T3_COST_GNOSIS + 20,
        voltis: 0,
      },
      gateways: { gw_test: makeGateway({ id: 'gw_test', capacity: 2 }) },
    })
    const next = upgradeGatewayCapacityAction(state, 'gw_test', 3)
    expect(next.gateways['gw_test'].capacity).toBe(3)
    expect(next.resources.anima).toBe(50)
    expect(next.resources.gnosis).toBe(20)
  })

  it('does nothing when capacity already at target tier', () => {
    const state = makeState({
      resources: {
        anima: 500,
        gnosis: 500,
        voltis: 0,
      },
      gateways: { gw_test: makeGateway({ id: 'gw_test', capacity: 2 }) },
    })
    const next = upgradeGatewayCapacityAction(state, 'gw_test', 2)
    expect(next).toBe(state)
  })

  it('does nothing when not enough Anima', () => {
    const state = makeState({
      resources: { anima: 10, gnosis: GATEWAY_CAPACITY_T2_COST_GNOSIS, voltis: 0 },
      gateways: { gw_test: makeGateway({ id: 'gw_test', capacity: 1 }) },
    })
    const next = upgradeGatewayCapacityAction(state, 'gw_test', 2)
    expect(next).toBe(state)
  })

  it('does nothing when not enough Gnosis', () => {
    const state = makeState({
      resources: { anima: GATEWAY_CAPACITY_T2_COST_ANIMA, gnosis: 5, voltis: 0 },
      gateways: { gw_test: makeGateway({ id: 'gw_test', capacity: 1 }) },
    })
    const next = upgradeGatewayCapacityAction(state, 'gw_test', 2)
    expect(next).toBe(state)
  })
})

// ============================================================
// sendExpeditionAction
// ============================================================
function withMilestone(state: GameState, ...milestones: string[]): GameState {
  const reached = { ...state.milestones.reached }
  for (const m of milestones) {
    reached[m as keyof typeof reached] = true
  }
  return {
    ...state,
    milestones: { ...state.milestones, reached },
  }
}

describe('sendExpeditionAction', () => {
  it('does nothing when M4 not reached for Planet A', () => {
    const state = makeState({
      cultists: { count: 5, assignments: [], nextRecruitAt: 0 },
    })
    const next = sendExpeditionAction(state, 'A', 2, NOW)
    expect(next).toBe(state)
  })

  it('does nothing when M9 not reached for Planet B', () => {
    const state = withMilestone(makeState({
      cultists: { count: 5, assignments: [], nextRecruitAt: 0 },
    }), 'm4')
    const next = sendExpeditionAction(state, 'B', 1, NOW)
    expect(next).toBe(state)
  })

  it('does nothing when not enough idle cultists', () => {
    const state = withMilestone(makeState({
      cultists: { count: 3, assignments: [], nextRecruitAt: 0 },
    }), 'm4')
    // Try to send 4 cultists (invalid, more than idle and more than max)
    const next = sendExpeditionAction(state, 'A', 4, NOW)
    expect(next).toBe(state)
  })

  it('does nothing when cultistCount is 0', () => {
    const state = withMilestone(makeState({
      cultists: { count: 5, assignments: [], nextRecruitAt: 0 },
    }), 'm4')
    const next = sendExpeditionAction(state, 'A', 0, NOW)
    expect(next).toBe(state)
  })

  it('creates an expedition and assigns cultists', () => {
    const state = withMilestone(makeState({
      cultists: { count: 5, assignments: [], nextRecruitAt: 0 },
    }), 'm4')
    const next = sendExpeditionAction(state, 'A', 2, NOW)

    expect(next.expeditions).toHaveLength(1)
    expect(next.expeditions[0].planet).toBe('A')
    expect(next.expeditions[0].cultistIds).toHaveLength(2)
    expect(next.expeditions[0].outcome).toBe('pending')
    expect(next.cultists.assignments.filter(a => a.role === 'expedition')).toHaveLength(2)
    expect(next.meta.nextExpeditionId).toBe(1)
  })

  it('does nothing when expedition slots are full', () => {
    const pending: ExpeditionState = {
      id: 'exp_1',
      planet: 'A',
      cultistIds: ['c1'],
      devotionSnapshot: 100,
      completesAt: NOW + 60_000,
      outcome: 'pending',
    }
    const state = withMilestone(makeState({
      expeditions: [pending, { ...pending, id: 'exp_2' }],
      cultists: { count: 5, assignments: [], nextRecruitAt: 0 },
    }), 'm4')
    // 2 pending = max slots (EXPEDITION_SLOTS_DEFAULT = 2)
    const next = sendExpeditionAction(state, 'A', 1, NOW)
    expect(next).toBe(state)
  })

  it('snapshots devotion from planet gateways', () => {
    const gw = makeGateway({ id: 'gw_a', planet: 'A', devotion: 60 })
    const state = withMilestone(makeState({
      gateways: { gw_a: gw },
      cultists: { count: 5, assignments: [], nextRecruitAt: 0 },
    }), 'm4')
    const next = sendExpeditionAction(state, 'A', 1, NOW)
    expect(next.expeditions[0].devotionSnapshot).toBe(60)
  })

  it('uses devotion 100 when no matching planet gateways', () => {
    const state = withMilestone(makeState({
      cultists: { count: 5, assignments: [], nextRecruitAt: 0 },
    }), 'm4')
    const next = sendExpeditionAction(state, 'A', 1, NOW)
    expect(next.expeditions[0].devotionSnapshot).toBe(100)
  })
})

// ============================================================
// resolveChoiceAction
// ============================================================
function makeChoiceExpedition(choiceId: string): ExpeditionState {
  const event: ChoiceEvent = {
    id: choiceId,
    weight: 'minor',
    prompt: 'Test prompt',
    options: [
      { id: 'optA', label: 'Option A' },
      { id: 'optB', label: 'Option B' },
    ],
  }
  return {
    id: 'exp_choice',
    planet: 'A',
    cultistIds: ['c1'],
    devotionSnapshot: 100,
    completesAt: NOW - 1000,
    outcome: 'choice',
    choiceEvent: event,
  }
}

describe('resolveChoiceAction', () => {
  it('does nothing for unknown expedition', () => {
    const state = makeState()
    const next = resolveChoiceAction(state, 'nonexistent', 'optA', NOW)
    expect(next).toBe(state)
  })

  it('does nothing when expedition is not a choice outcome', () => {
    const exp: ExpeditionState = {
      id: 'exp_safe',
      planet: 'A',
      cultistIds: [],
      devotionSnapshot: 100,
      completesAt: NOW - 1000,
      outcome: 'safe',
    }
    const state = makeState({ expeditions: [exp] })
    const next = resolveChoiceAction(state, 'exp_safe', 'optA', NOW)
    expect(next).toBe(state)
  })

  it('does nothing when already resolved', () => {
    const exp = makeChoiceExpedition('c1')
    const resolved = { ...exp, choiceEvent: { ...exp.choiceEvent!, resolvedOptionId: 'optA' } }
    const state = makeState({ expeditions: [resolved] })
    const next = resolveChoiceAction(state, 'exp_choice', 'optA', NOW)
    expect(next).toBe(state)
  })

  it('c1 take: adds 60 Anima', () => {
    const event: ChoiceEvent = {
      id: 'c1', weight: 'minor', prompt: 'p',
      options: [{ id: 'take', label: 'Take' }, { id: 'leave', label: 'Leave' }],
    }
    const exp: ExpeditionState = {
      id: 'exp_c1', planet: 'A', cultistIds: ['c1'],
      devotionSnapshot: 100, completesAt: NOW - 1000, outcome: 'choice', choiceEvent: event,
    }
    const state = makeState({
      expeditions: [exp],
      resources: { anima: 0, gnosis: 0, voltis: 0 },
      cultists: { count: 5, assignments: [{ cultistId: 'c1', role: 'expedition', expeditionId: 'exp_c1' }], nextRecruitAt: 0 },
    })
    const next = resolveChoiceAction(state, 'exp_c1', 'take', NOW)
    expect(next.resources.anima).toBe(60)
  })

  it('c6 absorb: adds 150 Gnosis and reduces cultist count', () => {
    const event: ChoiceEvent = {
      id: 'c6', weight: 'rare', prompt: 'p',
      options: [{ id: 'absorb', label: 'Absorb' }, { id: 'withdraw', label: 'Withdraw' }],
    }
    const exp: ExpeditionState = {
      id: 'exp_c6', planet: 'A', cultistIds: ['c1'],
      devotionSnapshot: 100, completesAt: NOW - 1000, outcome: 'choice', choiceEvent: event,
    }
    const state = makeState({
      expeditions: [exp],
      resources: { anima: 0, gnosis: 0, voltis: 0 },
      cultists: { count: 5, assignments: [{ cultistId: 'c1', role: 'expedition', expeditionId: 'exp_c6' }], nextRecruitAt: 0 },
    })
    const next = resolveChoiceAction(state, 'exp_c6', 'absorb', NOW)
    expect(next.resources.gnosis).toBe(150)
    expect(next.cultists.count).toBe(4)
  })

  it('c6 absorb: does not reduce cultist below floor', () => {
    const event: ChoiceEvent = {
      id: 'c6', weight: 'rare', prompt: 'p',
      options: [{ id: 'absorb', label: 'Absorb' }],
    }
    const exp: ExpeditionState = {
      id: 'exp_c6', planet: 'A', cultistIds: ['c1'],
      devotionSnapshot: 100, completesAt: NOW - 1000, outcome: 'choice', choiceEvent: event,
    }
    const state = makeState({
      expeditions: [exp],
      cultists: { count: CULTIST_FLOOR, assignments: [{ cultistId: 'c1', role: 'expedition', expeditionId: 'exp_c6' }], nextRecruitAt: 0 },
    })
    const next = resolveChoiceAction(state, 'exp_c6', 'absorb', NOW)
    expect(next.cultists.count).toBeGreaterThanOrEqual(CULTIST_FLOOR)
  })

  it('releases cultist assignments after resolving', () => {
    const event: ChoiceEvent = {
      id: 'c1', weight: 'minor', prompt: 'p',
      options: [{ id: 'leave', label: 'Leave' }],
    }
    const exp: ExpeditionState = {
      id: 'exp_release', planet: 'A', cultistIds: ['c1'],
      devotionSnapshot: 100, completesAt: NOW - 1000, outcome: 'choice', choiceEvent: event,
    }
    const state = makeState({
      expeditions: [exp],
      cultists: { count: 5, assignments: [{ cultistId: 'c1', role: 'expedition', expeditionId: 'exp_release' }], nextRecruitAt: 0 },
    })
    const next = resolveChoiceAction(state, 'exp_release', 'leave', NOW)
    expect(next.cultists.assignments.filter(a => a.expeditionId === 'exp_release')).toHaveLength(0)
  })
})

// ============================================================
// craftArtifactAction
// ============================================================
describe('craftArtifactAction', () => {
  it('does nothing for unknown artifact', () => {
    const state = makeState()
    const next = craftArtifactAction(state, 'nonexistent', NOW)
    expect(next).toBe(state)
  })

  it('does nothing for discovered artifacts', () => {
    const state = makeState({ resources: { anima: 1000, gnosis: 0, voltis: 0 } })
    const next = craftArtifactAction(state, 'voidwreath', NOW)
    expect(next).toBe(state)
  })

  it('does nothing when already obtained', () => {
    const existing: ArtifactState = { id: 'cindermark', source: 'crafted', progress: 1, obtained: true, dormant: false }
    const state = withMilestone(makeState({
      artifacts: [existing],
      resources: { anima: 300, gnosis: 0, voltis: 0 },
    }), 'm3')
    const next = craftArtifactAction(state, 'cindermark', NOW)
    expect(next).toBe(state)
  })

  it('does nothing when not enough resources', () => {
    const state = withMilestone(makeState({
      resources: { anima: 50, gnosis: 0, voltis: 0 },
    }), 'm3')
    const next = craftArtifactAction(state, 'cindermark', NOW)
    expect(next).toBe(state)
  })

  it('crafts cindermark and deducts anima', () => {
    const state = withMilestone(makeState({
      resources: { anima: 250, gnosis: 0, voltis: 0 },
    }), 'm3')
    const next = craftArtifactAction(state, 'cindermark', NOW)
    expect(next.resources.anima).toBe(50) // 250 - 200
    const artifact = next.artifacts.find(a => a.id === 'cindermark')
    expect(artifact?.obtained).toBe(true)
    expect(artifact?.dormant).toBe(false)
  })

  it('crafts unbinding and deducts multiple resources', () => {
    const state = withMilestone(makeState({
      resources: { anima: 350, gnosis: 200, voltis: 150 },
    }), 'm3', 'm5', 'm6', 'm8', 'm9')
    const next = craftArtifactAction(state, 'unbinding', NOW)
    expect(next.resources.anima).toBe(50)   // 350 - 300
    expect(next.resources.gnosis).toBe(50)  // 200 - 150
    expect(next.resources.voltis).toBe(50)  // 150 - 100
    expect(next.artifacts.find(a => a.id === 'unbinding')?.obtained).toBe(true)
  })
})

// ============================================================
// buildPlanetBGatewayAction
// ============================================================
describe('buildPlanetBGatewayAction', () => {
  it('does nothing when M8 not reached', () => {
    const state = makeState({
      resources: { anima: 500, gnosis: 500, voltis: 0 },
    })
    const next = buildPlanetBGatewayAction(state, NOW)
    expect(next).toBe(state)
  })

  it('does nothing when not enough Anima', () => {
    const state = withMilestone(makeState({
      resources: { anima: 10, gnosis: 500, voltis: 0 },
    }), 'm8')
    const next = buildPlanetBGatewayAction(state, NOW)
    expect(next).toBe(state)
  })

  it('does nothing when not enough Gnosis', () => {
    const state = withMilestone(makeState({
      resources: { anima: 500, gnosis: 10, voltis: 0 },
    }), 'm8')
    const next = buildPlanetBGatewayAction(state, NOW)
    expect(next).toBe(state)
  })

  it('builds a Planet B gateway and deducts resources', () => {
    const state = withMilestone(makeState({
      resources: {
        anima: GATEWAY_PLANET_B_BUILD_COST_ANIMA + 50,
        gnosis: GATEWAY_PLANET_B_BUILD_COST_GNOSIS + 20,
        voltis: 0,
      },
    }), 'm8')
    const next = buildPlanetBGatewayAction(state, NOW)
    expect(next.resources.anima).toBe(50)
    expect(next.resources.gnosis).toBe(20)
    const gws = Object.values(next.gateways)
    expect(gws).toHaveLength(1)
    expect(gws[0].planet).toBe('B')
    expect(gws[0].devotion).toBe(100)
  })

  it('does not allow building a second Planet B gateway', () => {
    const state = withMilestone(makeState({
      resources: { anima: 1000, gnosis: 1000, voltis: 0 },
      gateways: {
        existing: makeGateway({ id: 'existing', planet: 'B' }),
      },
    }), 'm8')
    const next = buildPlanetBGatewayAction(state, NOW)
    expect(next).toBe(state)
  })
})
