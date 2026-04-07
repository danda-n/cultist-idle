import { useEffect } from 'react'
import { useGameStore } from './hooks/useGameStore'
import { useGameLoop } from './hooks/useGameLoop'
import { ResourceBar } from './ui/ResourceBar'
import { ConjurePanel } from './ui/ConjurePanel'
import { CultistPanel } from './ui/CultistPanel'
import { ConstructsPanel } from './ui/ConstructsPanel'

function App() {
  const initGame = useGameStore(s => s.initGame)
  const milestones = useGameStore(s => s.state.milestones)

  useEffect(() => {
    initGame()
  }, [initGame])

  useGameLoop()

  const m2Reached = milestones.reached.m2

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
          {m2Reached ? 'The Veil Trembles' : 'The Gathering Begins'}
        </span>
      </header>

      {/* Left column: Cultists + Constructs */}
      <div className="game-col-left">
        <CultistPanel />
        <ConstructsPanel />
      </div>

      {/* Center column: Resource bar + Conjure */}
      <div className="game-col-center">
        <ResourceBar />
        <ConjurePanel />
      </div>

      {/* Right column: placeholder for future phases */}
      <div className="game-col-right">
        <div className="panel" style={{ opacity: 0.35 }}>
          <div className="panel-title">The Beyond</div>
          <div style={{ fontSize: '0.85rem', fontStyle: 'italic' }} className="text-muted">
            Gateways and expeditions await further rites…
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
