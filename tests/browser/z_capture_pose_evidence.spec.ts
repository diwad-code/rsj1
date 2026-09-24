import { expect, test, type Page } from '@playwright/test'
import { writeFileSync } from 'node:fs'
import { buildHill } from '../../src/simulation/technicalHill'
import { jumperVisualFrame, type JumperPose, type SceneActor } from '../../src/render/hillView'
import { actorFromFrame } from '../../src/render/replayView'
import type { ReplayFrame } from '../../src/replay/player'

type EvidenceResult = {
  dataUrl: string
  frames?: Array<{ pose: JumperPose; frameIndex: number }>
  heights?: number[]
}

async function poseSheet(
  page: Page,
  options: { silhouette?: boolean; poses?: JumperPose[]; columns?: number } = {},
): Promise<EvidenceResult> {
  return page.evaluate((sheetOptions) => {
    const evidence = (window as unknown as {
      __retroVisualEvidence?: {
        poseSheet(options: typeof sheetOptions): {
          canvas: HTMLCanvasElement
          frames: Array<{ pose: JumperPose; frameIndex: number }>
        }
      }
    }).__retroVisualEvidence
    if (!evidence) throw new Error('Brak debugowego renderera dowodów (?debug).')
    const result = evidence.poseSheet(sheetOptions)
    return { dataUrl: result.canvas.toDataURL('image/png'), frames: result.frames }
  }, options)
}

async function shadowSheet(page: Page): Promise<EvidenceResult> {
  return page.evaluate(() => {
    const evidence = (window as unknown as {
      __retroVisualEvidence?: {
        shadowHeightSheet(): { canvas: HTMLCanvasElement; heights: number[] }
      }
    }).__retroVisualEvidence
    if (!evidence) throw new Error('Brak debugowego renderera dowodów (?debug).')
    const result = evidence.shadowHeightSheet()
    return { dataUrl: result.canvas.toDataURL('image/png'), heights: [...result.heights] }
  })
}

function savePng(result: EvidenceResult, name: string): void {
  const base64 = result.dataUrl.split(',')[1]
  if (!base64) throw new Error(`Brak danych PNG dla ${name}`)
  writeFileSync(test.info().outputPath(name), Buffer.from(base64, 'base64'))
}

test('41 klatek, sylwetki, start z belki, podpórki, przejścia i wysokości cienia trafiają wyłącznie do outputPath', async ({ page }) => {
  await page.goto('/?debug', { waitUntil: 'domcontentloaded' })
  await page.waitForFunction(() => Boolean((window as unknown as { __retroVisualEvidence?: unknown }).__retroVisualEvidence))

  const all = await poseSheet(page)
  expect(all.frames).toHaveLength(41)
  expect(all.frames?.filter((frame) => frame.pose === 'takeoff')).toHaveLength(6)
  expect(Object.fromEntries(
    ['gate', 'inrun', 'takeoff', 'flight', 'landingPrep', 'supportOne', 'supportTwo', 'outrun', 'fall'].map((poseName) => [
      poseName,
      all.frames?.filter((frame) => frame.pose === poseName).length,
    ]),
  )).toEqual({ gate: 1, inrun: 3, takeoff: 6, flight: 8, landingPrep: 7, supportOne: 3, supportTwo: 3, outrun: 3, fall: 3 })
  expect(all.frames?.filter((frame) => frame.pose === 'gatePush')).toHaveLength(4)
  savePng(all, 'pkg008-pose-sheet-all-41.png')

  const silhouette = await poseSheet(page, { silhouette: true })
  expect(silhouette.frames).toEqual(all.frames)
  savePng(silhouette, 'pkg008-pose-sheet-silhouette-all-41.png')

  const landingComparison = await poseSheet(page, {
    poses: ['landingPrep', 'landingParallel'],
    columns: 7,
  })
  expect(landingComparison.frames).toHaveLength(14)
  expect(landingComparison.frames?.filter((frame) => frame.pose === 'landingPrep')).toHaveLength(7)
  expect(landingComparison.frames?.filter((frame) => frame.pose === 'landingParallel')).toHaveLength(7)
  savePng(landingComparison, 'pkg008-telemark-vs-parallel-full-color.png')

  const landingSilhouettes = await poseSheet(page, {
    silhouette: true,
    poses: ['landingPrep', 'landingParallel'],
    columns: 7,
  })
  expect(landingSilhouettes.frames).toEqual(landingComparison.frames)
  savePng(landingSilhouettes, 'pkg008-telemark-vs-parallel-black-silhouette.png')

  const strips: Array<[JumperPose, number]> = [
    ['gatePush', 4],
    ['inrun', 3],
    ['takeoff', 6],
    ['flight', 8],
    ['landingPrep', 7],
    ['supportOne', 3],
    ['supportTwo', 3],
    ['outrun', 3],
    ['fall', 3],
  ]
  for (const [poseName, expectedFrames] of strips) {
    const strip = await poseSheet(page, { poses: [poseName], columns: expectedFrames })
    expect(strip.frames).toHaveLength(expectedFrames)
    savePng(strip, `pkg008-transition-${poseName.toLowerCase()}-${expectedFrames}.png`)
  }

  const shadows = await shadowSheet(page)
  expect(shadows.heights).toEqual([1, 5, 10, 20, 30])
  savePng(shadows, 'pkg008-shadow-heights-1-5-10-20-30m.png')
})

test('replay używa wieku zapisanych zdarzeń, a upadek nie wraca do klatki zero', () => {
  const hill = buildHill()
  const replayFrame = (phase: string, tick: number, events: ReplayFrame['events']): ReplayFrame => ({
    tick,
    x: 0,
    y: 0,
    pitchRad: 0,
    phase,
    speedKmh: 90,
    windUserMetersPerSecond: 0,
    heightAboveSurface: 0,
    events,
  })

  const impulseEvent = [{ tick: 100, type: 'takeoffImpulseStart' as const, detail: 'test' }]
  const replayTakeoff = actorFromFrame(hill, replayFrame('Takeoff', 112, impulseEvent))
  const liveTakeoff: SceneActor = { ...replayTakeoff, impulseElapsedSeconds: 12 / 120 }
  expect(jumperVisualFrame(replayTakeoff)).toEqual(jumperVisualFrame(liveTakeoff))
  expect(jumperVisualFrame(replayTakeoff)).toEqual({ pose: 'takeoff', frameIndex: 2 })

  const edgeEvent = [{ tick: 100, type: 'takeoffEdge' as const, detail: 'test' }]
  const replayFlight = actorFromFrame(hill, replayFrame('Flight', 127, edgeEvent))
  const liveFlight: SceneActor = { ...replayFlight, flightSeconds: 27 / 120 }
  expect(jumperVisualFrame(replayFlight)).toEqual(jumperVisualFrame(liveFlight))
  expect(jumperVisualFrame(replayFlight)).toEqual({ pose: 'flight', frameIndex: 4 })

  const telemarkReplay = actorFromFrame(hill, replayFrame('LandingPrep', 150, [
    { tick: 140, type: 'landingPrep', detail: 'telemark, wysokość 4.0 m' },
  ]))
  const parallelReplay = actorFromFrame(hill, replayFrame('LandingPrep', 150, [
    { tick: 140, type: 'landingPrep', detail: 'parallel, wysokość 4.0 m' },
  ]))
  expect(telemarkReplay.landingStyle).toBe('telemark')
  expect(parallelReplay.landingStyle).toBe('parallel')
  expect(jumperVisualFrame(telemarkReplay).pose).toBe('landingPrep')
  expect(jumperVisualFrame(parallelReplay).pose).toBe('landingParallel')

  const contactEvents = [{ tick: 200, type: 'contact' as const, detail: 'test' }]
  const contactPosition = hill.surfacePositionAt(120)
  expect(jumperVisualFrame({
    ...telemarkReplay,
    phase: 'Outrun',
    tick: 205,
    position: contactPosition,
    events: contactEvents,
  }).pose).toBe('landingPrep')
  expect(jumperVisualFrame({
    ...parallelReplay,
    phase: 'Outrun',
    tick: 205,
    position: contactPosition,
    events: contactEvents,
  }).pose).toBe('landingParallel')
  expect(jumperVisualFrame({
    ...parallelReplay,
    phase: 'Outrun',
    tick: 225,
    position: contactPosition,
    events: contactEvents,
  }).pose).toBe('outrun')

  const oneHandEvents = [
    { tick: 200, type: 'contact' as const, detail: 'test' },
    { tick: 200, type: 'handSupport' as const, detail: 'jedna dłoń, stabilność 0.35' },
  ]
  const twoHandEvents = [
    { tick: 200, type: 'contact' as const, detail: 'test' },
    { tick: 200, type: 'handSupport' as const, detail: 'obie dłonie, stabilność 0.28' },
  ]
  expect(jumperVisualFrame({
    ...telemarkReplay,
    phase: 'Outrun',
    tick: 224,
    position: contactPosition,
    events: oneHandEvents,
  })).toEqual({ pose: 'supportOne', frameIndex: 1 })
  expect(jumperVisualFrame({
    ...telemarkReplay,
    phase: 'Outrun',
    tick: 248,
    position: contactPosition,
    events: twoHandEvents,
  })).toEqual({ pose: 'supportTwo', frameIndex: 2 })

  const fallEvent = [{ tick: 100, type: 'fall' as const, detail: 'test' }]
  const fallen: SceneActor = {
    hill,
    phase: 'Fall',
    position: hill.surfacePositionAt(120),
    pitchRad: 0,
    tick: 200,
    events: fallEvent,
  }
  expect(jumperVisualFrame(fallen)).toEqual({ pose: 'fall', frameIndex: 2 })
  expect(jumperVisualFrame({ ...fallen, phase: 'FallSettled', tick: 260 })).toEqual({ pose: 'fall', frameIndex: 2 })
})
