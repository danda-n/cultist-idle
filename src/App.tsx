import { useEffect } from 'react'
import { useGameStore } from './hooks/useGameStore'
import { useGameLoop } from './hooks/useGameLoop'
import { ResourceBar } from './ui/ResourceBar'
import { GnosisBar } from './ui/GnosisBar'
import { VoltisBar } from './ui/VoltisBar'
import { ConjurePanel } from './ui/ConjurePanel'
import { CultistPanel } from './ui/CultistPanel'
import { ConstructsPanel } from './ui/ConstructsPanel'
import { BuildGatewayPanel } from './ui/BuildGatewayPanel'
import { BuildPlanetBGatewayPanel } from './ui/BuildPlanetBGatewayPanel'
import { GatewayPanel } from './ui/GatewayPanel'
import { ResearchPanel } from './ui/ResearchPanel'
import { ExpeditionPanel } from './ui/ExpeditionPanel'
import { ArtifactPanel } from './ui/ArtifactPanel'
import { TrifectaPanel } from './ui/TrifectaPanel'

// TODO: TESTING ONLY — remove before release
function DebugBar() {
  const debugFastForward = useGameStore(s => s.debugFastForward)
  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, zIndex: 9999,
      display: 'flex', gap: '4px', padding: '4px',
      background: 'rgba(180,0,0,0.85)', borderBottomLeftRadius: '6px',
    }}>
      <span style={{ fontSize: '0.75rem', color: '#fff', alignSelf: 'center', marginRight: '4px', fontFamily: 'monospace' }}>
        ⚠ TEST
      </span>
      {[1, 5, 10, 30, 60].map(m => (
        <button
          key={m}
          onClick={() => debugFastForward(m)}
          style={{
            fontSize: '0.75rem', padding: '2px 6px', cursor: 'pointer',
            background: '#222', color: '#fff', border: '1px solid #555', borderRadius: '3px',
          }}
        >
          +{m}m
        </button>
      ))}
    </div>
  )
}

function App() {
  const initGame = useGameStore(s => s.initGame)
  const milestones = useGameStore(s => s.state.milestones)
  const gateways = useGameStore(s => s.state.gateways)

  useEffect(() => {
    initGame()
  }, [initGame])

  useGameLoop()

  const m2 = milestones.reached.m2
  const m3 = milestones.reached.m3
  const m4 = milestones.reached.m4
  const m8 = milestones.reached.m8
  const m9 = milestones.reached.m9

  const hasPlanetAGateway = Object.values(gateways).some(g => g.planet === 'A')
  const hasPlanetBGateway = Object.values(gateways).some(g => g.planet === 'B')

  const summoningStarted = milestones.summoningStartedAt > 0
  const summoningComplete = milestones.summoningProgress >= 1

  return (
    <div className="game-layout">
      {/* TODO: TESTING ONLY — remove before release */}
      <DebugBar />
      {/* Summoning overlay */}
      {summoningStarted && (
        <div style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          zIndex: 100,
          padding: '16px 24px',
          backgroundColor: 'rgba(0,0,0,0.85)',
          borderTop: '1px solid var(--gold-primary)',
          textAlign: 'center',
        }}>
          {summoningComplete ? (
            <div style={{
              fontSize: '2rem',
              color: 'var(--gold-primary)',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              animation: 'pulse 2s infinite',
            }}>
              THE SUMMONING IS COMPLETE
            </div>
          ) : (
            <>
              <div style={{ fontSize: '1.1rem', color: 'var(--gold-primary)', marginBottom: '8px', letterSpacing: '0.06em' }}>
                THE SUMMONING RITUAL PROCEEDS…
              </div>
              <div style={{ height: '8px', borderRadius: '4px', backgroundColor: 'var(--surface-1)', maxWidth: '400px', margin: '0 auto', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${milestones.summoningProgress * 100}%`,
                  backgroundColor: 'var(--gold-primary)',
                  transition: 'width 1s',
                  borderRadius: '4px',
                }} />
              </div>
              <div style={{ fontSize: '0.9rem', marginTop: '6px', color: 'var(--text-muted)' }}>
                {Math.floor(milestones.summoningProgress * 100)}% complete
              </div>
            </>
          )}
        </div>
      )}

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
          {m9 ? 'The Rift Expands' : m4 ? 'The Rift Opens' : m2 ? 'The Veil Trembles' : 'The Gathering Begins'}
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
        {m9 && <VoltisBar />}
        <ConjurePanel />
        {m2 && !hasPlanetAGateway && <BuildGatewayPanel />}
        {m4 && <GatewayPanel />}
        {m8 && !hasPlanetBGateway && <BuildPlanetBGatewayPanel />}
        {m4 && <TrifectaPanel />}
      </div>

      {/* Right column: Expeditions + Artifacts */}
      <div className="game-col-right">
        {m4 && <ExpeditionPanel />}
        {m3 && <ArtifactPanel />}
      </div>
    </div>
  )
}

export default App
