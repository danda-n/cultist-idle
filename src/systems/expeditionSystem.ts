import type { GameState, ExpeditionState, ArtifactState } from '../types'
import { CULTIST_FLOOR } from '../data/cultists'
import {
  EXPEDITION_CHOICE_CHANCE,
} from '../data/expeditions'
import {
  EXPEDITION_VOLTIS_DRAIN_PLANET_A_PER_MIN,
  EXPEDITION_VOLTIS_DRAIN_PLANET_B_PER_MIN,
} from '../data/gateways'
import { CHOICE_EVENT_POOL } from '../data/choices'

/**
 * Interpolate lost probability from the EXPEDITION_LOSS_CURVE.
 * Curve: [devotion%, lostProbability%]
 * Devotion 100→50: 0% lost, 50→40: 0→6%, 40→25: 6→15%, 25→10: 15→24%, 10→0: 24→30%
 */
const EXPEDITION_LOSS_CURVE: [number, number][] = [
  [100, 0],
  [50, 0],
  [40, 6],
  [25, 15],
  [10, 24],
  [0, 30],
]

function interpolateLostProbability(devotion: number): number {
  const clamped = Math.max(0, Math.min(100, devotion))
  // Walk the curve to find bracketing points
  for (let i = 0; i < EXPEDITION_LOSS_CURVE.length - 1; i++) {
    const [d1, p1] = EXPEDITION_LOSS_CURVE[i]
    const [d2, p2] = EXPEDITION_LOSS_CURVE[i + 1]
    if (clamped >= d2 && clamped <= d1) {
      if (d1 === d2) return p1 / 100
      const t = (d1 - clamped) / (d1 - d2)
      return (p1 + t * (p2 - p1)) / 100
    }
  }
  // Below 0 devotion — use max
  return EXPEDITION_LOSS_CURVE[EXPEDITION_LOSS_CURVE.length - 1][1] / 100
}

function pickRandomChoiceEvent() {
  // Weight-based selection: minor=0.60, major=0.30, rare=0.10
  const roll = Math.random()
  let selectedWeight: 'minor' | 'major' | 'rare' = 'minor'
  if (roll >= 0.90) selectedWeight = 'rare'
  else if (roll >= 0.60) selectedWeight = 'major'

  const pool = CHOICE_EVENT_POOL.filter(e => e.weight === selectedWeight)
  if (pool.length === 0) return CHOICE_EVENT_POOL[0]
  return pool[Math.floor(Math.random() * pool.length)]
}

export function expeditionSystem(
  state: GameState,
  deltaMs: number,
  now: number
): Partial<GameState> {
  const expeditions = [...state.expeditions]
  let anima = state.resources.anima
  let gnosis = state.resources.gnosis
  let voltis = state.resources.voltis
  let cultistCount = state.cultists.count
  let assignments = [...state.cultists.assignments]
  const artifacts = [...state.artifacts]
  let changed = false
  let cultistChanged = false
  let artifactChanged = false

  // --- Voltis drain for pending expeditions (only after M9) ---
  if (state.milestones.reached.m9) {
    for (const exp of expeditions) {
      if (exp.outcome !== 'pending') continue
      const drainPerMin = exp.planet === 'A'
        ? EXPEDITION_VOLTIS_DRAIN_PLANET_A_PER_MIN
        : EXPEDITION_VOLTIS_DRAIN_PLANET_B_PER_MIN
      const drain = (drainPerMin / 60_000) * deltaMs
      voltis = Math.max(0, voltis - drain)
    }
    changed = true // mark even if no change — resource changes tracked below
  }

  // --- Resolve completed expeditions ---
  for (let i = 0; i < expeditions.length; i++) {
    const exp = expeditions[i]
    if (exp.outcome !== 'pending') continue
    if (exp.completesAt > now) continue

    // Determine outcome
    const lostProb = interpolateLostProbability(exp.devotionSnapshot)
    const roll = Math.random()

    let resolvedOutcome: ExpeditionState['outcome']
    let choiceEvent = exp.choiceEvent

    if (roll < lostProb) {
      // Lost outcome
      resolvedOutcome = 'lost'
      // Remove cultist assignments for this expedition
      const expCultists = assignments.filter(a => a.expeditionId === exp.id)
      assignments = assignments.filter(a => a.expeditionId !== exp.id)
      // Reduce cultist count (floor at CULTIST_FLOOR)
      const lostCount = expCultists.length
      cultistCount = Math.max(CULTIST_FLOOR, cultistCount - lostCount)
      cultistChanged = true
    } else if (Math.random() < EXPEDITION_CHOICE_CHANCE) {
      // Choice outcome
      resolvedOutcome = 'choice'
      choiceEvent = pickRandomChoiceEvent()
      // Keep cultist assignments until choice resolved
    } else {
      // Safe outcome — release cultists and grant rewards
      resolvedOutcome = 'safe'
      assignments = assignments.filter(a => a.expeditionId !== exp.id)
      cultistChanged = true

      // Resource rewards
      if (exp.planet === 'A') {
        anima += 40
        gnosis += 20
      } else {
        anima += 60
        voltis += 40
      }

      // Artifact discovery chances
      if (exp.planet === 'A') {
        // Voidwreath: 15% if m5 reached and not obtained
        if (
          state.milestones.reached.m5 &&
          !artifacts.some(a => a.id === 'voidwreath' && a.obtained)
        ) {
          if (Math.random() < 0.15) {
            const existingIdx = artifacts.findIndex(a => a.id === 'voidwreath')
            const newArtifact: ArtifactState = {
              id: 'voidwreath',
              source: 'discovered',
              progress: 1,
              obtained: true,
              dormant: false,
            }
            if (existingIdx >= 0) {
              artifacts[existingIdx] = newArtifact
            } else {
              artifacts.push(newArtifact)
            }
            artifactChanged = true
          }
        }

        // Hungering Lens: 20% if m8 reached and not obtained
        if (
          state.milestones.reached.m8 &&
          !artifacts.some(a => a.id === 'hungeringLens' && a.obtained)
        ) {
          if (Math.random() < 0.20) {
            const dormant = !state.milestones.reached.m9
            const existingIdx = artifacts.findIndex(a => a.id === 'hungeringLens')
            const newArtifact: ArtifactState = {
              id: 'hungeringLens',
              source: 'discovered',
              progress: 1,
              obtained: true,
              dormant,
            }
            if (existingIdx >= 0) {
              artifacts[existingIdx] = newArtifact
            } else {
              artifacts.push(newArtifact)
            }
            artifactChanged = true
          }
        }
      }

      // Voicecaller: 15% if m11 reached and not obtained (any planet)
      if (
        state.milestones.reached.m11 &&
        !artifacts.some(a => a.id === 'voicecaller' && a.obtained)
      ) {
        if (Math.random() < 0.15) {
          const existingIdx = artifacts.findIndex(a => a.id === 'voicecaller')
          const newArtifact: ArtifactState = {
            id: 'voicecaller',
            source: 'discovered',
            progress: 1,
            obtained: true,
            dormant: false,
          }
          if (existingIdx >= 0) {
            artifacts[existingIdx] = newArtifact
          } else {
            artifacts.push(newArtifact)
          }
          artifactChanged = true
        }
      }
    }

    expeditions[i] = {
      ...exp,
      outcome: resolvedOutcome,
      choiceEvent,
    }
    changed = true
  }

  if (!changed && !cultistChanged && !artifactChanged) {
    // Check voltis drain changed
    const voltisChanged = voltis !== state.resources.voltis
    if (!voltisChanged) return {}
  }

  const result: Partial<GameState> = {}

  const resourcesChanged =
    anima !== state.resources.anima ||
    gnosis !== state.resources.gnosis ||
    voltis !== state.resources.voltis

  if (resourcesChanged) {
    result.resources = { ...state.resources, anima, gnosis, voltis }
  }

  if (changed) {
    result.expeditions = expeditions
  }

  if (cultistChanged) {
    result.cultists = {
      ...state.cultists,
      count: cultistCount,
      assignments,
    }
  }

  if (artifactChanged) {
    result.artifacts = artifacts
  }

  return result
}
