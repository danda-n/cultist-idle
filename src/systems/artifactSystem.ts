import type { GameState, ArtifactState } from '../types'
import { ARTIFACT_CONFIGS } from '../data/artifacts'

/**
 * Artifact system — tick-based artifact management:
 * - Resolve dormancy: hungeringLens becomes active when M9 reached
 * - Update crafted artifact progress bars based on current resources vs cost
 */
export function artifactSystem(
  state: GameState,
  _deltaMs: number,
  _now: number
): Partial<GameState> {
  const artifacts = [...state.artifacts]
  let changed = false

  // Dormancy resolution: hungeringLens activates at M9
  const hungeringIdx = artifacts.findIndex(a => a.id === 'hungeringLens')
  if (hungeringIdx >= 0) {
    const hl = artifacts[hungeringIdx]
    if (hl.obtained && hl.dormant && state.milestones.reached.m9) {
      artifacts[hungeringIdx] = { ...hl, dormant: false }
      changed = true
    }
  }

  // Update crafted artifact progress based on current resources vs cost
  for (const config of ARTIFACT_CONFIGS) {
    if (config.source !== 'crafted' || !config.cost) continue
    // Only show progress once the unlock milestone is reached
    const unlockMilestone = config.discoveryUnlocksAtMilestone
    if (unlockMilestone && !state.milestones.reached[unlockMilestone as keyof typeof state.milestones.reached]) continue

    const existingIdx = artifacts.findIndex(a => a.id === config.id)
    const existing = existingIdx >= 0 ? artifacts[existingIdx] : null

    // Don't update progress if already obtained
    if (existing?.obtained) continue

    const { anima: costAnima = 0, gnosis: costGnosis = 0, voltis: costVoltis = 0 } = config.cost
    const { anima, gnosis, voltis } = state.resources

    // Progress = min ratio across all required resources
    let progress = 1
    if (costAnima > 0) progress = Math.min(progress, anima / costAnima)
    if (costGnosis > 0) progress = Math.min(progress, gnosis / costGnosis)
    if (costVoltis > 0) progress = Math.min(progress, voltis / costVoltis)
    progress = Math.max(0, Math.min(1, progress))

    if (existing) {
      if (Math.abs(existing.progress - progress) > 0.001) {
        artifacts[existingIdx] = { ...existing, progress }
        changed = true
      }
    } else {
      // Create a placeholder artifact entry to track progress
      const newEntry: ArtifactState = {
        id: config.id as ArtifactState['id'],
        source: 'crafted',
        progress,
        obtained: false,
        dormant: false,
      }
      artifacts.push(newEntry)
      changed = true
    }
  }

  if (!changed) return {}
  return { artifacts }
}
