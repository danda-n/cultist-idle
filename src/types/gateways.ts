export type Planet = 'A' | 'B'

export interface GatewayState {
  id: string
  planet: Planet
  /** 0–100 (percentage) */
  devotion: number
  cultistsAssigned: number
  capacity: number
  channelActive: boolean
  /** Absolute timestamp; 0 = no cooldown active */
  disciplineCooldownUntil: number
  /** Absolute timestamp until which channeling is stunned after devotion collapse; 0 = no stun */
  stunUntil: number
}
