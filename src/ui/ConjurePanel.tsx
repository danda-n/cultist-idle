import { useGameStore } from '../hooks/useGameStore'
import { getConjureCooldown } from '../utils/conjureHelpers'
import { CONJURE_PRECISE_WINDOW_MS } from '../data/resources'
import { formatDuration } from '../utils/format'

const NARRATIVE_MESSAGES: Record<string, string> = {
  n10: 'The first threads of Anima coil through your fingers. Something stirs in the dark.',
  n25: 'Twenty-five souls\' worth of essence. The ritual circle begins to hum with latent power.',
  n50: 'Fifty Anima gathered. The veil between worlds grows thin at your command.',
}

export function ConjurePanel() {
  const state = useGameStore(s => s.state)
  const clickConjure = useGameStore(s => s.clickConjure)

  const { meta } = state
  const cooldownMs = getConjureCooldown(state)

  // Progress 0–1
  let progress = 0
  const now = Date.now()
  if (meta.conjureActive && meta.conjureCompletesAt > 0) {
    const startedAt = meta.conjureCompletesAt - cooldownMs
    progress = Math.min((now - startedAt) / cooldownMs, 1)
  }

  // Precise Rite window: button glows if last completion was < PRECISE_WINDOW_MS ago
  const inPreciseWindow =
    !meta.conjureAutomated &&
    !meta.conjureActive &&
    meta.lastConjureCompletedAt > 0 &&
    (now - meta.lastConjureCompletedAt) < CONJURE_PRECISE_WINDOW_MS

  const isDisabled = meta.conjureActive

  // Narrative messages to show
  const shownNarratives: string[] = []
  if (meta.narrativeSeen10Anima) shownNarratives.push('n10')
  if (meta.narrativeSeen25Anima) shownNarratives.push('n25')
  if (meta.narrativeSeen50Anima) shownNarratives.push('n50')
  // Show only the most recent one
  const latestNarrative = shownNarratives[shownNarratives.length - 1]

  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <div className="panel-title" style={{ textAlign: 'left' }}>Conjuring</div>

      <button
        className={`conjure-btn${inPreciseWindow ? ' conjure-btn-precise' : ''}`}
        onClick={clickConjure}
        disabled={isDisabled}
        title={isDisabled ? 'Ritual in progress…' : 'Begin the Conjuring Rite'}
      >
        {meta.conjureActive ? `Conjuring… (${formatDuration((1 - progress) * cooldownMs)})` : 'Conjure Anima'}
      </button>

      {meta.conjureActive && (
        <div className="conjure-progress-track">
          <div
            className="conjure-progress-fill"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}

      {inPreciseWindow && (
        <div style={{ marginTop: '6px', fontSize: '0.8rem', color: 'var(--gold-primary)' }}>
          Precise Rite window — conjure now for +3 Anima
        </div>
      )}

      {latestNarrative && (
        <div className="narrative-message">
          {NARRATIVE_MESSAGES[latestNarrative]}
        </div>
      )}

      {meta.conjureAutomated && (
        <div style={{ marginTop: '6px', fontSize: '0.75rem' }} className="text-muted">
          Blood Compact active — conjuring automated
        </div>
      )}
    </div>
  )
}
