export type ArtifactId =
  | 'cindermark'
  | 'whisperlock'
  | 'unbinding'
  | 'voidwreath'
  | 'hungeringLens'
  | 'voicecaller'

export type ArtifactSource = 'crafted' | 'discovered'

export interface ArtifactState {
  id: ArtifactId
  source: ArtifactSource
  /** 0–1: progress toward obtaining (cost progress or expedition find) */
  progress: number
  obtained: boolean
  /** Dormant = obtained but not yet active (Hungering Lens before M9) */
  dormant: boolean
}
