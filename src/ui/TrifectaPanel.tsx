import { useState, useEffect } from 'react'
import { useGameStore } from '../hooks/useGameStore'
import { formatNumber } from '../utils/format'
import {
  TRIFECTA_THRESHOLD_ANIMA,
  TRIFECTA_THRESHOLD_GNOSIS,
  TRIFECTA_THRESHOLD_VOLTIS,
} from '../data/trifecta'

function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

interface ResourceRowProps {
  name: string
  current: number
  threshold: number
}

function ResourceRow({ name, current, threshold }: ResourceRowProps) {
  const ratio = current / threshold
  let colorVar: string
  if (current >= threshold) {
    colorVar = 'var(--state-green-text)'
  } else if (ratio >= 0.8) {
    colorVar = 'var(--state-warn-text)'
  } else {
    colorVar = 'var(--state-danger-text)'
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
      <span style={{ fontSize: '1rem' }} className="text-muted">{name}</span>
      <span style={{ fontSize: '1rem', color: colorVar }}>
        {formatNumber(current)} / {formatNumber(threshold)}
        {current >= threshold ? ' ✓' : ''}
      </span>
    </div>
  )
}

export function TrifectaPanel() {
  const now = useNow()
  const resources = useGameStore(s => s.state.resources)
  const trifecta = useGameStore(s => s.state.trifecta)
  const artifacts = useGameStore(s => s.state.artifacts)

  const unbindingObtained = artifacts.some(a => a.id === 'unbinding' && a.obtained && !a.dormant)

  const animaThreshold = unbindingObtained ? 0 : TRIFECTA_THRESHOLD_ANIMA
  const gnosisThreshold = unbindingObtained ? 0 : TRIFECTA_THRESHOLD_GNOSIS
  const voltisThreshold = unbindingObtained ? 0 : TRIFECTA_THRESHOLD_VOLTIS

  const harmonyDurationMs = trifecta.harmonyActive && trifecta.harmonyStartedAt > 0
    ? now - trifecta.harmonyStartedAt
    : 0
  const harmonyMinutes = Math.floor(harmonyDurationMs / 60_000)
  const harmonySeconds = Math.floor((harmonyDurationMs % 60_000) / 1000)

  return (
    <div className="panel">
      <div className="panel-title">Trifecta</div>

      <ResourceRow
        name="Anima"
        current={resources.anima}
        threshold={animaThreshold}
      />
      <ResourceRow
        name="Gnosis"
        current={resources.gnosis}
        threshold={gnosisThreshold}
      />
      <ResourceRow
        name="Voltis"
        current={resources.voltis}
        threshold={voltisThreshold}
      />

      <div style={{
        marginTop: '12px',
        padding: '8px',
        borderRadius: '4px',
        backgroundColor: trifecta.harmonyActive
          ? 'rgba(212, 175, 55, 0.15)'
          : 'var(--surface-1)',
        textAlign: 'center',
      }}>
        {trifecta.harmonyActive ? (
          <>
            <div style={{
              fontSize: '1.1rem',
              color: 'var(--gold-primary)',
              fontWeight: 'bold',
              letterSpacing: '0.05em',
            }}>
              HARMONY ACTIVE +20%
            </div>
            {harmonyDurationMs > 0 && (
              <div style={{ fontSize: '0.9rem', marginTop: '4px' }} className="text-muted">
                Active for {harmonyMinutes}m {harmonySeconds}s
              </div>
            )}
          </>
        ) : (
          <div style={{ fontSize: '1rem' }} className="text-muted">
            {trifecta.harmonyStartedAt > 0
              ? 'Sustaining… building toward Harmony'
              : 'Harmony inactive — raise all resources above thresholds'}
          </div>
        )}
      </div>
    </div>
  )
}
