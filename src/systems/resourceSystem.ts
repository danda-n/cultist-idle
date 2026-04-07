import type { GameState } from '../types'
import {
  CONJURE_BASE_ANIMA,
  CONJURE_PRECISE_ANIMA,
  CONJURE_PRECISE_WINDOW_MS,
  SOFT_CAP_ANIMA,
  OVERFLOW_RATE_MULTIPLIER,
} from '../data/resources'
import {
  SACRIFICE_ANIMA_PER_MIN,
  OSSUARY_SACRIFICE_ANIMA_PER_MIN,
  CINDERMARK_SACRIFICE_MULTIPLIER,
} from '../data/constructs'
import { HARMONY_BONUS_MULTIPLIER } from '../data/trifecta'
import { getConjureCooldown } from '../utils/conjureHelpers'

/**
 * Manages Anima production each tick:
 *  - Conjure bar completion (releases Anima when bar finishes)
 *  - Auto-conjure (Blood Compact research flag)
 *  - Sacrifice passive production (soft-capped)
 *  - Narrative one-shot flags
 */
export function resourceSystem(
  state: GameState,
  _deltaMs: number,
  now: number
): Partial<GameState> {
  let anima = state.resources.anima
  const meta = { ...state.meta }
  let metaChanged = false

  // --- Conjure bar completion ---
  if (meta.conjureActive && meta.conjureCompletesAt > 0 && now >= meta.conjureCompletesAt) {
    // Precise Rite: bar was started within 1500ms of previous completion.
    // The bar was started at (conjureCompletesAt - cooldown); check if that
    // start time was within the precise window of lastConjureCompletedAt.
    const cooldown = getConjureCooldown(state)
    const startedAt = meta.conjureCompletesAt - cooldown
    const isPrecise =
      !meta.conjureAutomated &&
      meta.lastConjureCompletedAt > 0 &&
      startedAt - meta.lastConjureCompletedAt <= CONJURE_PRECISE_WINDOW_MS

    const gained = isPrecise ? CONJURE_PRECISE_ANIMA : CONJURE_BASE_ANIMA
    // Manual conjure rewards are NOT soft-capped
    anima += gained

    meta.lastConjureCompletedAt = meta.conjureCompletesAt
    meta.conjureActive = false
    meta.conjureCompletesAt = 0
    metaChanged = true

    // Auto-conjure: immediately start the next bar if automated
    if (meta.conjureAutomated) {
      meta.conjureActive = true
      meta.conjureCompletesAt = now + cooldown
    }
  }

  // Auto-conjure: start a bar when idle (if automated and not already active)
  if (meta.conjureAutomated && !meta.conjureActive) {
    const cooldown = getConjureCooldown(state)
    meta.conjureActive = true
    meta.conjureCompletesAt = now + cooldown
    metaChanged = true
  }

  // --- Sacrifice passive production ---
  const sacrificeCount = state.cultists.assignments.filter(a => a.role === 'sacrifice').length
  if (sacrificeCount > 0) {
    const ossuaryBuilt = state.constructs['ossuary']?.built === true
    const ratePerMin = ossuaryBuilt
      ? OSSUARY_SACRIFICE_ANIMA_PER_MIN
      : SACRIFICE_ANIMA_PER_MIN
    const ratePerMs = ratePerMin / 60_000
    let rawGain = ratePerMs * _deltaMs * sacrificeCount

    // Cindermark: doubles sacrifice yield (+100%)
    const cindermarkObtained = state.artifacts.some(a => a.id === 'cindermark' && a.obtained && !a.dormant)
    if (cindermarkObtained) {
      rawGain *= CINDERMARK_SACRIFICE_MULTIPLIER
    }

    // Harmony bonus: +20% to all production including sacrifice
    const harmonyMultiplier = 1 + (state.trifecta.harmonyActive ? HARMONY_BONUS_MULTIPLIER : 0)
    rawGain *= harmonyMultiplier

    // Apply soft cap: production above SOFT_CAP_ANIMA runs at OVERFLOW_RATE_MULTIPLIER
    const gain = applySoftCap(anima, rawGain, SOFT_CAP_ANIMA, OVERFLOW_RATE_MULTIPLIER)
    anima += gain
  }

  // --- Narrative one-shot flags ---
  if (!meta.narrativeSeen10Anima && anima >= 10) {
    meta.narrativeSeen10Anima = true
    metaChanged = true
  }
  if (!meta.narrativeSeen25Anima && anima >= 25) {
    meta.narrativeSeen25Anima = true
    metaChanged = true
  }
  if (!meta.narrativeSeen50Anima && anima >= 50) {
    meta.narrativeSeen50Anima = true
    metaChanged = true
  }

  const resourcesChanged = anima !== state.resources.anima

  if (!resourcesChanged && !metaChanged) return {}

  const result: Partial<GameState> = {}
  if (resourcesChanged) {
    result.resources = { ...state.resources, anima }
  }
  if (metaChanged) {
    result.meta = meta
  }
  return result
}

/**
 * Apply soft cap logic to a raw resource gain.
 * Production above `cap` is multiplied by `overflowRate`.
 * Manual conjure rewards bypass this (called separately with full amount).
 */
export function applySoftCap(
  current: number,
  rawGain: number,
  cap: number,
  overflowRate: number
): number {
  if (current >= cap) {
    // Entirely above cap
    return rawGain * overflowRate
  }
  const headroom = cap - current
  if (rawGain <= headroom) {
    // Entirely below cap
    return rawGain
  }
  // Straddles the cap
  const belowCap = headroom
  const aboveCap = rawGain - headroom
  return belowCap + aboveCap * overflowRate
}
