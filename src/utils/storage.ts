import type { GameState } from '../types'
import { createInitialState } from '../engine/initialState'
import { offlineProcessor } from '../engine/gameLoop'

const SAVE_KEY = 'cultist-idle-save'
const CURRENT_SAVE_VERSION = 1

export function saveGame(state: GameState): void {
  try {
    const payload = JSON.stringify({
      ...state,
      meta: {
        ...state.meta,
        lastSaved: Date.now(),
      },
    })
    localStorage.setItem(SAVE_KEY, payload)
  } catch (err) {
    console.error('[storage] saveGame failed:', err)
  }
}

export function loadGame(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null

    const parsed: GameState = JSON.parse(raw)

    // Version migration hook — extend as save format evolves
    const migrated = migrate(parsed)

    // Offline catch-up
    const offlineDelta = Date.now() - migrated.meta.lastSaved
    if (offlineDelta > 0) {
      return offlineProcessor(migrated, offlineDelta)
    }

    return migrated
  } catch (err) {
    console.error('[storage] loadGame failed, returning null:', err)
    return null
  }
}

export function deleteSave(): void {
  localStorage.removeItem(SAVE_KEY)
}

/**
 * Migrate save data from older versions to the current schema.
 * Add a case block for each version bump.
 */
function migrate(state: GameState): GameState {
  let s = state

  // v0 → v1: ensure all fields exist (fill missing with initial state defaults)
  if (!s.meta?.saveVersion || s.meta.saveVersion < 1) {
    const defaults = createInitialState()
    s = deepMergeDefaults(defaults, s) as GameState
    s = { ...s, meta: { ...s.meta, saveVersion: CURRENT_SAVE_VERSION } }
  }

  return s
}

/**
 * Recursively fill missing keys in `data` from `defaults`.
 * Existing values in `data` are preserved.
 */
function deepMergeDefaults(defaults: unknown, data: unknown): unknown {
  if (
    typeof defaults !== 'object' || defaults === null ||
    typeof data !== 'object' || data === null
  ) {
    return data ?? defaults
  }

  const result: Record<string, unknown> = { ...(data as Record<string, unknown>) }
  for (const key of Object.keys(defaults as Record<string, unknown>)) {
    if (!(key in result)) {
      result[key] = (defaults as Record<string, unknown>)[key]
    } else if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = deepMergeDefaults(
        (defaults as Record<string, unknown>)[key],
        result[key]
      )
    }
  }
  return result
}
