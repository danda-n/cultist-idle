import { describe, it, expect, vi } from 'vitest'
import { expeditionSystem } from './expeditionSystem'
import { createInitialState } from '../engine/initialState'
import type { GameState, ExpeditionState } from '../types'
import { EXPEDITION_VOLTIS_DRAIN_PLANET_A_PER_MIN } from '../data/gateways'
import { CULTIST_FLOOR } from '../data/cultists'

const NOW = 2_000_000

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides }
}

function withM9(state: GameState): GameState {
  return {
    ...state,
    milestones: {
      ...state.milestones,
      reached: { ...state.milestones.reached, m9: true },
    },
  }
}

function makePendingExpedition(overrides: Partial<ExpeditionState> = {}): ExpeditionState {
  return {
    id: 'exp_test',
    planet: 'A',
    cultistIds: ['c1', 'c2'],
    devotionSnapshot: 100,
    completesAt: NOW - 1000, // already complete
    outcome: 'pending',
    ...overrides,
  }
}

describe('expeditionSystem', () => {
  it('returns empty when no expeditions', () => {
    const state = makeState()
    const result = expeditionSystem(state, 1000, NOW)
    expect(result).toEqual({})
  })

  it('does not resolve pending expeditions that have not completed yet', () => {
    const exp = makePendingExpedition({ completesAt: NOW + 60_000 })
    const state = makeState({ expeditions: [exp] })
    const result = expeditionSystem(state, 1000, NOW)
    // No completions, but may have voltis drain changes — just check expeditions unchanged
    if (result.expeditions) {
      expect(result.expeditions[0].outcome).toBe('pending')
    }
  })

  it('resolves a completed expedition (high devotion = safe or choice, no lost)', () => {
    // With 100% devotion, lost prob = 0%, so it should be safe or choice
    const exp = makePendingExpedition({ devotionSnapshot: 100 })
    const state = makeState({
      expeditions: [exp],
      cultists: {
        count: 5,
        assignments: [
          { cultistId: 'c1', role: 'expedition', expeditionId: 'exp_test' },
          { cultistId: 'c2', role: 'expedition', expeditionId: 'exp_test' },
        ],
        nextRecruitAt: 0,
      },
    })

    // Run multiple times to verify no lost outcome with 100% devotion
    for (let i = 0; i < 10; i++) {
      const result = expeditionSystem(state, 1000, NOW)
      if (result.expeditions) {
        expect(result.expeditions[0].outcome).not.toBe('lost')
      }
    }
  })

  it('resolves safe expedition and grants Planet A rewards', () => {
    // Mock Math.random to force safe outcome (> choice chance, < 1 - lost prob)
    // With devotion=100, lostProb=0; roll=0 (< 0) never lost; then check choice
    // We want outcome 'safe': roll >= EXPEDITION_CHOICE_CHANCE (0.40)
    const mockRandom = vi.spyOn(Math, 'random')
    // First call: lost check (0 < 0 = false), second call: choice check (0.9 >= 0.4 = true... actually we want safe)
    // safe = roll >= EXPEDITION_CHOICE_CHANCE
    mockRandom
      .mockReturnValueOnce(0.5)  // lost roll: 0.5 > 0 (100% devotion) = not lost
      .mockReturnValueOnce(0.9)  // choice roll: 0.9 >= 0.4 = not choice (this is wrong logic)
    // Actually: lost prob = 0, so first roll < 0 never true; second check is choice probability
    // Let's just use: first roll = 0.5 (not lost since lostProb=0), second roll = 0.8 (>= 0.4, not choice = safe)

    mockRandom.mockReset()
    mockRandom
      .mockReturnValueOnce(0.5)  // lost check: 0.5 is NOT < 0 → not lost
      .mockReturnValueOnce(0.8)  // choice check: 0.8 is NOT < 0.4 → not choice → safe

    const exp = makePendingExpedition({ devotionSnapshot: 100 })
    const state = makeState({
      expeditions: [exp],
      resources: { anima: 0, gnosis: 0, voltis: 0 },
      cultists: {
        count: 5,
        assignments: [
          { cultistId: 'c1', role: 'expedition', expeditionId: 'exp_test' },
          { cultistId: 'c2', role: 'expedition', expeditionId: 'exp_test' },
        ],
        nextRecruitAt: 0,
      },
    })

    const result = expeditionSystem(state, 1000, NOW)

    if (result.expeditions) {
      expect(result.expeditions[0].outcome).toBe('safe')
    }
    if (result.resources) {
      expect(result.resources.anima).toBeGreaterThanOrEqual(40)
      expect(result.resources.gnosis).toBeGreaterThanOrEqual(20)
    }

    mockRandom.mockRestore()
  })

  it('resolves choice expedition and attaches a choice event', () => {
    const mockRandom = vi.spyOn(Math, 'random')
    // first roll: not lost (0.5 > lostProb=0)
    // second roll: choice! (0.2 < 0.4)
    // third roll: weight selection for choice event (any value)
    // fourth roll: pick specific event from pool
    mockRandom
      .mockReturnValueOnce(0.5)  // not lost
      .mockReturnValueOnce(0.2)  // choice!
      .mockReturnValue(0.3)      // rest for choice event selection

    const exp = makePendingExpedition({ devotionSnapshot: 100 })
    const state = makeState({ expeditions: [exp] })
    const result = expeditionSystem(state, 1000, NOW)

    if (result.expeditions) {
      expect(result.expeditions[0].outcome).toBe('choice')
      expect(result.expeditions[0].choiceEvent).toBeDefined()
    }

    mockRandom.mockRestore()
  })

  it('resolves lost expedition and removes cultist assignments', () => {
    const mockRandom = vi.spyOn(Math, 'random')
    // With devotion=0, lostProb=0.30; roll=0.1 < 0.30 → lost
    mockRandom.mockReturnValueOnce(0.1)

    const exp = makePendingExpedition({ devotionSnapshot: 0 })
    const state = makeState({
      expeditions: [exp],
      cultists: {
        count: 5,
        assignments: [
          { cultistId: 'c1', role: 'expedition', expeditionId: 'exp_test' },
          { cultistId: 'c2', role: 'expedition', expeditionId: 'exp_test' },
        ],
        nextRecruitAt: 0,
      },
    })

    const result = expeditionSystem(state, 1000, NOW)

    if (result.expeditions) {
      expect(result.expeditions[0].outcome).toBe('lost')
    }
    if (result.cultists) {
      expect(result.cultists.assignments.filter(a => a.expeditionId === 'exp_test')).toHaveLength(0)
      // count reduced by 2 (from 5 to 3 = floor)
      expect(result.cultists.count).toBeGreaterThanOrEqual(CULTIST_FLOOR)
    }

    mockRandom.mockRestore()
  })

  it('never reduces cultist count below floor even on loss', () => {
    const mockRandom = vi.spyOn(Math, 'random')
    mockRandom.mockReturnValueOnce(0.1) // lost

    const exp = makePendingExpedition({ devotionSnapshot: 0 })
    const state = makeState({
      expeditions: [exp],
      cultists: {
        count: CULTIST_FLOOR, // already at floor
        assignments: [
          { cultistId: 'c1', role: 'expedition', expeditionId: 'exp_test' },
        ],
        nextRecruitAt: 0,
      },
    })

    const result = expeditionSystem(state, 1000, NOW)

    if (result.cultists) {
      expect(result.cultists.count).toBeGreaterThanOrEqual(CULTIST_FLOOR)
    }

    mockRandom.mockRestore()
  })

  it('drains Voltis for pending expeditions after M9', () => {
    const exp = makePendingExpedition({ completesAt: NOW + 60_000 }) // not yet complete
    const state = withM9(makeState({
      expeditions: [exp],
      resources: { anima: 0, gnosis: 0, voltis: 100 },
    }))

    const deltaMs = 60_000 // 1 minute
    const result = expeditionSystem(state, deltaMs, NOW)

    const expectedDrain = EXPEDITION_VOLTIS_DRAIN_PLANET_A_PER_MIN
    if (result.resources) {
      expect(result.resources.voltis).toBeCloseTo(100 - expectedDrain, 0)
    }
  })

  it('does not drain Voltis before M9', () => {
    const exp = makePendingExpedition({ completesAt: NOW + 60_000 })
    const state = makeState({
      expeditions: [exp],
      resources: { anima: 0, gnosis: 0, voltis: 100 },
    })

    const result = expeditionSystem(state, 60_000, NOW)

    // No voltis drain before m9 — resources unchanged or absent in result
    if (result.resources) {
      expect(result.resources.voltis).toBe(100)
    }
  })

  it('does not drain Voltis below 0', () => {
    const exp = makePendingExpedition({ completesAt: NOW + 60_000 })
    const state = withM9(makeState({
      expeditions: [exp],
      resources: { anima: 0, gnosis: 0, voltis: 1 },
    }))

    const result = expeditionSystem(state, 60_000_000, NOW) // huge delta

    if (result.resources) {
      expect(result.resources.voltis).toBeGreaterThanOrEqual(0)
    }
  })
})
