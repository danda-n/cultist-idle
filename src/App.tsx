import { useEffect } from 'react'
import { useGameStore } from './hooks/useGameStore'
import { useGameLoop } from './hooks/useGameLoop'
import { ResourceBar } from './ui/ResourceBar'
import { GnosisBar } from './ui/GnosisBar'
import { ConjurePanel } from './ui/ConjurePanel'
import { CultistPanel } from './ui/CultistPanel'
import { ConstructsPanel } from './ui/ConstructsPanel'
import { BuildGatewayPanel } from './ui/BuildGatewayPanel'
import { GatewayPanel } from './ui/GatewayPanel'
import { ResearchPanel } from './ui/ResearchPanel'

function App() {
  const initGame = useGameStore(s => s.initGame)
  const milestones = useGameStore(s => s.state.milestones)
  const gateways = useGameStore(s => s.state.gateways)

  useEffect(() => {
    initGame()
  }, [initGame])

  useGameLoop()

  const m2 = milestones.reached.m2
  const m4 = milestones.reached.m4
  const hasGateway = Object.keys(gateways).length > 0

  return (
    <div className="game-layout">
      {/* Header */}
      <header className="game-header">
        <h1
          className="font-display"
          style={{ fontSize: '1.875rem', color: 'var(--gold-primary)', letterSpacing: '0.08em' }}
        >
          Cultist Idle
        </h1>
        <span
          className="font-heading"
          style={{ fontSize: '1rem', color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          {m4 ? 'The Rift Opens' : m2 ? 'The Veil Trembles' : 'The Gathering Begins'}
        </span>
      </header>

      {/* Left column: Cultists + Constructs + Research (after M4) */}
      <div className="game-col-left">
        <CultistPanel />
        <ConstructsPanel />
        {m4 && <ResearchPanel />}
      </div>

      {/* Center column: Resource bars + Conjure + Gateway panels */}
      <div className="game-col-center">
        <ResourceBar />
        {m4 && <GnosisBar />}
        <ConjurePanel />
        {m2 && !hasGateway && <BuildGatewayPanel />}
        {m4 && <GatewayPanel />}
      </div>

      {/* Right column: placeholder for future phases */}
      <div className="game-col-right">
        <div className="panel" style={{ opacity: 0.35 }}>
          <div className="panel-title">The Beyond</div>
          <div style={{ fontSize: '0.85rem', fontStyle: 'italic' }} className="text-muted">
            Expeditions and deeper rites await…
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
