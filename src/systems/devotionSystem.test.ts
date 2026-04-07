import { describe, it, expect } from 'vitest'
import { devotionSystem } from './devotionSystem'
import { createInitialState } from '../engine/initialState'
import type { GameState, GatewayState } from '../types'
import {
  DEVOTION_DECAY_RATE_PER_MIN,
  DREAD_FORTITUDE_DECAY_REDUCTION,
  DEVOTION_COLLAPSE_STUN_MS,
} from '../data/devotion'

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
  const base = createInitialState()
  return { ...base, ...overrides }
}

function withM7(state: GameState): GameState {
  return {
    ...state,
    milestones: {
      ...state.milestones,
      reached: { ...state.milestones.reached, m7: true },
    },
  }
}

describe('devotionSystem – no decay before M7', () => {
  it('does not decay devotion when M7 not reached', () => {
    const gw = makeGateway({ devotion: 80 })
    const state = makeState({ gateways: { gw_test: gw } })
    const patch = devotionSystem(state, 60_000, 10_000)
    expect(patch).toEqual({})
  })
})

describe('devotionSystem – decay per tick', () => {
  it('decays devotion by 0.5% per minute after M7', () => {
    const gw = makeGateway({ devotion: 80 })
    const state = withM7(makeState({ gateways: { gw_test: gw } }))
    const deltaMs = 60_000 // 1 minute
    const patch = devotionSystem(state, deltaMs, 10_000)
    expect(patch.gateways?.['gw_test'].devotion).toBeCloseTo(
      80 - DEVOTION_DECAY_RATE_PER_MIN,
      5
    )
  })

  it('decays proportionally for partial minutes', () => {
    const gw = makeGateway({ devotion: 50 })
    const state = withM7(makeState({ gateways: { gw_test: gw } }))
    const deltaMs = 30_000 // 0.5 minute
    const patch = devotionSystem(state, deltaMs, 10_000)
    expect(patch.gateways?.['gw_test'].devotion).toBeCloseTo(
      50 - DEVOTION_DECAY_RATE_PER_MIN * 0.5,
      5
    )
  })

  it('clamps devotion to 0 (never negative)', () => {
    const gw = makeGateway({ devotion: 0.1 })
    const state = withM7(makeState({ gateways: { gw_test: gw } }))
    const patch = devotionSystem(state, 60_000, 10_000)
    expect(patch.gateways?.['gw_test'].devotion).toBeGreaterThanOrEqual(0)
    expect(patch.gateways?.['gw_test'].devotion).toBe(0)
  })
})

describe('devotionSystem – Dread Fortitude', () => {
  it('reduces decay rate by 15% when Dread Fortitude is purchased', () => {
    const gw = makeGateway({ devotion: 80 })
    const state = withM7(makeState({
      gateways: { gw_test: gw },
      research: {
        nodes: {
          dreadFortitude: { id: 'dreadFortitude', phase: 1, purchased: true },
        },
      },
    }))
    const deltaMs = 60_000
    const patch = devotionSystem(state, deltaMs, 10_000)
    const expectedDecay = DEVOTION_DECAY_RATE_PER_MIN * (1 - DREAD_FORTITUDE_DECAY_REDUCTION)
    expect(patch.gateways?.['gw_test'].devotion).toBeCloseTo(80 - expectedDecay, 5)
  })
})

describe('devotionSystem – collapse and stun', () => {
  it('sets stun and disables channelActive when devotion collapses to 0', () => {
    const now = 10_000
    // Devotion 0.01% — next tick will decay to 0
    const gw = makeGateway({ devotion: 0.01, channelActive: true, stunUntil: 0 })
    const state = withM7(makeState({ gateways: { gw_test: gw } }))
    const patch = devotionSystem(state, 60_000, now)
    expect(patch.gateways?.['gw_test'].devotion).toBe(0)
    expect(patch.gateways?.['gw_test'].channelActive).toBe(false)
    expect(patch.gateways?.['gw_test'].stunUntil).toBe(now + DEVOTION_COLLAPSE_STUN_MS)
  })

  it('does not set stun again when already stunned', () => {
    const now = 10_000
    const existingStun = now + 60_000
    const gw = makeGateway({ devotion: 0.01, channelActive: false, stunUntil: existingStun })
    const state = withM7(makeState({ gateways: { gw_test: gw } }))
    const patch = devotionSystem(state, 60_000, now)
    // channelActive already false, stunUntil shouldn't be extended
    expect(patch.gateways?.['gw_test']?.stunUntil ?? existingStun).toBe(existingStun)
  })

  it('does not stun when devotion hits 0 but channel is not active', () => {
    const now = 10_000
    const gw = makeGateway({ devotion: 0.01, channelActive: false, stunUntil: 0 })
    const state = withM7(makeState({ gateways: { gw_test: gw } }))
    const patch = devotionSystem(state, 60_000, now)
    expect(patch.gateways?.['gw_test']?.stunUntil ?? 0).toBe(0)
  })

  it('clears stun when it expires and devotion > 0', () => {
    const now = 200_000
    // Stun already expired
    const gw = makeGateway({ devotion: 50, channelActive: false, stunUntil: now - 1 })
    const state = withM7(makeState({ gateways: { gw_test: gw } }))
    const patch = devotionSystem(state, 16, now)
    expect(patch.gateways?.['gw_test'].stunUntil).toBe(0)
  })
})

describe('devotionSystem – no gateways', () => {
  it('returns empty patch when no gateways', () => {
    const state = withM7(makeState({ gateways: {} }))
    const patch = devotionSystem(state, 60_000, 10_000)
    expect(patch).toEqual({})
  })
})
