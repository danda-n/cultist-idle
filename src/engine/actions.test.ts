import { describe, it, expect } from 'vitest'
import {
  buildGatewayAction,
  toggleChannelAction,
  disciplineAction,
  purchaseResearchNodeAction,
  upgradeGatewayCapacityAction,
} from './actions'
import { createInitialState } from './initialState'
import type { GameState, GatewayState } from '../types'
import {
  GATEWAY_BUILD_COST_ANIMA,
  GATEWAY_CAPACITY_T2_COST_ANIMA,
  GATEWAY_CAPACITY_T2_COST_GNOSIS,
  GATEWAY_CAPACITY_T3_COST_ANIMA,
  GATEWAY_CAPACITY_T3_COST_GNOSIS,
} from '../data/gateways'
import { DISCIPLINE_COOLDOWN_MS } from '../data/devotion'
import { DEVOTION_COLLAPSE_STUN_MS } from '../data/devotion'

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
