import { useGameStore } from '../hooks/useGameStore'
import { formatNumber, formatRate } from '../utils/format'
import { SOFT_CAP_GNOSIS } from '../data/resources'
import { GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN } from '../data/gateways'

export function GnosisBar() {
  const resources = useGameStore(s => s.state.resources)
  const cultists = useGameStore(s => s.state.cultists)
  const gateways = useGameStore(s => s.state.gateways)

  // Sum channeling cultists across all active gateways
  const channelingCount = Object.values(gateways).reduce((sum, gw) => {
    if (!gw.channelActive) return sum
    return sum + cultists.assignments.filter(
      a => a.role === 'channel' && a.gatewayId === gw.id
    ).length
  }, 0)

  const ratePerMin = channelingCount * GNOSIS_PRODUCTION_PER_CULTIST_PER_MIN

  // Visual cap: show fill up to 2x softcap
  const displayMax = SOFT_CAP_GNOSIS * 2
  const fillPct = Math.min((resources.gnosis / displayMax) * 100, 100)
  const softCapPct = (SOFT_CAP_GNOSIS / displayMax) * 100

  return (
    <div className="panel">
      <div className="panel-title">Gnosis</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span className="text-number" style={{ fontSize: '2.75rem', color: 'var(--gold-primary)' }}>
          {formatNumber(resources.gnosis)}
        </span>
        {ratePerMin > 0 && (
          <span className="text-number text-green" style={{ fontSize: '1.5rem' }}>
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
      {resources.gnosis >= SOFT_CAP_GNOSIS && (
        <div style={{ fontSize: '1.1rem', marginTop: '6px' }} className="text-warn">
          Above soft cap — channel yield reduced to 10%
        </div>
      )}
    </div>
  )
}
