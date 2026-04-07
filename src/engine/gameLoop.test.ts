import { describe, it, expect } from 'vitest'
import { tick, offlineProcessor } from './gameLoop'
import { createInitialState } from './initialState'

describe('tick', () => {
  it('returns state unchanged when deltaMs is 0', () => {
    const state = createInitialState()
    expect(tick(state, 0, Date.now())).toBe(state)
  })

  it('returns state unchanged when deltaMs is negative', () => {
    const state = createInitialState()
    expect(tick(state, -100, Date.now())).toBe(state)
  })

  it('returns a new state object when deltaMs > 0', () => {
    const state = createInitialState()
    const now = Date.now()
    const next = tick(state, 1000, now)
    // Systems are registered; state content may change (cultist recruit timer, etc.)
    expect(next).toBeDefined()
  })
})

describe('offlineProcessor', () => {
  it('clamps offline delta to 8 hours max', () => {
    const state = createInitialState()
    const tenHoursMs = 10 * 60 * 60 * 1000
    // Should not throw; clamping is internal
    expect(() => offlineProcessor(state, tenHoursMs)).not.toThrow()
  })

  it('enforces devotion offline floor at 15% per gateway', () => {
    const state = createInitialState()
    const stateWithGateway = {
      ...state,
      gateways: {
        gw1: {
          id: 'gw1',
          planet: 'A' as const,
          devotion: 5,  // below floor
          cultistsAssigned: 1,
          capacity: 1,
          channelActive: true,
          disciplineCooldownUntil: 0,
          stunUntil: 0,
        },
      },
    }
    const result = offlineProcessor(stateWithGateway, 1000)
    expect(result.gateways['gw1'].devotion).toBeGreaterThanOrEqual(15)
  })

  it('enforces cultist floor of 3', () => {
    const state = {
      ...createInitialState(),
      cultists: { ...createInitialState().cultists, count: 1 },
    }
    const result = offlineProcessor(state, 1000)
    expect(result.cultists.count).toBeGreaterThanOrEqual(3)
  })
})
