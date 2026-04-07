import { useState, useEffect } from 'react'
import { useGameStore } from '../hooks/useGameStore'
import { formatDuration } from '../utils/format'

export function CultistPanel() {
  const cultists = useGameStore(s => s.state.cultists)
  const milestones = useGameStore(s => s.state.milestones)
  const assignSacrifice = useGameStore(s => s.assignSacrifice)
  const unassignSacrifice = useGameStore(s => s.unassignSacrifice)

  // Update every second so the recruit countdown ticks down live
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const m3Reached = milestones.reached.m3

  const sacrificeCount = cultists.assignments.filter(a => a.role === 'sacrifice').length
  const idleCount = cultists.count - cultists.assignments.length
  const recruitIn = Math.max(0, cultists.nextRecruitAt - now)

  const canAssign = idleCount > 0
  const canUnassign = sacrificeCount > 0

  return (
    <div className="panel">
      <div className="panel-title">Cultists</div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span className="text-number" style={{ fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          {cultists.count}
        </span>
        <span style={{ fontSize: '1rem' }} className="text-secondary">
          bound souls
        </span>
      </div>

      <div style={{ fontSize: '1rem', marginTop: '4px' }} className="text-secondary">
        <span className="text-number">{idleCount}</span> idle
        {sacrificeCount > 0 && (
          <span>, <span className="text-number">{sacrificeCount}</span> offered</span>
        )}
      </div>

      <div style={{ fontSize: '0.875rem', marginTop: '4px' }} className="text-muted">
        Next arrival: {recruitIn > 0 ? formatDuration(recruitIn) : 'arriving…'}
      </div>

      {/* Sacrifice assignment — only shown after M3 milestone */}
      {m3Reached && (
        <div style={{ marginTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
          <div style={{ fontSize: '0.875rem', marginBottom: '4px' }} className="text-muted">
            Sacrifice rites
          </div>
          <div className="assign-row">
            <span style={{ fontSize: '1rem' }} className="text-secondary">
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
