import { describe, it, expect } from 'vitest'
import { cultistSystem } from './cultistSystem'
import { createInitialState } from '../engine/initialState'
import type { GameState } from '../types'
import { CULTIST_RECRUIT_RATE_MS, CULTIST_FLOOR } from '../data/cultists'

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides }
}

describe('cultistSystem – recruitment', () => {
  it('recruits one cultist when nextRecruitAt is reached', () => {
    const base = createInitialState()
    const nextRecruitAt = base.cultists.nextRecruitAt
    // Advance now past the recruit time
    const now = nextRecruitAt + 1000
    const patch = cultistSystem(base, 1000, now)
    expect(patch.cultists?.count).toBe(base.cultists.count + 1)
  })

  it('does not recruit when now is before nextRecruitAt', () => {
    const base = createInitialState()
    const now = base.cultists.nextRecruitAt - 1000
    const patch = cultistSystem(base, 1000, now)
    expect(patch.cultists).toBeUndefined()
  })

  it('handles multiple intervals in a single tick (offline catch-up)', () => {
    const base = createInitialState()
    const nextRecruitAt = base.cultists.nextRecruitAt
    // Advance past 3 recruit intervals
    const now = nextRecruitAt + CULTIST_RECRUIT_RATE_MS * 2 + 1
    const patch = cultistSystem(base, CULTIST_RECRUIT_RATE_MS * 3, now)
    expect(patch.cultists?.count).toBe(base.cultists.count + 3)
  })

  it('advances nextRecruitAt by CULTIST_RECRUIT_RATE_MS per recruit', () => {
    const base = createInitialState()
    const nextRecruitAt = base.cultists.nextRecruitAt
    const now = nextRecruitAt + 100
    const patch = cultistSystem(base, 100, now)
    expect(patch.cultists?.nextRecruitAt).toBe(nextRecruitAt + CULTIST_RECRUIT_RATE_MS)
  })
})

describe('cultistSystem – floor enforcement', () => {
  it('enforces the cultist floor of 3', () => {
    const state = makeState({
      cultists: {
        ...createInitialState().cultists,
        count: 1,
      },
    })
    const now = state.cultists.nextRecruitAt - 1000 // no recruit yet
    const patch = cultistSystem(state, 100, now)
    expect(patch.cultists?.count).toBeGreaterThanOrEqual(CULTIST_FLOOR)
  })

  it('does not reduce count below floor even with overrides', () => {
    const state = makeState({
      cultists: { ...createInitialState().cultists, count: 0 },
    })
    const now = state.cultists.nextRecruitAt - 1000
    const patch = cultistSystem(state, 100, now)
    const finalCount = patch.cultists?.count ?? state.cultists.count
    expect(finalCount).toBeGreaterThanOrEqual(CULTIST_FLOOR)
  })
})

describe('cultistSystem – nextCultistId', () => {
  it('increments nextCultistId when a cultist is recruited', () => {
    const base = createInitialState()
    const now = base.cultists.nextRecruitAt + 100
    const patch = cultistSystem(base, 100, now)
    expect(patch.meta?.nextCultistId).toBe(base.meta.nextCultistId + 1)
  })
})
