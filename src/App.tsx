import { useEffect } from 'react'
import { useGameStore } from './hooks/useGameStore'
import { useGameLoop } from './hooks/useGameLoop'

function App() {
  const initGame = useGameStore(s => s.initGame)

  useEffect(() => {
    initGame()
  }, [initGame])

  useGameLoop()

  return (
    <div style={{ padding: '2rem', color: 'var(--text-primary)' }}>
      <h1 style={{ fontFamily: 'serif', marginBottom: '1rem' }}>Cultist Idle</h1>
      <p style={{ color: 'var(--text-secondary)' }}>Engine initialised. Phase 1 coming soon.</p>
    </div>
  )
}

export default App
