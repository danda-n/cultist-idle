import { useGameStore } from '../hooks/useGameStore'
import { formatNumber } from '../utils/format'
import {
  ALTAR_T1_COST_ANIMA,
  ALTAR_T2_COST_ANIMA,
  OSSUARY_COST_ANIMA,
  GATEWAY_FRAME_COST_ANIMA,
} from '../data/constructs'

interface ConstructEntry {
  key: string
  label: string
  description: string
  cost: number
  tier: 1 | 2
  prerequisiteLabel?: string
  isAvailable: boolean
  isBuilt: boolean
}

export function ConstructsPanel() {
  const state = useGameStore(s => s.state)
  const buildConstruct = useGameStore(s => s.buildConstruct)

  const { resources, constructs, research } = state
  const anima = resources.anima

  const altarT1Built = constructs['altar']?.built === true && constructs['altar']?.tier === 1
  const altarT2Built = constructs['altar']?.built === true && constructs['altar']?.tier === 2
  const altarBuilt = altarT1Built || altarT2Built
  const ossuaryBuilt = constructs['ossuary']?.built === true
  const gatewayFrameBuilt = constructs['gatewayFrame']?.built === true
  const conjuringRitesPurchased = research.nodes['conjuringRites']?.purchased === true

  const entries: ConstructEntry[] = [
    {
      key: 'altar',
      label: 'Altar of Binding',
      description: 'Reduces conjure cooldown from 8s to 6s',
      cost: ALTAR_T1_COST_ANIMA,
      tier: 1,
      isAvailable: true,
      isBuilt: altarBuilt,
    },
    {
      key: 'altar',
      label: 'Altar of Binding — Tier II',
      description: 'Further reduces conjure cooldown to 4.8s',
      cost: ALTAR_T2_COST_ANIMA,
      tier: 2,
      prerequisiteLabel: 'Requires: Altar T1 + Conjuring Rites research',
      isAvailable: altarT1Built && conjuringRitesPurchased,
      isBuilt: altarT2Built,
    },
    {
      key: 'ossuary',
      label: 'Ossuary',
      description: 'Sacrifice yield: 6 → 9 Anima/min per cultist offered',
      cost: OSSUARY_COST_ANIMA,
      tier: 1,
      isAvailable: true,
      isBuilt: ossuaryBuilt,
    },
    {
      key: 'gatewayFrame',
      label: 'Gateway Frame',
      description: 'Raises the Frame for a dimensional rift. Unlocks the Gateway rite — the path to Gnosis and deeper power.',
      cost: GATEWAY_FRAME_COST_ANIMA,
      tier: 1,
      isAvailable: true,
      isBuilt: gatewayFrameBuilt,
    },
  ]

  return (
    <div className="panel">
      <div className="panel-title">Forbidden Works</div>

      {entries.map((entry, i) => {
        const canAfford = anima >= entry.cost
        const costClass = canAfford ? 'construct-cost-affordable' : 'construct-cost-unaffordable'

        return (
          <div
            key={`${entry.key}-${entry.tier}-${i}`}
            className={`construct-card${entry.isBuilt ? ' construct-card-built' : ''}`}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                {entry.label}
              </span>
              {entry.isBuilt ? (
                <span style={{ fontSize: '0.85rem' }} className="text-green">Built</span>
              ) : (
                <span className={`construct-cost ${costClass}`}>
                  {formatNumber(entry.cost)} Anima
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.9rem', marginTop: '3px' }} className="text-muted">
              {entry.description}
            </div>
            {!entry.isBuilt && (
              <>
                {entry.prerequisiteLabel && !entry.isAvailable && (
                  <div style={{ fontSize: '0.8rem', marginTop: '4px', color: 'var(--text-ghost)' }}>
                    {entry.prerequisiteLabel}
                  </div>
                )}
                <button
                  className="btn-small"
                  style={{ marginTop: '8px', width: '100%' }}
                  disabled={!entry.isAvailable || !canAfford}
                  onClick={() => buildConstruct(entry.key as 'altar' | 'ossuary' | 'gatewayFrame', entry.tier)}
                >
                  {!entry.isAvailable ? 'Locked' : `Construct (${formatNumber(entry.cost)} A)`}
                </button>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
