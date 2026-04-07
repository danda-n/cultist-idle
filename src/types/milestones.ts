export type MilestoneId =
  | 'm1' | 'm2' | 'm3' | 'm4' | 'm5'
  | 'm6' | 'm7' | 'm8' | 'm9' | 'm10'
  | 'm11' | 'm12' | 'm13' | 'm14'

export interface MilestoneState {
  reached: Record<MilestoneId, boolean>
  /** Summoning sequence progress 0–1; active when m14 trigger fires */
  summoningProgress: number
  /** Absolute timestamp when summoning started; 0 = not started */
  summoningStartedAt: number
}
