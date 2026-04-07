export type ConstructType = 'altar' | 'gatewayFrame' | 'ossuary' | 'scryingPool'

export type ConstructTier = 1 | 2

export interface ConstructState {
  type: ConstructType
  tier: ConstructTier
  built: boolean
}
