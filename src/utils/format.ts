/**
 * Format a game number with compact notation for large values.
 * Uses Courier Prime font-class for rendering.
 */
export function formatNumber(n: number): string {
  if (n < 1000) return Math.floor(n).toString()
  if (n < 1_000_000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M'
  return (n / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B'
}

/**
 * Format a per-minute rate with appropriate precision.
 * e.g. 6 → "+6/min", 0.5 → "+0.5/min"
 */
export function formatRate(perMin: number): string {
  if (perMin === 0) return '+0/min'
  const sign = perMin >= 0 ? '+' : ''
  if (Math.abs(perMin) >= 10) return `${sign}${Math.round(perMin)}/min`
  return `${sign}${perMin.toFixed(1).replace(/\.0$/, '')}/min`
}

/**
 * Format a duration in milliseconds as a human-readable string.
 * e.g. 8000 → "8s", 90000 → "1m 30s", 3600000 → "1h"
 */
export function formatDuration(ms: number): string {
  const totalSec = Math.ceil(ms / 1000)
  if (totalSec < 60) return `${totalSec}s`
  const mins = Math.floor(totalSec / 60)
  const secs = totalSec % 60
  if (mins < 60) {
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }
  const hours = Math.floor(mins / 60)
  const remMins = mins % 60
  return remMins > 0 ? `${hours}h ${remMins}m` : `${hours}h`
}
