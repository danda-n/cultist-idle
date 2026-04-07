import { describe, it, expect } from 'vitest'
import { resourceSystem, applySoftCap } from './resourceSystem'
import { createInitialState } from '../engine/initialState'
import type { GameState } from '../types'
import {
  CONJURE_BASE_ANIMA,
  CONJURE_PRECISE_ANIMA,
  CONJURE_COOLDOWN_MS,
  SOFT_CAP_ANIMA,
  OVERFLOW_RATE_MULTIPLIER,
} from '../data/resources'
import {
  SACRIFICE_ANIMA_PER_MIN,
  OSSUARY_SACRIFICE_ANIMA_PER_MIN,
} from '../data/constructs'

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialState()
  return { ...base, ...overrides }
}

describe('applySoftCap', () => {
  it('returns full gain when entirely below soft cap', () => {
    expect(applySoftCap(0, 10, SOFT_CAP_ANIMA, OVERFLOW_RATE_MULTIPLIER)).toBe(10)
  })

  it('returns overflow gain when entirely above soft cap', () => {
    const gain = applySoftCap(600, 100, SOFT_CAP_ANIMA, OVERFLOW_RATE_MULTIPLIER)
    expect(gain).toBe(100 * OVERFLOW_RATE_MULTIPLIER)
  })

  it('splits gain at the soft cap boundary', () => {
    // current=490, gain=20: 10 below cap, 10 above cap
    const gain = applySoftCap(490, 20, SOFT_CAP_ANIMA, OVERFLOW_RATE_MULTIPLIER)
    expect(gain).toBeCloseTo(10 + 10 * OVERFLOW_RATE_MULTIPLIER)
  })

  it('returns 0 when gain is 0', () => {
    expect(applySoftCap(0, 0, SOFT_CAP_ANIMA, OVERFLOW_RATE_MULTIPLIER)).toBe(0)
  })
})

describe('resourceSystem – conjure completion', () => {
  it('releases base anima when conjure bar completes', () => {
    const now = 10_000
    const state = makeState({
      meta: {
        ...createInitialState().meta,
        conjureActive: true,
        conjureCompletesAt: now - 100, // completed in the past
        lastConjureCompletedAt: 0,
      },
    })
    const patch = resourceSystem(state, 16, now)
    expect(patch.resources?.anima).toBe(CONJURE_BASE_ANIMA)
    expect(patch.meta?.conjureActive).toBe(false)
    expect(patch.meta?.conjureCompletesAt).toBe(0)
  })

  it('does not release anima when bar is not yet complete', () => {
    const now = 10_000
    const state = makeState({
      meta: {
        ...createInitialState().meta,
        conjureActive: true,
        conjureCompletesAt: now + 5_000, // still in the future
      },
    })
    const patch = resourceSystem(state, 16, now)
    expect(patch.resources).toBeUndefined()
    expect(patch.meta?.conjureActive).toBeUndefined()
  })

  it('awards precise rite bonus when bar started within precise window', () => {
    // lastConjureCompletedAt = 11_000, cooldown = 8_000
    // bar started 1000ms after last: 11_000 + 1_000 = 12_000
    // gap = 1000ms < 1500ms window → Precise Rite applies
    const lastCompleted = 11_000
    const cooldown = CONJURE_COOLDOWN_MS
    const completesAt = lastCompleted + 1_000 + cooldown // started 1000ms after last
    const state = makeState({
      meta: {
        ...createInitialState().meta,
        conjureActive: true,
        conjureCompletesAt: completesAt,
        lastConjureCompletedAt: lastCompleted,
        conjureAutomated: false,
      },
    })
    const patch = resourceSystem(state, 16, completesAt + 10)
    expect(patch.resources?.anima).toBe(CONJURE_PRECISE_ANIMA)
  })

  it('does not award precise rite bonus when gap is outside window', () => {
    const lastCompleted = 1_000
    const cooldown = CONJURE_COOLDOWN_MS
    // started 5000ms after last completed: 5000 > 1500ms window
    const completesAt = lastCompleted + 5_000 + cooldown
    const state = makeState({
      meta: {
        ...createInitialState().meta,
        conjureActive: true,
        conjureCompletesAt: completesAt,
        lastConjureCompletedAt: lastCompleted,
        conjureAutomated: false,
      },
    })
    const patch = resourceSystem(state, 16, completesAt + 10)
    expect(patch.resources?.anima).toBe(CONJURE_BASE_ANIMA)
  })

  it('does not award precise rite when conjure is automated', () => {
    const lastCompleted = 1_000
    const cooldown = CONJURE_COOLDOWN_MS
    // started immediately (100ms gap) — would qualify except automated
    const completesAt = lastCompleted + 100 + cooldown
    const state = makeState({
      meta: {
        ...createInitialState().meta,
        conjureActive: true,
        conjureCompletesAt: completesAt,
        lastConjureCompletedAt: lastCompleted,
        conjureAutomated: true,
      },
    })
    const patch = resourceSystem(state, 16, completesAt + 10)
    expect(patch.resources?.anima).toBe(CONJURE_BASE_ANIMA)
  })
})

describe('resourceSystem – sacrifice passive production', () => {
  it('adds anima per tick proportional to sacrifice count and delta', () => {
    const now = 10_000
    const deltaMs = 60_000 // 1 minute
    const state = makeState({
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'sacrifice' }],
      },
    })
    const patch = resourceSystem(state, deltaMs, now)
    // 1 sacrifice * 6/min * 1 min = 6
    expect(patch.resources?.anima).toBeCloseTo(SACRIFICE_ANIMA_PER_MIN, 5)
  })

  it('uses ossuary rate when ossuary is built', () => {
    const now = 10_000
    const deltaMs = 60_000
    const state = makeState({
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'sacrifice' }],
      },
      constructs: {
        ossuary: { type: 'ossuary', tier: 1, built: true },
      },
    })
    const patch = resourceSystem(state, deltaMs, now)
    expect(patch.resources?.anima).toBeCloseTo(OSSUARY_SACRIFICE_ANIMA_PER_MIN, 5)
  })

  it('applies soft cap to sacrifice production above SOFT_CAP_ANIMA', () => {
    const now = 10_000
    const deltaMs = 60_000 // 1 minute
    const state = makeState({
      resources: { anima: SOFT_CAP_ANIMA + 100, gnosis: 0, voltis: 0 },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'sacrifice' }],
      },
    })
    const patch = resourceSystem(state, deltaMs, now)
    // All production above cap → 6 * 0.1 = 0.6
    const expected = SACRIFICE_ANIMA_PER_MIN * OVERFLOW_RATE_MULTIPLIER
    expect(patch.resources?.anima).toBeCloseTo(
      (SOFT_CAP_ANIMA + 100) + expected,
      3
    )
  })
})

describe('resourceSystem – narrative flags', () => {
  it('sets narrativeSeen10Anima when anima reaches 10', () => {
    const now = 10_000
    const deltaMs = 60_000
    // Start at 9 with 1 sacrifice (1/min) → 9 + 1 = 10
    const state = makeState({
      resources: { anima: 9, gnosis: 0, voltis: 0 },
      cultists: {
        ...createInitialState().cultists,
        count: 4,
        assignments: [{ cultistId: '1', role: 'sacrifice' }],
      },
    })
    const patch = resourceSystem(state, deltaMs, now)
    expect(patch.meta?.narrativeSeen10Anima).toBe(true)
  })

  it('does not re-set narrativeSeen10Anima if already true', () => {
    const now = 10_000
    const state = makeState({
      resources: { anima: 50, gnosis: 0, voltis: 0 },
      meta: {
        ...createInitialState().meta,
        narrativeSeen10Anima: true,
        narrativeSeen25Anima: true,
        narrativeSeen50Anima: true,
      },
    })
    const patch = resourceSystem(state, 1000, now)
    // No change expected for narrative flags
    expect(patch.meta?.narrativeSeen10Anima).toBeUndefined()
  })
})
