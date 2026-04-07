import type { GameState } from '../types'
import { applySoftCap } from './resourceSystem'
import {
  GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN,
  VOLTIS_PRODUCTION_PER_CULTIST_PER_MIN,
} from '../data/gateways'
import {
  SOFT_CAP_GNOSIS,
  SOFT_CAP_VOLTIS,
  OVERFLOW_RATE_MULTIPLIER,
} from '../data/resources'
import { HARMONY_BONUS_MULTIPLIER } from '../data/trifecta'

/**
 * Produces Gnosis (Planet A gateways) or Voltis (Planet B gateways) from channeling cultists.
 *
 * Per gateway:
 *  - Count cultists assigned with role 'channel' to this gateway
 *  - If channelActive, channelingCount > 0, and stun not active:
 *    compute raw production and apply soft cap
 *  - Apply Harmony bonus (+20%) if harmonyActive
 *  - Apply Voidwreath bonus (+40% Gnosis) if voidwreath obtained
 */
export function gatewaySystem(
  state: GameState,
  deltaMs: number,
  now: number
): Partial<GameState> {
  const gateways = Object.values(state.gateways)
  if (gateways.length === 0) return {}

  let gnosis = state.resources.gnosis
  let voltis = state.resources.voltis
  let anyChanged = false

  const harmonyMultiplier = 1 + (state.trifecta.harmonyActive ? HARMONY_BONUS_MULTIPLIER : 0)
  const voidwreathObtained = state.artifacts.some(a => a.id === 'voidwreath' && a.obtained && !a.dormant)

  for (const gw of gateways) {
    if (!gw.channelActive) continue
    if (gw.stunUntil > now) continue

    const channelingCount = state.cultists.assignments.filter(
      a => a.role === 'channel' && a.gatewayId === gw.id
    ).length

    if (channelingCount <= 0) continue

    if (gw.planet === 'A') {
      let rawGnosis =
        (channelingCount * GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN / 60_000) * deltaMs

      // Apply Harmony bonus
      rawGnosis *= harmonyMultiplier

      // Apply Voidwreath bonus (+40% Gnosis channel efficiency)
      if (voidwreathObtained) {
        rawGnosis *= 1.4
      }

      const gain = applySoftCap(gnosis, rawGnosis, SOFT_CAP_GNOSIS, OVERFLOW_RATE_MULTIPLIER)
      gnosis += gain
      anyChanged = true
    } else if (gw.planet === 'B') {
      let rawVoltis =
        (channelingCount * VOLTIS_PRODUCTION_PER_CULTIST_PER_MIN / 60_000) * deltaMs

      // Apply Harmony bonus
      rawVoltis *= harmonyMultiplier

      const gain = applySoftCap(voltis, rawVoltis, SOFT_CAP_VOLTIS, OVERFLOW_RATE_MULTIPLIER)
      voltis += gain
      anyChanged = true
    }
  }

  if (!anyChanged) return {}

  return {
    resources: {
      ...state.resources,
      gnosis,
      voltis,
    },
  }
}
