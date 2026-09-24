import { IDBFactory } from 'fake-indexeddb'
import { describe, expect, it } from 'vitest'
import { JumpRecorder, REPLAY_SAMPLE_HZ } from '../src/replay/recorder'
import { ReplayPlayer, REPLAY_RATES, replayVisualsCompatible } from '../src/replay/player'
import { FIXED_HZ } from '../src/core/fixedClock'
import { DEFAULT_JUMP_PARAMS } from '../src/simulation/params'
import { buildHill } from '../src/simulation/technicalHill'
import { createWindField } from '../src/simulation/wind'
import { createCompetitionJumpResult, type CompetitionJumpResult } from '../src/sport/jumpResult'
import { commitAttempt, countStore, loadLatestReplay, openGameDatabase } from '../src/storage/db'
import { CompetitionSession } from '../src/app/competitionSession'
import { REPLAY_LIMITS, STORE, validateStoredReplay, type StoredReplay } from '../src/storage/schema'
import { runJump } from './support/jumpHarness'
import type { JumpParams } from '../src/simulation/params'
import type { JumpSimulation } from '../src/simulation/jump'

const hill = buildHill()

type Recording = {
  readonly replay: StoredReplay
  readonly sim: JumpSimulation
  readonly result: CompetitionJumpResult
}

function record(params: JumpParams = DEFAULT_JUMP_PARAMS): Recording {
  let recorder: JumpRecorder | null = null
  const sim = runJump({
    pilot: 'ideal',
    style: 'telemark',
    params,
    windField: createWindField(0x1234),
    onStep: (current, input) => {
      recorder ??= new JumpRecorder(current, {
        sessionId: 'standard-tech-k120-1',
        competitionId: 'standard-tech-k120-1',
        roundId: 'first',
        participantId: 'local-01',
        participantName: 'Łucja Wicher',
        juryGateNumber: 8,
        coachRequested: false,
      })
      recorder.record(input)
    },
  })
  if (!recorder) throw new Error('rejestrator nie wystartował')
  const result = createCompetitionJumpResult(sim, {
    competitionId: 'standard-tech-k120-1',
    roundId: 'first',
    participantId: 'local-01',
    juryGateNumber: 8,
    coachRequested: false,
    coachDecisionPhase: 'red',
    sessionRevision: 1,
  })
  return { replay: (recorder as JumpRecorder).finish(result, 5_000), sim, result }
}

describe('P20 — rejestracja skoku', () => {
  it('replay zawiera wersje, stan początkowy, próbki 30 Hz i zdarzenia dyskretne', () => {
    const { replay, sim, result } = record()

    expect(validateStoredReplay(replay)).toMatchObject({ ok: true })
    expect(replay.versions).toEqual({
      rules: result.versions.rules,
      physics: DEFAULT_JUMP_PARAMS.physicsVersion,
      hill: hill.spec.hillVersion,
    })
    expect(replay.sampleHz).toBe(REPLAY_SAMPLE_HZ)
    expect(replay.initialState).toMatchObject({
      participantName: 'Łucja Wicher',
      gateNumber: sim.gateNumber,
      juryGateNumber: 8,
      windSeed: 0x1234,
      hillId: hill.spec.id,
    })
    expect(replay.recordedResult).toEqual(result)

    // Próbki są rzadkie: ok. 30 Hz zamiast 120 klatek Canvas na sekundę.
    const span = replay.samples[replay.samples.length - 1]!.tick - replay.samples[0]!.tick
    expect(replay.samples.length).toBeLessThan(span / 2)
    expect(replay.samples.length).toBeGreaterThan(span / (FIXED_HZ / REPLAY_SAMPLE_HZ) - 3)

    // Zdarzenia dyskretne zachowują dokładny tick oryginału.
    expect(replay.discreteEvents.map((event) => `${event.tick} ${event.type}`)).toEqual(
      sim.events.map((event) => `${event.tick} ${event.type}`),
    )
    expect(replay.discreteEvents.some((event) => event.type === 'contact')).toBe(true)
    expect(replay.discreteEvents.some((event) => event.type === 'measured')).toBe(true)
    // Odtwarzacz jest próbkowy: wejścia pozostają puste dla kompatybilności schematu.
    expect(replay.inputs).toEqual([])
  })

  it('replay odtwarza pozycje i zdarzenia oryginału, a recordedResult pozostaje identyczny', () => {
    const { replay, sim, result } = record()
    const player = new ReplayPlayer(replay)

    for (const sample of replay.samples) {
      const exact = player.sampleAt(sample.tick)
      expect(exact).toEqual(sample)
    }
    expect(player.sampleAt(replay.samples[replay.samples.length - 1]!.tick).phase).toBe(sim.phase)

    const contact = replay.discreteEvents.find((event) => event.type === 'contact')
    if (!contact) throw new Error('brak zdarzenia kontaktu')
    expect(player.eventsUpTo(contact.tick - 1).some((event) => event.type === 'contact')).toBe(false)
    expect(player.eventsUpTo(contact.tick).some((event) => event.type === 'contact')).toBe(true)

    player.scrub(-500)
    player.togglePlay()
    player.changeRate(-1)
    player.advance(1)
    expect(player.replay.recordedResult).toEqual(result)
  })

  it('pauza, tempo i przewijanie nie naliczają wyniku ani nie zmieniają replaya', () => {
    const { replay } = record()
    const before = structuredClone(replay)
    const player = new ReplayPlayer(replay)

    player.advance(0.5)
    const afterPlay = player.tick
    expect(afterPlay).toBeGreaterThan(player.firstTick)

    player.togglePlay()
    expect(player.playing).toBe(false)
    player.advance(5)
    expect(player.tick).toBe(afterPlay)

    player.togglePlay()
    player.changeRate(1)
    expect(player.rate).toBe(2)
    player.changeRate(-99)
    expect(player.rate).toBe(REPLAY_RATES[0])

    player.scrub(200)
    const forward = player.tick
    player.scrub(-200)
    expect(player.tick).toBe(forward - 200)
    expect(player.playing).toBe(false)
    player.scrub(-1_000_000)
    expect(player.tick).toBe(player.firstTick)
    player.scrub(1_000_000)
    expect(player.tick).toBe(player.lastTick)

    expect(replay).toEqual(before)
  })

  it('odtwarzanie kończy się na ostatniej próbce i nie wychodzi poza zapis', () => {
    const { replay } = record()
    const player = new ReplayPlayer(replay)
    player.advance(600)
    expect(player.tick).toBe(player.lastTick)
    expect(player.playing).toBe(false)
    expect(player.progress).toBe(1)
    expect(player.finished).toBe(true)
  })
})

describe('P20 — niezależność od bieżącej fizyki', () => {
  it('replay starszej physicsVersion działa z próbek i nie używa bieżącego solvera', () => {
    const ancientParams: JumpParams = {
      ...DEFAULT_JUMP_PARAMS,
      physicsVersion: 'archiwalna-0',
      gravity: DEFAULT_JUMP_PARAMS.gravity * 0.6,
    }
    const ancient = record(ancientParams)
    const current = record()

    expect(ancient.replay.versions.physics).toBe('archiwalna-0')
    expect(ancient.replay.versions.physics).not.toBe(DEFAULT_JUMP_PARAMS.physicsVersion)
    // Archiwalny przebieg różni się od bieżącego solvera — replay musi zostać przy swoim.
    expect(ancient.result.distanceHalfMeters).not.toBe(current.result.distanceHalfMeters)

    const player = new ReplayPlayer(ancient.replay)
    for (const sample of ancient.replay.samples) {
      expect(player.sampleAt(sample.tick)).toEqual(sample)
    }
    player.scrub(ancient.replay.samples[4]!.tick - player.firstTick)
    expect(player.frame().phase).toBe(ancient.replay.samples[4]!.phase)
    expect(player.replay.recordedResult.distanceHalfMeters).toBe(ancient.result.distanceHalfMeters)
  })

  it('odtwarzacz czyta wyłącznie próbki, także gdy są fizycznie niemożliwe', () => {
    const { replay } = record()
    const impossible: StoredReplay = {
      ...replay,
      samples: [
        { tick: 0, x: 0, y: 0, pitchRad: 0, phase: 'Flight', speedKmh: 0, windUserMetersPerSecond: 0, heightAboveSurface: 0 },
        { tick: 120, x: 0, y: 500, pitchRad: 0, phase: 'Flight', speedKmh: 0, windUserMetersPerSecond: 0, heightAboveSurface: 500 },
      ],
    }
    const player = new ReplayPlayer(impossible)
    player.scrub(60)
    const frame = player.frame()
    expect(frame.y).toBeCloseTo(250, 6)
    expect(frame.phase).toBe('Flight')
  })

  it('niezgodna wersja skoczni kieruje do widoku technicznego zamiast przeliczenia', () => {
    const { replay } = record()
    expect(replayVisualsCompatible(replay, hill.spec.hillVersion, hill.spec.id)).toBe(true)
    expect(replayVisualsCompatible(replay, '9.9.9', hill.spec.id)).toBe(false)
    expect(replayVisualsCompatible(replay, hill.spec.hillVersion, 'inna-skocznia')).toBe(false)
  })

  it('uszkodzony replay jest odrzucony przez walidację', () => {
    const { replay } = record()
    expect(validateStoredReplay({ ...replay, schemaVersion: 42 })).toMatchObject({ ok: false })
    expect(validateStoredReplay({ ...replay, samples: [] })).toMatchObject({ ok: false })
    expect(
      validateStoredReplay({
        ...replay,
        samples: [{ ...replay.samples[0]!, x: Number.NaN }],
      }),
    ).toMatchObject({ ok: false })
  })
})

describe('P20 — replay w tej samej transakcji co wynik', () => {
  it('replay trafia do bazy razem z wynikiem i utrzymywany jest tylko ostatni skok', async () => {
    const db = await openGameDatabase(new IDBFactory())
    const session = new CompetitionSession(hill, 1, 'normal')
    const first = record()
    const second = record()
    const older: StoredReplay = { ...first.replay, id: 'replay-stary', createdAtMs: 1_000 }
    const newer: StoredReplay = { ...second.replay, id: 'replay-nowy', createdAtMs: 9_000 }

    const base = {
      ownerId: 'tab-a',
      recordCandidate: null,
      nowMs: 1_000,
    }
    await commitAttempt(db, {
      ...base,
      session: { ...session.toStoredSession(1_000), revision: 1 },
      result: { ...first.result, resultId: 'wynik-1' },
      replay: older,
    })
    expect(await countStore(db, STORE.replays)).toBe(1)

    await commitAttempt(db, {
      ...base,
      nowMs: 9_000,
      session: { ...session.toStoredSession(9_000), revision: 2 },
      result: { ...second.result, resultId: 'wynik-2' },
      replay: newer,
    })

    expect(await countStore(db, STORE.results)).toBe(2)
    expect(await countStore(db, STORE.replays)).toBe(REPLAY_LIMITS.automaticKeep)
    const latest = await loadLatestReplay(db)
    expect(latest.kind === 'ok' && latest.replay.id).toBe('replay-nowy')
  })

  it('awaria zapisu replaya odmawia całej transakcji, bez wyniku bez replaya', async () => {
    const db = await openGameDatabase(new IDBFactory())
    const session = new CompetitionSession(hill, 1, 'normal')
    const { replay, result } = record()
    const poisoned = { ...replay, id: 'zly', samples: [{ ...replay.samples[0]!, broken: () => undefined }] }

    const outcome = await commitAttempt(db, {
      session: { ...session.toStoredSession(1_000), revision: 1 },
      result: { ...result, resultId: 'wynik-x' },
      recordCandidate: null,
      replay: poisoned as unknown as StoredReplay,
      ownerId: 'tab-a',
      nowMs: 1_000,
    })

    expect(outcome.ok).toBe(false)
    expect(await countStore(db, STORE.results)).toBe(0)
    expect(await countStore(db, STORE.replays)).toBe(0)
    expect(await countStore(db, STORE.sessions)).toBe(0)
  })

  it('uszkodzony najnowszy replay nie zasłania starszego poprawnego', async () => {
    const db = await openGameDatabase(new IDBFactory())
    const { replay } = record()
    const older: StoredReplay = { ...replay, id: 'replay-starszy', createdAtMs: 1_000 }
    const broken = {
      ...replay,
      id: 'replay-uszkodzony',
      createdAtMs: 9_000,
      samples: [],
    } as unknown as StoredReplay

    const put = (value: unknown): Promise<void> => new Promise((resolve, reject) => {
      const tx = db.transaction([STORE.replays], 'readwrite')
      tx.objectStore(STORE.replays).put(value)
      tx.oncomplete = () => resolve()
      tx.onabort = () => reject(tx.error ?? new Error('abort'))
    })
    await put(older)
    await put(broken)

    const latest = await loadLatestReplay(db)
    expect(latest.kind).toBe('ok')
    expect(latest.kind === 'ok' && latest.replay.id).toBe('replay-starszy')
  })
})
