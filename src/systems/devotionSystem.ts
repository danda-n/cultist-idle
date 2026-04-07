import type { GameState, GatewayState } from '../types'
import {
  DEVOTION_DECAY_RATE_PER_MIN,
  DREAD_FORTITUDE_DECAY_REDUCTION,
  DEVOTION_COLLAPSE_STUN_MS,
} from '../data/devotion'

/**
 * Handles per-gateway devotion decay each tick.
 *
 * Decay only activates after M7. Per gateway:
 *  - Apply decay rate (reduced by Dread Fortitude if purchased)
 *  - Clamp to 0
 *  - On collapse (hits 0 while channeling and not already stunned):
 *    stun the gateway and deactivate channel
 *  - Clear expired stuns when devotion is above 0
 */
export function devotionSystem(
  state: GameState,
  deltaMs: number,
  now: number
): Partial<GameState> {
  // No decay before M7
  if (!state.milestones.reached.m7) return {}

  const gwIds = Object.keys(state.gateways)
  if (gwIds.length === 0) return {}

  const dreadFortitudePurchased =
    state.research.nodes['dreadFortitude']?.purchased === true

  let anyChanged = false
  const updatedGateways: Record<string, GatewayState> = { ...state.gateways }

  for (const id of gwIds) {
    const gw = updatedGateways[id]

    // Clear expired stun
    if (gw.stunUntil > 0 && now > gw.stunUntil && gw.devotion > 0) {
      updatedGateways[id] = { ...gw, stunUntil: 0 }
      anyChanged = true
      continue
    }

    // Compute decay
    let decayRate = DEVOTION_DECAY_RATE_PER_MIN
    if (dreadFortitudePurchased) {
      decayRate *= (1 - DREAD_FORTITUDE_DECAY_REDUCTION)
    }

    // Voicecaller artifact: halve devotion decay permanently
    const voicecallerObtained = state.artifacts.some(a => a.id === 'voicecaller' && a.obtained && !a.dormant)
    if (voicecallerObtained) {
      decayRate *= 0.5
    }

    const decayAmount = decayRate * (deltaMs / 60_000)
    const newDevotion = Math.max(0, gw.devotion - decayAmount)

    if (newDevotion === gw.devotion) continue

    let newGw: GatewayState = { ...gw, devotion: newDevotion }

    // Devotion collapse: hits 0 while channeling and not already stunned
    if (newDevotion === 0 && gw.channelActive && gw.stunUntil <= now) {
      newGw = {
        ...newGw,
        stunUntil: now + DEVOTION_COLLAPSE_STUN_MS,
        channelActive: false,
      }
    }

    updatedGateways[id] = newGw
    anyChanged = true
  }

  if (!anyChanged) return {}

  return {
    gateways: updatedGateways,
  }
}
