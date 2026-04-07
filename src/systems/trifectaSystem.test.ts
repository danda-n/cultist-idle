import { describe, it, expect } from 'vitest'
import { trifectaSystem } from './trifectaSystem'
import { createInitialState } from '../engine/initialState'
import type { GameState } from '../types'
import {
  TRIFECTA_THRESHOLD_ANIMA,
  TRIFECTA_THRESHOLD_GNOSIS,
  TRIFECTA_THRESHOLD_VOLTIS,
  TRIFECTA_SUSTAIN_MS,
} from '../data/trifecta'

const NOW = 1_000_000

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides }
}

function withM4(state: GameState): GameState {
  return {
    ...state,
    milestones: {
      ...state.milestones,
      reached: { ...state.milestones.reached, m4: true },
    },
  }
}

function withAllAbove(state: GameState): GameState {
  return {
    ...state,
    resources: {
      anima: TRIFECTA_THRESHOLD_ANIMA + 10,
      gnosis: TRIFECTA_THRESHOLD_GNOSIS + 10,
      voltis: TRIFECTA_THRESHOLD_VOLTIS + 10,
    },
  }
}

describe('trifectaSystem', () => {
  it('does nothing before M4', () => {
    const state = withAllAbove(makeState())
    const result = trifectaSystem(state, 1000, NOW)
    expect(result).toEqual({})
  })

  it('does nothing when resources are below thresholds', () => {
    const state = withM4(makeState({
      resources: { anima: 0, gnosis: 0, voltis: 0 },
    }))
    const result = trifectaSystem(state, 1000, NOW)
    expect(result).toEqual({})
  })

  it('starts harmony timer when all resources are above threshold', () => {
    const state = withM4(withAllAbove(makeState()))
    const result = trifectaSystem(state, 1000, NOW)
    expect(result.trifecta?.harmonyStartedAt).toBe(NOW)
    expect(result.trifecta?.harmonyActive).toBe(false)
  })

  it('does not restart timer if already started', () => {
    const state = withM4({
      ...withAllAbove(makeState()),
      trifecta: { harmonyStartedAt: NOW - 10_000, harmonyActive: false },
    })
    const result = trifectaSystem(state, 1000, NOW)
    expect(result).toEqual({})
  })

  it('activates harmony after sustain period', () => {
    const state = withM4({
      ...withAllAbove(makeState()),
      trifecta: { harmonyStartedAt: NOW - TRIFECTA_SUSTAIN_MS, harmonyActive: false },
    })
    const result = trifectaSystem(state, 1000, NOW)
    expect(result.trifecta?.harmonyActive).toBe(true)
  })

  it('does not activate harmony before sustain period', () => {
    const state = withM4({
      ...withAllAbove(makeState()),
      trifecta: { harmonyStartedAt: NOW - (TRIFECTA_SUSTAIN_MS - 5000), harmonyActive: false },
    })
    const result = trifectaSystem(state, 1000, NOW)
    expect(result).toEqual({})
  })

  it('resets harmony when any resource drops below threshold', () => {
    const state = withM4({
      ...makeState(),
      resources: {
        anima: TRIFECTA_THRESHOLD_ANIMA + 10,
        gnosis: 0, // below threshold
        voltis: TRIFECTA_THRESHOLD_VOLTIS + 10,
      },
      trifecta: { harmonyStartedAt: NOW - 10_000, harmonyActive: true },
    })
    const result = trifectaSystem(state, 1000, NOW)
    expect(result.trifecta?.harmonyStartedAt).toBe(0)
    expect(result.trifecta?.harmonyActive).toBe(false)
  })

  it('does not emit change when already reset', () => {
    const state = withM4(makeState({
      resources: { anima: 0, gnosis: 0, voltis: 0 },
      trifecta: { harmonyStartedAt: 0, harmonyActive: false },
    }))
    const result = trifectaSystem(state, 1000, NOW)
    expect(result).toEqual({})
  })
})
