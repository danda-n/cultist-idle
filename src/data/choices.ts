import type { ChoiceEvent } from '../types'

export const CHOICE_EVENT_POOL: ChoiceEvent[] = [
  {
    id: 'c1',
    weight: 'minor',
    prompt: 'The cultists find a sealed chamber. The air inside hums with residual Anima. Do you break the seal?',
    options: [
      { id: 'take', label: "Break it open — claim what's inside" },
      { id: 'leave', label: 'Leave it sealed — too risky' },
    ],
  },
  {
    id: 'c2',
    weight: 'minor',
    prompt: 'A fleeing scholar offers to trade forbidden manuscripts for safe passage.',
    options: [
      { id: 'trade', label: 'Accept the trade' },
      { id: 'refuse', label: 'Refuse — we need no outsiders' },
    ],
  },
  {
    id: 'c3',
    weight: 'major',
    prompt: 'The gateway flickers mid-channel. Hold it open for full loot or recall the cultists now?',
    options: [
      { id: 'hold', label: 'Hold — full loot, costs 30 Voltis', cost: { resource: 'voltis', amount: 30 } },
      { id: 'recall', label: 'Recall now — safe, half loot' },
    ],
  },
  {
    id: 'c4',
    weight: 'major',
    prompt: 'A local entity offers a trade: 80 Gnosis for your entire Voltis cache from this expedition.',
    options: [
      { id: 'trade', label: 'Accept the trade' },
      { id: 'refuse', label: 'Refuse — Voltis is precious' },
    ],
  },
  {
    id: 'c5',
    weight: 'minor',
    prompt: 'Your cultists discover a wounded void-beast. Sacrifice it for Anima or leave it?',
    options: [
      { id: 'sacrifice', label: 'Sacrifice it — 50 Anima' },
      { id: 'release', label: 'Release it — perhaps it remembers mercy' },
    ],
  },
  {
    id: 'c6',
    weight: 'rare',
    prompt: 'The cultists stumble onto a ritual site still warm with power. They can absorb it — but one will not return.',
    options: [
      { id: 'absorb', label: 'Absorb the power — lose one cultist, gain 150 Gnosis' },
      { id: 'withdraw', label: 'Withdraw — no sacrifice is worth this' },
    ],
  },
]
