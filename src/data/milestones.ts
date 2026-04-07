import type { MilestoneId } from '../types'

export interface MilestoneConfig {
  id: MilestoneId
  label: string
  description: string
  /** Human-readable trigger description */
  triggerDescription: string
}

export const MILESTONE_CONFIGS: MilestoneConfig[] = [
  { id: 'm1', label: 'The First Stirring',     description: 'Anima first gathered.',             triggerDescription: 'Collect 10 Anima' },
  { id: 'm2', label: 'The Frame Is Raised',    description: 'Gateway Frame construct built.',     triggerDescription: 'Build the Gateway Frame' },
  { id: 'm3', label: 'First Blood',            description: 'First sacrifice assigned.',          triggerDescription: 'Assign a cultist to Sacrifice' },
  { id: 'm4', label: 'The Gate Breathes',      description: 'Planet A gateway built.',            triggerDescription: 'Build a Planet A gateway' },
  { id: 'm5', label: 'Depths Glimpsed',        description: 'First expedition returns.',          triggerDescription: 'Complete one expedition' },
  { id: 'm6', label: 'The Branching Path',     description: 'Phase 1 research complete.',        triggerDescription: 'Purchase Dread Fortitude' },
  { id: 'm7', label: 'The Second Breath',      description: 'Devotion decay begins.',             triggerDescription: 'Reach 50 Gnosis' },
  { id: 'm8', label: 'The Compact Sealed',     description: 'Conjuring automated, Anima flowing.', triggerDescription: 'Blood Compact active + net Anima > 0' },
  { id: 'm9', label: 'Beyond the Veil',        description: 'Planet B accessible.',               triggerDescription: 'Build a Planet B gateway' },
  { id: 'm10', label: 'The Triad Awakens',     description: 'All 3 resources active.',            triggerDescription: 'First Voltis gathered' },
  { id: 'm11', label: 'In Perfect Alignment',  description: 'Trifecta first achieved.',           triggerDescription: 'Harmony bonus activates' },
  { id: 'm12', label: 'The Six Are Named',     description: 'All 6 artifacts obtained.',          triggerDescription: 'Obtain all 6 artifacts' },
  { id: 'm13', label: 'The Circle Closes',     description: 'Ritual circle complete.',            triggerDescription: 'All 6 ritual circle segments filled' },
  { id: 'm14', label: 'The Summoning',         description: '5-minute ritual phase begins.',      triggerDescription: '6th artifact placed in ritual circle' },
]

// Summoning phase duration
export const SUMMONING_DURATION_MS = 5 * 60 * 1000
