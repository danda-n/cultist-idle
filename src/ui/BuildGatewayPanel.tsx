import { useGameStore } from '../hooks/useGameStore'
import { formatNumber } from '../utils/format'
import { GATEWAY_BUILD_COST_ANIMA } from '../data/gateways'

export function BuildGatewayPanel() {
  const resources = useGameStore(s => s.state.resources)
  const research = useGameStore(s => s.state.research)
  const buildGateway = useGameStore(s => s.buildGateway)

  const openedWayPurchased = research.nodes['theOpenedWay']?.purchased === true
  const cost = Math.floor(GATEWAY_BUILD_COST_ANIMA * (openedWayPurchased ? 0.8 : 1.0))
  const canAfford = resources.anima >= cost

  return (
    <div className="panel">
      <div className="panel-title">Raise a Gateway</div>
      <div style={{ fontSize: '1rem', marginBottom: '10px' }} className="text-muted">
        Channel the Frame into a dimensional rift. Produces Gnosis via the Channel rite.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <span style={{ fontSize: '1rem' }} className="text-muted">Cost</span>
        <span style={{ fontSize: '1rem', color: canAfford ? 'var(--state-green-text)' : 'var(--state-danger-text)' }}>
          {formatNumber(cost)} Anima
          {openedWayPurchased && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
              (−20% Opened Way)
            </span>
          )}
        </span>
      </div>

      <button
        className="btn-small"
        style={{ width: '100%' }}
        disabled={!canAfford}
        onClick={buildGateway}
      >
        Open Gateway ({formatNumber(cost)} A)
      </button>
    </div>
  )
}
