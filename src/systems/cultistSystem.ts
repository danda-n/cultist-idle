import type { GameState } from '../types'
import { CULTIST_RECRUIT_RATE_MS, CULTIST_FLOOR } from '../data/cultists'

/**
 * Handles passive cultist recruitment and enforces the global floor of 3.
 * Supports multiple recruitment intervals in a single tick (offline catch-up).
 */
export function cultistSystem(
  state: GameState,
  _deltaMs: number,
  now: number
): Partial<GameState> {
  let { count, assignments, nextRecruitAt } = state.cultists
  const meta = { ...state.meta }
  let metaChanged = false
  let cultistChanged = false

  // Process multiple recruitment intervals (handles offline catch-up)
  while (now >= nextRecruitAt) {
    count += 1
    nextRecruitAt += CULTIST_RECRUIT_RATE_MS
    // Assign a deterministic ID to track new cultists
    meta.nextCultistId += 1
    metaChanged = true
    cultistChanged = true
  }

  // Enforce global floor of 3 (can never go below)
  if (count < CULTIST_FLOOR) {
    count = CULTIST_FLOOR
    cultistChanged = true
  }

  // Clean up any assignments for cultists that no longer exist
  // (e.g., if count was reduced — floor prevents this normally, but be safe)
  if (assignments.length > count) {
    assignments = assignments.slice(0, count)
    cultistChanged = true
  }

  if (!cultistChanged && !metaChanged) return {}

  const result: Partial<GameState> = {}
  if (cultistChanged) {
    result.cultists = { count, assignments, nextRecruitAt }
  }
  if (metaChanged) {
    result.meta = meta
  }
  return result
}
