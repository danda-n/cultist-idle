export interface TrifectaState {
  /** Absolute timestamp when all 3 resources crossed their thresholds; 0 = not active */
  harmonyStartedAt: number
  /** Whether the Harmony bonus is currently active (all thresholds met for 60s+) */
  harmonyActive: boolean
}
