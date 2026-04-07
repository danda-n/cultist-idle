import { describe, it, expect } from 'vitest'
import { milestoneSystem } from './milestoneSystem'
import { createInitialState } from '../engine/initialState'
import type { GameState } from '../types'

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides }
}

describe('milestoneSystem – M1', () => {
  it('triggers M1 when anima reaches 10', () => {
    const state = makeState({
      resources: { anima: 10, gnosis: 0, voltis: 0 },
    })
    const patch = milestoneSystem(state, 100, Date.now())
    expect(patch.milestones?.reached.m1).toBe(true)
  })

  it('does not trigger M1 below 10 anima', () => {
    const state = makeState({
      resources: { anima: 9.9, gnosis: 0, voltis: 0 },
    })
    const patch = milestoneSystem(state, 100, Date.now())
    expect(patch.milestones).toBeUndefined()
  })

  it('does not re-trigger M1 if already reached', () => {
    const state = makeState({
      resources: { anima: 100, gnosis: 0, voltis: 0 },
      milestones: {
        ...createInitialState().milestones,
        reached: { ...createInitialState().milestones.reached, m1: true },
      },
    })
    const patch = milestoneSystem(state, 100, Date.now())
    // No change since m1 already true
    expect(patch.milestones).toBeUndefined()
  })
})

describe('milestoneSystem – M2', () => {
  it('triggers M2 when gatewayFrame is built', () => {
    const state = makeState({
      constructs: {
        gatewayFrame: { type: 'gatewayFrame', tier: 1, built: true },
      },
    })
    const patch = milestoneSystem(state, 100, Date.now())
    expect(patch.milestones?.reached.m2).toBe(true)
  })

  it('does not trigger M2 when gatewayFrame is not built', () => {
    const state = makeState({
      constructs: {},
    })
    const patch = milestoneSystem(state, 100, Date.now())
    expect(patch.milestones?.reached?.m2).toBeUndefined()
  })
})

describe('milestoneSystem – M3', () => {
  it('triggers M3 when a cultist is assigned to sacrifice', () => {
    const state = makeState({
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'sacrifice' }],
      },
    })
    const patch = milestoneSystem(state, 100, Date.now())
    expect(patch.milestones?.reached.m3).toBe(true)
  })

  it('does not trigger M3 when no sacrifice assignments', () => {
    const state = makeState({
      cultists: {
        ...createInitialState().cultists,
        count: 3,
        assignments: [],
      },
    })
    const patch = milestoneSystem(state, 100, Date.now())
    expect(patch.milestones?.reached?.m3).toBeUndefined()
  })

  it('triggers multiple milestones in one tick', () => {
    const state = makeState({
      resources: { anima: 10, gnosis: 0, voltis: 0 },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'sacrifice' }],
      },
      constructs: {
        gatewayFrame: { type: 'gatewayFrame', tier: 1, built: true },
      },
    })
    const patch = milestoneSystem(state, 100, Date.now())
    expect(patch.milestones?.reached.m1).toBe(true)
    expect(patch.milestones?.reached.m2).toBe(true)
    expect(patch.milestones?.reached.m3).toBe(true)
  })
})
