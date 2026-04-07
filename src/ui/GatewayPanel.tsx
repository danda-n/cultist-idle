import { useState, useEffect } from 'react'
import { useGameStore } from '../hooks/useGameStore'
import { formatNumber, formatDuration } from '../utils/format'
import { DEVOTION_DECAY_RATE_PER_MIN, DREAD_FORTITUDE_DECAY_REDUCTION } from '../data/devotion'
import {
  GATEWAY_CAPACITY_T2_COST_ANIMA,
  GATEWAY_CAPACITY_T2_COST_GNOSIS,
  GATEWAY_CAPACITY_T3_COST_ANIMA,
  GATEWAY_CAPACITY_T3_COST_GNOSIS,
} from '../data/gateways'

function useNow(interval = 1000) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

interface GatewayCardProps {
  gatewayId: string
}

function GatewayCard({ gatewayId }: GatewayCardProps) {
  const now = useNow()
  const gw = useGameStore(s => s.state.gateways[gatewayId])
  const resources = useGameStore(s => s.state.resources)
  const cultists = useGameStore(s => s.state.cultists)
  const milestones = useGameStore(s => s.state.milestones)
  const research = useGameStore(s => s.state.research)
  const toggleChannel = useGameStore(s => s.toggleChannel)
  const discipline = useGameStore(s => s.discipline)
  const upgradeGatewayCapacity = useGameStore(s => s.upgradeGatewayCapacity)

  if (!gw) return null

  const isStunned = gw.stunUntil > now
  const isOnDisciplineCooldown = gw.disciplineCooldownUntil > now

  // Devotion color
  let devotionColorVar = 'var(--state-green-text)'
  let devotionBgVar = 'var(--indicator-green)'
  if (gw.devotion < 60 && gw.devotion >= 20) {
    devotionColorVar = 'var(--state-warn-text)'
    devotionBgVar = 'var(--indicator-warn)'
  } else if (gw.devotion < 20) {
    devotionColorVar = 'var(--state-danger-text)'
    devotionBgVar = 'var(--indicator-danger)'
  }

  // Channeling cultist count
  const channelingCount = cultists.assignments.filter(
    a => a.role === 'channel' && a.gatewayId === gatewayId
  ).length

  const idleCount = cultists.count - cultists.assignments.length

  // Decay rate display
  const dreadFortitudePurchased = research.nodes['dreadFortitude']?.purchased === true
  let decayRate = DEVOTION_DECAY_RATE_PER_MIN
  if (dreadFortitudePurchased) decayRate *= (1 - DREAD_FORTITUDE_DECAY_REDUCTION)

  // Capacity upgrade
  const canUpgradeT2 = gw.capacity < 2
  const canUpgradeT3 = gw.capacity < 3 && gw.capacity >= 2
  const t2CostAnima = GATEWAY_CAPACITY_T2_COST_ANIMA
  const t2CostGnosis = GATEWAY_CAPACITY_T2_COST_GNOSIS
  const t3CostAnima = GATEWAY_CAPACITY_T3_COST_ANIMA
  const t3CostGnosis = GATEWAY_CAPACITY_T3_COST_GNOSIS

  const canAffordT2 = resources.anima >= t2CostAnima && resources.gnosis >= t2CostGnosis
  const canAffordT3 = resources.anima >= t3CostAnima && resources.gnosis >= t3CostGnosis

  return (
    <div className="panel">
      <div className="panel-title">Planet A Gateway</div>

      {/* Stun notice */}
      {isStunned && (
        <div style={{
          padding: '8px',
          marginBottom: '10px',
          borderRadius: '4px',
          backgroundColor: 'var(--indicator-danger)',
          color: 'var(--state-danger-text)',
          fontSize: '1.05rem',
          fontStyle: 'italic',
        }}>
          Collapsed — channel stunned ({formatDuration(gw.stunUntil - now)} remaining)
        </div>
      )}

      {/* Devotion meter */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '1rem' }} className="text-muted">Devotion</span>
          <span style={{ fontSize: '1rem', color: devotionColorVar }}>
            {Math.floor(gw.devotion)}%
          </span>
        </div>
        <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--surface-1)', overflow: 'hidden' }}>
          <div style={{
            height: '100%',
            width: `${gw.devotion}%`,
            backgroundColor: devotionBgVar,
            transition: 'width 0.3s',
            borderRadius: '4px',
          }} />
        </div>
        {milestones.reached.m7 && (
          <div style={{ fontSize: '0.9rem', marginTop: '4px' }} className="text-muted">
            Decay: −{decayRate.toFixed(2)}%/min
          </div>
        )}
      </div>

      {/* Capacity */}
      <div style={{ marginBottom: '10px', fontSize: '1rem' }} className="text-muted">
        Channeling: {channelingCount} / {gw.capacity}
      </div>

      {/* Channel toggle */}
      <button
        className="btn-small"
        style={{ width: '100%', marginBottom: '8px' }}
        disabled={isStunned || (!gw.channelActive && idleCount <= 0)}
        onClick={() => toggleChannel(gatewayId)}
      >
        {gw.channelActive ? 'End Channel' : 'Begin Channel'}
      </button>

      {/* Capacity upgrades */}
      {canUpgradeT2 && (
        <button
          className="btn-small"
          style={{ width: '100%', marginBottom: '8px' }}
          disabled={!canAffordT2}
          onClick={() => upgradeGatewayCapacity(gatewayId, 2)}
        >
          Expand Rift (T2): {formatNumber(t2CostAnima)}A + {formatNumber(t2CostGnosis)}G
        </button>
      )}
      {canUpgradeT3 && (
        <button
          className="btn-small"
          style={{ width: '100%', marginBottom: '8px' }}
          disabled={!canAffordT3}
          onClick={() => upgradeGatewayCapacity(gatewayId, 3)}
        >
          Expand Rift (T3): {formatNumber(t3CostAnima)}A + {formatNumber(t3CostGnosis)}G
        </button>
      )}

      {/* Discipline */}
      <button
        className="btn-small"
        style={{ width: '100%' }}
        disabled={isOnDisciplineCooldown}
        onClick={() => discipline(gatewayId)}
      >
        {isOnDisciplineCooldown
          ? `Invoke Discipline (${formatDuration(gw.disciplineCooldownUntil - now)})`
          : 'Invoke Discipline'}
      </button>
    </div>
  )
}

export function GatewayPanel() {
  const gateways = useGameStore(s => s.state.gateways)
  const gatewayIds = Object.keys(gateways)

  if (gatewayIds.length === 0) return null

  return (
    <>
      {gatewayIds.map(id => (
        <GatewayCard key={id} gatewayId={id} />
      ))}
    </>
  )
}
