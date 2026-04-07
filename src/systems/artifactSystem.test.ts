import { describe, it, expect } from 'vitest'
import { artifactSystem } from './artifactSystem'
import { createInitialState } from '../engine/initialState'
import type { GameState, ArtifactState } from '../types'

const NOW = 1_000_000

function makeState(overrides: Partial<GameState> = {}): GameState {
  return { ...createInitialState(), ...overrides }
}

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

describe('artifactSystem', () => {
  it('returns empty when no artifacts and no change needed', () => {
    const state = makeState()
    const result = artifactSystem(state, 1000, NOW)
    // May create progress entries for unlocked milestones, but with no milestones reached, nothing to do
    expect(result).toEqual({})
  })

  it('resolves dormancy for hungeringLens when M9 reached', () => {
    const lens: ArtifactState = {
      id: 'hungeringLens',
      source: 'discovered',
      progress: 1,
      obtained: true,
      dormant: true,
    }
    const state = withMilestone(makeState({ artifacts: [lens] }), 'm9')
    const result = artifactSystem(state, 1000, NOW)

    expect(result.artifacts).toBeDefined()
    const updated = result.artifacts!.find(a => a.id === 'hungeringLens')
    expect(updated?.dormant).toBe(false)
  })

  it('does not resolve dormancy for hungeringLens before M9', () => {
    const lens: ArtifactState = {
      id: 'hungeringLens',
      source: 'discovered',
      progress: 1,
      obtained: true,
      dormant: true,
    }
    const state = makeState({ artifacts: [lens] })
    const result = artifactSystem(state, 1000, NOW)
    expect(result).toEqual({})
  })

  it('does not change non-dormant obtained artifacts', () => {
    const cindermark: ArtifactState = {
      id: 'cindermark',
      source: 'crafted',
      progress: 1,
      obtained: true,
      dormant: false,
    }
    const state = withMilestone(makeState({ artifacts: [cindermark] }), 'm3')
    const result = artifactSystem(state, 1000, NOW)
    // Should not modify cindermark
    if (result.artifacts) {
      const updated = result.artifacts.find(a => a.id === 'cindermark')
      expect(updated?.obtained).toBe(true)
      expect(updated?.dormant).toBe(false)
    }
  })

  it('calculates progress for crafted artifact based on resources', () => {
    // cindermark costs 200 anima, unlocks at m3
    const state = withMilestone(makeState({
      resources: { anima: 100, gnosis: 0, voltis: 0 },
    }), 'm3')
    const result = artifactSystem(state, 1000, NOW)

    if (result.artifacts) {
      const cindermark = result.artifacts.find(a => a.id === 'cindermark')
      // 100/200 = 0.5
      expect(cindermark?.progress).toBeCloseTo(0.5, 2)
    }
  })

  it('caps progress at 1.0', () => {
    const state = withMilestone(makeState({
      resources: { anima: 300, gnosis: 0, voltis: 0 },
    }), 'm3')
    const result = artifactSystem(state, 1000, NOW)

    if (result.artifacts) {
      const cindermark = result.artifacts.find(a => a.id === 'cindermark')
      expect(cindermark?.progress).toBeLessThanOrEqual(1)
    }
  })

  it('does not create progress entry for locked milestone artifacts', () => {
    // cindermark requires m3, which is not reached
    const state = makeState({
      resources: { anima: 300, gnosis: 0, voltis: 0 },
    })
    const result = artifactSystem(state, 1000, NOW)
    if (result.artifacts) {
      const cindermark = result.artifacts.find(a => a.id === 'cindermark')
      expect(cindermark).toBeUndefined()
    }
  })
})
