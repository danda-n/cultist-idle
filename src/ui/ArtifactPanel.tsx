import { useGameStore } from '../hooks/useGameStore'
import { formatNumber } from '../utils/format'
import { ARTIFACT_CONFIGS } from '../data/artifacts'
import type { ArtifactState } from '../types'

interface ArtifactCardProps {
  config: typeof ARTIFACT_CONFIGS[0]
  artifactState?: ArtifactState
  milestoneReached: boolean
}

function ArtifactCard({ config, artifactState, milestoneReached }: ArtifactCardProps) {
  const resources = useGameStore(s => s.state.resources)
  const craftArtifact = useGameStore(s => s.craftArtifact)

  const obtained = artifactState?.obtained === true
  const dormant = artifactState?.dormant === true
  const progress = artifactState?.progress ?? 0

  if (!milestoneReached) {
    return (
      <div style={{
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '8px',
        backgroundColor: 'var(--surface-1)',
        opacity: 0.4,
        border: '1px solid var(--border-subtle)',
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '1rem', letterSpacing: '0.04em' }}>
          ???
        </div>
        <div style={{ fontSize: '0.85rem' }} className="text-muted">Locked — ritual requirements not yet met</div>
      </div>
    )
  }

  if (obtained && !dormant) {
    return (
      <div style={{
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '8px',
        border: '1px solid var(--gold-primary)',
        backgroundColor: 'rgba(212, 175, 55, 0.07)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--gold-primary)' }}>
            {config.label}
          </span>
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: 'var(--gold-primary)',
            color: 'var(--surface-bg)',
            fontWeight: 'bold',
            letterSpacing: '0.06em',
          }}>
            OBTAINED
          </span>
        </div>
        <div style={{ fontSize: '0.9rem' }} className="text-muted">{config.description}</div>
      </div>
    )
  }

  if (obtained && dormant) {
    return (
      <div style={{
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '8px',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface-1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
          <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>{config.label}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--state-warn-text)', letterSpacing: '0.05em' }}>
            AWAITING PLANET B
          </span>
        </div>
        <div style={{ fontSize: '0.9rem' }} className="text-muted">{config.description}</div>
      </div>
    )
  }

  // Not yet obtained
  if (config.source === 'discovered') {
    return (
      <div style={{
        padding: '10px',
        borderRadius: '4px',
        marginBottom: '8px',
        border: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface-1)',
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>{config.label}</div>
        <div style={{ fontSize: '0.9rem', marginBottom: '4px' }} className="text-muted">{config.description}</div>
        <div style={{ fontSize: '0.85rem', fontStyle: 'italic' }} className="text-muted">
          Found on expeditions
        </div>
      </div>
    )
  }

  // Crafted artifact
  const cost = config.cost ?? {}
  const costAnima = cost.anima ?? 0
  const costGnosis = cost.gnosis ?? 0
  const costVoltis = cost.voltis ?? 0

  const canAfford =
    (costAnima === 0 || resources.anima >= costAnima) &&
    (costGnosis === 0 || resources.gnosis >= costGnosis) &&
    (costVoltis === 0 || resources.voltis >= costVoltis)

  const progressPct = Math.min(progress * 100, 100)

  return (
    <div style={{
      padding: '10px',
      borderRadius: '4px',
      marginBottom: '8px',
      border: '1px solid var(--border-subtle)',
      backgroundColor: 'var(--surface-1)',
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '4px' }}>{config.label}</div>
      <div style={{ fontSize: '0.9rem', marginBottom: '6px' }} className="text-muted">{config.description}</div>

      {/* Cost display */}
      <div style={{ fontSize: '0.85rem', marginBottom: '6px' }} className="text-muted">
        Cost:
        {costAnima > 0 && <span style={{ marginLeft: '6px', color: resources.anima >= costAnima ? 'var(--state-green-text)' : 'var(--state-danger-text)' }}>{formatNumber(costAnima)} Anima</span>}
        {costGnosis > 0 && <span style={{ marginLeft: '6px', color: resources.gnosis >= costGnosis ? 'var(--state-green-text)' : 'var(--state-danger-text)' }}>{formatNumber(costGnosis)} Gnosis</span>}
        {costVoltis > 0 && <span style={{ marginLeft: '6px', color: resources.voltis >= costVoltis ? 'var(--state-green-text)' : 'var(--state-danger-text)' }}>{formatNumber(costVoltis)} Voltis</span>}
      </div>

      {/* Progress bar */}
      <div style={{ height: '4px', borderRadius: '2px', backgroundColor: 'var(--surface-bg)', marginBottom: '8px', overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          backgroundColor: canAfford ? 'var(--gold-primary)' : 'var(--indicator-warn)',
          transition: 'width 0.5s',
          borderRadius: '2px',
        }} />
      </div>

      <button
        className="btn-small"
        style={{ width: '100%' }}
        disabled={!canAfford}
        onClick={() => craftArtifact(config.id)}
      >
        Craft {config.label}
      </button>
    </div>
  )
}

export function ArtifactPanel() {
  const milestones = useGameStore(s => s.state.milestones)
  const artifacts = useGameStore(s => s.state.artifacts)

  const obtainedCount = artifacts.filter(a => a.obtained).length

  // Milestone unlock map for artifacts (using discoveryUnlocksAtMilestone or crafted milestone)
  const artifactMilestones: Record<string, string> = {
    cindermark: 'm3',
    voidwreath: 'm5',
    whisperlock: 'm6',
    hungeringLens: 'm8',
    unbinding: 'm9',
    voicecaller: 'm11',
  }

  return (
    <div className="panel">
      <div className="panel-title">Ritual Artifacts</div>
      <div style={{ fontSize: '0.9rem', marginBottom: '12px' }} className="text-muted">
        {obtainedCount} / 6 artifacts obtained
      </div>

      {/* Ritual circle — 6 segment indicator */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '14px' }}>
        {ARTIFACT_CONFIGS.map((config) => {
          const state = artifacts.find(a => a.id === config.id)
          const obtained = state?.obtained === true && state?.dormant === false
          return (
            <div
              key={config.id}
              title={config.label}
              style={{
                flex: 1,
                height: '8px',
                borderRadius: '4px',
                backgroundColor: obtained ? 'var(--gold-primary)' : 'var(--surface-1)',
                border: '1px solid var(--border-subtle)',
                transition: 'background-color 0.3s',
              }}
            />
          )
        })}
      </div>

      {ARTIFACT_CONFIGS.map((config) => {
        const unlockMs = artifactMilestones[config.id]
        const milestoneReached = !unlockMs || milestones.reached[unlockMs as keyof typeof milestones.reached]
        const artifactState = artifacts.find(a => a.id === config.id)

        return (
          <ArtifactCard
            key={config.id}
            config={config}
            artifactState={artifactState}
            milestoneReached={Boolean(milestoneReached)}
          />
        )
      })}
    </div>
  )
}
