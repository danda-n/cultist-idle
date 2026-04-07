// Expedition durations in milliseconds
export const EXPEDITION_TIMERS: Record<'A' | 'B', Record<1 | 2 | 3, number>> = {
  A: {
    1: 20 * 60 * 1000,
    2: 15 * 60 * 1000,
    3: 12 * 60 * 1000,
  },
  B: {
    1: 35 * 60 * 1000,
    2: 26 * 60 * 1000,
    3: 20 * 60 * 1000,
  },
}

// Outcome formula constants
export const EXPEDITION_CHOICE_CHANCE = 0.40
// lost% = max(0, (50 - devotion%) × 0.6)

// Choice event pool weights
export const CHOICE_WEIGHT_MINOR = 0.60
export const CHOICE_WEIGHT_MAJOR = 0.30
export const CHOICE_WEIGHT_RARE = 0.10

// Corruption cleanse costs (Gnosis)
export const CORRUPTION_CLEANSE_FULL_GNOSIS = 200
export const CORRUPTION_CLEANSE_HALF_GNOSIS = 100  // when second corruption auto-cleanses first

// Expedition slots
export const EXPEDITION_SLOTS_DEFAULT = 2
export const EXPEDITION_SLOTS_MAX = 3

// Maximum queued choice events during offline
export const OFFLINE_CHOICE_QUEUE_MAX = 10
