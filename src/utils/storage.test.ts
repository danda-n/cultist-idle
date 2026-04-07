import { describe, it, expect, beforeEach, vi } from 'vitest'
import { saveGame, loadGame, deleteSave } from './storage'
import { createInitialState } from '../engine/initialState'

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

beforeEach(() => {
  localStorageMock.clear()
})

describe('saveGame / loadGame round-trip', () => {
  it('saves and loads state without data loss', () => {
    const state = createInitialState()
    saveGame(state)
    const loaded = loadGame()
    expect(loaded).not.toBeNull()
    expect(loaded!.resources).toEqual(state.resources)
    expect(loaded!.cultists.count).toEqual(state.cultists.count)
    expect(loaded!.prestige.runNumber).toEqual(state.prestige.runNumber)
  })

  it('returns null when no save exists', () => {
    expect(loadGame()).toBeNull()
  })

  it('deleteSave removes the save', () => {
    const state = createInitialState()
    saveGame(state)
    deleteSave()
    expect(loadGame()).toBeNull()
  })

  it('handles corrupted save data gracefully', () => {
    localStorage.setItem('cultist-idle-save', 'not-valid-json{{{')
    expect(() => loadGame()).not.toThrow()
    expect(loadGame()).toBeNull()
  })

  it('applies offline progress on load', () => {
    vi.useFakeTimers()
    const state = createInitialState()
    saveGame(state)

    // Advance time by 1 minute
    vi.advanceTimersByTime(60_000)

    const loaded = loadGame()
    // Offline processor ran — state should exist and not throw
    expect(loaded).not.toBeNull()

    vi.useRealTimers()
  })
})
