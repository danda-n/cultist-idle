import { useState, useEffect } from 'react'
import { useGameStore } from '../hooks/useGameStore'
import { formatDuration } from '../utils/format'

export function CultistPanel() {
  const cultists = useGameStore(s => s.state.cultists)
  const constructs = useGameStore(s => s.state.constructs)
  const assignSacrifice = useGameStore(s => s.assignSacrifice)
  const unassignSacrifice = useGameStore(s => s.unassignSacrifice)

  // Update every second so the recruit countdown ticks down live
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const altarBuilt = constructs['altar']?.built === true

  const sacrificeCount = cultists.assignments.filter(a => a.role === 'sacrifice').length
  const idleCount = cultists.count - cultists.assignments.length
  const recruitIn = Math.max(0, cultists.nextRecruitAt - now)

  const canAssign = idleCount > 0
  const canUnassign = sacrificeCount > 0

  return (
    <div className="panel">
      <div className="panel-title">Cultists</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <span className="text-number" style={{ fontSize: '2.25rem', color: 'var(--text-primary)' }}>
          {cultists.count}
        </span>
        <span style={{ fontSize: '1.5rem' }} className="text-secondary">
          bound souls
        </span>
      </div>

      <div style={{ fontSize: '1.1rem', marginTop: '6px' }} className="text-secondary">
        <span className="text-number">{idleCount}</span> idle
        {sacrificeCount > 0 && (
          <span>, <span className="text-number">{sacrificeCount}</span> offered</span>
        )}
      </div>

      <div style={{ fontSize: '1rem', marginTop: '4px' }} className="text-muted">
        Next arrival: {recruitIn > 0 ? formatDuration(recruitIn) : 'arriving…'}
      </div>

      {/* Description of cultist purpose */}
      {!altarBuilt && (
        <div style={{ fontSize: '0.95rem', marginTop: '8px', fontStyle: 'italic' }} className="text-muted">
          Your followers await purpose. Construct the Altar to begin binding their essence into sacrifice rites.
        </div>
      )}

      {/* Sacrifice assignment — shown once Altar is built (gates M3 milestone) */}
      {altarBuilt && (
        <div style={{ marginTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
          <div style={{ fontSize: '1rem', marginBottom: '4px' }} className="text-muted">
            Sacrifice rites
          </div>
          <div style={{ fontSize: '0.95rem', marginBottom: '6px', fontStyle: 'italic' }} className="text-muted">
            Offered cultists generate <span style={{ color: 'var(--gold-primary)' }}>6 Anima/min</span> passively.
          </div>
          <div className="assign-row">
            <span style={{ fontSize: '1.1rem' }} className="text-secondary">
              Offered: <span className="text-number">{sacrificeCount}</span>
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button className="btn-small" onClick={unassignSacrifice} disabled={!canUnassign}>−</button>
              <button className="btn-small" onClick={assignSacrifice} disabled={!canAssign}>+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
