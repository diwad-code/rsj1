import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CompetitionSession, LARGE_ROUND_SUMMARY_VISIBLE_ROWS } from '../src/app/competitionSession'
import { drawCompetitionProgress, drawRoundSummary } from '../src/render/competitionView'
import { drawSettingsScreen, SETTINGS_ROWS } from '../src/render/settingsView'
import { drawPixelText } from '../src/render/pixelFont'
import { DEFAULT_SETTINGS } from '../src/settings/settings'
import { buildHill } from '../src/simulation/technicalHill'
import type { RankingEntry } from '../src/sport/competition'

vi.mock('../src/render/pixelFont', () => ({
  drawPixelText: vi.fn(),
  measurePixelText: (value: string, scale = 2) => Math.max(0, value.length * 6 * scale - scale),
}))

function canvas(): CanvasRenderingContext2D {
  return {
    imageSmoothingEnabled: true,
    fillRect: vi.fn(),
    strokeRect: vi.fn(),
    textAlign: 'left',
  } as unknown as CanvasRenderingContext2D
}

const standings: readonly RankingEntry[] = Array.from({ length: 75 }, (_, index) => ({
  participantId: index === 73 ? 'local-01' : `bot-${index}`,
  name: index === 73 ? 'ALEKSANDRA DŁUGIE NAZWISKO' : `ZAWODNIK ${index + 1}`,
  rank: index + 1,
  totalTenths: 1400 + index,
  status: 'landed',
}))

beforeEach(() => vi.mocked(drawPixelText).mockClear())

describe('P22 — bitmapowy ekran i czytelne tabele', () => {
  it('ma dokładnie 12 wierszy, widoczny fokus, etykiety fizycznych klawiszy i powrót ratunkowy', () => {
    expect(SETTINGS_ROWS).toEqual([
      'takeoff', 'left', 'right', 'telemark', 'parallel', 'menuConfirm', 'menuBack',
      'volume', 'scaleMode', 'largeText', 'reducedMotion', 'reset',
    ])
    const ctx = canvas()
    drawSettingsScreen(ctx, { settings: DEFAULT_SETTINGS, selectedRow: 'takeoff', captureTarget: null, message: null })
    const labels = vi.mocked(drawPixelText).mock.calls.map((call) => call[1])
    expect(labels).toContain('USTAWIENIA')
    expect(labels).toContain('WYBICIE')
    expect(labels).toContain('↑')
    expect(labels).toContain('ENTER')
    expect(labels).toContain('BACKSPACE')
    expect(labels).toContain('DOMYŚLNE')
    expect(labels).toContain('ENTER I BACKSPACE W MENU')
    expect(vi.mocked(ctx.fillRect)).toHaveBeenCalledWith(28, 70, 221, 20)
    expect(ctx.imageSmoothingEnabled).toBe(false)
  })

  it('wyraźnie komunikuje przechwycenie i konflikt, nie gubiąc anulowania ESC', () => {
    drawSettingsScreen(canvas(), {
      settings: DEFAULT_SETTINGS, selectedRow: 'left', captureTarget: 'left',
      message: 'KONFLIKT: TEN KLAWISZ JEST ZAJĘTY PRZEZ WYBICIE',
    })
    const labels = vi.mocked(drawPixelText).mock.calls.map((call) => call[1])
    expect(labels).toContain('PRZECHWYĆ: LOT W LEWO')
    expect(labels).toContain('NACIŚNIJ...')
    expect(labels).toContain('ESC ANULUJ')
    expect(labels).toContain('KONFLIKT: TEN KLAWISZ JEST ZAJĘTY PRZEZ WYBICIE')
  })

  it('duży tekst pokazuje 7 zamiast 10 wierszy na podsumowaniu i mieści ostatni w panelu', () => {
    const base = new CompetitionSession(buildHill(), 1, 'easy').snapshot()
    const snapshot = {
      ...base, view: 'round-summary' as const, lastCompletedRound: 'qualification' as const,
      standings, roundSummaryScroll: 68, humanStandings: [{ participantId: 'local-01', name: 'ALEKSANDRA DŁUGIE NAZWISKO', rank: 74, totalTenths: 1473 }],
    }
    drawRoundSummary(canvas(), snapshot, true)
    const ranks = vi.mocked(drawPixelText).mock.calls.filter(([,, x, y,, scale]) => x === 34 && y >= 75 && y <= 208 && scale === 2)
    expect(ranks).toHaveLength(LARGE_ROUND_SUMMARY_VISIBLE_ROWS)
    expect(ranks.map((call) => call[1])).toEqual(['69', '70', '71', '72', '73', '74', '75'])
    expect(ranks.at(-1)?.[3]).toBe(207) // font 14 px; panel kończy się na y228.
    expect(vi.mocked(drawPixelText).mock.calls.some(([, value]) => value.startsWith('POZYCJE 69–75 Z 75'))).toBe(true)

    vi.mocked(drawPixelText).mockClear()
    drawRoundSummary(canvas(), snapshot)
    const defaultRanks = vi.mocked(drawPixelText).mock.calls.filter(([, value, x, y,, scale]) => x === 34 && y >= 70 && y <= 215 && scale === 1 && /^\s*\d+$/.test(value))
    expect(defaultRanks).toHaveLength(10)
  })

  it('w wąskiej tabeli postępu przenosi wynik pod nazwę i powiększa oba do 2x', () => {
    const base = new CompetitionSession(buildHill(), 1, 'easy').snapshot()
    drawCompetitionProgress(canvas(), {
      ...base, view: 'finished', status: 'complete', standings,
      humanStandings: [{ participantId: 'local-01', name: 'ALEKSANDRA', rank: 74, totalTenths: 1473 }],
    }, true)
    const calls = vi.mocked(drawPixelText).mock.calls
    const rows = calls.filter(([, value, x, y,, scale]) => x === 221 && y >= 74 && y <= 216 && scale === 2 && /^\s*\d+$/.test(value))
    expect(rows).toHaveLength(5)
    expect(rows.at(-1)?.[3]).toBe(202) // ostatni wiersz, druga linia wyniku y218.
    expect(calls.some(([, value,,,, scale]) => value.startsWith('ZAWODNIK') && scale === 2)).toBe(true)
    expect(calls.some(([, value,,,, scale]) => value.endsWith('pkt') && scale === 2)).toBe(true)
  })

  it('scroll sesji stosuje ten sam limit 7 wierszy i zachowuje limit 10 domyślnie', () => {
    const session = new CompetitionSession(buildHill(), 1, 'easy')
    session.view = 'round-summary'
    session.scrollRoundSummary(1000)
    expect(session.snapshot().roundSummaryScroll).toBe(65)
    session.setRoundSummaryVisibleRows(LARGE_ROUND_SUMMARY_VISIBLE_ROWS)
    session.scrollRoundSummary(1000)
    expect(session.snapshot().roundSummaryScroll).toBe(68)
    session.scrollRoundSummary(-3)
    expect(session.snapshot().roundSummaryScroll).toBe(65)
  })
})
