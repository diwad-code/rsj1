import { expect, test, type Page } from '@playwright/test'
import { edgeTickFor } from '../support/jumpHarness'

/**
 * Nagranie jednego pełnego skoku. Trzymane osobno od testów funkcjonalnych,
 * żeby koszt enkodera wideo nie wywoływał celowej pauzy 120 Hz w scenariuszach,
 * które mierzą timing.
 */

test.use({ video: 'on' })

type Snapshot = {
  screen: string
  paused: boolean
  pauseReason: string
  jump: { phase: string; tick: number; gate: number; status: string | null; distance: number | null; events: string[] } | null
}

function snapshot(page: Page): Promise<Snapshot> {
  return page.evaluate(() => (
    window as unknown as { __retroDebugSnapshot: () => Snapshot }
  ).__retroDebugSnapshot())
}

async function waitForJump(page: Page, predicate: string): Promise<void> {
  const deadline = Date.now() + 40_000
  while (Date.now() < deadline) {
    const matched = await page.evaluate((expression: string) => {
      const state = (window as unknown as { __retroDebugSnapshot: () => Snapshot }).__retroDebugSnapshot()
      if (!state.jump) return false
      return new Function('jump', `return ${expression}`)(state.jump) as boolean
    }, predicate)
    if (matched) return
    // Udokumentowana pauza po przekroczeniu budżetu klatki; wznawiamy nagranie.
    const state = await snapshot(page)
    if (state.paused) {
      expect(state.pauseReason).toBe('zbyt długa przerwa klatki')
      await page.keyboard.press('Enter')
    }
    await page.waitForTimeout(16)
  }
  throw new Error(`Warunek nie został spełniony: ${predicate}`)
}

test('zapis pełnego skoku w scenie produkcyjnej', async ({ page }) => {
  // Pełny skok z odjazdem do fall line przy włączonym enkoderze wideo
  // potrzebuje ponad domyślne 30 s (sam odjazd to ~4 s ściany).
  test.setTimeout(120_000)
  await page.setViewportSize({ width: 960, height: 540 })
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.keyboard.press('Enter')
  if ((await snapshot(page)).paused) await page.keyboard.press('Enter')
  await page.keyboard.press('Enter')
  await expect.poll(async () => (await snapshot(page)).screen).toBe('jump')
  if ((await snapshot(page)).paused) await page.keyboard.press('Enter')

  await page.waitForTimeout(500)
  await page.keyboard.press('ArrowRight')
  // Próg liczymy od ZDARZENIA gateOpen (dokładny tick symulacji, bez
  // opóźnienia wykrycia fazy): cel ~35 ticków przed krawędzią. Opóźnienie
  // samej pętli/przycisku przesuwa w stronę ideału (krawędź−24).
  // Zwarta pętla (1 snapshot na iterację, bez sleep).
  {
    const deadline = Date.now() + 30_000
    let pressAt = Number.POSITIVE_INFINITY
    for (;;) {
      const state = await snapshot(page)
      if (state.paused) { await page.keyboard.press('Enter'); continue }
      if (pressAt === Number.POSITIVE_INFINITY) {
        const gateOpen = (state.jump?.events ?? []).find((entry) => entry.endsWith(' gateOpen'))
        if (gateOpen === undefined) {
          if (Date.now() > deadline) throw new Error('Brak otwarcia belki')
          continue
        }
        const gateTick = Number(gateOpen.split(' ')[0] ?? '0')
        const trainingGate = state.jump?.gate
        if (!trainingGate) throw new Error('Brak belki bieżącej próby treningowej.')
        pressAt = gateTick + edgeTickFor(trainingGate) - 35
      }
      if ((state.jump?.tick ?? 0) >= pressAt) break
      if (Date.now() > deadline) throw new Error('Nie osiągnięto progu wybicia')
    }
  }
  await page.keyboard.press('ArrowUp')
  await waitForJump(page, `jump.phase === 'Flight'`)
  const flightTick = (await snapshot(page)).jump?.tick ?? 0
  await page.keyboard.down('ArrowRight')
  // Model FIS: korygowany lot wznosi się tylko do ~4 m (nigdy 5 m), więc
  // środek lotu wyznacza czas symulacji (odporny na pauzy), nie wysokość.
  // Krótka korekta + T przy +130 (kontakt ~+420): lądowanie telemarkiem
  // także przy słabszym wybiciu; pełne spłaszczenie wbija w garb, dryf pada.
  await waitForJump(page, `jump.tick >= ${flightTick + 130}`)
  await page.keyboard.up('ArrowRight')
  await page.keyboard.press('KeyT')
  await waitForJump(page, 'jump.status !== null')
  await page.waitForTimeout(900)

  const finished = await snapshot(page)
  expect(finished.jump?.status).not.toBeNull()
  // Kontrola sensu, nie bilansu: chodzi o to, że skok został zmierzony i jest
  // realnej długości. Dokładne odległości pilnuje `tests/hillCalibration.test.ts`
  // na deterministycznym harnessie — tutaj moment wciśnięcia ↑ zależy od
  // ziarnistości odpytywania przeglądarki, więc próba bywa spóźniona o kilka
  // ticków i wychodzi ~79 m zamiast ~126 m z idealnym timingiem.
  expect(finished.jump?.distance ?? 0).toBeGreaterThan(70)
})
