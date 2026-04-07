import type { GameState } from '../types'

export function createInitialState(): GameState {
  const now = Date.now()
  return {
    resources: {
      anima: 0,
      gnosis: 0,
      voltis: 0,
    },
    cultists: {
      count: 3,
      assignments: [],
      nextRecruitAt: now + 1_200_000, // 20 min
    },
    gateways: {},
    expeditions: [],
    research: {
      nodes: {},
    },
    artifacts: [],
    milestones: {
      reached: {
        m1: false, m2: false, m3: false, m4: false, m5: false,
        m6: false, m7: false, m8: false, m9: false, m10: false,
        m11: false, m12: false, m13: false, m14: false,
      },
      summoningProgress: 0,
      summoningStartedAt: 0,
    },
    prestige: {
      runNumber: 1,
      boonPointsTotal: 0,
      boonPointsAvailable: 0,
      purchasedBoons: [],
    },
    meta: {
      saveVersion: 1,
      lastSaved: now,
      runStartedAt: now,
      narrativeSeen10Anima: false,
      narrativeSeen25Anima: false,
      narrativeSeen50Anima: false,
      conjureAutomated: false,
      lastConjureCompletedAt: 0,
      conjureActive: false,
      conjureCompletesAt: 0,
      nextCultistId: 1,
      preciseTutorialSeen: false,
      nextExpeditionId: 0,
    },
    constructs: {},
    trifecta: {
      harmonyStartedAt: 0,
      harmonyActive: false,
    },
    corruption: {
      active: null,
      cleanseProgress: 0,
    },
  }
}
