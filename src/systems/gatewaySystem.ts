import type { GameState } from '../types'
import { applySoftCap } from './resourceSystem'
import { GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN } from '../data/gateways'
import { SOFT_CAP_GNOSIS, OVERFLOW_RATE_MULTIPLIER } from '../data/resources'

/**
 * Produces Gnosis from channeling cultists each tick.
 *
 * Per gateway:
 *  - Count cultists assigned with role 'channel' to this gateway
 *  - If channelActive, channelingCount > 0, and stun not active:
 *    compute raw Gnosis production and apply soft cap
 */
export function gatewaySystem(
  state: GameState,
  deltaMs: number,
  now: number
): Partial<GameState> {
  const gateways = Object.values(state.gateways)
  if (gateways.length === 0) return {}

  let gnosis = state.resources.gnosis
  let gnosisChanged = false

  for (const gw of gateways) {
    if (!gw.channelActive) continue
    if (gw.stunUntil > now) continue

    const channelingCount = state.cultists.assignments.filter(
      a => a.role === 'channel' && a.gatewayId === gw.id
    ).length

    if (channelingCount <= 0) continue

    const rawGnosis =
      (channelingCount * GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN / 60_000) * deltaMs

    const gain = applySoftCap(gnosis, rawGnosis, SOFT_CAP_GNOSIS, OVERFLOW_RATE_MULTIPLIER)
    gnosis += gain
    gnosisChanged = true
  }

  if (!gnosisChanged) return {}

  return {
    resources: {
      ...state.resources,
      gnosis,
    },
  }
}
