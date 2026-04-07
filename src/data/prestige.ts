import type { MilestoneId } from '../types'

// Boon points granted at each milestone
export const BOON_GRANTS: Partial<Record<MilestoneId, number>> = {
  m8:  2,
  m10: 3,
  m11: 3,
}

// Phase 1 research nodes that auto-complete at run 2+
export { PHASE_1_NODE_IDS as PRESTIGE_AUTOCOMPLETE_NODES } from './research'

// What resets on Rehearsal
export const PRESTIGE_RESET_SCOPE = {
  resources: true,
  gateways: true,
  cultists: true,       // count resets to floor of 3
  phase2Research: true,
  phase1Research: false, // auto-completes instead
  artifacts: false,      // persist
  talentTree: false,     // persist
  runCounter: false,     // increments
} as const
