import type { GameState } from '../types'
import {
  TRIFECTA_THRESHOLD_ANIMA,
  TRIFECTA_THRESHOLD_GNOSIS,
  TRIFECTA_THRESHOLD_VOLTIS,
  TRIFECTA_SUSTAIN_MS,
} from '../data/trifecta'

/**
 * Tracks whether all 3 resources are simultaneously above their thresholds.
 * After 60s above all thresholds, harmonyActive becomes true.
 * Falls below any threshold → harmonyStartedAt resets to 0, harmonyActive = false.
 */
export function trifectaSystem(
  state: GameState,
  _deltaMs: number,
  now: number
): Partial<GameState> {
  // Only active after M4 (first trifecta link)
  if (!state.milestones.reached.m4) return {}

  const { anima, gnosis, voltis } = state.resources
  const { harmonyStartedAt, harmonyActive } = state.trifecta

  // Check if Unbinding artifact is active (doubles threshold reduction — actually Unbinding reduces threshold to 0%)
  const unbindingObtained = state.artifacts.some(a => a.id === 'unbinding' && a.obtained && !a.dormant)

  // Threshold values (Unbinding makes all thresholds 0, meaning always above)
  const animaThreshold = unbindingObtained ? 0 : TRIFECTA_THRESHOLD_ANIMA
  const gnosisThreshold = unbindingObtained ? 0 : TRIFECTA_THRESHOLD_GNOSIS
  const voltisThreshold = unbindingObtained ? 0 : TRIFECTA_THRESHOLD_VOLTIS

  const allAbove =
    anima >= animaThreshold &&
    gnosis >= gnosisThreshold &&
    voltis >= voltisThreshold

  if (!allAbove) {
    // Any threshold missed — reset harmony
    if (harmonyStartedAt !== 0 || harmonyActive) {
      return {
        trifecta: {
          harmonyStartedAt: 0,
          harmonyActive: false,
        },
      }
    }
    return {}
  }

  // All above threshold
  if (harmonyStartedAt === 0) {
    // Start the timer
    return {
      trifecta: {
        harmonyStartedAt: now,
        harmonyActive: false,
      },
    }
  }

  // Timer running — check if 60s has elapsed
  const elapsed = now - harmonyStartedAt
  if (!harmonyActive && elapsed >= TRIFECTA_SUSTAIN_MS) {
    return {
      trifecta: {
        harmonyStartedAt,
        harmonyActive: true,
      },
    }
  }

  return {}
}
