import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { buildSportMarkers } from '../src/render/sportMarkers'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { buildHill } from '../src/simulation/technicalHill'
import type { WindField } from '../src/simulation/wind'
import { coachThresholdHalfMeters, sumCompensatedScoreTenths, windCompensationTenths } from '../src/sport/compensation'
import { solveLeadingTarget } from '../src/sport/leadingTarget'
import { OFFICIAL_SCORING_FIXTURES } from './fixtures/fisScoring'
import { runJump } from './support/jumpHarness'
import { BASELINE_PARAMS } from './support/tuneProbe'

const evidenceHill = buildHill()

function decimalTenths(value: number): string {
  return (value / 10).toFixed(1)
}

function constantWind(userMetersPerSecond: number): WindField {
  return {
    seed: 1,
    version: 'pkg004-calibration-probe',
    sampleUserMetersPerSecond: () => userMetersPerSecond,
  }
}

describe('PKG-004 — materiał dowodowy', () => {
  it('odtwarza źródła, pełne wiersze, kalibrację, markery i solver bez nadpisywania dowodu', () => {
    const lines: string[] = [
      '# PKG-004 — fixtures punktacji, markerów i kalibracji',
      '',
      'Plik generowany przez `tests/pkg004Evidence.test.ts` podczas `npm test`.',
      'Arytmetyka: integer tenths; połowy są zaokrąglane od zera. Znak użytkowy/FIS: `+` = pod narty.',
      '',
      '## 1. Oficjalne pełne wiersze FIS / Swiss Timing',
      '',
      '| Fixture | Obiekt | Dystans | Długość | Styl | Wiatr [m/s] | Wiatr pkt | Belka pkt | Suma | Źródło |',
      '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
    ]

    for (const fixture of OFFICIAL_SCORING_FIXTURES) {
      const wind = windCompensationTenths(
        fixture.windUserMetersPerSecond,
        fixture.hill.headWindFactorTenthsPerMps,
        fixture.hill.tailWindFactorTenthsPerMps,
      )
      const score = sumCompensatedScoreTenths({
        distance: fixture.distanceTenths,
        style: fixture.styleTenths,
        wind,
        juryGate: fixture.publishedGateTenths,
        coachGate: 0,
      })
      expect(score.totalTenths).toBe(fixture.expectedTotalTenths)
      lines.push(`| ${fixture.athlete} — ${fixture.event} | K${fixture.hill.kPointMeters}/HS${fixture.hill.hillSizeMeters} | ${fixture.distanceMeters.toFixed(1)} | ${decimalTenths(fixture.distanceTenths)} | ${decimalTenths(fixture.styleTenths)} | ${fixture.windUserMetersPerSecond >= 0 ? '+' : ''}${fixture.windUserMetersPerSecond.toFixed(2)} | ${decimalTenths(wind)} | ${decimalTenths(fixture.publishedGateTenths)} | ${decimalTenths(score.totalTenths)} | [PDF FIS](${fixture.sourceUrl}) |`)
    }

    lines.push(
      '',
      '## 2. Q-FIS-08 — próg coach 95% HS',
      '',
      '| HS | surowe 95% | próg źródłowy / obcięty do 0,5 m |',
      '| ---: | ---: | ---: |',
      `| 137 | 130,15 | ${(coachThresholdHalfMeters(137) / 2).toFixed(1)} |`,
      `| 140 | 133,00 | ${(coachThresholdHalfMeters(140) / 2).toFixed(1)} |`,
      `| 142 | 134,90 | ${(coachThresholdHalfMeters(142) / 2).toFixed(1)} |`,
      `| 235 | 223,25 | ${(coachThresholdHalfMeters(235) / 2).toFixed(1)} |`,
      '',
      'Źródła: [ICR June 2026 §422.1](https://assets.fis-ski.com/f/252177/x/c67426c343/icr-ski-jumping-2024_e_clean.pdf), oficjalne nagłówki wyników F10/F11/Kulm powyżej.',
      '',
      '## 3. Q-FIS-17 — kolejność ograniczenia',
      '',
      '`collective = max(0, długość + styl)`, następnie rekompensaty, następnie `total = max(0, collective + wiatr + jury + coach)`.',
      'Dla długość −90,0 i styl +30,0: rekompensata +5,0 daje 5,0; rekompensata −5,0 daje 0,0.',
      '',
      '## 4. Kalibracja fikcyjnej K120 — ADAPT / simulation-calibrated',
      '',
      // Opis liczony z danych, żeby nie rozjechał się po przestrojeniu.
      `Fizyka \`${DEFAULT_JUMP_PARAMS.physicsVersion}\`; współczynniki gry: wiatr pod narty `
        + `${(evidenceHill.spec.compensation.headWindFactorTenthsPerMps / 10).toFixed(1).replace('.', ',')} pkt/(m/s), `
        + `wiatr w plecy ${(evidenceHill.spec.compensation.tailWindFactorTenthsPerMps / 10).toFixed(1).replace('.', ',')} pkt/(m/s), `
        + `belka ${(evidenceHill.spec.compensation.gateFactorTenthsPerInrunMeter / 10).toFixed(1).replace('.', ',')} pkt/m rozbiegu. Nie są danymi FIS.`,
      '',
      '| Próba | Wejście | Odległość [m] |',
      '| --- | ---: | ---: |',
    )

    // Fizyczne belki odniesienia (runda 13: nowe 17/10/13/21 = stare 8/1/4/12):
    // wektory kalibracji muszą pozostać identyczne z zamkniętym dowodem.
    // Historyczna baza bez premii perfect (BASELINE) — tylko do tego
    // zamrożonego porównania; produkcję z premią pokrywają testy safety/takeoff.
    for (const wind of [-1, 0, 1]) {
      const sim = runJump({ gate: 17, pilot: 'ideal', style: 'telemark', windField: constantWind(wind), params: BASELINE_PARAMS })
      lines.push(`| stały wiatr | ${wind >= 0 ? '+' : ''}${wind.toFixed(1)} m/s | ${(sim.measuredDistanceMeters ?? 0).toFixed(3)} |`)
    }
    for (const gate of [10, 13, 17, 21]) {
      const sim = runJump({ gate, pilot: 'ideal', style: 'telemark', windField: constantWind(0), params: BASELINE_PARAMS })
      lines.push(`| belka | ${gate} / ${sim.gateInrunLengthMeters.toFixed(2)} m rozbiegu | ${(sim.measuredDistanceMeters ?? 0).toFixed(3)} |`)
    }

    const hill = buildHill()
    const markers = buildSportMarkers(hill, { leadingTargetHalfMeters: 265, recordHalfMeters: 274 })
    const target = solveLeadingTarget({
      kPointMeters: 120,
      maximumDistanceHalfMeters: hill.spec.outrunEndMeters * 2,
      leaderTotalTenths: 1400,
      playerPreviousTenths: 0,
      predictedStyleTenths: 555,
      windTenths: 0,
      juryGateTenths: 0,
      coachGateTenths: 0,
      coachDecisionAccepted: false,
      coachThresholdHalfMeters: hill.spec.compensation.coachThresholdHalfMeters,
    })
    expect(target).not.toBeNull()
    lines.push(
      '',
      '## 5. P14 — generator markerów i solver',
      '',
      `Linie 5 m: ${markers.meterLines.map((marker) => marker.meters).join(', ')}.`,
      `Pasy boczne: ${markers.sideBands.map((band) => `${band.kind} ${band.fromMeters}–${band.toMeters} m`).join('; ')}.`,
      `K ${markers.kPoint.meters} m; HS ${markers.hillSize.meters} m; fall line ${markers.fallLine.meters} m; kontrolny rekord ${markers.record?.meters.toFixed(1)} m.`,
      `Dla lidera 140,0 pkt, stylu 55,5 i warunków neutralnych solver zwraca ~${((target?.distanceHalfMeters ?? 0) / 2).toFixed(1)} m; remis jest niewystarczający.`,
      '',
      'Agregat czujników 45/95/130 m z wagami 0,25/0,45/0,30 pozostaje `ADAPT`; HUD nie jest wejściem punktacji.',
      '',
    )

    const source = readFileSync('src/sport/compensation.ts', 'utf8')
    expect(source).not.toContain('Math.round(')
    const historical = readFileSync('docs/evidence/PKG-004/scoring-fixtures.md', 'utf8')
    // Zamknięty dowód PKG-004 zachowuje wersję fizyki, na której powstał.
    // Bieżąca wersja może rosnąć bez przepisywania historycznego artefaktu,
    // o ile sprawdzane tu wektory kalibracji pozostają identyczne.
    expect(historical).toContain('Fizyka `pkg008-tune-3`')
    // Runda 13: belki przenumerowane (nowa = stara + 9, te same długości
    // rozbiegu). Zamrożony dowód weryfikuje WEKTORY (rozbieg → odległość),
    // nie etykiety — numery mapujemy wstecz tylko do porównania.
    const historicalVersionLines = lines.map((line) => line
      .replace(/\| belka \| (\d+) \//, (_, digits: string) => `| belka | ${Number(digits) - 9} /`)
      .replace(
        `Fizyka \`${DEFAULT_JUMP_PARAMS.physicsVersion}\``,
        'Fizyka `pkg008-tune-3`',
      ))
    expect(historical).toBe(`${historicalVersionLines.join('\n')}\n`)
  })
})
