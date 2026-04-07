import { useState, useEffect } from 'react'
import { useGameStore } from '../hooks/useGameStore'
import { formatDuration, formatNumber } from '../utils/format'
import { EXPEDITION_TIMERS, EXPEDITION_SLOTS_DEFAULT, EXPEDITION_SLOTS_MAX } from '../data/expeditions'
import type { ExpeditionState } from '../types'

function useNow(interval = 500) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval)
    return () => clearInterval(id)
  }, [interval])
  return now
}

interface ActiveExpeditionCardProps {
  expedition: ExpeditionState
  now: number
}

function ActiveExpeditionCard({ expedition, now }: ActiveExpeditionCardProps) {
  const remaining = Math.max(0, expedition.completesAt - now)
  const totalDuration = EXPEDITION_TIMERS[expedition.planet][expedition.cultistIds.length as 1 | 2 | 3]
    ?? EXPEDITION_TIMERS[expedition.planet][1]
  const elapsed = totalDuration - remaining
  const progress = Math.min(elapsed / totalDuration, 1)

  return (
    <div style={{
      border: '1px solid var(--border-subtle)',
      borderRadius: '4px',
      padding: '10px',
      marginBottom: '8px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '1rem', fontWeight: 'bold' }}>
          Planet {expedition.planet} — {expedition.cultistIds.length} cultist{expedition.cultistIds.length !== 1 ? 's' : ''}
        </span>
        <span style={{ fontSize: '1rem' }} className="text-muted">
          {remaining > 0 ? formatDuration(remaining) : 'Returning…'}
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--surface-1)', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progress * 100}%`,
          backgroundColor: 'var(--gold-primary)',
          transition: 'width 0.5s',
          borderRadius: '3px',
        }} />
      </div>
    </div>
  )
}

interface ChoiceCardProps {
  expedition: ExpeditionState
}

function ChoiceCard({ expedition }: ChoiceCardProps) {
  const resolveChoice = useGameStore(s => s.resolveChoice)
  const resources = useGameStore(s => s.state.resources)
  const event = expedition.choiceEvent
  if (!event || event.resolvedOptionId) return null

  return (
    <div style={{
      border: '1px solid var(--gold-primary)',
      borderRadius: '4px',
      padding: '12px',
      marginBottom: '8px',
      backgroundColor: 'rgba(212, 175, 55, 0.05)',
    }}>
      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', color: 'var(--gold-primary)', letterSpacing: '0.06em' }}>
        CHOICE EVENT — Planet {expedition.planet}
      </div>
      <div style={{ fontSize: '1rem', marginBottom: '12px', fontStyle: 'italic' }}>
        {event.prompt}
      </div>
      {event.options.map(option => {
        const cost = option.cost
        const canAfford = !cost || resources[cost.resource] >= cost.amount
        return (
          <button
            key={option.id}
            className="btn-small"
            style={{ width: '100%', marginBottom: '6px', opacity: canAfford ? 1 : 0.5 }}
            disabled={!canAfford}
            onClick={() => resolveChoice(expedition.id, option.id)}
          >
            {option.label}
            {cost && (
              <span style={{ fontSize: '0.85rem', marginLeft: '6px', opacity: 0.8 }}>
                (costs {formatNumber(cost.amount)} {cost.resource})
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

interface CompletedCardProps {
  expedition: ExpeditionState
  onDismiss: () => void
}

function CompletedCard({ expedition, onDismiss }: CompletedCardProps) {
  if (expedition.outcome === 'safe') {
    return (
      <div style={{
        border: '1px solid var(--indicator-green)',
        borderRadius: '4px',
        padding: '10px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ color: 'var(--state-green-text)', fontWeight: 'bold' }}>Safe Return</span>
          <span style={{ fontSize: '0.9rem', marginLeft: '8px' }} className="text-muted">
            Planet {expedition.planet} — {expedition.cultistIds.length} cultists
          </span>
        </div>
        <button className="btn-small" onClick={onDismiss}>Dismiss</button>
      </div>
    )
  }

  if (expedition.outcome === 'lost') {
    return (
      <div style={{
        border: '1px solid var(--indicator-danger)',
        borderRadius: '4px',
        padding: '10px',
        marginBottom: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <span style={{ color: 'var(--state-danger-text)', fontWeight: 'bold' }}>Lost</span>
          <span style={{ fontSize: '0.9rem', marginLeft: '8px' }} className="text-muted">
            {expedition.cultistIds.length} cultist{expedition.cultistIds.length !== 1 ? 's' : ''} did not return
          </span>
        </div>
        <button className="btn-small" onClick={onDismiss}>Dismiss</button>
      </div>
    )
  }

  return null
}

export function ExpeditionPanel() {
  const now = useNow()
  const expeditions = useGameStore(s => s.state.expeditions)
  const cultists = useGameStore(s => s.state.cultists)
  const milestones = useGameStore(s => s.state.milestones)
  const artifacts = useGameStore(s => s.state.artifacts)
  const sendExpedition = useGameStore(s => s.sendExpedition)

  const [selectedPlanet, setSelectedPlanet] = useState<'A' | 'B'>('A')
  const [cultistCount, setCultistCount] = useState(1)
  // Track dismissed expedition IDs
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const voidwreathObtained = artifacts.some(a => a.id === 'voidwreath' && a.obtained && !a.dormant)
  const maxSlots = voidwreathObtained ? EXPEDITION_SLOTS_MAX : EXPEDITION_SLOTS_DEFAULT
  const hasPlanetB = milestones.reached.m9

  const pendingExpeditions = expeditions.filter(e => e.outcome === 'pending')
  const choiceExpeditions = expeditions.filter(
    e => e.outcome === 'choice' && e.choiceEvent && !e.choiceEvent.resolvedOptionId
  )
  const completedExpeditions = expeditions.filter(
    e => (e.outcome === 'safe' || e.outcome === 'lost') && !dismissed.has(e.id)
  )

  const idleCount = cultists.count - cultists.assignments.length
  const canSend =
    pendingExpeditions.length < maxSlots &&
    idleCount >= cultistCount &&
    cultistCount >= 1 &&
    cultistCount <= 3

  const expectedDuration = EXPEDITION_TIMERS[selectedPlanet][cultistCount as 1 | 2 | 3]
    ?? EXPEDITION_TIMERS[selectedPlanet][1]

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]))
  }

  const handleCultistCountChange = (delta: number) => {
    const next = Math.max(1, Math.min(3, cultistCount + delta))
    setCultistCount(next)
  }

  return (
    <div className="panel">
      <div className="panel-title">Expeditions</div>

      <div style={{ fontSize: '0.9rem', marginBottom: '12px' }} className="text-muted">
        {pendingExpeditions.length} / {maxSlots} expeditions active
      </div>

      {/* Launch section */}
      {pendingExpeditions.length < maxSlots && (
        <div style={{
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '12px',
          marginBottom: '12px',
        }}>
          {/* Planet selector */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <button
              className={`btn-small${selectedPlanet === 'A' ? '' : ''}`}
              style={{
                flex: 1,
                opacity: selectedPlanet === 'A' ? 1 : 0.6,
                border: selectedPlanet === 'A' ? '1px solid var(--gold-primary)' : undefined,
              }}
              onClick={() => setSelectedPlanet('A')}
            >
              Planet A
            </button>
            {hasPlanetB && (
              <button
                className="btn-small"
                style={{
                  flex: 1,
                  opacity: selectedPlanet === 'B' ? 1 : 0.6,
                  border: selectedPlanet === 'B' ? '1px solid var(--gold-primary)' : undefined,
                }}
                onClick={() => setSelectedPlanet('B')}
              >
                Planet B
              </button>
            )}
          </div>

          {/* Cultist count stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1rem' }} className="text-muted">Cultists:</span>
            <button
              className="btn-small"
              style={{ padding: '2px 10px' }}
              disabled={cultistCount <= 1}
              onClick={() => handleCultistCountChange(-1)}
            >
              −
            </button>
            <span style={{ fontSize: '1.1rem', minWidth: '20px', textAlign: 'center' }}>
              {cultistCount}
            </span>
            <button
              className="btn-small"
              style={{ padding: '2px 10px' }}
              disabled={cultistCount >= 3 || cultistCount >= idleCount}
              onClick={() => handleCultistCountChange(1)}
            >
              +
            </button>
            <span style={{ fontSize: '0.9rem' }} className="text-muted">
              ({idleCount} idle)
            </span>
          </div>

          {/* Expected duration */}
          <div style={{ fontSize: '0.9rem', marginBottom: '10px' }} className="text-muted">
            Expected return: {formatDuration(expectedDuration)}
          </div>

          <button
            className="btn-small"
            style={{ width: '100%' }}
            disabled={!canSend}
            onClick={() => sendExpedition(selectedPlanet, cultistCount)}
          >
            Send Expedition — Planet {selectedPlanet}
          </button>
        </div>
      )}

      {/* Active expeditions */}
      {pendingExpeditions.map(exp => (
        <ActiveExpeditionCard key={exp.id} expedition={exp} now={now} />
      ))}

      {/* Choice events */}
      {choiceExpeditions.map(exp => (
        <ChoiceCard key={exp.id} expedition={exp} />
      ))}

      {/* Completed expeditions */}
      {completedExpeditions.map(exp => (
        <CompletedCard key={exp.id} expedition={exp} onDismiss={() => handleDismiss(exp.id)} />
      ))}

      {pendingExpeditions.length === 0 && choiceExpeditions.length === 0 && completedExpeditions.length === 0 && (
        <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }} className="text-muted">
          No expeditions in progress. Send cultists to explore the beyond.
        </div>
      )}
    </div>
  )
}
