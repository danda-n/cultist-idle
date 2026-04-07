export type ExpeditionOutcome = 'safe' | 'choice' | 'lost' | 'pending'

export type ChoiceEventWeight = 'minor' | 'major' | 'rare'

export interface ChoiceOption {
  id: string
  label: string
  cost?: { resource: 'anima' | 'gnosis' | 'voltis'; amount: number }
  locked?: boolean
}

export interface ChoiceEvent {
  id: string
  weight: ChoiceEventWeight
  prompt: string
  options: ChoiceOption[]
  resolvedOptionId?: string
}

export interface ExpeditionState {
  id: string
  planet: 'A' | 'B'
  cultistIds: string[]
  /** Devotion percentage snapshotted at departure */
  devotionSnapshot: number
  /** Absolute timestamp when expedition completes */
  completesAt: number
  outcome: ExpeditionOutcome
  choiceEvent?: ChoiceEvent
}
