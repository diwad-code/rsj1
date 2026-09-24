import { describe, expect, it } from 'vitest'
import {
  coachDecisionAccepted,
  coachThresholdHalfMeters,
  gateCompensationTenths,
  roundHalfAwayFromZero,
  scoreCompensatedJump,
  sumCompensatedScoreTenths,
  windCompensationTenths,
  type CompensationRule,
} from '../src/sport/compensation'
import { OFFICIAL_SCORING_FIXTURES } from './fixtures/fisScoring'

const SYNTHETIC_RULE: CompensationRule = {
  id: 'test-compensation',
  provenance: 'simulation-calibrated',
  headWindFactorTenthsPerMps: 100,
  tailWindFactorTenthsPerMps: 150,
  gateFactorTenthsPerInrunMeter: 100,
  referenceGateNumber: 8,
  coachThresholdHalfMeters: 190,
  sourceRefs: ['synthetic-test'],
}

describe('P13 / Q-FIS-05 — znaki, faktory i zaokrąglenie', () => {
  it('zaokrągla dodatnie i ujemne połówki symetrycznie od zera', () => {
    expect(roundHalfAwayFromZero(1.5)).toBe(2)
    expect(roundHalfAwayFromZero(-1.5)).toBe(-2)
    expect(windCompensationTenths(0.15, 10, 10)).toBe(-2)
    expect(gateCompensationTenths(100, 100.15, 10)).toBe(-2)
  })

  it('odejmuje za wiatr pod narty i dodaje za wiatr w plecy właściwym faktorem', () => {
    expect(windCompensationTenths(1.22, 108, 162)).toBe(-132)
    expect(windCompensationTenths(-0.49, 108, 162)).toBe(79)
    expect(windCompensationTenths(0, 108, 162)).toBe(0)
  })
})

describe('P13 / Q-FIS-06 i Q-FIS-08 — jury oraz coach', () => {
  it('obcina 95% HS w dół do połówki metra jak w oficjalnych arkuszach', () => {
    expect(coachThresholdHalfMeters(137)).toBe(260) // 130,0 m
    expect(coachThresholdHalfMeters(140)).toBe(266) // 133,0 m
    expect(coachThresholdHalfMeters(142)).toBe(269) // 134,5 m
    expect(coachThresholdHalfMeters(235)).toBe(446) // 223,0 m
  })

  it('nalicza jury i coach jednocześnie, a niespełniony próg usuwa tylko coach', () => {
    const base = {
      distanceTenths: 600,
      styleTenths: 500,
      windUserMetersPerSecond: 0,
      referenceInrunMeters: 100,
      juryInrunMeters: 99,
      actualInrunMeters: 98,
      coachDecision: { requested: true, phase: 'red' as const },
    }
    const below = scoreCompensatedJump(SYNTHETIC_RULE, { ...base, distanceHalfMeters: 189 })
    const equal = scoreCompensatedJump(SYNTHETIC_RULE, { ...base, distanceHalfMeters: 190 })
    const above = scoreCompensatedJump(SYNTHETIC_RULE, { ...base, distanceHalfMeters: 191 })
    expect(below.componentTenths).toMatchObject({ juryGate: 100, coachGate: 0 })
    expect(equal.componentTenths).toMatchObject({ juryGate: 100, coachGate: 100 })
    expect(above.componentTenths).toMatchObject({ juryGate: 100, coachGate: 100 })
  })

  it('akceptuje decyzję coach wyłącznie w czerwonej fazie i przy obniżeniu belki', () => {
    expect(coachDecisionAccepted({ requested: true, phase: 'red' }, 99, 98)).toBe(true)
    expect(coachDecisionAccepted({ requested: true, phase: 'yellow' }, 99, 98)).toBe(false)
    expect(coachDecisionAccepted({ requested: true, phase: 'green' }, 99, 98)).toBe(false)
    expect(coachDecisionAccepted({ requested: true, phase: 'red' }, 99, 99)).toBe(false)
    expect(coachDecisionAccepted({ requested: false, phase: 'red' }, 99, 98)).toBe(false)
  })
})

describe('P13 / Q-FIS-17 — kolejność clamp', () => {
  it('zachowuje dodatnią rekompensatę po clamp długość+styl, a ujemną ogranicza finalnie do zera', () => {
    const positive = sumCompensatedScoreTenths({
      distance: -900,
      style: 300,
      wind: 50,
      juryGate: 0,
      coachGate: 0,
    })
    expect(positive.collectiveTenths).toBe(0)
    expect(positive.totalTenths).toBe(50)

    const negative = sumCompensatedScoreTenths({
      distance: -900,
      style: 300,
      wind: -50,
      juryGate: 0,
      coachGate: 0,
    })
    expect(negative.collectiveTenths).toBe(0)
    expect(negative.beforeFinalClampTenths).toBe(-50)
    expect(negative.totalTenths).toBe(0)
  })
})

describe('P13 — oficjalne pełne wiersze FIS', () => {
  it.each(OFFICIAL_SCORING_FIXTURES)('$id = $expectedTotalTenths dziesiątych', (fixture) => {
    const calculatedWind = windCompensationTenths(
      fixture.windUserMetersPerSecond,
      fixture.hill.headWindFactorTenthsPerMps,
      fixture.hill.tailWindFactorTenthsPerMps,
    )
    expect(calculatedWind).toBe(fixture.publishedWindTenths)
    const score = sumCompensatedScoreTenths({
      distance: fixture.distanceTenths,
      style: fixture.styleTenths,
      wind: calculatedWind,
      juryGate: fixture.publishedGateTenths,
      coachGate: 0,
    })
    expect(score.totalTenths).toBe(fixture.expectedTotalTenths)
  })
})
