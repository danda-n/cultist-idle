import { useGameStore } from '../hooks/useGameStore'
import { formatNumber, formatRate } from '../utils/format'
import { SOFT_CAP_ANIMA } from '../data/resources'
import { SACRIFICE_ANIMA_PER_MIN, OSSUARY_SACRIFICE_ANIMA_PER_MIN } from '../data/constructs'

export function ResourceBar() {
  const resources = useGameStore(s => s.state.resources)
  const cultists = useGameStore(s => s.state.cultists)
  const constructs = useGameStore(s => s.state.constructs)

  const sacrificeCount = cultists.assignments.filter(a => a.role === 'sacrifice').length
  const ossuaryBuilt = constructs['ossuary']?.built === true
  const ratePerMin = sacrificeCount * (ossuaryBuilt ? OSSUARY_SACRIFICE_ANIMA_PER_MIN : SACRIFICE_ANIMA_PER_MIN)

  // Visual cap: show fill up to 2x softcap
  const displayMax = SOFT_CAP_ANIMA * 2
  const fillPct = Math.min((resources.anima / displayMax) * 100, 100)
  const softCapPct = (SOFT_CAP_ANIMA / displayMax) * 100

  return (
    <div className="panel">
      <div className="panel-title">Anima</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span className="text-number" style={{ fontSize: '1.875rem', color: 'var(--gold-primary)' }}>
          {formatNumber(resources.anima)}
        </span>
        {ratePerMin > 0 && (
          <span className="text-number text-green" style={{ fontSize: '1rem' }}>
            {formatRate(ratePerMin)}
          </span>
        )}
      </div>
      <div className="resource-bar-track">
        <div
          className="resource-bar-fill"
          style={{ width: `${fillPct}%` }}
        />
        <div
          className="resource-bar-softcap-marker"
          style={{ left: `${softCapPct}%` }}
        />
      </div>
      {resources.anima >= SOFT_CAP_ANIMA && (
        <div style={{ fontSize: '0.9rem', marginTop: '4px' }} className="text-warn">
          Above soft cap — passive production reduced to 10%
        </div>
      )}
    </div>
  )
}
