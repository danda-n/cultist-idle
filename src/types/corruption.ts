export type CorruptionId =
  | 'theGnawing'
  | 'ashTaint'
  | 'theShudderingRite'
  | 'veilSickness'
  | 'voltisDrain'

export interface CorruptionState {
  /** Currently active corruption; null = clean */
  active: CorruptionId | null
  /** Progress toward cleansing 0–1 (Gnosis spent / cleanse cost) */
  cleanseProgress: number
}
