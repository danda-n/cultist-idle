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
  buildGatewayAction,
  addChannelerAction,
  removeChannelerAction,
  toggleChannelAction,
  disciplineAction,
  purchaseResearchNodeAction,
  upgradeGatewayCapacityAction,
  sendExpeditionAction,
  resolveChoiceAction,
  craftArtifactAction,
  buildPlanetBGatewayAction,
  cleanseCorruptionAction,
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
  /** Build a Planet A gateway */
  buildGateway: () => void
  /** Add one channeling cultist to a gateway */
  addChanneler: (gatewayId: string) => void
  /** Remove one channeling cultist from a gateway */
  removeChanneler: (gatewayId: string) => void
  /** Toggle the Channel rite on a gateway */
  toggleChannel: (gatewayId: string) => void
  /** Invoke Discipline on a gateway */
  discipline: (gatewayId: string) => void
  /** Purchase a research node */
  purchaseResearch: (nodeId: string) => void
  /** Upgrade gateway capacity to tier 2 or 3 */
  upgradeGatewayCapacity: (gatewayId: string, tier: 2 | 3) => void
  /** Send an expedition to a planet */
  sendExpedition: (planet: 'A' | 'B', cultistCount: number) => void
  /** Resolve a choice event for an expedition */
  resolveChoice: (expeditionId: string, optionId: string) => void
  /** Craft an artifact */
  craftArtifact: (artifactId: string) => void
  /** Build a Planet B gateway */
  buildPlanetBGateway: () => void
  /** Cleanse the active corruption */
  cleanseCorruption: () => void
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

  buildGateway: () => {
    const now = Date.now()
    set(store => ({ state: buildGatewayAction(store.state, now) }))
  },

  addChanneler: (gatewayId: string) => {
    const now = Date.now()
    set(store => ({ state: addChannelerAction(store.state, gatewayId, now) }))
  },

  removeChanneler: (gatewayId: string) => {
    set(store => ({ state: removeChannelerAction(store.state, gatewayId) }))
  },

  toggleChannel: (gatewayId: string) => {
    const now = Date.now()
    set(store => ({ state: toggleChannelAction(store.state, gatewayId, now) }))
  },

  discipline: (gatewayId: string) => {
    const now = Date.now()
    set(store => ({ state: disciplineAction(store.state, gatewayId, now) }))
  },

  purchaseResearch: (nodeId: string) => {
    set(store => ({ state: purchaseResearchNodeAction(store.state, nodeId) }))
  },

  upgradeGatewayCapacity: (gatewayId: string, tier: 2 | 3) => {
    set(store => ({ state: upgradeGatewayCapacityAction(store.state, gatewayId, tier) }))
  },

  sendExpedition: (planet: 'A' | 'B', cultistCount: number) => {
    const now = Date.now()
    set(store => ({ state: sendExpeditionAction(store.state, planet, cultistCount, now) }))
  },

  resolveChoice: (expeditionId: string, optionId: string) => {
    const now = Date.now()
    set(store => ({ state: resolveChoiceAction(store.state, expeditionId, optionId, now) }))
  },

  craftArtifact: (artifactId: string) => {
    const now = Date.now()
    set(store => ({ state: craftArtifactAction(store.state, artifactId, now) }))
  },

  buildPlanetBGateway: () => {
    const now = Date.now()
    set(store => ({ state: buildPlanetBGatewayAction(store.state, now) }))
  },

  cleanseCorruption: () => {
    set(store => ({ state: cleanseCorruptionAction(store.state) }))
  },
}))
