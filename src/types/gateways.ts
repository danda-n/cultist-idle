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
}
