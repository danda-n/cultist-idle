import { useEffect, useRef } from 'react'
import { useGameStore } from './useGameStore'
import { saveGame } from '../utils/storage'

const SAVE_INTERVAL_MS = 30_000 // autosave every 30s

export function useGameLoop(): void {
  const tickFrame = useGameStore(s => s.tickFrame)
  const getState = useGameStore.getState
  const lastTimeRef = useRef<number | null>(null)
  const lastSaveRef = useRef<number>(Date.now())
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }

      const deltaMs = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      if (deltaMs > 0 && deltaMs < 60_000) {
        // Ignore deltas > 1 min (tab was backgrounded — offline processor handles that)
        tickFrame(deltaMs)
      }

      // Autosave
      if (timestamp - lastSaveRef.current >= SAVE_INTERVAL_MS) {
        saveGame(getState().state)
        lastSaveRef.current = timestamp
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [tickFrame, getState])
}
