export type ResearchPhase = 1 | 2

export type Phase2Branch = 'dominion' | 'covenant' | 'unraveling'

export interface ResearchNodeState {
  id: string
  phase: ResearchPhase
  branch?: Phase2Branch  // undefined for Phase 1 (linear)
  purchased: boolean
}

export interface ResearchState {
  nodes: Record<string, ResearchNodeState>
}
