export type CultistRole = 'idle' | 'sacrifice' | 'channel' | 'expedition'

export interface CultistAssignment {
  cultistId: string
  role: CultistRole
  gatewayId?: string      // set when role is 'channel'
  expeditionId?: string   // set when role is 'expedition'
}

export interface CultistState {
  count: number
  assignments: CultistAssignment[]
  /** Absolute timestamp when next cultist is recruited */
  nextRecruitAt: number
}
