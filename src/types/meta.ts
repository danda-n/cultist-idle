export interface MetaState {
  /** Incremented on each save; used for migration */
  saveVersion: number
  /** Absolute timestamp of last save */
  lastSaved: number
  /** Absolute timestamp of game start for this run */
  runStartedAt: number

  // Narrative one-shot flags (pre-M3 experience, never reset)
  narrativeSeen10Anima: boolean
  narrativeSeen25Anima: boolean
  narrativeSeen50Anima: boolean

  // Blood Compact flag — automation cannot trigger Precise Rite
  conjureAutomated: boolean

  /** Absolute timestamp of last conjure completion (for Precise Rite window) */
  lastConjureCompletedAt: number
  /** Whether the conjure bar is currently filling */
  conjureActive: boolean
  /** Absolute timestamp when current conjure bar will complete; 0 = idle */
  conjureCompletesAt: number
}
