// 1 cultist every 20 minutes = 1 / 1,200,000 ms
// TODO: TESTING ONLY — 10x faster recruitment. Revert before release. (rate=1_200_000)
export const CULTIST_RECRUIT_RATE_MS = 120_000
export const CULTIST_FLOOR = 3

// Default priority order for forced removal (lowest priority removed first)
export const DEFAULT_ROLE_PRIORITY: readonly string[] = [
  'idle',
  'sacrifice',
  'channel',
  'expedition',
]
