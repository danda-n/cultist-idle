import { create } from 'zustand'
import type { GameState } from '../types'
import { createInitialState } from '../engine/initialState'
import { tick } from '../engine/gameLoop'
import { saveGame, loadGame } from '../utils/storage'

interface GameStore {
  state: GameState
  /** Called every animation frame with elapsed ms */
  tickFrame: (deltaMs: number) => void
  /** Load from localStorage (or start fresh) */
  initGame: () => void
  /** Manually trigger a save */
  saveNow: () => void
  /** Apply an arbitrary patch to state (for action handlers) */
  applyPatch: (patch: Partial<GameState>) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),

  initGame: () => {
    const loaded = loadGame()
    set({ state: loaded ?? createInitialState() })
  },

  tickFrame: (deltaMs: number) => {
    const next = tick(get().state, deltaMs)
    set({ state: next })
  },

  saveNow: () => {
    saveGame(get().state)
  },

  applyPatch: (patch: Partial<GameState>) => {
    set(store => ({ state: { ...store.state, ...patch } }))
  },
}))
