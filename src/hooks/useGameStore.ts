import { create } from 'zustand'
import type { GameState } from '../types'
import { createInitialState } from '../engine/initialState'
import { tick } from '../engine/gameLoop'
import { saveGame, loadGame } from '../utils/storage'
import {
  clickConjureAction,
  assignSacrificeAction,
  unassignSacrificeAction,
  buildConstructAction,
} from '../engine/actions'
import type { ConstructType } from '../types'

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
  /** Player clicks the conjure button */
  clickConjure: () => void
  /** Assign one idle cultist to sacrifice */
  assignSacrifice: () => void
  /** Remove one sacrificed cultist (return to idle) */
  unassignSacrifice: () => void
  /** Build (or upgrade) a construct */
  buildConstruct: (type: ConstructType, tier?: 1 | 2) => void
}

export const useGameStore = create<GameStore>((set, get) => ({
  state: createInitialState(),

  initGame: () => {
    const loaded = loadGame()
    set({ state: loaded ?? createInitialState() })
  },

  tickFrame: (deltaMs: number) => {
    const now = Date.now()
    const next = tick(get().state, deltaMs, now)
    set({ state: next })
  },

  saveNow: () => {
    saveGame(get().state)
  },

  applyPatch: (patch: Partial<GameState>) => {
    set(store => ({ state: { ...store.state, ...patch } }))
  },

  clickConjure: () => {
    const now = Date.now()
    set(store => ({ state: clickConjureAction(store.state, now) }))
  },

  assignSacrifice: () => {
    set(store => ({ state: assignSacrificeAction(store.state) }))
  },

  unassignSacrifice: () => {
    set(store => ({ state: unassignSacrificeAction(store.state) }))
  },

  buildConstruct: (type: ConstructType, tier?: 1 | 2) => {
    set(store => ({ state: buildConstructAction(store.state, type, tier) }))
  },
}))
