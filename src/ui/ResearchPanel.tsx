import { useGameStore } from '../hooks/useGameStore'
import { formatNumber } from '../utils/format'
import { RESEARCH_NODES } from '../data/research'

export function ResearchPanel() {
  const resources = useGameStore(s => s.state.resources)
  const research = useGameStore(s => s.state.research)
  const milestones = useGameStore(s => s.state.milestones)
  const purchaseResearch = useGameStore(s => s.purchaseResearch)

  const phase1Nodes = RESEARCH_NODES
    .filter(n => n.phase === 1)
    .sort((a, b) => a.order - b.order)

  return (
    <div className="panel">
      <div className="panel-title">Forbidden Knowledge</div>

      {phase1Nodes.map((node, index) => {
        const isPurchased = research.nodes[node.id]?.purchased === true
        const prevNode = index > 0 ? phase1Nodes[index - 1] : null
        const isLocked = prevNode !== null && !research.nodes[prevNode.id]?.purchased
        const canAfford = resources.gnosis >= node.cost
        const canPurchase = !isPurchased && !isLocked && canAfford

        let costColor = 'var(--state-green-text)'
        if (isPurchased) costColor = 'var(--text-muted)'
        else if (isLocked) costColor = 'var(--text-ghost)'
        else if (!canAfford) costColor = 'var(--state-danger-text)'

        return (
          <div
            key={node.id}
            className="construct-card"
            style={isPurchased ? { opacity: 0.7 } : undefined}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                {node.label}
              </span>
              {isPurchased ? (
                <span style={{ fontSize: '1rem' }} className="text-green">Acquired</span>
              ) : (
                <span style={{ fontSize: '1rem', color: costColor }}>
                  {formatNumber(node.cost)} Gnosis
                </span>
              )}
            </div>
            <div style={{ fontSize: '1rem', marginTop: '4px' }} className="text-muted">
              {node.description}
            </div>
            {!isPurchased && (
              <button
                className="btn-small"
                style={{ marginTop: '8px', width: '100%' }}
                disabled={!canPurchase}
                onClick={() => purchaseResearch(node.id)}
              >
                {isLocked ? 'Locked' : !canAfford ? `Acquire (${formatNumber(node.cost)} G)` : `Acquire (${formatNumber(node.cost)} G)`}
              </button>
            )}
          </div>
        )
      })}

      {/* Phase 2 placeholder */}
      <div
        className="construct-card"
        style={{ opacity: 0.4 }}
      >
        <div style={{ fontFamily: 'Cinzel, serif', fontSize: '1.1rem', color: 'var(--text-muted)' }}>
          Phase 2 Branches
        </div>
        <div style={{ fontSize: '1rem', marginTop: '4px' }} className="text-muted">
          {milestones.reached.m6
            ? 'Advanced rites available — three paths diverge…'
            : 'Unlocked at Milestone 6 (Dread Fortitude acquired)'}
        </div>
      </div>
    </div>
  )
}
