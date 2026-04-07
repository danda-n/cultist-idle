import type { ResourceState } from './resources'
import type { CultistState } from './cultists'
import type { GatewayState } from './gateways'
import type { ExpeditionState } from './expeditions'
import type { ResearchState } from './research'
import type { ArtifactState } from './artifacts'
import type { MilestoneState } from './milestones'
import type { PrestigeState } from './prestige'
import type { MetaState } from './meta'
import type { ConstructState } from './constructs'
import type { TrifectaState } from './trifecta'
import type { CorruptionState } from './corruption'

export interface GameState {
  resources: ResourceState
  cultists: CultistState
  /** Keyed by gateway id */
  gateways: Record<string, GatewayState>
  expeditions: ExpeditionState[]
  research: ResearchState
  artifacts: ArtifactState[]
  milestones: MilestoneState
  prestige: PrestigeState
  meta: MetaState
  constructs: Record<string, ConstructState>
  trifecta: TrifectaState
  corruption: CorruptionState
}

/**
 * Every system tick function receives current state + elapsed ms,
 * and returns the subset of state it modifies.
 */
export type SystemTick = (state: GameState, deltaMs: number, now: number) => Partial<GameState>
