import { useGameStore } from '../hooks/useGameStore'
import { formatDuration } from '../utils/format'
import { CULTIST_FLOOR } from '../data/cultists'

export function CultistPanel() {
  const cultists = useGameStore(s => s.state.cultists)
  const milestones = useGameStore(s => s.state.milestones)
  const assignSacrifice = useGameStore(s => s.assignSacrifice)
  const unassignSacrifice = useGameStore(s => s.unassignSacrifice)

  const m3Reached = milestones.reached.m3

  const sacrificeCount = cultists.assignments.filter(a => a.role === 'sacrifice').length
  const idleCount = cultists.count - cultists.assignments.length

  const now = Date.now()
  const recruitIn = Math.max(0, cultists.nextRecruitAt - now)

  // Can assign if there's an idle cultist (idle > 0 means count > assignments.length)
  const canAssign = idleCount > 0
  // Can unassign if there's at least one sacrifice
  const canUnassign = sacrificeCount > 0

  return (
    <div className="panel">
      <div className="panel-title">Cultists</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span className="text-number" style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>
          {cultists.count}
        </span>
        <span style={{ fontSize: '0.75rem' }} className="text-muted">
          floor: {CULTIST_FLOOR}
        </span>
      </div>

      <div style={{ fontSize: '0.8rem', marginTop: '4px' }} className="text-secondary">
        <span className="text-number">{idleCount}</span> idle
        {sacrificeCount > 0 && (
          <span>, <span className="text-number">{sacrificeCount}</span> in sacrifice</span>
        )}
      </div>

      <div style={{ fontSize: '0.75rem', marginTop: '4px' }} className="text-muted">
        Next recruit: {recruitIn > 0 ? formatDuration(recruitIn) : 'arriving…'}
      </div>

      {/* Sacrifice assignment — only shown after M3 milestone */}
      {m3Reached && (
        <div style={{ marginTop: 'var(--space-sm)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-sm)' }}>
          <div style={{ fontSize: '0.75rem', marginBottom: '4px' }} className="text-muted">
            Sacrifice rites
          </div>
          <div className="assign-row">
            <span style={{ fontSize: '0.85rem' }} className="text-secondary">
              Sacrificed: <span className="text-number">{sacrificeCount}</span>
            </span>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                className="btn-small"
                onClick={unassignSacrifice}
                disabled={!canUnassign}
                title="Return one cultist from sacrifice"
              >
                −
              </button>
              <button
                className="btn-small"
                onClick={assignSacrifice}
                disabled={!canAssign}
                title="Assign one cultist to sacrifice"
              >
                +
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
