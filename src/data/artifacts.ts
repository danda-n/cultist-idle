import type { ArtifactId, ArtifactSource } from '../types'

export interface ArtifactConfig {
  id: ArtifactId
  label: string
  source: ArtifactSource
  /** Crafted cost; undefined for discovered */
  cost?: {
    anima?: number
    gnosis?: number
    voltis?: number
  }
  /** Milestone required before this artifact can be found in expedition loot */
  discoveryUnlocksAtMilestone?: string
  description: string
}

export const ARTIFACT_CONFIGS: ArtifactConfig[] = [
  {
    id: 'cindermark',
    label: 'The Cindermark',
    source: 'crafted',
    cost: { anima: 200 },
    description: 'All sacrifice yields doubled.',
  },
  {
    id: 'whisperlock',
    label: 'The Whisperlock',
    source: 'crafted',
    cost: { anima: 150, gnosis: 100 },
    description: 'Phase 2 research cost −20%.',
  },
  {
    id: 'unbinding',
    label: 'The Unbinding',
    source: 'crafted',
    cost: { anima: 300, gnosis: 150, voltis: 100 },
    description: 'Trifecta threshold → 0%; Harmony bonus doubled.',
  },
  {
    id: 'voidwreath',
    label: 'The Voidwreath',
    source: 'discovered',
    discoveryUnlocksAtMilestone: 'm5',
    description: 'Adds a run-scoped expedition slot.',
  },
  {
    id: 'hungeringLens',
    label: 'The Hungering Lens',
    source: 'discovered',
    discoveryUnlocksAtMilestone: 'm8',
    description: 'Expedition cultist loss chance −15% (activates at M9).',
  },
  {
    id: 'voicecaller',
    label: 'The Voicecaller',
    source: 'discovered',
    discoveryUnlocksAtMilestone: 'm9',
    description: 'Cultist passive recruitment rate +50%.',
  },
]
