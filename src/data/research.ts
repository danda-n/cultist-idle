import type { ResearchPhase, Phase2Branch } from '../types'

export interface ResearchNodeConfig {
  id: string
  label: string
  phase: ResearchPhase
  branch?: Phase2Branch
  /** Gnosis cost */
  cost: number
  /** Order within phase/branch (lower = earlier) */
  order: number
  description: string
}

export const RESEARCH_NODES: ResearchNodeConfig[] = [
  // Phase 1 — linear, never resets
  {
    id: 'conjuringRites',
    label: 'Conjuring Rites',
    phase: 1,
    cost: 30,
    order: 1,
    description: 'Altar T2 cooldown reduction',
  },
  {
    id: 'theOpenedWay',
    label: 'The Opened Way',
    phase: 1,
    cost: 40,
    order: 2,
    description: 'Gateway construction cost −20% (future runs only)',
  },
  {
    id: 'bloodCompact',
    label: 'Blood Compact',
    phase: 1,
    cost: 50,
    order: 3,
    description: 'Automates conjuring at 8 Anima (no Precise Rite)',
  },
  {
    id: 'dreadFortitude',
    label: 'Dread Fortitude',
    phase: 1,
    cost: 60,
    order: 4,
    description: 'Devotion decay −15% on all gateways',
  },
  // Phase 2 branches — reset each Rehearsal, defined here for save/load
  // Branch: Dominion
  {
    id: 'dominion1',
    label: 'Dominion I',
    phase: 2,
    branch: 'dominion',
    cost: 100,
    order: 1,
    description: 'Dominion branch node 1',
  },
  {
    id: 'dominion2',
    label: 'Dominion II',
    phase: 2,
    branch: 'dominion',
    cost: 100,
    order: 2,
    description: 'Dominion branch node 2',
  },
  {
    id: 'dominion3',
    label: 'Dominion III',
    phase: 2,
    branch: 'dominion',
    cost: 100,
    order: 3,
    description: 'Dominion branch node 3',
  },
  // Branch: Covenant
  {
    id: 'covenant1',
    label: 'Covenant I',
    phase: 2,
    branch: 'covenant',
    cost: 100,
    order: 1,
    description: 'Covenant branch node 1',
  },
  {
    id: 'covenant2',
    label: 'Covenant II',
    phase: 2,
    branch: 'covenant',
    cost: 100,
    order: 2,
    description: 'Covenant branch node 2',
  },
  {
    id: 'covenant3',
    label: 'Covenant III',
    phase: 2,
    branch: 'covenant',
    cost: 100,
    order: 3,
    description: 'Covenant branch node 3',
  },
  // Branch: Unraveling
  {
    id: 'unraveling1',
    label: 'Unraveling I',
    phase: 2,
    branch: 'unraveling',
    cost: 100,
    order: 1,
    description: 'Unraveling branch node 1',
  },
  {
    id: 'unraveling2',
    label: 'Unraveling II',
    phase: 2,
    branch: 'unraveling',
    cost: 100,
    order: 2,
    description: 'Unraveling branch node 2',
  },
  {
    id: 'unraveling3',
    label: 'Unraveling III',
    phase: 2,
    branch: 'unraveling',
    cost: 100,
    order: 3,
    description: 'Unraveling branch node 3',
  },
]

export const PHASE_1_NODE_IDS = RESEARCH_NODES
  .filter(n => n.phase === 1)
  .map(n => n.id)
