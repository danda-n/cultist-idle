import { useGameStore } from '../hooks/useGameStore'
import { formatNumber, formatRate } from '../utils/format'
import { SOFT_CAP_VOLTIS } from '../data/resources'
import { VOLTIS_PRODUCTION_PER_CULTIST_PER_MIN } from '../data/gateways'

export function VoltisBar() {
  const resources = useGameStore(s => s.state.resources)
  const cultists = useGameStore(s => s.state.cultists)
  const gateways = useGameStore(s => s.state.gateways)

  // Sum channeling cultists across Planet B gateways
  const channelingCount = Object.values(gateways).reduce((sum, gw) => {
    if (!gw.channelActive || gw.planet !== 'B') return sum
    return sum + cultists.assignments.filter(
      a => a.role === 'channel' && a.gatewayId === gw.id
    ).length
  }, 0)

  const ratePerMin = channelingCount * VOLTIS_PRODUCTION_PER_CULTIST_PER_MIN

  // Visual cap: show fill up to 2x softcap
  const displayMax = SOFT_CAP_VOLTIS * 2
  const fillPct = Math.min((resources.voltis / displayMax) * 100, 100)
  const softCapPct = (SOFT_CAP_VOLTIS / displayMax) * 100

  return (
    <div className="panel">
      <div className="panel-title">Voltis</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span className="text-number" style={{ fontSize: '2.75rem', color: 'var(--gold-primary)' }}>
          {formatNumber(resources.voltis)}
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
      {resources.voltis >= SOFT_CAP_VOLTIS && (
        <div style={{ fontSize: '1.1rem', marginTop: '6px' }} className="text-warn">
          Above soft cap — channel yield reduced to 10%
        </div>
      )}
    </div>
  )
}
