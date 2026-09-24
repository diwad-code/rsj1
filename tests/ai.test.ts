import { describe, expect, it } from 'vitest'
import { createWindField } from '../src/simulation/wind'
import { truncateDistanceToHalfMeters } from '../src/sport/scoring'
import {
  aiSeedForJump,
  createAiPlan,
  simulateAiJump,
  summarizeAiDistribution,
  type AiRunnerConfig,
} from '../src/sport/ai'

function config(seed: number, difficulty: 'easy' | 'normal' | 'hard'): AiRunnerConfig {
  return {
    plan: createAiPlan(seed, difficulty),
    gateNumber: 8,
    windField: createWindField(0x45ab_1000 + seed),
  }
}

describe('P17 — deterministyczne AI używa tego samego rdzenia', () => {
  it('oglądany i szybki przebieg mają identyczne zdarzenia i wynik', () => {
    const runnerConfig = config(aiSeedForJump(0xa11ce, 'bot-017', 'qualification'), 'normal')
    const watched = simulateAiJump(runnerConfig, 'watched')
    const fast = simulateAiJump(runnerConfig, 'fast')

    expect(fast.events).toEqual(watched.events)
    expect(fast.outcome).toEqual(watched.outcome)
    expect(fast.measuredDistanceMeters).toBe(watched.measuredDistanceMeters)
    expect(fast.windMeasurement).toEqual(watched.windMeasurement)
  })

  it('seed AI jest zależny od zawodnika i serii, a nie od seeda wiatru', () => {
    const first = aiSeedForJump(123, 'bot-001', 'qualification')
    expect(aiSeedForJump(123, 'bot-001', 'qualification')).toBe(first)
    expect(aiSeedForJump(123, 'bot-002', 'qualification')).not.toBe(first)
    expect(aiSeedForJump(123, 'bot-001', 'first')).not.toBe(first)
    expect(createAiPlan(first, 'normal')).toEqual(createAiPlan(first, 'normal'))
  })
})

describe('P17 — sweep trudności TUNE', () => {
  it('zapisuje różne rozkłady decyzji, odległości i upadków bez mnożnika punktów', () => {
    const distributions = (['easy', 'normal', 'hard'] as const).map((difficulty) => {
      const samples = Array.from({ length: 24 }, (_, index) => {
        const seed = aiSeedForJump(0x51ee_0000 + index, `bot-${index}`, 'qualification')
        const plan = createAiPlan(seed, difficulty)
        const sim = simulateAiJump({ plan, gateNumber: 8, windField: createWindField(0x7700 + index) }, 'fast')
        return {
          plan,
          distanceHalfMeters: truncateDistanceToHalfMeters(sim.measuredDistanceMeters ?? 0),
          status: sim.outcome?.status ?? 'fall' as const,
        }
      })
      return [difficulty, summarizeAiDistribution(samples)] as const
    })

    const byDifficulty = Object.fromEntries(distributions)
    expect(byDifficulty.easy.count).toBe(24)
    expect(byDifficulty.normal.count).toBe(24)
    expect(byDifficulty.hard.count).toBe(24)
    expect(byDifficulty.easy.meanAbsoluteTimingErrorTicks).toBeGreaterThan(byDifficulty.normal.meanAbsoluteTimingErrorTicks)
    expect(byDifficulty.normal.meanAbsoluteTimingErrorTicks).toBeGreaterThan(byDifficulty.hard.meanAbsoluteTimingErrorTicks)
    expect(byDifficulty.hard.meanDistanceMeters).toBeGreaterThan(byDifficulty.easy.meanDistanceMeters)
    expect(byDifficulty.easy.falls).toBeGreaterThan(byDifficulty.normal.falls)
    for (const summary of Object.values(byDifficulty)) {
      expect(summary.minimumDistanceMeters).toBeGreaterThan(0)
      expect(summary.maximumDistanceMeters).toBeGreaterThanOrEqual(summary.minimumDistanceMeters)
    }
  })
})
