import { describe, it, expect } from 'vitest'
import { gatewaySystem } from './gatewaySystem'
import { createInitialState } from '../engine/initialState'
import type { GameState, GatewayState } from '../types'
import {
  GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN,
} from '../data/gateways'
import { SOFT_CAP_GNOSIS, OVERFLOW_RATE_MULTIPLIER } from '../data/resources'

function makeGateway(overrides: Partial<GatewayState> = {}): GatewayState {
  return {
    id: 'gw_test',
    planet: 'A',
    devotion: 100,
    cultistsAssigned: 1,
    capacity: 1,
    channelActive: true,
    disciplineCooldownUntil: 0,
    stunUntil: 0,
    ...overrides,
  }
}

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides }
}

describe('gatewaySystem – Gnosis production', () => {
  it('produces Gnosis per minute per channeling cultist', () => {
    const now = 10_000
    const deltaMs = 60_000 // 1 minute
    const gw = makeGateway({ id: 'gw_test', channelActive: true })
    const state = makeState({
      gateways: { gw_test: gw },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'channel', gatewayId: 'gw_test' }],
      },
    })
    const patch = gatewaySystem(state, deltaMs, now)
    // 1 cultist * 4 gnosis/min * 1 min = 4
    expect(patch.resources?.gnosis).toBeCloseTo(GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN, 5)
  })

  it('scales with multiple channeling cultists', () => {
    const now = 10_000
    const deltaMs = 60_000
    const gw = makeGateway({ id: 'gw_test', channelActive: true, capacity: 2 })
    const state = makeState({
      gateways: { gw_test: gw },
      cultists: {
        ...createInitialState().cultists,
        count: 5,
        assignments: [
          { cultistId: '1', role: 'channel', gatewayId: 'gw_test' },
          { cultistId: '2', role: 'channel', gatewayId: 'gw_test' },
        ],
      },
    })
    const patch = gatewaySystem(state, deltaMs, now)
    // 2 cultists * 4/min * 1 min = 8
    expect(patch.resources?.gnosis).toBeCloseTo(GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN * 2, 5)
  })

  it('does not produce Gnosis when channelActive is false', () => {
    const now = 10_000
    const deltaMs = 60_000
    const gw = makeGateway({ id: 'gw_test', channelActive: false })
    const state = makeState({
      gateways: { gw_test: gw },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'channel', gatewayId: 'gw_test' }],
      },
    })
    const patch = gatewaySystem(state, deltaMs, now)
    expect(patch.resources).toBeUndefined()
  })

  it('does not produce Gnosis when gateway is stunned', () => {
    const now = 10_000
    const deltaMs = 60_000
    const gw = makeGateway({ id: 'gw_test', channelActive: true, stunUntil: now + 120_000 })
    const state = makeState({
      gateways: { gw_test: gw },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'channel', gatewayId: 'gw_test' }],
      },
    })
    const patch = gatewaySystem(state, deltaMs, now)
    expect(patch.resources).toBeUndefined()
  })

  it('does not produce Gnosis when no channeling cultists', () => {
    const now = 10_000
    const deltaMs = 60_000
    const gw = makeGateway({ id: 'gw_test', channelActive: true })
    const state = makeState({
      gateways: { gw_test: gw },
      cultists: {
        ...createInitialState().cultists,
        count: 3,
        assignments: [],
      },
    })
    const patch = gatewaySystem(state, deltaMs, now)
    expect(patch.resources).toBeUndefined()
  })

  it('applies soft cap to Gnosis production above SOFT_CAP_GNOSIS', () => {
    const now = 10_000
    const deltaMs = 60_000
    const gw = makeGateway({ id: 'gw_test', channelActive: true })
    const state = makeState({
      resources: { anima: 0, gnosis: SOFT_CAP_GNOSIS + 10, voltis: 0 },
      gateways: { gw_test: gw },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'channel', gatewayId: 'gw_test' }],
      },
    })
    const patch = gatewaySystem(state, deltaMs, now)
    // All production is above soft cap
    const expected = GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN * OVERFLOW_RATE_MULTIPLIER
    expect(patch.resources?.gnosis).toBeCloseTo(
      (SOFT_CAP_GNOSIS + 10) + expected,
      3
    )
  })

  it('returns empty patch when no gateways exist', () => {
    const state = makeState({ gateways: {} })
    const patch = gatewaySystem(state, 60_000, 10_000)
    expect(patch).toEqual({})
  })

  it('produces Gnosis after stun expires (stunUntil <= now)', () => {
    const now = 200_000
    const deltaMs = 60_000
    const gw = makeGateway({ id: 'gw_test', channelActive: true, stunUntil: now - 1 })
    const state = makeState({
      gateways: { gw_test: gw },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'channel', gatewayId: 'gw_test' }],
      },
    })
    const patch = gatewaySystem(state, deltaMs, now)
    expect(patch.resources?.gnosis).toBeCloseTo(GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN, 5)
  })
})
