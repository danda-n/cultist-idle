export type BoonId =
  | 'dreadVigil'
  | 'fanaticSeal'
  | 'trifectaResonance'
  | 'animaSwell'
  | 'expeditionKeystone'
  | 'voidwreathKeystone'
  | 'carefulBalance'

export interface PrestigeState {
  runNumber: number
  /** Total Dark Boon points earned (spent + unspent) */
  boonPointsTotal: number
  /** Unspent boon points available to allocate */
  boonPointsAvailable: number
  /** Purchased boons, persists across runs */
  purchasedBoons: BoonId[]
}
