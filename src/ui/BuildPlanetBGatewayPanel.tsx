import { useGameStore } from '../hooks/useGameStore'
import { formatNumber } from '../utils/format'
import {
  GATEWAY_PLANET_B_BUILD_COST_ANIMA,
  GATEWAY_PLANET_B_BUILD_COST_GNOSIS,
} from '../data/gateways'

export function BuildPlanetBGatewayPanel() {
  const resources = useGameStore(s => s.state.resources)
  const buildPlanetBGateway = useGameStore(s => s.buildPlanetBGateway)

  const canAfford =
    resources.anima >= GATEWAY_PLANET_B_BUILD_COST_ANIMA &&
    resources.gnosis >= GATEWAY_PLANET_B_BUILD_COST_GNOSIS

  return (
    <div className="panel">
      <div className="panel-title">Open the Rift — Planet B</div>
      <div style={{ fontSize: '1rem', marginBottom: '10px' }} className="text-muted">
        A second dimensional plane, more volatile and resource-rich. Channels produce Voltis,
        enabling automation and deeper rites.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
        <span style={{ fontSize: '1rem' }} className="text-muted">Cost</span>
        <span style={{
          fontSize: '1rem',
          color: canAfford ? 'var(--state-green-text)' : 'var(--state-danger-text)',
        }}>
          {formatNumber(GATEWAY_PLANET_B_BUILD_COST_ANIMA)} Anima +{' '}
          {formatNumber(GATEWAY_PLANET_B_BUILD_COST_GNOSIS)} Gnosis
        </span>
      </div>

      <button
        className="btn-small"
        style={{ width: '100%' }}
        disabled={!canAfford}
        onClick={buildPlanetBGateway}
      >
        Open the Rift ({formatNumber(GATEWAY_PLANET_B_BUILD_COST_ANIMA)}A + {formatNumber(GATEWAY_PLANET_B_BUILD_COST_GNOSIS)}G)
      </button>
    </div>
  )
}
