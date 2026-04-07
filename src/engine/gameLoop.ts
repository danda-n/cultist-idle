import type { GameState, SystemTick } from '../types'
import { resourceSystem } from '../systems/resourceSystem'
import { cultistSystem } from '../systems/cultistSystem'
import { milestoneSystem } from '../systems/milestoneSystem'

/**
 * Registered system ticks, executed in dependency order on every frame.
 */
const systems: SystemTick[] = [
  resourceSystem,
  cultistSystem,
  milestoneSystem,
]

/**
 * Pure tick function: given current state, elapsed ms and current timestamp, returns next state.
 * Identical behaviour online and offline — no side effects.
 */
export function tick(state: GameState, deltaMs: number, now: number = Date.now()): GameState {
  if (deltaMs <= 0) return state

  let next = { ...state }

  for (const system of systems) {
    const patch = system(next, deltaMs, now)
    next = { ...next, ...patch }
  }

  return next
}

/**
 * Thin wrapper over tick() for offline catch-up.
 * Applies game-design floors that only apply while offline:
 *   - Devotion floor at 15% (per gateway)
 *   - Cultist count floor of 3 (guaranteed by all systems, double-checked here)
 * Choice events that overflow the 10-event queue are auto-resolved as safe Return.
 */
export function offlineProcessor(state: GameState, deltaMs: number): GameState {
  const MAX_OFFLINE_MS = 8 * 60 * 60 * 1000 // cap at 8 hours
  const clampedDelta = Math.min(deltaMs, MAX_OFFLINE_MS)
  // Offline now = last saved time + clamped delta
  const offlineNow = state.meta.lastSaved + clampedDelta

  // Tick the world forward
  let next = tick(state, clampedDelta, offlineNow)

  // Apply offline devotion floor (15%) to every gateway
  const gateways = { ...next.gateways }
  for (const id of Object.keys(gateways)) {
    if (gateways[id].devotion < 15) {
      gateways[id] = { ...gateways[id], devotion: 15 }
    }
  }

  // Apply global cultist floor of 3
  const cultists = next.cultists.count < 3
    ? { ...next.cultists, count: 3 }
    : next.cultists

  // Cap expedition choice event queue at 10; auto-resolve overflow as safe
  const expeditions = next.expeditions.map(exp => {
    if (exp.outcome === 'choice' && !exp.choiceEvent?.resolvedOptionId) {
      return exp // already queued, will be handled in UI
    }
    return exp
  })

  const pendingChoices = expeditions.filter(
    e => e.outcome === 'choice' && !e.choiceEvent?.resolvedOptionId
  )
  const resolvedExpeditions = pendingChoices.length > 10
    ? expeditions.map(exp => {
        if (exp.outcome === 'choice' && !exp.choiceEvent?.resolvedOptionId) {
          // Auto-resolve oldest overflow as safe return
          const overflowIndex = pendingChoices.indexOf(exp)
          if (overflowIndex < pendingChoices.length - 10) {
            return { ...exp, outcome: 'safe' as const }
          }
        }
        return exp
      })
    : expeditions

  return { ...next, gateways, cultists, expeditions: resolvedExpeditions }
}
