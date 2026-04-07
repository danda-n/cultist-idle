import { useState, useEffect, useRef } from 'react'
import { useGameStore } from '../hooks/useGameStore'
import { getConjureCooldown } from '../utils/conjureHelpers'
import { CONJURE_PRECISE_WINDOW_MS } from '../data/resources'
import { formatDuration } from '../utils/format'

const NARRATIVE_MESSAGES: Record<string, string> = {
  n10: 'The first threads of Anima coil through your fingers. Something stirs in the dark.',
  n25: 'The essence pools and thickens. Power is beginning to answer your call.',
  n50: 'The veil between worlds grows thin. A gateway may now be within reach.',
}

const TOAST_DURATION_MS = 8_000

export function ConjurePanel() {
  const state = useGameStore(s => s.state)
  const clickConjure = useGameStore(s => s.clickConjure)

  const { meta } = state
  const cooldownMs = getConjureCooldown(state)

  // Progress 0–1, re-computed each render (RAF-driven by game loop)
  let progress = 0
  const now = Date.now()
  if (meta.conjureActive && meta.conjureCompletesAt > 0) {
    const startedAt = meta.conjureCompletesAt - cooldownMs
    progress = Math.min((now - startedAt) / cooldownMs, 1)
  }

  const inPreciseWindow =
    !meta.conjureAutomated &&
    !meta.conjureActive &&
    meta.lastConjureCompletedAt > 0 &&
    (now - meta.lastConjureCompletedAt) < CONJURE_PRECISE_WINDOW_MS

  // Narrative toast: only fires when flag transitions false → true
  const [activeNarrative, setActiveNarrative] = useState<string | null>(null)
  const prevFlags = useRef({
    n10: meta.narrativeSeen10Anima,
    n25: meta.narrativeSeen25Anima,
    n50: meta.narrativeSeen50Anima,
  })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const prev = prevFlags.current
    const newMsg =
      (!prev.n50 && meta.narrativeSeen50Anima) ? 'n50' :
      (!prev.n25 && meta.narrativeSeen25Anima) ? 'n25' :
      (!prev.n10 && meta.narrativeSeen10Anima) ? 'n10' : null

    prevFlags.current = {
      n10: meta.narrativeSeen10Anima,
      n25: meta.narrativeSeen25Anima,
      n50: meta.narrativeSeen50Anima,
    }

    if (newMsg) {
      setActiveNarrative(newMsg)
      if (toastTimer.current) clearTimeout(toastTimer.current)
      toastTimer.current = setTimeout(() => setActiveNarrative(null), TOAST_DURATION_MS)
    }

    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current)
    }
  }, [meta.narrativeSeen10Anima, meta.narrativeSeen25Anima, meta.narrativeSeen50Anima])

  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <div className="panel-title" style={{ textAlign: 'left' }}>Conjuring</div>

      <button
        className={`conjure-btn${inPreciseWindow ? ' conjure-btn-precise' : ''}`}
        onClick={clickConjure}
        disabled={meta.conjureActive}
      >
        {meta.conjureActive
          ? `Conjuring… (${formatDuration((1 - progress) * cooldownMs)})`
          : 'Conjure Anima'}
      </button>

      {meta.conjureActive && (
        <div className="conjure-progress-track">
          <div className="conjure-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {inPreciseWindow && (
        <div style={{ marginTop: '8px', fontSize: '1rem', color: 'var(--gold-primary)' }}>
          Precise Rite — conjure now for +3 Anima
        </div>
      )}

      {activeNarrative && (
        <div className="narrative-message">
          {NARRATIVE_MESSAGES[activeNarrative]}
        </div>
      )}

      {meta.conjureAutomated && (
        <div style={{ marginTop: '6px', fontSize: '0.875rem' }} className="text-muted">
          Blood Compact active — conjuring automated
        </div>
      )}
    </div>
  )
}
