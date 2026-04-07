// Thresholds: 30% of soft cap (default)
export const TRIFECTA_THRESHOLD_ANIMA = 150   // 30% of 500
export const TRIFECTA_THRESHOLD_GNOSIS = 75   // 30% of 250
export const TRIFECTA_THRESHOLD_VOLTIS = 90   // 30% of 300

// Careful Balance talent: reduces thresholds to 24% of soft cap
export const TRIFECTA_THRESHOLD_ANIMA_TALENT = 120
export const TRIFECTA_THRESHOLD_GNOSIS_TALENT = 60
export const TRIFECTA_THRESHOLD_VOLTIS_TALENT = 72

// Time all 3 must be above threshold before Harmony activates (ms)
export const TRIFECTA_SUSTAIN_MS = 60_000

// Harmony bonus multiplier (default)
export const HARMONY_BONUS_MULTIPLIER = 0.20

// Trifecta Resonance talent: +10pp → 30% total
export const HARMONY_BONUS_RESONANCE_MULTIPLIER = 0.30

// Unbinding artifact doubles bonus
export const HARMONY_UNBINDING_MULTIPLIER = 2

// Summoning: Harmony window shortens to 3 min
export const HARMONY_SUMMONING_SUSTAIN_MS = 3 * 60 * 1000
