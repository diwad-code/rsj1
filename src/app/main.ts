import './style.css'
import { FixedStepClock, FIXED_HZ } from '../core/fixedClock'
import {
  ActiveSessionClock,
  InputBuffer,
  normalizeEventTimestamp,
  type Action,
  type TickInput,
} from '../input/keyboard'
import { JumpSimulation } from '../simulation/jump'
import {
  PLAYABLE_HILL_SPECS,
  buildHillById,
  hillCompetitionSessionId,
  assertSessionMatchesHill,
} from './hills'
import { createWindField, windSeedForAttempt } from '../simulation/wind'
import { createTrainingJumpResult, type TrainingJumpResult } from '../sport/jumpResult'
import { forecastWindMean, selectSafeJuryGate } from '../sport/safety'
import { gateCompensationTenths, windCompensationTenths } from '../sport/compensation'
import { projectedCompetitionTenthsAt, solveLeadingTarget, trainingTargetHalfMeters, type LeadingTargetInput } from '../sport/leadingTarget'
import {
  buildView,
  createDebugJumperPoseSheet,
  createDebugPerfectTakeoffSheet,
  createDebugShadowHeightSheet,
  drawJumpScreen,
  drawPlanicaThumbnail,
  fillPixelPolygon,
  jumperVisualFrame,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type TrainingSceneState,
  type JumperPose,
  type WorldView,
} from '../render/hillView'
import { drawPixelText, measurePixelText, type PixelTextAlign } from '../render/pixelFont'
import {
  CompetitionSession,
  LARGE_ROUND_SUMMARY_VISIBLE_ROWS,
  ROUND_LABEL,
  ROUND_SUMMARY_VISIBLE_ROWS,
  type CommitRequest,
} from './competitionSession'
import type { AiDifficulty } from '../sport/competition'
import {
  drawCompetitionProgress,
  drawCompetitionSetup,
  drawHandover,
  drawRoundSummary,
  drawStartProcedure,
  drawWithdrawalConfirmation,
} from '../render/competitionView'
import { commitAttempt, countStore, loadGameSettings, loadLatestReplay, loadOfficialRecord, loadSession, openGameDatabase, saveGameSettings } from '../storage/db'
import { MODERN_RULES } from '../sport/scoring'
import { physicsParamsForHill } from '../simulation/params'
import { createOwnerId, SessionLease, LEASE_CHANNEL_NAME } from '../storage/lease'
import { approximateBytes, recordKey, type StoredRecord, type StoredReplay, type StoredSession } from '../storage/schema'
import { ReplayPlayer, replayVisualsCompatible } from '../replay/player'
import { drawReplayScreen } from '../render/replayView'
import { drawSettingsScreen, SETTINGS_ROWS, type BindingRow, type SettingsRow } from '../render/settingsView'
import { DEFAULT_SETTINGS, normalizeSettings, rebindSettings, resolveBoundAction, type GameSettings } from '../settings/settings'

type Screen = 'title' | 'menu' | 'settings' | 'jump' | 'competition-setup' | 'competition' | 'replay'
type MenuSelection = 'training' | 'competition' | 'replay' | 'settings'
type SaveState = 'idle' | 'saving' | 'saved' | 'failed' | 'readonly'
type DebugSnapshot = {
  debugEnabled: boolean
  reducedMotion: boolean
  canvasScale: number
  screen: Screen
  paused: boolean
  pauseReason: string
  tick: number
  held: Action[]
  horizontal: -1 | 0 | 1
  journal: string[]
  fullscreenAttempts: number
  menuSelection: MenuSelection
  settings: GameSettings
  selectedRow: SettingsRow
  captureTarget: BindingRow | null
  message: string | null
  selectedHill: { id: string; version: string; name: string; loading: boolean }
  competitionSetup: { profileCount: number; difficulty: AiDifficulty }
  persistence: {
    ready: boolean
    saveState: SaveState
    saveMessage: string
    revision: number
    savedRevision: number | null
    savedNextStartIndex: number | null
    savedRoundId: string | null
    resumable: boolean
    rejectedReason: string | null
    ownerId: string
    leaseRole: 'owner' | 'reader'
    leaseTakeoverAvailable: boolean
    recordDistanceHalfMeters: number | null
    resultCount: number
  }
  replay: {
    available: boolean
    resultId: string | null
    participantName: string | null
    tick: number
    playing: boolean
    rate: number
    phase: string | null
    progress: number
    visualsCompatible: boolean
    notice: string
    sampleCount: number
    recordedTotalTenths: number | null
    recordedDistanceHalfMeters: number | null
    physicsVersion: string | null
    hillId: string
  } | null
  jump: {
    phase: string
    tick: number
    gate: number
    gateSource: 'auto' | 'manual' | null
    gateAutoNumber: number | null
    gateForecastMean: number | null
    speedKmh: number
    targetPitchDeg: number
    flowDeg: number
    flightSeconds: number
    heightAboveSurface: number
    distance: number | null
    status: string | null
    terminalPhase: string | null
    perfectTakeoff: boolean
    takeoffTimingOffsetSeconds: number | null
    windUserMetersPerSecond: number
    windMeasuredMetersPerSecond: number | null
    windSeed: number | null
    resultTotalTenths: number | null
    resultComponentsTenths: TrainingJumpResult['componentTenths'] | null
    leadingTargetHalfMeters: number | null
    attemptNumber: number
    completedAttempts: number
    technicalView: boolean
    snowEnabled: boolean
    events: string[]
    visualPose: string
    visualFrame: number
  } | null
  competition: ReturnType<CompetitionSession['snapshot']> | null
}

declare global {
  interface Window {
    __retroDebugSnapshot?: () => DebugSnapshot
    __retroVisualEvidence?: {
      poseSheet(options?: { silhouette?: boolean; poses?: readonly JumperPose[]; columns?: number }): ReturnType<typeof createDebugJumperPoseSheet>
      perfectTakeoffSheet(): ReturnType<typeof createDebugPerfectTakeoffSheet>
      shadowHeightSheet(): ReturnType<typeof createDebugShadowHeightSheet>
    }
  }
}

const canvas = requireElement<HTMLCanvasElement>('game-canvas')
const shell = requireElement<HTMLElement>('game-shell')
const screenReaderStatus = requireElement<HTMLElement>('screen-reader-status')
const renderingContext = canvas.getContext('2d')
if (!renderingContext) throw new Error('Canvas2D jest niedostępny.')
const context: CanvasRenderingContext2D = renderingContext

context.imageSmoothingEnabled = false

const debugEnabled = new URLSearchParams(location.search).has('debug')
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
let settings = normalizeSettings(DEFAULT_SETTINGS)
let reducedMotion = reducedMotionQuery.matches || settings.reducedMotion
let canvasScale = 1

function applyCanvasScale(): void {
  const availableWidth = window.innerWidth
  const availableHeight = window.innerHeight
  const fitted = Math.min(availableWidth / VIEW_WIDTH, availableHeight / VIEW_HEIGHT)
  // At >=2× both modes keep integral pixels; fit uses the available fraction
  // between 1× and 2×, while integer keeps a 1× letterbox. Below 1× both shrink.
  canvasScale = fitted < 1 ? fitted : settings.scaleMode === 'integer' || fitted >= 2 ? Math.floor(fitted) : fitted
  canvas.style.imageRendering = 'pixelated'
  canvas.style.width = `${VIEW_WIDTH * canvasScale}px`
  canvas.style.height = `${VIEW_HEIGHT * canvasScale}px`
}

applyCanvasScale()
reducedMotionQuery.addEventListener('change', (event) => {
  reducedMotion = event.matches || settings.reducedMotion
})

const fixedClock = new FixedStepClock()
const sessionClock = new ActiveSessionClock()
const input = new InputBuffer(sessionClock)

let screen: Screen = 'title'
let paused = false
let pauseReason = ''
let tick = 0
let demoPosition = 0
let lastInput: TickInput = emptyTickInput()
let journal: string[] = []
let fullscreenAttempts = 0
let fullscreenTransitioning = false
let wasFullscreen = false
let lifecycleMessage = 'NACIŚNIJ ENTER'
let enterDown = false
let menuSelection: MenuSelection = 'training'
let selectedRow: SettingsRow = SETTINGS_ROWS[0]
let captureTarget: BindingRow | null = null
let settingsMessage: string | null = null
let settingsSaveChain: Promise<void> = Promise.resolve()

// --- P19/P20: trwała sesja, lease jednej karty i ostatni replay ---------------
/**
 * Identyfikator karty przeżywa reload (sessionStorage), ale nie jest wspólny dla
 * dwóch kart. Dzięki temu odświeżenie nie odbiera sobie samemu prawa zapisu.
 */
function resolveOwnerId(): string {
  try {
    const existing = sessionStorage.getItem('retro-ski-session-owner')
    if (existing) return existing
    const created = createOwnerId()
    sessionStorage.setItem('retro-ski-session-owner', created)
    return created
  } catch {
    return createOwnerId()
  }
}

const persistenceOwnerId = resolveOwnerId()
let database: IDBDatabase | null = null
let sessionLease: SessionLease | null = null
let persistenceReady = false
let saveState: SaveState = 'idle'
let saveMessage = ''
let saveChain: Promise<void> = Promise.resolve()
/** Pierwsza niezapisana transakcja; `Z` ponawia dokładnie ją. */
let failedCommit: CommitRequest | null = null
let savedSession: StoredSession | null = null
let savedRejectedReason: string | null = null
let officialRecord: StoredRecord | null = null
let storedResultCount = 0
let latestReplay: StoredReplay | null = null
let replayPlayer: ReplayPlayer | null = null
let replayNotice = ''
let replayVisualsOk = true
let replayLastFrameMs = 0
let replayStorageBytes = 0
let screenBeforeReplay: Screen = 'menu'

let hill = buildHillById(PLAYABLE_HILL_SPECS[0]!.id)
let hillView: WorldView = buildView(hill)
let replayHill = hill
let replayHillView = hillView
let hillLoading = false
let leaseChannel: BroadcastChannel | null = null
type TrainingGateDecision = {
  readonly gateNumber: number
  readonly autoGateNumber: number
  readonly forecastWindMean: number
  readonly manual: boolean
}
let trainingGateOverride: number | null = null
let trainingGateDecision: TrainingGateDecision | null = null
let jump: JumpSimulation | null = null
const TRAINING_WIND_BASE_SEED = 0x5a17c0de
/** P42 runda 17 (poprawka użytkownika): treningowy cel prowadzenia to połowa dystansu między K a HS (połówka metra). */
let TRAINING_LEADING_TARGET_HALF_METERS = trainingTargetHalfMeters(hill.spec.kPointMeters, hill.spec.hillSizeMeters)
const TRAINING_PLAYER_PREVIOUS_TENTHS = 0
/** P14: kontrolowany rekord techniczny, nie rekord prawdziwej skoczni. */
let TRAINING_RECORD_HALF_METERS = 274
let trainingAttempt = 0
let trainingCompletedAttempts = 0
let trainingBestDistanceHalfMeters = 0
let trainingBestTotalTenths = 0
let trainingResult: TrainingJumpResult | null = null
let technicalView = false
let snowEnabled = true
let competitionProfileCount = 1
let competitionDifficulty: AiDifficulty = 'normal'
let competition: CompetitionSession | null = null

class AudioGate {
  private audioContext: AudioContext | null = null

  async unlock(): Promise<void> {
    const AudioConstructor = window.AudioContext
    if (!AudioConstructor) return
    this.audioContext ??= new AudioConstructor()
    await this.audioContext.resume()
    // Do not play at default volume before a persisted mute has been loaded.
    if (persistenceReady || saveState === 'failed') this.play('confirm')
  }

  play(kind: 'confirm' | 'takeoff' | 'contact' | 'fall' | 'result'): void {
    const audioContext = this.audioContext
    if (!audioContext || audioContext.state !== 'running' || settings.volume === 0) return
    try {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()
      const now = audioContext.currentTime
      const sound = {
        confirm: { from: 220, to: 280, duration: 0.07, volume: 0.025, wave: 'square' as OscillatorType },
        takeoff: { from: 165, to: 430, duration: 0.09, volume: 0.035, wave: 'square' as OscillatorType },
        contact: { from: 150, to: 92, duration: 0.1, volume: 0.04, wave: 'triangle' as OscillatorType },
        fall: { from: 90, to: 42, duration: 0.18, volume: 0.055, wave: 'sawtooth' as OscillatorType },
        result: { from: 330, to: 495, duration: 0.14, volume: 0.03, wave: 'square' as OscillatorType },
      }[kind]
      oscillator.type = sound.wave
      oscillator.frequency.setValueAtTime(sound.from, now)
      oscillator.frequency.exponentialRampToValueAtTime(sound.to, now + sound.duration)
      gain.gain.setValueAtTime(sound.volume * settings.volume / 100, now)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + sound.duration)
      oscillator.connect(gain).connect(audioContext.destination)
      oscillator.start(now)
      oscillator.stop(now + sound.duration)
    } catch {
      // Dźwięk jest dodatkiem. Niepełne lub zablokowane Web Audio nie wpływa na grę.
    }
  }
}

const audio = new AudioGate()
const audioEventCursor = new WeakMap<JumpSimulation, number>()
const resultSoundPlayed = new WeakSet<JumpSimulation>()

function playJumpAudio(sim: JumpSimulation): void {
  const from = audioEventCursor.get(sim) ?? 0
  for (const event of sim.events.slice(from)) {
    if (event.type === 'takeoffEdge') audio.play('takeoff')
    else if (event.type === 'contact') audio.play('contact')
    else if (event.type === 'fall') audio.play('fall')
  }
  audioEventCursor.set(sim, sim.events.length)
}

function playResultAudio(sim: JumpSimulation): void {
  if (resultSoundPlayed.has(sim)) return
  resultSoundPlayed.add(sim)
  audio.play('result')
}

function requireElement<T extends Element>(id: string): T {
  const element = document.getElementById(id)
  if (!element) throw new Error(`Brak elementu #${id}`)
  return element as unknown as T
}

function emptyTickInput(): TickInput {
  return {
    pressed: [],
    released: [],
    held: new Set<Action>(),
    events: [],
    horizontal: 0,
  }
}

function isActiveScreen(): boolean {
  return screen !== 'title'
}

function usesFixedTicks(): boolean {
  if (screen === 'menu' || screen === 'jump') return true
  if (screen !== 'competition' || !competition) return false
  return competition.view === 'start' || competition.view === 'jump'
}

const MENU_ORDER: readonly MenuSelection[] = ['training', 'competition', 'replay', 'settings']
const MENU_NAMES: Readonly<Record<MenuSelection, string>> = {
  training: 'Trening', competition: 'Konkurs standardowy', replay: 'Ostatnia powtórka', settings: 'Ustawienia',
}
const SETTINGS_NAMES: Readonly<Record<SettingsRow, string>> = {
  takeoff: 'Wybicie', left: 'Lot w lewo', right: 'Lot w prawo', telemark: 'Telemark', parallel: 'Dwie nogi',
  menuConfirm: 'Potwierdź', menuBack: 'Wstecz', volume: 'Głośność', scaleMode: 'Skala',
  largeText: 'Duży tekst', reducedMotion: 'Mniej ruchu', reset: 'Przywróć domyślne',
}

function setScreenReaderStatus(): void {
  if (screen === 'title') {
    screenReaderStatus.textContent = 'Ekran tytułowy. Enter rozpoczyna grę i próbuje włączyć pełny ekran oraz dźwięk.'
    canvas.setAttribute('aria-label', 'Retro Ski Jumping — ekran tytułowy')
    return
  }

  if (screen === 'settings') {
    const row = SETTINGS_NAMES[selectedRow]
    const action = captureTarget
      ? `Przechwytywanie: ${SETTINGS_NAMES[captureTarget]}. Naciśnij klawisz; Escape lub Backspace anuluje.`
      : `${row}. Góra/dół wybiera, Enter lub ${settings.menuConfirm} zmienia, lewo/prawo ustawia wartość, Backspace wraca.`
    screenReaderStatus.textContent = `Ustawienia. ${action} ${settingsMessage ?? ''}`
    canvas.setAttribute('aria-label', `Retro Ski Jumping — ustawienia, ${row}`)
    return
  }

  if (screen === 'jump') {
    const phase = jump?.phase ?? 'GateGreen'
    const summary = trainingResult
      ? `Wynik: ${trainingResult.status === 'landed' ? 'skok ustany' : 'upadek'}, ${(trainingResult.distanceHalfMeters / 2).toFixed(1)} metra, ${(trainingResult.totalTenths / 10).toFixed(1)} punktu. Enter rozpoczyna następną próbę, Backspace wraca do menu.`
      : `Faza ${phase}.`
    screenReaderStatus.textContent = paused
      ? `Pauza: ${pauseReason}. Enter wznawia.`
      : `Trening: ${hillLabel()}. ${summary}`
    canvas.setAttribute('aria-label', `Retro Ski Jumping — ${paused ? 'pauza' : `trening, faza ${phase}`}`)
    return
  }

  if (screen === 'replay' && replayPlayer) {
    const replay = replayPlayer.replay
    screenReaderStatus.textContent =
      `Powtórka skoku: ${replay.initialState.participantName}, ${(replay.recordedResult.distanceHalfMeters / 2).toFixed(1)} metra. `
      + `${replayPlayer.playing ? 'Odtwarzanie' : 'Pauza'}, tempo ${replayPlayer.rate}. `
      + `${replayVisualsOk ? '' : `${replayNotice}. `}`
      + 'Spacja pauzuje, strzałki lewo i prawo przewijają, Backspace wychodzi. Odtwarzanie nie nalicza wyniku.'
    canvas.setAttribute('aria-label', 'Retro Ski Jumping — powtórka ostatniego skoku')
    return
  }

  if (screen === 'competition-setup') {
    const resume = resumableSession()
    screenReaderStatus.textContent =
      `Konfiguracja konkursu: ${hillLabel()}. ${competitionProfileCount} profili, trudność ${competitionDifficulty}. ${savedRejectedReason ?? ''} `
      + (resume
        ? `Zapisany konkurs, następny skok ${resume.competition.nextStartIndex + 1}. Enter wznawia, N rozpoczyna nowy.`
        : 'Brak zapisanej sesji. Enter rozpoczyna konkurs.')
    canvas.setAttribute('aria-label', 'Retro Ski Jumping — konfiguracja konkursu')
    return
  }

  if (screen === 'competition' && competition) {
    const state = competition.snapshot()
    const detail = state.view === 'handover'
      ? `Przekazanie klawiatury dla ${state.currentParticipantName}. Wymagany nowy Enter.`
      : state.view === 'start'
        ? `Procedura startowa, faza ${state.startPhase}.`
        : state.view === 'jump'
          ? `Skok konkursowy ${state.currentParticipantName}, faza ${state.jump?.phase}.`
          : state.view === 'finished'
            ? 'Konkurs zakończony. Enter wraca do menu.'
            : `${state.roundLabel}. Tabela konkursu.`
    screenReaderStatus.textContent = paused ? `Pauza: ${pauseReason}. Enter wznawia.` : detail
    canvas.setAttribute('aria-label', `Retro Ski Jumping — ${paused ? 'pauza' : detail}`)
    return
  }

  const state = paused ? `Pauza: ${pauseReason}. Enter wznawia.` : 'Menu główne.'
  const hillControls = PLAYABLE_HILL_SPECS.length > 1
    ? 'Lewo i prawo zmienia skocznię.'
    : 'Dostępna jest tylko skocznia techniczna.'
  const replayBlock = latestReplay ? blockedReplayNotice(latestReplay) : null
  const replayStatus = replayBlock
    ? `Ostatnia powtórka niedostępna: ${replayBlock}.`
    : ''
  screenReaderStatus.textContent = `${state} Wybrano: ${MENU_NAMES[menuSelection]}. ${hillLabel()}. ${hill.spec.name}, identyfikator ${hill.spec.id}, wersja ${hill.spec.hillVersion}. ${hillControls} Góra i dół wybiera tryb, Enter lub ${settings.menuConfirm} zatwierdza, Backspace lub ${settings.menuBack} wraca. F ponawia pełny ekran. P włącza pauzę. ${settingsMessage?.startsWith('NIE') ? `${settingsMessage}. ` : ''}${replayStatus} ${accessibleTrainingGateText()}`
  canvas.setAttribute('aria-label', `Retro Ski Jumping — ${paused ? 'pauza' : 'menu główne'}`)
}

function trainingAutoGate(attemptNumber: number): { gateNumber: number; windMean: number } {
  const field = createWindField(windSeedForAttempt(TRAINING_WIND_BASE_SEED, attemptNumber))
  const windMean = forecastWindMean(field, hill)
  return { gateNumber: selectSafeJuryGate(hill, windMean).gateNumber, windMean }
}

function formatTrainingWind(windMean: number): string {
  return `${windMean >= 0 ? '+' : ''}${windMean.toFixed(1).replace('.', ',')}`
}

function accessibleTrainingGateText(): string {
  const automatic = trainingAutoGate(1)
  if (trainingGateOverride === null) {
    return `Belka automatyczna ${automatic.gateNumber}, prognoza wiatru ${formatTrainingWind(automatic.windMean)} metra na sekundę.`
  }
  return `Belka ręczna ${trainingGateOverride}, automatyczna propozycja ${automatic.gateNumber}.`
}

function menuTrainingGateText(): string {
  const automatic = trainingAutoGate(1)
  if (trainingGateOverride === null) {
    return `BELKA AUTO (WIATR ${formatTrainingWind(automatic.windMean)}): ${automatic.gateNumber}`
  }
  return `BELKA RĘCZNA ${trainingGateOverride} (AUTO ${automatic.gateNumber})`
}

function startAttempt(resetTraining: boolean): void {
  sessionLease?.stopHeartbeat()
  if (resetTraining) {
    // Nowa sesja treningowa zawsze zaczyna od propozycji AUTO. Ręczny wybór
    // zachowujemy tylko między próbami tej samej sesji.
    trainingGateOverride = null
    trainingAttempt = 1
    trainingCompletedAttempts = 0
    trainingBestDistanceHalfMeters = 0
    trainingBestTotalTenths = 0
  } else {
    trainingAttempt += 1
  }
  const windSeed = windSeedForAttempt(TRAINING_WIND_BASE_SEED, trainingAttempt)
  const windField = createWindField(windSeed)
  const forecast = forecastWindMean(windField, hill)
  const automatic = selectSafeJuryGate(hill, forecast).gateNumber
  const attemptGate = trainingGateOverride ?? automatic
  trainingGateDecision = {
    gateNumber: attemptGate,
    autoGateNumber: automatic,
    forecastWindMean: forecast,
    manual: trainingGateOverride !== null,
  }
  jump = new JumpSimulation({ hill, gateNumber: attemptGate, windField })
  trainingResult = null
  technicalView = false
  screen = 'jump'
  paused = false
  tick = 0
  journal = []
  input.reset()
  lastInput = emptyTickInput()
  const now = performance.now()
  sessionClock.start(now)
  fixedClock.reset(now)
  lifecycleMessage = `ZIELONE ŚWIATŁO — ${settings.bindings.right} OPUSZCZA BELKĘ`
  setScreenReaderStatus()
  canvas.focus()
}

function retuneTrainingGate(nextGate: number): void {
  const current = jump
  if (!current || !current.windField) return
  const windField = current.windField
  const autoGateNumber = trainingGateDecision?.autoGateNumber
    ?? selectSafeJuryGate(hill, forecastWindMean(windField, hill)).gateNumber
  const forecastWindMeanValue = trainingGateDecision?.forecastWindMean
    ?? forecastWindMean(windField, hill)
  trainingGateOverride = nextGate
  trainingGateDecision = {
    gateNumber: nextGate,
    autoGateNumber,
    forecastWindMean: forecastWindMeanValue,
    manual: true,
  }
  jump = new JumpSimulation({ hill, gateNumber: nextGate, windField })
  trainingResult = null
  tick = 0
  journal = []
  input.reset()
  lastInput = emptyTickInput()
  const now = performance.now()
  sessionClock.start(now)
  fixedClock.reset(now)
  lifecycleMessage = `ZIELONE ŚWIATŁO — ${settings.bindings.right} OPUSZCZA BELKĘ`
  setScreenReaderStatus()
  canvas.focus()
}

function settleTrainingResult(): void {
  if (!jump?.outcome || trainingResult) return
  trainingResult = createTrainingJumpResult(jump, trainingAttempt)
  playResultAudio(jump)
  trainingCompletedAttempts += 1
  trainingBestDistanceHalfMeters = Math.max(trainingBestDistanceHalfMeters, trainingResult.distanceHalfMeters)
  trainingBestTotalTenths = Math.max(trainingBestTotalTenths, trainingResult.totalTenths)
  lifecycleMessage = 'WYNIK — ENTER: NASTĘPNA PRÓBA / BACKSPACE: MENU'
  setScreenReaderStatus()
}

function trainingLeadingState(sim: JumpSimulation): { targetHalfMeters: number | null; leaderFixtureTenths: number } {
  const rule = sim.hill.spec.compensation
  const referenceGate = sim.hill.gate(rule.referenceGateNumber)
  const juryGate = sim.hill.gate(sim.gateNumber)
  // Ta sama średnia wiatru, którą punktacja użyje w wyniku końcowym.
  // Przed kontaktem zamrożony pomiar jeszcze nie istnieje, więc używamy
  // bieżącej średniej akumulatora; po kontakcie obowiązuje pomiar końcowy.
  const scoringWindMean = sim.windMeasurement?.meanUserMetersPerSecond
    ?? sim.liveWindMeasurement?.meanUserMetersPerSecond
    ?? sim.currentWindUserMetersPerSecond
  const windTenths = windCompensationTenths(
    scoringWindMean,
    rule.headWindFactorTenthsPerMps,
    rule.tailWindFactorTenthsPerMps,
  )
  const juryGateTenths = gateCompensationTenths(
    referenceGate.inrunLengthMeters,
    juryGate.inrunLengthMeters,
    rule.gateFactorTenthsPerInrunMeter,
  )
  const input: LeadingTargetInput = {
    kPointMeters: sim.hill.spec.kPointMeters,
    maximumDistanceHalfMeters: sim.hill.spec.outrunEndMeters * 2,
    leaderTotalTenths: 0,
    playerPreviousTenths: TRAINING_PLAYER_PREVIOUS_TENTHS,
    predictedStyleTenths: 525,
    predictedStyleRule: { hillSizeMeters: sim.hill.spec.hillSizeMeters, landingStyle: 'telemark' },
    windTenths,
    juryGateTenths,
    coachGateTenths: 0,
    coachDecisionAccepted: false,
    coachThresholdHalfMeters: rule.coachThresholdHalfMeters,
  }
  // Lider kontrolny dostaje wynik dokładnie z połówki poprzedzającej cel
  // treningowy (połowa K–HS). Solver wymaga wyniku WIĘKSZEGO, więc zielona
  // linia wypada na docelowej połówce metra niezależnie od wiatru
  // i rekompensaty za AUTO belkę.
  const leaderFixtureTenths = projectedCompetitionTenthsAt(
    input,
    Math.max(0, TRAINING_LEADING_TARGET_HALF_METERS - 1),
  )
  return {
    targetHalfMeters: solveLeadingTarget({ ...input, leaderTotalTenths: leaderFixtureTenths })?.distanceHalfMeters ?? null,
    leaderFixtureTenths,
  }
}

function contentVersions() {
  return {
    rules: MODERN_RULES.version,
    physics: physicsParamsForHill(hill.spec).physicsVersion,
    hill: hill.spec.hillVersion,
  }
}

function resumableSession(): StoredSession | null {
  return savedSession && savedSession.competition.status === 'active' ? savedSession : null
}

async function initPersistence(): Promise<void> {
  try {
    database = await openGameDatabase()
  } catch (cause) {
    saveState = 'failed'
    saveMessage = cause instanceof Error ? cause.message : String(cause)
    settingsMessage = 'NIE ZAPISANO USTAWIEŃ — BRAK BAZY; UŻYJ DOMYŚLNYCH'
    setScreenReaderStatus()
    return
  }

  try {
    settings = await loadGameSettings(database)
  } catch {
    settings = normalizeSettings(undefined)
    settingsMessage = 'NIE ODCZYTANO USTAWIEŃ — DOMYŚLNE W PAMIĘCI'
  }
  reducedMotion = settings.reducedMotion || reducedMotionQuery.matches
  applyCanvasScale()
  await loadSelectedHillPersistence()
  // Karta w trybie odczytu odświeża stan, aby zauważyć wygaśnięcie lease.
  // Poza ekranami konkursu nie dotykamy bazy: trening i menu mają pozostać
  // wolne od tła, które mogłoby wywołać auto-pauzę limitu klatki.
  setInterval(() => {
    const lease = sessionLease
    if (!lease || lease.status.role === 'owner') return
    if (screen !== 'competition' && screen !== 'competition-setup') return
    void lease.refresh().catch(() => undefined)
  }, 2_000)

  const replay = await loadLatestReplay(database)
  if (replay.kind === 'ok') {
    latestReplay = replay.replay
    const blocked = blockedReplayNotice(latestReplay)
    if (blocked) {
      replayVisualsOk = false
      replayNotice = blocked
    }
  }
  else if (replay.kind === 'rejected') replayNotice = replay.reason

  officialRecord = (await loadOfficialRecord(database, recordKey(contentVersions()))) ?? null
  storedResultCount = await countStore(database, 'results')
  persistenceReady = true
  setScreenReaderStatus()
}

function hillLabel(): string {
  const name = hill.spec.id === 'h01-lillehammer-normal'
    ? 'LILLEHAMMER INSP.'
    : hill.spec.id === 'h02-zakopane-large' ? 'ZAKOPANE INSP.' : 'TECHNICZNA'
  const displayName = hill.spec.id === 'h04-planica-flying' ? 'PLANICA MAMUT INSP.'
    : hill.spec.id === 'h03-oberstdorf-large' ? 'OBERSTDORF INSP.' : name
  return `${displayName} • K${hill.spec.kPointMeters}/HS${hill.spec.hillSizeMeters}`
}

function blockedReplayNotice(replay: StoredReplay): string | null {
  const hillId = replay.initialState.hillId
  const current = PLAYABLE_HILL_SPECS.find((spec) => spec.id === hillId)
  if (hillId === 'h01-lillehammer-normal' && replay.versions.hill !== current?.hillVersion) {
    return 'POWTÓRKA H01 ZE STAREGO PROFILU JEST NIEDOSTĘPNA'
  }
  if (hillId === 'h02-zakopane-large' && replay.versions.hill !== current?.hillVersion) {
    return 'POWTÓRKA H02 ZE STAREGO PROFILU JEST NIEDOSTĘPNA'
  }
  if (hillId === 'h03-oberstdorf-large' && replay.versions.hill !== current?.hillVersion) {
    return 'POWTÓRKA H03 ZE STAREGO PROFILU JEST NIEDOSTĘPNA'
  }
  if (hillId === 'h04-planica-flying' && replay.versions.hill !== current?.hillVersion) {
    return 'POWTÓRKA PLANICY ZE STAREGO PROFILU JEST NIEDOSTĘPNA'
  }
  return null
}

function latestReplayCanOpen(): boolean {
  return latestReplay !== null && blockedReplayNotice(latestReplay) === null
}

async function loadSelectedHillPersistence(): Promise<void> {
  if (!database) return
  savedSession = null
  savedRejectedReason = null
  officialRecord = null
  failedCommit = null
  saveState = 'idle'
  saveMessage = ''
  leaseChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel(LEASE_CHANNEL_NAME) : null
  sessionLease = new SessionLease(database, hillCompetitionSessionId(hill.spec.id), persistenceOwnerId, { channel: leaseChannel })
  const status = await sessionLease.acquire()
  if (status.role !== 'owner') {
    saveState = 'readonly'
    saveMessage = `sesję zapisuje karta ${status.ownerId ?? '—'}`
  }
  const loaded = await loadSession(database, hillCompetitionSessionId(hill.spec.id))
  if (loaded.kind === 'ok') {
    try {
      assertSessionMatchesHill(loaded.session, hill.spec.id)
      savedSession = loaded.session
    } catch {
      savedRejectedReason = hill.spec.id === 'h04-planica-flying'
        && loaded.session.hillId === hill.spec.id
        && (loaded.session.versions.hill !== hill.spec.hillVersion
          || loaded.session.competition.versions.hill !== hill.spec.hillVersion)
        ? 'STARY ZAPIS PLANICY — INNA WERSJA PROFILU'
        : 'INNA SKOCZNIA LUB WERSJA'
    }
  } else if (loaded.kind === 'rejected') savedRejectedReason = loaded.reason
  officialRecord = (await loadOfficialRecord(database, recordKey(contentVersions()))) ?? null
}

async function changeHill(direction: -1 | 1): Promise<void> {
  if (hillLoading || (!persistenceReady && saveState !== 'failed')) return
  if (PLAYABLE_HILL_SPECS.length <= 1) {
    lifecycleMessage = 'DOSTĘPNA JEST TYLKO JEDNA SKOCZNIA'
    setScreenReaderStatus()
    return
  }
  const currentIndex = PLAYABLE_HILL_SPECS.findIndex((spec) => spec.id === hill.spec.id)
  const nextIndex = (currentIndex + direction + PLAYABLE_HILL_SPECS.length) % PLAYABLE_HILL_SPECS.length
  const nextHill = PLAYABLE_HILL_SPECS[nextIndex]
  if (!nextHill) return
  hillLoading = true
  try {
    await saveChain
    await sessionLease?.release()
    leaseChannel?.close()
    hill = buildHillById(nextHill.id)
    hillView = buildView(hill)
    TRAINING_LEADING_TARGET_HALF_METERS = trainingTargetHalfMeters(hill.spec.kPointMeters, hill.spec.hillSizeMeters)
    TRAINING_RECORD_HALF_METERS = hill.spec.id === 'h01-lillehammer-normal' ? 215
      : hill.spec.id === 'h02-zakopane-large' ? 294
        : hill.spec.id === 'h03-oberstdorf-large' ? 287
          : hill.spec.id === 'h04-planica-flying' ? 509 : 274
    trainingGateOverride = null
    trainingGateDecision = null
    await loadSelectedHillPersistence()
    lifecycleMessage = 'MENU — WYBIERZ TRYB'
  } catch (cause) {
    saveState = 'failed'
    saveMessage = cause instanceof Error ? cause.message : String(cause)
  } finally {
    hillLoading = false
    setScreenReaderStatus()
  }
}

function enqueueSave(request: CommitRequest): void {
  saveChain = saveChain.then(() => runCommit(request)).catch(() => undefined)
}

async function runCommit(request: CommitRequest): Promise<void> {
  if (!database) {
    saveState = 'failed'
    saveMessage = 'baza zapisu jest niedostępna'
    return
  }
  // Karta bez lease nie przejmuje zapisu po cichu; przejęcie wymaga klawisza L.
  if (sessionLease && sessionLease.status.role !== 'owner') {
    saveState = 'readonly'
    saveMessage = `sesję zapisuje karta ${sessionLease.status.ownerId ?? '—'}`
    return
  }
  if (saveState !== 'failed') saveState = 'saving'
  const outcome = await commitAttempt(database, {
    session: request.session,
    result: request.result,
    recordCandidate: request.recordCandidate,
    replay: request.replay,
    ownerId: persistenceOwnerId,
    nowMs: Date.now(),
  })
  if (!outcome.ok) {
    // Stan RAM pozostaje poprawny; gracz może ponowić zapis.
    if (outcome.error !== 'lease-denied') failedCommit ??= request
    saveState = outcome.error === 'lease-denied' ? 'readonly' : 'failed'
    saveMessage = outcome.reason
    return
  }
  if (failedCommit === request) failedCommit = null
  saveState = failedCommit ? 'failed' : 'saved'
  if (!failedCommit) saveMessage = ''
  savedSession = request.session
  savedRejectedReason = null
  if (outcome.applied) storedResultCount += 1
  if (outcome.recordUpdated && request.recordCandidate) {
    officialRecord = {
      key: recordKey(request.recordCandidate.versions),
      distanceHalfMeters: request.recordCandidate.distanceHalfMeters,
      totalTenths: request.result?.totalTenths ?? 0,
      participantId: request.result?.participantId ?? '',
      resultId: request.result?.resultId ?? '',
      establishedAtMs: Date.now(),
      versions: request.recordCandidate.versions,
    }
  }
  if (request.replay) {
    latestReplay = request.replay
    replayVisualsOk = request.replay.initialState.hillId === hill.spec.id
      && replayVisualsCompatible(request.replay, hill.spec.hillVersion, hill.spec.id)
    replayNotice = replayVisualsOk ? '' : 'TA POWTÓRKA POCHODZI Z INNEGO WYDANIA GRY'
  }
}

function retrySave(): void {
  if (!failedCommit || saveState === 'saving') return
  enqueueSave(failedCommit)
}

function takeOverSessionLease(): void {
  const lease = sessionLease
  if (!lease || lease.status.role === 'owner' || !lease.status.takeoverAvailable) return
  void lease.acquire().then((status) => {
    if (status.role !== 'owner') return
    lease.startHeartbeat()
    saveState = failedCommit ? 'failed' : 'idle'
    saveMessage = failedCommit ? 'zapis oczekuje na ponowienie' : ''
    setScreenReaderStatus()
  })
}

function attachPersistence(session: CompetitionSession): void {
  session.onCommit = enqueueSave
  session.requestCheckpoint()
}

function openLastReplay(): boolean {
  if (!latestReplay) return false
  const replayHillId = latestReplay.initialState.hillId
  const blocked = blockedReplayNotice(latestReplay)
  if (blocked) {
    replayPlayer = null
    replayVisualsOk = false
    replayNotice = blocked
    lifecycleMessage = blocked
    setScreenReaderStatus()
    canvas.focus()
    return false
  }
  const replaySpec = PLAYABLE_HILL_SPECS.find((spec) => spec.id === replayHillId)
  replayPlayer = new ReplayPlayer(latestReplay)
  replayStorageBytes = approximateBytes(latestReplay)
  replayHill = replaySpec ? buildHillById(replaySpec.id) : hill
  replayHillView = buildView(replayHill)
  replayVisualsOk = Boolean(replaySpec)
    && replayVisualsCompatible(latestReplay, replayHill.spec.hillVersion, replayHill.spec.id)
  replayNotice = replayVisualsOk
    ? ''
    : debugEnabled
      ? `BRAK ZGODNYCH DANYCH WIZUALNYCH (${latestReplay.versions.hill}) — BEZ PRZELICZANIA NOWĄ FIZYKĄ`
      : 'TA POWTÓRKA POCHODZI Z INNEGO WYDANIA GRY'
  screenBeforeReplay = screen
  screen = 'replay'
  paused = false
  replayLastFrameMs = performance.now()
  input.reset()
  lastInput = emptyTickInput()
  lifecycleMessage = 'POWTÓRKA — ODTWARZANIE NIE NALICZA WYNIKU'
  setScreenReaderStatus()
  canvas.focus()
  return true
}

function closeReplay(): void {
  replayPlayer = null
  screen = screenBeforeReplay === 'replay' ? 'menu' : screenBeforeReplay
  const now = performance.now()
  input.reset()
  lastInput = emptyTickInput()
  sessionClock.start(now)
  fixedClock.reset(now)
  lifecycleMessage = screen === 'menu' ? 'MENU — WYBIERZ TRYB' : 'KONKURS STANDARDOWY'
  setScreenReaderStatus()
  canvas.focus()
}

function openCompetitionSetup(): void {
  competition = null
  screen = 'competition-setup'
  paused = false
  tick = 0
  input.reset()
  lastInput = emptyTickInput()
  lifecycleMessage = 'KONFIGURACJA KONKURSU'
  setScreenReaderStatus()
}

async function startCompetition(restored: StoredSession | null = null): Promise<void> {
  if (hillLoading || (!persistenceReady && saveState !== 'failed')) return
  if (restored) assertSessionMatchesHill(restored, hill.spec.id)
  // Po returnToMenu ta sama karta zwolniła lease; przed pierwszym checkpointem
  // odzyskujemy własność, aby zapis startowy przeszedł bez czekania na TTL.
  // Czekamy też na kolejkę zapisów (w tym zaległy release), żeby acquire nie
  // wyścignął się ze zwolnieniem poprzedniej sesji.
  try {
    await saveChain.catch(() => undefined)
  } catch {
    /* kolejka zapisów nigdy nie blokuje startu konkursu */
  }
  try {
    await sessionLease?.acquire()
  } catch {
    /* błąd lease ujawni się jako readonly przy najbliższym commicie */
  }
  competition = new CompetitionSession(
    hill,
    restored ? restored.setup.profileCount : competitionProfileCount,
    restored ? restored.setup.difficulty : competitionDifficulty,
    enterDown,
    restored,
    hillCompetitionSessionId(hill.spec.id),
  )
  competition.setRoundSummaryVisibleRows(settings.largeText ? LARGE_ROUND_SUMMARY_VISIBLE_ROWS : ROUND_SUMMARY_VISIBLE_ROWS)
  // Nowy konkurs nadpisuje poprzedni zapis, więc startuje od jego rewizji.
  if (!restored) competition.revision = savedSession?.revision ?? 0
  attachPersistence(competition)
  if (sessionLease?.status.role === 'owner') sessionLease.startHeartbeat()
  screen = 'competition'
  paused = false
  tick = 0
  input.reset()
  lastInput = emptyTickInput()
  const now = performance.now()
  sessionClock.start(now)
  fixedClock.reset(now)
  lifecycleMessage = 'KONKURS STANDARDOWY'
  setScreenReaderStatus()
}

function returnToMenu(): void {
  const lease = sessionLease
  lease?.stopHeartbeat()
  // Świadome wyjście zwalnia lease, aby druga karta przejęła zapis bez TTL.
  // Release jest ustawiony ZA kolejką zapisów, aby oczekujący commit nie
  // odnowił lease po wyjściu (commit odnawia lease w tej samej transakcji).
  if (lease) {
    saveChain = saveChain.then(() => lease.release()).catch(() => undefined)
  }
  jump = null
  trainingResult = null
  competition = null
  screen = 'menu'
  paused = false
  tick = 0
  journal = []
  input.reset()
  lastInput = emptyTickInput()
  const now = performance.now()
  sessionClock.start(now)
  fixedClock.reset(now)
  lifecycleMessage = 'MENU — WYBIERZ TRYB'
  setScreenReaderStatus()
  canvas.focus()
}

function startFromGesture(): void {
  if (screen !== 'title') return

  void requestFullscreenSafely()
  void audio.unlock().then(
    () => { lifecycleMessage = 'DŹWIĘK: AKTYWNY' },
    () => { lifecycleMessage = 'DŹWIĘK: NIEDOSTĘPNY — GRA DZIAŁA DALEJ' },
  )

  screen = 'menu'
  paused = false
  tick = 0
  demoPosition = 0
  journal = []
  input.reset()
  const now = performance.now()
  sessionClock.start(now)
  fixedClock.reset(now)
  setScreenReaderStatus()
  canvas.focus()
}

async function requestFullscreenSafely(): Promise<void> {
  fullscreenAttempts += 1
  const requestedFromTitle = screen === 'title'
  const suspendedActiveSession = isActiveScreen() && !paused
  fullscreenTransitioning = true
  if (suspendedActiveSession) {
    sessionClock.pause(performance.now())
    fixedClock.reset()
    input.reset()
  }

  try {
    if (!shell.requestFullscreen) {
      lifecycleMessage = 'PEŁNY EKRAN: BRAK API — TRYB OKIENKOWY'
      return
    }
    await shell.requestFullscreen()
    lifecycleMessage = 'PEŁNY EKRAN: AKTYWNY'
    if (paused && pauseReason === 'opuszczono pełny ekran') {
      resumeGame(performance.now())
    }
  } catch {
    lifecycleMessage = 'PEŁNY EKRAN: ODMOWA — TRYB OKIENKOWY'
  } finally {
    const now = performance.now()
    if (isActiveScreen() && !paused) {
      if (suspendedActiveSession) sessionClock.resume(now)
      else if (requestedFromTitle) sessionClock.reanchor(now)
      fixedClock.reset(now)
      input.reset()
    }
    fullscreenTransitioning = false
  }
}

function pauseGame(reason: string, now = performance.now(), alignToSimulation = false): void {
  if (!isActiveScreen()) return
  if (screen === 'settings') {
    // There is no running jump to pause on this screen. Dropping focus must
    // discard a half-finished rebinding, not leave an invisible paused state.
    const wasCapturing = captureTarget !== null
    const wasPaused = paused
    captureTarget = null
    input.reset()
    lastInput = emptyTickInput()
    enterDown = false
    if (wasPaused) {
      paused = false
      pauseReason = ''
      sessionClock.resume(now)
      fixedClock.reset(now)
    }
    if (wasCapturing) settingsMessage = 'ANULOWANO PRZECHWYTYWANIE KLAWISZA PO UTRACIE FOKUSU'
    if (wasCapturing || wasPaused) setScreenReaderStatus()
    return
  }
  if (paused) return
  if (alignToSimulation) sessionClock.pauseAtTick(tick)
  else sessionClock.pause(now)
  fixedClock.reset()
  input.reset()
  lastInput = emptyTickInput()
  paused = true
  pauseReason = reason
  lifecycleMessage = 'PAUZA — BRAK NADRABIANIA CZASU'
  setScreenReaderStatus()
}

function resumeGame(now = performance.now()): void {
  if (!isActiveScreen() || !paused) return
  input.reset()
  sessionClock.resume(now)
  fixedClock.reset(now)
  paused = false
  pauseReason = ''
  lifecycleMessage = 'SESJA WZNOWIONA'
  setScreenReaderStatus()
  canvas.focus()
}

function timestampFor(event: KeyboardEvent): number {
  return normalizeEventTimestamp(event.timeStamp, performance.now(), performance.timeOrigin)
}

function updateSettings(next: GameSettings, message: string): void {
  settings = next
  settingsMessage = message
  reducedMotion = settings.reducedMotion || reducedMotionQuery.matches
  competition?.setRoundSummaryVisibleRows(settings.largeText ? LARGE_ROUND_SUMMARY_VISIBLE_ROWS : ROUND_SUMMARY_VISIBLE_ROWS)
  applyCanvasScale()
  setScreenReaderStatus()
  // Queue full snapshots in order. Failure affects persistence, never the current RAM settings.
  settingsSaveChain = settingsSaveChain.then(async () => {
    if (!database) throw new Error('Baza niedostępna')
    await saveGameSettings(database, next)
    if (settings === next) {
      settingsMessage = 'USTAWIENIA ZAPISANE'
      setScreenReaderStatus()
    }
  }).catch(() => {
    if (settings === next) {
      settingsMessage = 'NIE ZAPISANO USTAWIEŃ — ZMIANA DZIAŁA TYLKO DO ODŚWIEŻENIA'
      setScreenReaderStatus()
    }
  })
}

function openSettings(): void {
  if (paused) resumeGame()
  screen = 'settings'
  selectedRow = SETTINGS_ROWS[0]
  captureTarget = null
  input.reset()
  lastInput = emptyTickInput()
  setScreenReaderStatus()
}

function closeSettings(): void {
  captureTarget = null
  screen = 'menu'
  input.reset()
  lastInput = emptyTickInput()
  lifecycleMessage = 'MENU — WYBIERZ TRYB'
  setScreenReaderStatus()
}

function changeSettingsOption(direction: -1 | 1): void {
  switch (selectedRow) {
    case 'volume': {
      const volume = Math.max(0, Math.min(100, settings.volume + direction * 10))
      if (volume !== settings.volume) updateSettings({ ...settings, volume }, `GŁOŚNOŚĆ ${volume}%`)
      break
    }
    case 'scaleMode':
      updateSettings({ ...settings, scaleMode: settings.scaleMode === 'fit' ? 'integer' : 'fit' }, 'SKALA ZMIENIONA')
      break
    case 'largeText':
      updateSettings({ ...settings, largeText: !settings.largeText }, 'DUŻY TEKST ZMIENIONY')
      break
    case 'reducedMotion':
      updateSettings({ ...settings, reducedMotion: !settings.reducedMotion }, 'RUCH TŁA ZMIENIONY')
      break
    default:
      break
  }
}

function handleSettingsKey(event: KeyboardEvent): void {
  event.preventDefault()
  if (event.repeat) return
  if (captureTarget) {
    if (event.code === 'Escape' || event.code === 'Backspace') {
      captureTarget = null
      settingsMessage = 'ANULOWANO ZMIANĘ KLAWISZA'
    } else {
      const result = rebindSettings(settings, captureTarget, event.code)
      if (result.ok) {
        const name = SETTINGS_NAMES[captureTarget]
        captureTarget = null
        updateSettings(result.settings, `${name.toUpperCase()}: ${event.code}`)
        return
      }
      settingsMessage = result.reason === 'conflict'
        ? `KONFLIKT: ${SETTINGS_NAMES[result.conflictingWith!] ?? result.conflictingWith} JUŻ UŻYWA TEGO KLAWISZA`
        : result.reason === 'reserved-key'
          ? 'NIEDOZWOLONY KLAWISZ — ZAREZERWOWANY DLA MENU LUB SKRÓTU'
          : 'NIEPRAWIDŁOWY KOD KLAWISZA'
    }
    setScreenReaderStatus()
    return
  }
  if (event.code === 'Backspace' || event.code === 'Escape' || event.code === settings.menuBack) {
    closeSettings()
    return
  }
  if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
    const delta = event.code === 'ArrowDown' ? 1 : -1
    selectedRow = SETTINGS_ROWS[(SETTINGS_ROWS.indexOf(selectedRow) + delta + SETTINGS_ROWS.length) % SETTINGS_ROWS.length]!
    settingsMessage = null
    setScreenReaderStatus()
    return
  }
  if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
    changeSettingsOption(event.code === 'ArrowRight' ? 1 : -1)
    return
  }
  if (event.code !== 'Enter' && event.code !== settings.menuConfirm) return
  if (selectedRow === 'reset') {
    updateSettings(normalizeSettings(DEFAULT_SETTINGS), 'PRZYWRÓCONO DOMYŚLNE USTAWIENIA')
  } else if (selectedRow === 'volume' || selectedRow === 'scaleMode' || selectedRow === 'largeText' || selectedRow === 'reducedMotion') {
    changeSettingsOption(1)
  } else {
    captureTarget = selectedRow
    settingsMessage = 'NACIŚNIJ KLAWISZ; ESC / BACKSPACE ANULUJE'
    setScreenReaderStatus()
  }
}

function actionFor(event: KeyboardEvent): Action | undefined {
  if (screen === 'competition' && competition?.view === 'jump' && !competition.activeProfile) return undefined
  return resolveBoundAction(settings.bindings, event.code)
}

function textEntryOrComposing(event: KeyboardEvent): boolean {
  if (event.isComposing || event.key === 'Process' || event.keyCode === 229) return true
  const target = event.target
  return target instanceof HTMLElement
    && (target.isContentEditable || target.closest('input, textarea, select, [contenteditable="true"]') !== null)
}

function onKeyDown(event: KeyboardEvent): void {
  if (textEntryOrComposing(event)) return
  if (event.code === 'Enter' && !event.repeat) enterDown = true

  if (screen === 'title' && event.code === 'Enter' && !event.repeat) {
    event.preventDefault()
    startFromGesture()
    return
  }

  if (screen === 'settings') {
    if (paused) resumeGame(timestampFor(event))
    handleSettingsKey(event)
    return
  }

  if (event.code === 'KeyF' && !event.repeat) {
    event.preventDefault()
    void requestFullscreenSafely()
    return
  }

  if (!isActiveScreen()) return
  if (paused && event.code === 'Enter' && !event.repeat) {
    event.preventDefault()
    resumeGame(timestampFor(event))
    return
  }
  if (screen === 'replay' && replayPlayer) {
    const player = replayPlayer
    if (event.code === 'Backspace' && !event.repeat) {
      event.preventDefault()
      closeReplay()
      return
    }
    if (event.code === 'Space' && !event.repeat) {
      event.preventDefault()
      player.togglePlay()
      replayLastFrameMs = performance.now()
      setScreenReaderStatus()
      return
    }
    if (event.code === 'KeyR' && !event.repeat) {
      event.preventDefault()
      player.restart()
      replayLastFrameMs = performance.now()
      return
    }
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
      event.preventDefault()
      player.scrub(event.code === 'ArrowRight' ? 30 : -30)
      setScreenReaderStatus()
      return
    }
    if ((event.code === 'ArrowUp' || event.code === 'ArrowDown') && !event.repeat) {
      event.preventDefault()
      player.changeRate(event.code === 'ArrowUp' ? 1 : -1)
      return
    }
    return
  }

  if (event.code === 'KeyS' && !event.repeat) {
    event.preventDefault()
    snowEnabled = !snowEnabled
    lifecycleMessage = `ŚNIEG: ${snowEnabled ? 'WŁĄCZONY' : 'WYŁĄCZONY'} (TYLKO GRAFIKA)`
    return
  }
  if (debugEnabled && event.code === 'KeyD' && screen === 'jump' && !event.repeat) {
    event.preventDefault()
    technicalView = !technicalView
    return
  }
  if (debugEnabled && event.code === 'KeyD' && screen === 'competition' && competition?.view === 'jump' && !event.repeat) {
    event.preventDefault()
    technicalView = !technicalView
    return
  }
  if (event.code === 'KeyP' && !event.repeat) {
    event.preventDefault()
    pauseGame('pauza użytkownika', timestampFor(event))
    return
  }
  if (event.code === 'Backspace' && screen === 'jump' && !event.repeat) {
    event.preventDefault()
    returnToMenu()
    return
  }
  if (paused) return

  if (screen === 'menu') {
    if (!persistenceReady && saveState !== 'failed') return
    if ((event.code === 'Backspace' || event.code === settings.menuBack) && !event.repeat) {
      event.preventDefault()
      screen = 'title'
      input.reset()
      lastInput = emptyTickInput()
      setScreenReaderStatus()
      return
    }
    if ((event.code === 'ArrowLeft' || event.code === 'ArrowRight') && !event.repeat) {
      event.preventDefault()
      void changeHill(event.code === 'ArrowRight' ? 1 : -1)
      return
    }
    if ((event.code === 'ArrowUp' || event.code === 'ArrowDown') && !event.repeat) {
      event.preventDefault()
      const delta = event.code === 'ArrowDown' ? 1 : -1
      const next = (MENU_ORDER.indexOf(menuSelection) + delta + MENU_ORDER.length) % MENU_ORDER.length
      menuSelection = MENU_ORDER[next] ?? 'training'
      setScreenReaderStatus()
      return
    }
    if ((event.code === 'Enter' || event.code === settings.menuConfirm) && !event.repeat) {
      event.preventDefault()
      if (hillLoading || (!persistenceReady && saveState !== 'failed')) return
      if (menuSelection === 'training') startAttempt(true)
      else if (menuSelection === 'competition') openCompetitionSetup()
      else if (menuSelection === 'settings') openSettings()
      else if (!openLastReplay() && !latestReplay) {
        lifecycleMessage = 'BRAK ZAPISANEJ POWTÓRKI — ROZEGRAJ SKOK'
        setScreenReaderStatus()
      }
      return
    }
  }

  if (screen === 'competition-setup') {
    if (event.code === 'Backspace' && !event.repeat) {
      event.preventDefault()
      returnToMenu()
      return
    }
    if (event.code === 'KeyL' && !event.repeat) {
      event.preventDefault()
      takeOverSessionLease()
      return
    }
    if (event.code === 'KeyN' && !event.repeat) {
      event.preventDefault()
      void startCompetition(null)
      return
    }
    if ((event.code === 'ArrowLeft' || event.code === 'ArrowRight') && !event.repeat) {
      event.preventDefault()
      competitionProfileCount = Math.max(1, Math.min(10, competitionProfileCount + (event.code === 'ArrowRight' ? 1 : -1)))
      setScreenReaderStatus()
      return
    }
    if ((event.code === 'ArrowUp' || event.code === 'ArrowDown') && !event.repeat) {
      event.preventDefault()
      const difficulties: AiDifficulty[] = ['easy', 'normal', 'hard']
      const current = difficulties.indexOf(competitionDifficulty)
      const delta = event.code === 'ArrowDown' ? 1 : -1
      competitionDifficulty = difficulties[(current + delta + difficulties.length) % difficulties.length] ?? 'normal'
      setScreenReaderStatus()
      return
    }
    if (event.code === 'Enter' && !event.repeat) {
      event.preventDefault()
      void startCompetition(resumableSession())
      return
    }
    return
  }

  if (screen === 'competition' && competition) {
    if (event.code === 'KeyZ' && !event.repeat) {
      event.preventDefault()
      retrySave()
      setScreenReaderStatus()
      return
    }
    if (event.code === 'KeyL' && !event.repeat) {
      event.preventDefault()
      takeOverSessionLease()
      return
    }
    if (event.code === 'KeyV' && !event.repeat && competition.view !== 'jump') {
      event.preventDefault()
      if (!openLastReplay() && !latestReplay) lifecycleMessage = 'BRAK ZAPISANEJ POWTÓRKI'
      return
    }

    if (competition.view === 'withdraw-confirm') {
      if (event.code === 'Enter' && !event.repeat) competition.confirmHumanWithdrawal()
      else if (event.code === 'Backspace' && !event.repeat) competition.cancelHumanWithdrawal()
      else return
      event.preventDefault()
      setScreenReaderStatus()
      return
    }

    if (competition.view === 'handover') {
      if (event.code === 'KeyQ' && !event.repeat) {
        event.preventDefault()
        competition.requestHumanWithdrawal()
        setScreenReaderStatus()
        return
      }
      if (event.code === 'Enter' && !event.repeat) {
        event.preventDefault()
        competition.acceptHandover(event.repeat)
        setScreenReaderStatus()
      }
      return
    }

    if (competition.view === 'result' || competition.view === 'round-summary') {
      if (competition.view === 'round-summary'
        && (event.code === 'ArrowUp' || event.code === 'ArrowDown')
        && !event.repeat) {
        event.preventDefault()
        competition.scrollRoundSummary(event.code === 'ArrowDown' ? 3 : -3)
        setScreenReaderStatus()
        return
      }
      if (event.code === 'Enter' && !event.repeat) {
        event.preventDefault()
        competition.continueAfterResult(true)
        setScreenReaderStatus()
      }
      return
    }

    if (competition.view === 'finished') {
      if (event.code === 'Enter' && !event.repeat) {
        event.preventDefault()
        returnToMenu()
      }
      return
    }

    if (competition.view === 'start') {
      if (event.code === 'KeyQ' && !event.repeat) {
        event.preventDefault()
        competition.requestHumanWithdrawal()
      } else if (event.code === 'KeyX' && !event.repeat) {
        event.preventDefault()
        competition.cancelRoundByJury()
      } else if (event.code === 'KeyJ' && !event.repeat) {
        event.preventDefault()
        competition.toggleJuryHold()
      } else if (event.code === 'KeyY' && !event.repeat) {
        event.preventDefault()
        competition.restartStart()
      } else if (event.code === 'KeyC' && !event.repeat) {
        event.preventDefault()
        competition.coachAction()
      } else if ((event.code === 'BracketLeft' || event.code === 'BracketRight') && !event.repeat) {
        event.preventDefault()
        competition.changeJuryGate(event.code === 'BracketRight' ? 1 : -1)
      } else if (event.code === 'Enter' && !event.repeat) {
        event.preventDefault()
        competition.advanceStart()
      } else {
        const profile = competition.activeProfile
        const action = profile ? resolveBoundAction(settings.bindings, event.code) : undefined
        if (action === 'right' && !event.repeat && competition.startHumanJump()) {
          event.preventDefault()
          input.reset()
          lastInput = emptyTickInput()
          technicalView = false
        }
      }
      setScreenReaderStatus()
      return
    }

    if (competition.view === 'jump') {
      const action = actionFor(event)
      if (!action) return
      event.preventDefault()
      input.enqueue(action, 'pressed', timestampFor(event), tick, event.repeat)
      return
    }
    return
  }

  if ((event.code === 'BracketLeft' || event.code === 'BracketRight') && screen === 'jump' && !event.repeat) {
    event.preventDefault()
    if (jump && jump.phase === 'GateGreen' && !trainingResult && !jump.outcome && !paused) {
      const first = hill.gates[0]
      const last = hill.gates[hill.gates.length - 1]
      if (first && last) {
        const delta = event.code === 'BracketRight' ? 1 : -1
        const nextGate = Math.min(last.number, Math.max(first.number, jump.gateNumber + delta))
        if (nextGate !== jump.gateNumber) retuneTrainingGate(nextGate)
        setScreenReaderStatus()
      }
    }
    return
  }

  if (event.code === 'Enter' && !event.repeat) {
    event.preventDefault()
    if (jump?.outcome) startAttempt(false)
    return
  }

  const action = actionFor(event)
  if (!action) return
  event.preventDefault()
  input.enqueue(action, 'pressed', timestampFor(event), tick, event.repeat)
}

function onKeyUp(event: KeyboardEvent): void {
  if (textEntryOrComposing(event)) return
  if (event.code === 'Enter') {
    enterDown = false
    competition?.releaseEnter()
    if (screen === 'competition') setScreenReaderStatus()
  }
  const action = actionFor(event)
  const acceptsJumpInput = screen === 'jump' || (screen === 'competition' && competition?.view === 'jump')
  if (!action || !acceptsJumpInput || paused) return
  event.preventDefault()
  input.enqueue(action, 'released', timestampFor(event), tick)
}

function simulateTick(): void {
  lastInput = input.consume(tick)

  if (screen === 'jump' && jump) {
    const phaseBefore = jump.phase
    jump.step(lastInput)
    playJumpAudio(jump)
    if (jump.phase !== phaseBefore && !jump.outcome) setScreenReaderStatus()
    settleTrainingResult()
    tick += 1
    return
  }

  if (screen === 'competition' && competition) {
    if (competition.view === 'start') {
      const viewBefore = competition.view
      competition.tickStart()
      tick += 1
      if (competition.view !== viewBefore) setScreenReaderStatus()
      return
    }
    if (competition.view === 'jump') {
      const activeJump = competition.jump
      const phaseBefore = competition.jump?.phase
      const viewBefore = competition.view
      competition.stepHumanJump(lastInput)
      if (activeJump) {
        playJumpAudio(activeJump)
        if (competition.view !== 'jump') playResultAudio(activeJump)
      }
      tick += 1
      if (competition.view !== viewBefore || competition.jump?.phase !== phaseBefore) setScreenReaderStatus()
      return
    }
  }

  demoPosition = Math.max(-120, Math.min(120, demoPosition + lastInput.horizontal * 1.5))

  for (const event of lastInput.events) {
    const late = event.delayed ? ' OPÓŹN.' : ''
    journal.push(`${String(event.tick).padStart(5, '0')} ${event.action.toUpperCase()} ${event.edge === 'pressed' ? '↓' : '↑'}${late}`)
  }
  journal = journal.slice(-7)
  tick += 1
}

function drawPixelScene(): void {
  context.imageSmoothingEnabled = false
  context.fillStyle = '#07111f'
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)

  const sky = ['#14233b', '#1b3150', '#244462', '#315d76', '#4c7f91']
  sky.forEach((color, index) => {
    context.fillStyle = color
    context.fillRect(0, index * 27, VIEW_WIDTH, 28)
  })

  fillPixelPolygon(context, '#183344', [[0, 125], [53, 64], [103, 119], [160, 52], [216, 122], [283, 71], [350, 123], [413, 56], [480, 125], [480, 195], [0, 195]])
  fillPixelPolygon(context, '#244b59', [[0, 150], [59, 101], [101, 144], [176, 86], [240, 143], [305, 104], [364, 152], [432, 89], [480, 133], [480, 210], [0, 210]])
  fillPixelPolygon(context, '#d9e8e8', [[0, 145], [53, 125], [118, 139], [178, 124], [247, 143], [305, 138], [369, 151], [429, 155], [480, 160], [480, 270], [0, 270]])
  fillPixelPolygon(context, '#91b4cb', [[0, 165], [73, 150], [146, 163], [225, 152], [293, 167], [373, 171], [480, 177], [480, 270], [0, 270]])

  context.fillStyle = '#536c7a'
  context.fillRect(56, 103, 5, 52)
  context.fillRect(81, 116, 4, 41)
  context.fillRect(56, 103, 31, 4)
  fillPixelPolygon(context, '#e7f0ef', [[58, 105], [84, 105], [193, 159], [190, 163], [80, 111]])
  context.fillStyle = '#d64d53'
  context.fillRect(189, 158, 7, 3)

  for (let x = 0; x < VIEW_WIDTH; x += 14) {
    const height = 9 + ((x * 13) % 17)
    const color = x % 28 === 0 ? '#17382d' : '#244637'
    fillPixelPolygon(context, color, [[x, 210], [x + 5, 210 - height], [x + 10, 210], [x + 10, 231], [x, 231]])
  }
}

function drawFrame(): void {
  if (screen === 'settings') {
    drawSettingsScreen(context, { settings, selectedRow, captureTarget, message: settingsMessage })
    return
  }
  if (screen === 'jump' && jump) {
    const leading = trainingLeadingState(jump)
    const sceneState: TrainingSceneState = {
      attemptNumber: trainingAttempt,
      completedAttempts: trainingCompletedAttempts,
      bestDistanceHalfMeters: trainingBestDistanceHalfMeters,
      bestTotalTenths: trainingBestTotalTenths,
      result: trainingResult,
      technicalView,
      snowEnabled,
      reducedMotion,
      debugEnabled,
      leadingTargetHalfMeters: leading.targetHalfMeters,
      leaderFixtureTenths: leading.leaderFixtureTenths,
      recordHalfMeters: TRAINING_RECORD_HALF_METERS,
      trainingGateMode: trainingGateDecision?.manual === true ? 'manual' : 'auto',
      trainingGateForecastMean: trainingGateDecision?.forecastWindMean ?? null,
      trainingGateAutoNumber: trainingGateDecision?.autoGateNumber ?? null,
      bindingHints: settings.bindings,
    }
    drawJumpScreen(context, jump, hillView, sceneState)
    if (paused) drawPauseBanner()
    return
  }
  if (screen === 'replay' && replayPlayer) {
    drawReplayScreen(context, replayHill, replayHillView, replayPlayer, {
      visualsCompatible: replayVisualsOk,
      notice: replayNotice,
      storageBytes: replayStorageBytes,
      debugEnabled,
      reducedMotion,
      snowEnabled,
    })
    if (paused) drawPauseBanner()
    return
  }
  if (screen === 'competition-setup') {
    const resume = resumableSession()
    drawCompetitionSetup(context, competitionProfileCount, competitionDifficulty, {
      hillLabel: hillLabel(),
      resumeAvailable: resume !== null,
      resumeLabel: resume
        ? `${ROUND_LABEL[resume.competition.rounds[resume.competition.currentRoundIndex]?.id ?? 'qualification']} • SKOK ${resume.competition.nextStartIndex + 1}`
        : savedRejectedReason
          ? savedRejectedReason.startsWith('STARY ZAPIS PLANICY') ? 'PLANICA: ZAPIS ZE STAREGO PROFILU'
            : savedRejectedReason === 'INNA SKOCZNIA LUB WERSJA' ? 'ODRZUCONO: INNA SKOCZNIA' : 'ODRZUCONO: FORMAT ZAPISU'
          : 'BRAK ZAPISANEJ SESJI',
      replayAvailable: latestReplayCanOpen(),
      recordHalfMeters: officialRecord?.distanceHalfMeters ?? null,
      bindingHints: settings.bindings,
    })
    // Pasek zapisu zajmuje przerwę pod nagłówkiem, nie sam nagłówek.
    drawSaveBanner()
    if (paused) drawPauseBanner()
    return
  }
  if (screen === 'competition' && competition) {
    const snapshot = competition.snapshot()
    if (competition.view === 'jump' && competition.jump) {
      const sceneState: TrainingSceneState = {
        mode: 'competition',
        competitorName: snapshot.currentParticipantName ?? '—',
        roundLabel: snapshot.roundLabel,
        attemptNumber: snapshot.nextStartIndex + 1,
        completedAttempts: snapshot.nextStartIndex,
        bestDistanceHalfMeters: 0,
        bestTotalTenths: 0,
        result: null,
        technicalView,
        snowEnabled,
        reducedMotion,
        debugEnabled,
        leadingTargetHalfMeters: competition.leadingTargetHalfMeters(),
        leaderFixtureTenths: snapshot.leaderTotalTenths,
        recordHalfMeters: null,
        bindingHints: settings.bindings,
      }
      drawJumpScreen(context, competition.jump, hillView, sceneState)
    } else if (competition.view === 'handover') {
      drawHandover(context, snapshot, settings.bindings)
    } else if (competition.view === 'start') {
      drawStartProcedure(context, snapshot, settings.bindings)
    } else if (competition.view === 'withdraw-confirm') {
      drawWithdrawalConfirmation(context, snapshot)
    } else if (competition.view === 'round-summary') {
      drawRoundSummary(context, snapshot, settings.largeText)
    } else {
      drawCompetitionProgress(context, snapshot, settings.largeText)
    }
    // Pasek zapisu zajmuje przerwę pod nagłówkiem, nie sam nagłówek.
    drawSaveBanner()
    if (paused) drawPauseBanner()
    return
  }
  drawPixelScene()
  if (screen === 'title') drawTitle()
  else drawMenu()
}

function sizeToScale(size: number): number {
  return size >= 40 ? 5 : size >= 24 ? 3 : size >= 16 ? 2 : 1
}

function currentAlign(): PixelTextAlign {
  return context.textAlign === 'right' ? 'right' : context.textAlign === 'center' ? 'center' : 'left'
}

function label(text: string, x: number, y: number, color: string, size = 16): void {
  const scale = sizeToScale(size)
  drawPixelText(context, text, x, y - 7 * scale, color, scale, currentAlign())
}

/** Błąd zapisu nie kasuje stanu RAM; gracz widzi `NIE ZAPISANO` i może ponowić. */
function drawSaveBanner(): void {
  if (saveState !== 'failed' && saveState !== 'readonly') return
  const readonly = saveState === 'readonly'
  context.fillStyle = readonly ? '#e57731' : '#d64d53'
  // Pasek zajmuje dotychczasową 9-pikselową przerwę między nagłówkiem a panelem
  // (y32–41), więc nie zasłania ani tytułu, ani treści ekranu.
  context.fillRect(0, 32, VIEW_WIDTH, 10)
  context.textAlign = 'left'
  const action = readonly
    ? (sessionLease?.status.takeoverAvailable ? 'L — PRZEJMIJ ZAPIS' : 'INNA KARTA ZAPISUJE')
    : 'Z — PONÓW ZAPIS'
  const prefix = readonly ? 'TYLKO ODCZYT' : 'NIE ZAPISANO'
  const suffix = ` — ${action}`
  const available = VIEW_WIDTH - 16
  const used = measurePixelText(`${prefix}${suffix}`, 1)
  const messageLength = Math.max(0, Math.floor((available - used + 1) / 6))
  const message = saveMessage.slice(0, messageLength)
  label(`${prefix} — ${message}${suffix}`, 8, 40, '#07111f', 8)
}

function drawPauseBanner(): void {
  context.fillStyle = '#d64d53'
  context.fillRect(0, 124, VIEW_WIDTH, 22)
  context.textAlign = 'center'
  label(`PAUZA — ${pauseReason.toUpperCase()} — ENTER WZNAWIA`, VIEW_WIDTH / 2, 138, '#07111f', 11)
  context.textAlign = 'left'
}

function drawTitle(): void {
  context.fillStyle = 'rgba(3, 7, 13, 0.72)'
  context.fillRect(53, 36, 375, 197)
  drawBorder(53, 36, 375, 197, '#f1bd79', '#286bc6')

  context.textAlign = 'center'
  label('RETRO', VIEW_WIDTH / 2, 92, '#f3ead1', 32)
  label('SKI JUMPING', VIEW_WIDTH / 2, 121, '#f1bd79', 24)
  label('PIKSELOWE SKOKI • KLAWIATURA • PEŁNY EKRAN', VIEW_WIDTH / 2, 139, '#91b4cb', 9)

  context.fillStyle = '#14233b'
  context.fillRect(128, 166, 225, 31)
  context.strokeStyle = '#f3ead1'
  context.lineWidth = 1
  context.strokeRect(128.5, 166.5, 224, 30)
  label('ENTER — START', VIEW_WIDTH / 2, 187, '#f3ead1', 16)
  label('Przy odmowie pełnego ekranu gra działa w oknie', VIEW_WIDTH / 2, 216, '#91b4cb', 8)
}

function keyHint(code: string): string {
  const arrows: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' }
  return arrows[code] ?? (code.startsWith('Key') ? code.slice(3) : code.startsWith('Digit') ? code.slice(5) : code)
}

function drawMenu(): void {
  context.fillStyle = 'rgba(3, 7, 13, 0.84)'
  context.fillRect(17, 14, 446, 242)
  drawBorder(17, 14, 446, 242, '#91b4cb', '#286bc6')

  context.textAlign = 'left'
  label('RETRO SKI JUMPING', 32, 35, '#f1bd79', 16)
  const hillSwitchHint = PLAYABLE_HILL_SPECS.length > 1 ? '   ←/→ SKOCZNIA' : ''
  label(`${hillLabel()}${hillSwitchHint}`, 32, 47, '#f1bd79', 8)
  if (debugEnabled) {
    context.textAlign = 'right'
    label(`120 HZ  •  TICK ${tick}`, VIEW_WIDTH - 16, 34, '#91b4cb', 8)
  }

  context.textAlign = 'left'
  context.fillStyle = '#14233b'
  context.fillRect(32, 52, 175, 126)
  context.strokeStyle = '#536c7a'
  context.strokeRect(32, 52, 175, 126)
  label('MENU GŁÓWNE', 44, 70, '#f3ead1', 11)
  drawMenuRow(`${menuSelection === 'training' ? '>' : ' '} TRENING`, 44, 88, menuSelection === 'training')
  drawMenuRow(`${menuSelection === 'competition' ? '>' : ' '} KONKURS STANDARDOWY`, 44, 105, menuSelection === 'competition')
  const replayMenuLabel = !latestReplay
    ? 'POWTÓRKA: BRAK'
    : latestReplayCanOpen()
      ? 'OSTATNIA POWTÓRKA'
      : 'POWTÓRKA NIEDOSTĘPNA'
  drawMenuRow(`${menuSelection === 'replay' ? '>' : ' '} ${replayMenuLabel}`, 44, 122, menuSelection === 'replay')
  drawMenuRow(`${menuSelection === 'settings' ? '>' : ' '} USTAWIENIA`, 44, 139, menuSelection === 'settings')
  drawMenuRow(menuTrainingGateText(), 44, 154, false)
  drawMenuRow('  [ / ] BELKA NA ZIELONYM', 44, 170, false)
  if (hill.spec.id === 'h04-planica-flying') drawPlanicaThumbnail(context, 32, 182)

  context.fillStyle = '#0c1827'
  context.fillRect(220, 52, 228, 159)
  context.strokeStyle = '#536c7a'
  context.strokeRect(220, 52, 228, 159)
  if (debugEnabled) {
    label('WEJŚCIE / CZAS — DEBUG', 231, 70, '#f1bd79', 9)
    label(`${keyHint(settings.bindings.takeoff)} WYBICIE    ${keyHint(settings.bindings.left)} ${keyHint(settings.bindings.right)} POZYCJA`, 231, 89, '#f3ead1', 9)
    label(`${keyHint(settings.bindings.telemark)} TELEMARK   ${keyHint(settings.bindings.parallel)} DWIE NOGI`, 231, 104, '#f3ead1', 9)
    label('P PAUZA      F PEŁNY EKRAN', 231, 119, '#f3ead1', 9)
    context.fillStyle = '#17382d'
    context.fillRect(231, 133, 204, 19)
    label(`OŚ: ${lastInput.horizontal.toString().padStart(2, ' ')}  HELD: ${[...lastInput.held].join(', ') || '—'}`, 237, 146, '#f3ead1', 8)
    journal.forEach((line, index) => label(line, 231, 165 + index * 10, '#91b4cb', 7))
    const markerX = 334 + demoPosition / 2
    context.fillStyle = '#f1bd79'
    context.fillRect(Math.round(markerX), 198, 13, 4)
    context.fillStyle = '#d64d53'
    context.fillRect(Math.round(markerX + 4), 190, 4, 8)
  } else {
    label('STEROWANIE', 231, 72, '#f1bd79', 11)
    label(`${keyHint(settings.bindings.right)}  OPUŚĆ BELKĘ`, 231, 96, '#f3ead1', 9)
    label(`${keyHint(settings.bindings.takeoff)}  WYBICIE`, 231, 113, '#f3ead1', 9)
    label(`${keyHint(settings.bindings.left)} ${keyHint(settings.bindings.right)}  POZYCJA W LOCIE`, 231, 130, '#f3ead1', 9)
    label(`${keyHint(settings.bindings.telemark)}  TELEMARK   ${keyHint(settings.bindings.parallel)}  DWIE NOGI`, 231, 147, '#f3ead1', 9)
    label('P  PAUZA      F  PEŁNY EKRAN', 231, 164, '#91b4cb', 8)
    label(`ŚNIEG: ${snowEnabled && !reducedMotion ? 'WŁ.' : 'WYŁ.'}${reducedMotion ? '  •  MNIEJ RUCHU' : ''}`, 231, 190, '#3fa865', 7)
    label(`ZAPIS: ${resumableSession() ? 'TAK' : 'BRAK'}  •  POTWIERDŹ: ${keyHint(settings.menuConfirm)}`, 231, 204, '#91b4cb', 7)
  }

  context.fillStyle = paused ? '#d64d53' : '#3fa865'
  context.fillRect(32, 224, 416, 19)
  label(paused ? `PAUZA — ${pauseReason.toUpperCase()} — ENTER WZNAWIA` : settingsMessage?.startsWith('NIE') ? settingsMessage : lifecycleMessage, 39, 236, '#07111f', 8)
}

function drawMenuRow(text: string, x: number, y: number, active: boolean): void {
  label(text, x, y, active ? '#f1bd79' : '#91b4cb', y >= 141 ? 8 : 9)
}

function drawBorder(x: number, y: number, width: number, height: number, outer: string, inner: string): void {
  context.strokeStyle = outer
  context.lineWidth = 2
  context.strokeRect(x + 0.5, y + 0.5, width, height)
  context.strokeStyle = inner
  context.lineWidth = 1
  context.strokeRect(x + 4.5, y + 4.5, width - 8, height - 8)
}

function animationFrame(now: number): void {
  if (screen === 'replay' && replayPlayer) {
    // Prezentacja replaya nie używa zegara symulacji i nie nalicza wyniku.
    const deltaSeconds = Math.min(0.25, Math.max(0, (now - replayLastFrameMs) / 1000))
    replayLastFrameMs = now
    if (!paused) replayPlayer.advance(deltaSeconds)
    drawFrame()
    requestAnimationFrame(animationFrame)
    return
  }

  if (screen === 'competition' && competition && !paused && !fullscreenTransitioning && competition.view === 'bots') {
    const viewBefore = competition.view
    competition.advanceBotChunk()
    if (competition.view !== viewBefore) setScreenReaderStatus()
  }

  if (screen === 'competition' && competition?.takeInputResetRequest()) {
    input.reset()
    lastInput = emptyTickInput()
    tick = 0
    sessionClock.start(now)
    fixedClock.reset(now)
  }

  if (usesFixedTicks() && !paused && !fullscreenTransitioning) {
    const result = fixedClock.frame(now, simulateTick)
    if (result.overloaded) pauseGame('zbyt długa przerwa klatki', now, true)
  }
  drawFrame()
  requestAnimationFrame(animationFrame)
}

canvas.addEventListener('keydown', onKeyDown)
canvas.addEventListener('keyup', onKeyUp)
canvas.addEventListener('click', startFromGesture)
window.addEventListener('blur', () => pauseGame('utrata fokusu'))
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') pauseGame('karta w tle')
})
document.addEventListener('fullscreenchange', () => {
  const isFullscreen = Boolean(document.fullscreenElement)
  if (wasFullscreen && !isFullscreen) {
    pauseGame('opuszczono pełny ekran')
    canvas.focus()
  }
  wasFullscreen = isFullscreen
  applyCanvasScale()
})
window.addEventListener('resize', applyCanvasScale)

window.__retroDebugSnapshot = () => ({
  debugEnabled,
  reducedMotion,
  canvasScale,
  screen,
  paused,
  pauseReason,
  tick,
  held: [...lastInput.held],
  horizontal: lastInput.horizontal,
  journal: [...journal],
  fullscreenAttempts,
  menuSelection,
  settings: normalizeSettings(settings),
  selectedRow,
  captureTarget,
  message: settingsMessage,
  selectedHill: { id: hill.spec.id, version: hill.spec.hillVersion, name: hill.spec.name, loading: hillLoading },
  competitionSetup: { profileCount: competitionProfileCount, difficulty: competitionDifficulty },
  persistence: {
    ready: persistenceReady,
    saveState,
    saveMessage,
    revision: competition?.revision ?? 0,
    savedRevision: savedSession?.revision ?? null,
    savedNextStartIndex: savedSession?.competition.nextStartIndex ?? null,
    savedRoundId: savedSession
      ? savedSession.competition.rounds[savedSession.competition.currentRoundIndex]?.id ?? null
      : null,
    resumable: resumableSession() !== null,
    rejectedReason: savedRejectedReason,
    ownerId: persistenceOwnerId,
    leaseRole: sessionLease?.status.role ?? 'reader',
    leaseTakeoverAvailable: sessionLease?.status.takeoverAvailable ?? false,
    recordDistanceHalfMeters: officialRecord?.distanceHalfMeters ?? null,
    resultCount: storedResultCount,
  },
  replay: latestReplay
    ? {
        available: true,
        resultId: latestReplay.id,
        participantName: latestReplay.initialState.participantName,
        tick: replayPlayer?.tick ?? 0,
        playing: replayPlayer?.playing ?? false,
        rate: replayPlayer?.rate ?? 1,
        phase: replayPlayer?.frame().phase ?? null,
        progress: replayPlayer?.progress ?? 0,
        visualsCompatible: replayVisualsOk,
        notice: replayNotice,
        sampleCount: latestReplay.samples.length,
        recordedTotalTenths: latestReplay.recordedResult.totalTenths,
        recordedDistanceHalfMeters: latestReplay.recordedResult.distanceHalfMeters,
        physicsVersion: latestReplay.versions.physics,
        hillId: latestReplay.initialState.hillId,
      }
    : null,
  jump: jump
    ? {
        phase: jump.phase,
        tick: jump.tick,
        gate: jump.gateNumber,
        gateSource: trainingGateDecision?.manual === true ? 'manual' : trainingGateDecision ? 'auto' : null,
        gateAutoNumber: trainingGateDecision?.autoGateNumber ?? null,
        gateForecastMean: trainingGateDecision?.forecastWindMean ?? null,
        speedKmh: jump.speedKmh,
        targetPitchDeg: jump.targetPitchRad * 180 / Math.PI,
        flowDeg: Math.atan2(jump.velocity.y, jump.velocity.x) * 180 / Math.PI,
        flightSeconds: jump.flightSeconds,
        heightAboveSurface: jump.heightAboveSurface(),
        distance: jump.measuredDistanceMeters,
        status: jump.outcome?.status ?? null,
        terminalPhase: jump.outcome?.terminalPhase ?? null,
        perfectTakeoff: jump.perfectTakeoff,
        takeoffTimingOffsetSeconds: jump.takeoffTimingOffsetSeconds,
        windUserMetersPerSecond: jump.currentWindUserMetersPerSecond,
        windMeasuredMetersPerSecond: jump.windMeasurement?.meanUserMetersPerSecond ?? null,
        windSeed: jump.windField?.seed ?? null,
        resultTotalTenths: trainingResult?.totalTenths ?? null,
        resultComponentsTenths: trainingResult?.componentTenths ?? null,
        leadingTargetHalfMeters: trainingLeadingState(jump).targetHalfMeters,
        attemptNumber: trainingAttempt,
        completedAttempts: trainingCompletedAttempts,
        technicalView,
        snowEnabled,
        events: jump.events.map((event) => `${event.tick} ${event.type}`),
        visualPose: jumperVisualFrame(jump, reducedMotion).pose,
        visualFrame: jumperVisualFrame(jump, reducedMotion).frameIndex,
      }
    : null,
  competition: competition?.snapshot() ?? null,
})

if (debugEnabled) {
  window.__retroVisualEvidence = {
    poseSheet: (options) => createDebugJumperPoseSheet(options),
    perfectTakeoffSheet: () => createDebugPerfectTakeoffSheet(hill),
    shadowHeightSheet: () => createDebugShadowHeightSheet(hill),
  }
}

setScreenReaderStatus()
canvas.focus()
requestAnimationFrame(animationFrame)
void initPersistence()

console.info(`Retro Ski Jumping: Canvas2D ${VIEW_WIDTH}×${VIEW_HEIGHT}, fixed timestep ${FIXED_HZ} Hz`)
