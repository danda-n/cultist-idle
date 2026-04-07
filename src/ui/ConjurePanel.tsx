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
  const applyPatch = useGameStore(s => s.applyPatch)

  const { meta } = state
  const cooldownMs = getConjureCooldown(state)

  const now = Date.now()
  let progress = 0
  if (meta.conjureActive && meta.conjureCompletesAt > 0) {
    const startedAt = meta.conjureCompletesAt - cooldownMs
    progress = Math.min((now - startedAt) / cooldownMs, 1)
  }

  const inPreciseWindow =
    !meta.conjureAutomated &&
    !meta.conjureActive &&
    meta.lastConjureCompletedAt > 0 &&
    (now - meta.lastConjureCompletedAt) < CONJURE_PRECISE_WINDOW_MS

  // Show Precise Rite tutorial once: fires after first conjure bar ever completes
  const hasCompletedOnce = meta.lastConjureCompletedAt > 0
  const showTutorial = hasCompletedOnce && !meta.preciseTutorialSeen

  function dismissTutorial() {
    applyPatch({ meta: { ...meta, preciseTutorialSeen: true } })
  }

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

    return () => { if (toastTimer.current) clearTimeout(toastTimer.current) }
  }, [meta.narrativeSeen10Anima, meta.narrativeSeen25Anima, meta.narrativeSeen50Anima])

  return (
    <div className="panel" style={{ textAlign: 'center' }}>
      <div className="panel-title" style={{ textAlign: 'left' }}>Conjuring</div>

      {/* Precise Rite one-time tutorial */}
      {showTutorial && (
        <div style={{
          background: 'var(--bg-elevated)',
          border: '1px solid var(--gold-dim)',
          borderRadius: '4px',
          padding: 'var(--space-md)',
          marginBottom: 'var(--space-sm)',
          textAlign: 'left',
        }}>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: 'var(--gold-primary)', marginBottom: '8px' }}>
            The Precise Rite
          </div>
          <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
            Each conjure bar takes {formatDuration(cooldownMs)} to fill.
            The moment it completes, a <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>golden window</span> opens
            for 1.5 seconds — the button glows and pulses.
          </div>
          <div style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginTop: '6px' }}>
            Click <strong style={{ color: 'var(--text-primary)' }}>Conjure</strong> during that window
            to earn <span style={{ color: 'var(--gold-primary)', fontWeight: 'bold' }}>+3 bonus Anima</span> (11 instead of 8).
            Miss the window and you still get 8.
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic' }}>
            Timing your clicks is the fastest way to gather Anima early.
          </div>
          <button
            className="btn-small"
            style={{ marginTop: '10px', width: '100%' }}
            onClick={dismissTutorial}
          >
            Understood — begin the rite
          </button>
        </div>
      )}

      <button
        className={`conjure-btn${inPreciseWindow ? ' conjure-btn-precise' : ''}`}
        onClick={clickConjure}
        disabled={meta.conjureActive}
      >
        {meta.conjureActive
          ? `Conjuring… (${formatDuration((1 - progress) * cooldownMs)})`
          : inPreciseWindow
            ? '✦ Precise Rite Window ✦'
            : 'Conjure Anima'}
      </button>

      {meta.conjureActive && (
        <div className="conjure-progress-track">
          <div className="conjure-progress-fill" style={{ width: `${progress * 100}%` }} />
        </div>
      )}

      {inPreciseWindow && (
        <div style={{ marginTop: '8px', fontSize: '1.25rem', color: 'var(--gold-primary)', fontFamily: 'Cinzel, serif' }}>
          Click now for +3 bonus Anima!
        </div>
      )}

      {activeNarrative && (
        <div className="narrative-message">
          {NARRATIVE_MESSAGES[activeNarrative]}
        </div>
      )}

      {meta.conjureAutomated && (
        <div style={{ marginTop: '6px', fontSize: '1rem' }} className="text-muted">
          Blood Compact active — conjuring automated
        </div>
      )}
    </div>
  )
}
