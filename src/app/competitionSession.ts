/** PKG-005 — jeden właściciel przejść standardowego konkursu w RAM. */

import type { TickInput } from '../input/keyboard'
import { FreshEnterGate, LOCAL_PROFILES, profileForEntrant, replaceEntrantsWithProfiles, type PlayerProfile } from '../player/profiles'
import { JumpSimulation } from '../simulation/jump'
import { physicsParamsForHill } from '../simulation/params'
import type { Hill } from '../simulation/technicalHill'
import { createSeriesWindField, type WindField } from '../simulation/wind'
import { forecastWindMean, selectSafeJuryGate } from '../sport/safety'
import { createAiPlan, createFictionalEntrants, aiSeedForJump, AiJumpRunner, type AiPlan } from '../sport/ai'
import {
  cancelCurrentRound,
  cancelWithdrawal,
  clearPendingRoundSummary,
  competitionStandings,
  confirmWithdrawal,
  createStandardCompetition,
  currentParticipantId,
  currentRound,
  leaderTotalTenths,
  previousCompetitionTenths,
  recordAttempt,
  requestWithdrawal,
  roundRanking,
  roundRankingOf,
  setJuryGate,
  type AdministrativeAttempt,
  type AiDifficulty,
  type CompetitionAttempt,
  type CompetitionEntrant,
  type CompetitionRoundId,
  type CompetitionState,
  type RankingEntry,
} from '../sport/competition'
import { gateCompensationTenths, windCompensationTenths } from '../sport/compensation'
import { createCompetitionJumpResult, type CompetitionJumpResult } from '../sport/jumpResult'
import { solveLeadingTarget } from '../sport/leadingTarget'
import { meterValueTenthsForK, MODERN_RULES } from '../sport/scoring'
import { JumpRecorder } from '../replay/recorder'
import {
  EMPTY_SESSION_STATS,
  SESSION_SCHEMA_VERSION,
  type RecordCandidate,
  type SessionStats,
  type StoredReplay,
  type StoredSession,
} from '../storage/schema'
import {
  actualGateNumber,
  advanceStartPhase,
  changePendingCoachGate,
  confirmCoachGate,
  createStartProcedure,
  greenSecondsRemaining,
  openCoachPanel,
  restartStartProcedure,
  setJuryHeld,
  tickStartProcedure,
  type StartProcedureState,
} from '../sport/startProcedure'

export type CompetitionView =
  | 'handover'
  | 'start'
  | 'jump'
  | 'bots'
  | 'result'
  | 'round-summary'
  | 'withdraw-confirm'
  | 'finished'

export const ROUND_LABEL: Readonly<Record<CompetitionRoundId, string>> = {
  qualification: 'KWALIFIKACJE',
  first: 'PIERWSZA SERIA',
  final: 'FINAŁ',
}

/** Liczba wierszy planszy round-summary mieszczących się w widoku 480×270. */
export const ROUND_SUMMARY_VISIBLE_ROWS = 10
export const LARGE_ROUND_SUMMARY_VISIBLE_ROWS = 7

const AI_BASE_SEED = 0xa17e_5005
export const COMPETITION_SESSION_ID = 'standard-tech-k120-1'
export const H01_COMPETITION_SESSION_ID = 'standard-h01-lillehammer-normal-5'
export const H02_COMPETITION_SESSION_ID = 'standard-h02-zakopane-large-1'
export const H03_COMPETITION_SESSION_ID = 'standard-h03-oberstdorf-large-1'
export const H04_COMPETITION_SESSION_ID = 'standard-h04-planica-flying-4'

/**
 * P21 — hill-specific session id bez importu cyklicznego (małe, jawne
 * mapowanie; rejestr w `src/app/hills.ts` deleguje tutaj). Techniczny default
 * bez zmian, więc stare testy i wyniki K120 są stabilne.
 */
export function defaultCompetitionSessionIdForHillId(hillId: string): string {
  if (hillId === 'tech-k120-hs134') return COMPETITION_SESSION_ID
  if (hillId === 'h01-lillehammer-normal') return H01_COMPETITION_SESSION_ID
  if (hillId === 'h02-zakopane-large') return H02_COMPETITION_SESSION_ID
  if (hillId === 'h03-oberstdorf-large') return H03_COMPETITION_SESSION_ID
  if (hillId === 'h04-planica-flying') return H04_COMPETITION_SESSION_ID
  throw new Error(`Nieznana skocznia: ${hillId}.`)
}

/** H02 TUNE: boty czekają z lądowaniem na zejście, bez przedwczesnego T/R. */
export function h02CompetitionAiPlan(plan: AiPlan): AiPlan {
  return {
    ...plan,
    takeoffOffsetTicks: Math.round(plan.takeoffOffsetTicks * 0.22),
    targetAngleOfAttackDeg: 32 + (plan.targetAngleOfAttackDeg - 32) * 0.28,
    prepHeightMeters: 1.5,
    prepDelayTicks: 0,
  }
}

/** H03 TUNE: wąski rozrzut wybicia, prowadzenie lotu i przygotowanie na zejściu. */
export function h03CompetitionAiPlan(plan: AiPlan): AiPlan {
  const timingScale = plan.difficulty === 'hard' ? 0.2 : plan.difficulty === 'normal' ? 0.4 : 0.3
  const postureScale = plan.difficulty === 'hard' ? 0.2 : 0.4
  return {
    ...plan,
    takeoffOffsetTicks: Math.round(plan.takeoffOffsetTicks * timingScale),
    targetAngleOfAttackDeg: 32 + (plan.targetAngleOfAttackDeg - 32) * postureScale,
    prepHeightMeters: 1.6,
    prepDelayTicks: 0,
  }
}

/** H04 TUNE: mammoth flight requires steadier pitch and a later landing approach. */
export function h04CompetitionAiPlan(plan: AiPlan): AiPlan {
  return {
    ...plan,
    takeoffOffsetTicks: Math.round(plan.takeoffOffsetTicks * (plan.difficulty === 'easy' ? 0.18 : 0.25)),
    targetAngleOfAttackDeg: (plan.difficulty === 'easy' ? 33.6 : plan.difficulty === 'normal' ? 33.3 : 33)
      + (plan.targetAngleOfAttackDeg - 32) * 0.1,
    prepHeightMeters: 1.6,
    prepDelayTicks: 0,
    // At competitive mammoth distances, telemark attempts often exceed the
    // stricter style limit; easy bots still retain their seeded T/R variety.
    landingStyle: plan.difficulty === 'easy' ? plan.landingStyle : 'parallel',
  }
}

/** Żądanie jednej transakcji zapisu; warstwa aplikacji decyduje, kiedy je wykona. */
export type CommitRequest = {
  readonly session: StoredSession
  readonly result: CompetitionJumpResult | null
  readonly recordCandidate: RecordCandidate | null
  readonly replay: StoredReplay | null
}

export type HumanStanding = {
  readonly participantId: string
  readonly name: string
  readonly rank: number | null
  readonly totalTenths: number | null
}

export type CompetitionSessionSnapshot = {
  readonly view: CompetitionView
  readonly status: CompetitionState['status']
  readonly roundId: CompetitionRoundId
  readonly roundLabel: string
  readonly nextStartIndex: number
  readonly roundSize: number
  readonly currentParticipantId: string | null
  readonly currentParticipantName: string | null
  readonly currentController: 'human' | 'ai' | null
  readonly humanProfileId: string | null
  readonly handoverReady: boolean
  readonly startPhase: StartProcedureState['phase'] | null
  readonly juryHeld: boolean
  readonly greenSecondsRemaining: number | null
  readonly juryGateNumber: number
  readonly actualGateNumber: number
  readonly coachPanelOpen: boolean
  readonly coachPendingGateNumber: number | null
  readonly coachDecision: StartProcedureState['lastCoachDecision']
  readonly safeGateCeiling: number
  readonly roundSummaryScroll: number
  readonly humanStandings: readonly HumanStanding[]
  readonly lastResult: CompetitionJumpResult | null
  readonly lastAdministrative: AdministrativeAttempt | null
  readonly lastCompletedRound: CompetitionRoundId | null
  readonly standings: readonly RankingEntry[]
  readonly leaderTotalTenths: number
  readonly botYieldCount: number
  readonly leadingTargetHalfMeters: number | null
  readonly jump: {
    readonly phase: string
    readonly tick: number
    readonly distance: number | null
    readonly status: string | null
    readonly heightAboveSurface: number
    readonly targetPitchDeg: number
    readonly flowDeg: number
    readonly flightSeconds: number
    readonly events: readonly string[]
  } | null
}

function entrantById(state: CompetitionState, participantId: string | null): CompetitionEntrant | null {
  if (!participantId) return null
  return state.entrants.find((entrant) => entrant.id === participantId) ?? null
}

export class CompetitionSession {
  state: CompetitionState
  view: CompetitionView = 'bots'
  readonly profiles: readonly PlayerProfile[]
  startProcedure: StartProcedureState | null = null
  jump: JumpSimulation | null = null
  lastResult: CompetitionJumpResult | null = null
  lastAdministrative: AdministrativeAttempt | null = null
  lastCompletedRound: CompetitionRoundId | null = null
  botYieldCount = 0
  revision: number
  stats: SessionStats
  /** Ustawiane przez warstwę aplikacji; sesja sama nie zna IndexedDB. */
  onCommit: ((request: CommitRequest) => void) | null = null

  private readonly handoverGate = new FreshEnterGate()
  private aiRunner: AiJumpRunner | null = null
  private inputResetRequested = true
  private roundSummaryScroll = 0
  private roundSummaryVisibleRows = ROUND_SUMMARY_VISIBLE_ROWS
  private viewBeforeWithdrawal: CompetitionView = 'start'
  private jumpJuryGateNumber = 8
  private jumpCoachRequested = false
  private recorder: JumpRecorder | null = null
  /** Sufit bezpiecznej belki jury dla bieżącej próby (prognoza z jej pola wiatru). */
  safeGateCeiling: number
  /** Pole wiatru bieżącej próby: ta sama instancja służy prognozie i skokowi. */
  private currentWindField: WindField | null = null

  /** Diagnostyka bieżącej próby: seed/wersja pola wiatru (prognoza i skok współdzielą instancję). */
  get currentWindIdentity(): { seed: number; version: string } | null {
    const field = this.currentWindField
    return field ? { seed: field.seed, version: field.version } : null
  }

  constructor(
    readonly hill: Hill,
    profileCount: number,
    readonly difficulty: AiDifficulty,
    enterCurrentlyDown = false,
    restored: StoredSession | null = null,
    sessionId?: string,
  ) {
    this.profiles = restored ? restored.profiles : LOCAL_PROFILES.slice(0, profileCount)
    this.revision = restored ? restored.revision : 0
    this.stats = restored ? restored.stats : EMPTY_SESSION_STATS
    this.safeGateCeiling = hill.spec.safety.referenceGateNumber
    if (restored) {
      const expectedSessionId = defaultCompetitionSessionIdForHillId(hill.spec.id)
      if (restored.hillId !== hill.spec.id) {
        throw new Error(
          `Zapis z innej skoczni: hillId ${String(restored.hillId)} != ${hill.spec.id}.`,
        )
      }
      if (restored.versions.hill !== hill.spec.hillVersion
        || restored.competition.versions.hill !== hill.spec.hillVersion) {
        throw new Error(
          `Zapis z innej wersji skoczni: ${String(restored.versions.hill)}/${String(restored.competition.versions?.hill)} != ${hill.spec.hillVersion}.`,
        )
      }
      if (restored.id !== expectedSessionId || restored.competition.id !== expectedSessionId) {
        throw new Error(
          `Zapis z innej sesji: ${String(restored.id)}/${String(restored.competition.id)} != ${expectedSessionId}.`,
        )
      }
      this.state = restored.competition
      if (this.state.status === 'active' && this.state.pendingRoundSummary) {
        this.lastCompletedRound = this.state.pendingRoundSummary
        this.setView('round-summary')
        this.centerRoundSummaryOnHumans()
        return
      }
    } else {
      const entrants = replaceEntrantsWithProfiles(createFictionalEntrants(difficulty), this.profiles)
      this.state = createStandardCompetition({
        id: sessionId ?? defaultCompetitionSessionIdForHillId(hill.spec.id),
        entrants,
        hillClass: hill.spec.classification,
        juryGateNumber: hill.spec.compensation.referenceGateNumber,
        seed: 0x5005,
        rulesVersion: 'pkg008-competition-2',
        hillVersion: hill.spec.hillVersion,
      })
    }
    this.prepareCurrent(enterCurrentlyDown)
  }

  /** Zapis zawiera tylko dane potrzebne do odtworzenia stanu, profili, seedów i wersji. */
  toStoredSession(nowMs: number): StoredSession {
    return {
      schemaVersion: SESSION_SCHEMA_VERSION,
      id: this.state.id,
      hillId: this.hill.spec.id,
      revision: this.revision,
      savedAtMs: nowMs,
      competition: this.state,
      profiles: this.profiles,
      setup: { profileCount: this.profiles.length, difficulty: this.difficulty },
      seeds: { ai: AI_BASE_SEED, wind: this.state.seed },
      versions: {
        rules: MODERN_RULES.version,
        physics: physicsParamsForHill(this.hill.spec).physicsVersion,
        hill: this.hill.spec.hillVersion,
      },
      stats: this.stats,
    }
  }

  /** Checkpoint bez wyniku: stan przed startem następnego zawodnika. */
  requestCheckpoint(nowMs = Date.now()): void {
    this.onCommit?.({ session: this.toStoredSession(nowMs), result: null, recordCandidate: null, replay: null })
  }

  private setView(view: CompetitionView): void {
    this.view = view
    this.inputResetRequested = true
  }

  takeInputResetRequest(): boolean {
    const requested = this.inputResetRequested
    this.inputResetRequested = false
    return requested
  }

  get roundId(): CompetitionRoundId {
    return currentRound(this.state).id
  }

  get activeEntrant(): CompetitionEntrant | null {
    return entrantById(this.state, currentParticipantId(this.state))
  }

  get activeProfile(): PlayerProfile | null {
    const entrant = this.activeEntrant
    return entrant ? profileForEntrant(entrant, this.profiles) : null
  }

  private windFieldForAttempt(): WindField {
    return createSeriesWindField({
      competitionSeed: this.state.seed,
      roundId: this.roundId,
      attemptIndex: this.state.nextStartIndex,
    })
  }

  private centerRoundSummaryOnHumans(): void {
    const standings = this.ranking()
    const firstHuman = standings.findIndex((entry) => entry.participantId.startsWith('local-'))
    const rows = this.roundSummaryVisibleRows
    const target = firstHuman < 0 ? 0 : Math.max(0, firstHuman - Math.floor(rows / 2))
    this.roundSummaryScroll = Math.min(Math.max(0, standings.length - rows), target)
  }

  /** Widok wybiera liczbę wierszy; sesja utrzymuje ten sam limit przy ↑/↓ i po wznowieniu zapisu. */
  setRoundSummaryVisibleRows(rows: number): void {
    if (!Number.isInteger(rows) || rows < 1 || rows > ROUND_SUMMARY_VISIBLE_ROWS) return
    if (this.roundSummaryVisibleRows === rows) return
    this.roundSummaryVisibleRows = rows
    if (this.view === 'round-summary') this.centerRoundSummaryOnHumans()
  }

  scrollRoundSummary(delta: number): void {
    if (this.view !== 'round-summary' || !Number.isInteger(delta)) return
    const total = this.ranking().length
    const maximum = Math.max(0, total - this.roundSummaryVisibleRows)
    this.roundSummaryScroll = Math.min(maximum, Math.max(0, this.roundSummaryScroll + delta))
  }

  private prepareCurrent(enterCurrentlyDown: boolean): void {
    this.jump = null
    this.startProcedure = null
    this.aiRunner = null
    this.currentWindField = null
    if (this.state.status !== 'active') {
      this.setView('finished')
      return
    }
    const entrant = this.activeEntrant
    if (!entrant) {
      this.setView('finished')
      return
    }
    // Automatyczna bezpieczna belka jury dla tej próby: prognoza z tego
    // samego pola wiatru, które poleci w skoku (jedna instancja na próbę).
    // Ręczna zmiana jury może ją potem tylko obniżyć (sufit), nie podwyższyć.
    const field = this.windFieldForAttempt()
    this.currentWindField = field
    const forecast = forecastWindMean(field, this.hill)
    const selection = selectSafeJuryGate(this.hill, forecast)
    this.safeGateCeiling = selection.gateNumber
    if (this.state.status === 'active') {
      this.state = setJuryGate(this.state, selection.gateNumber, `automatyczna belka jury (prognoza wiatru ${forecast.toFixed(2)} m/s)`)
    }
    if (entrant.controller.kind === 'human') {
      this.handoverGate.begin(enterCurrentlyDown)
      this.setView('handover')
      return
    }
    const initialPlan = createAiPlan(
      aiSeedForJump(AI_BASE_SEED, entrant.id, this.roundId),
      entrant.controller.difficulty,
      this.hill.spec.id,
    )
    const plan = this.hill.spec.id === 'h02-zakopane-large' ? h02CompetitionAiPlan(initialPlan)
      : this.hill.spec.id === 'h03-oberstdorf-large' ? h03CompetitionAiPlan(initialPlan)
        : this.hill.spec.id === 'h04-planica-flying' ? h04CompetitionAiPlan(initialPlan) : initialPlan
    this.aiRunner = new AiJumpRunner({
      plan,
      gateNumber: this.state.juryGateNumber,
      windField: field,
      jumpConfig: { hill: this.hill },
    })
    this.setView('bots')
  }

  releaseEnter(): void {
    if (this.view === 'handover') this.handoverGate.release()
  }

  acceptHandover(repeat: boolean): boolean {
    if (this.view !== 'handover' || !this.handoverGate.press(repeat)) return false
    this.startProcedure = createStartProcedure()
    this.setView('start')
    return true
  }

  advanceStart(): void {
    if (this.view !== 'start' || !this.startProcedure) return
    this.startProcedure = advanceStartPhase(this.startProcedure)
  }

  toggleJuryHold(): void {
    if (this.view !== 'start' || !this.startProcedure) return
    this.startProcedure = setJuryHeld(this.startProcedure, !this.startProcedure.juryHeld)
  }

  restartStart(): void {
    if (this.view !== 'start' || !this.startProcedure) return
    this.startProcedure = restartStartProcedure(this.startProcedure)
  }

  changeJuryGate(delta: number): void {
    if (this.view !== 'start' || !this.startProcedure || this.startProcedure.phase !== 'red') return
    if (this.startProcedure.coachPanelOpen) {
      this.startProcedure = changePendingCoachGate(this.startProcedure, this.state.juryGateNumber, delta)
      return
    }
    const first = this.hill.gates[0]?.number ?? 1
    const last = this.hill.gates.at(-1)?.number ?? first
    // Ręczne jury może obniżyć belkę, ale nie podnieść powyżej sufitu
    // automatyki bezpieczeństwa dla tej próby; coach i tak zostaje poniżej jury.
    const ceiling = Math.max(first, Math.min(last, this.safeGateCeiling))
    const next = Math.max(first, Math.min(ceiling, this.state.juryGateNumber + delta))
    this.state = setJuryGate(this.state, next, 'decyzja jury przed startem')
    // Decyzja coacha dotyczy konkretnej belki jury. Jej zmiana otwiera nową
    // czerwoną procedurę zamiast zostawiać nieprawidłową "niższą" belkę.
    this.startProcedure = createStartProcedure()
  }

  coachAction(): void {
    if (this.view !== 'start' || !this.startProcedure) return
    if (!this.startProcedure.coachPanelOpen) {
      this.startProcedure = openCoachPanel(this.startProcedure, this.state.juryGateNumber)
      return
    }
    this.startProcedure = confirmCoachGate(this.startProcedure, this.state.juryGateNumber).state
  }

  tickStart(): void {
    if (this.view !== 'start' || !this.startProcedure) return
    this.startProcedure = tickStartProcedure(this.startProcedure)
    if (this.startProcedure.timedOut) {
      this.commitAdministrative('nps', 'przekroczono 10 s aktywnego zielonego światła')
    }
  }

  startHumanJump(): boolean {
    if (this.view !== 'start' || this.startProcedure?.phase !== 'green' || this.startProcedure.juryHeld) return false
    this.jumpJuryGateNumber = this.state.juryGateNumber
    this.jumpCoachRequested = this.startProcedure.acceptedCoachGateNumber !== null
    const entrant = this.activeEntrant
    this.jump = new JumpSimulation({
      hill: this.hill,
      gateNumber: actualGateNumber(this.startProcedure, this.state.juryGateNumber),
      windField: this.currentWindField ?? this.windFieldForAttempt(),
      autoStart: true,
    })
    this.recorder = new JumpRecorder(this.jump, {
      sessionId: this.state.id,
      competitionId: this.state.id,
      roundId: this.roundId,
      participantId: entrant?.id ?? '',
      participantName: entrant?.name ?? '',
      juryGateNumber: this.jumpJuryGateNumber,
      coachRequested: this.jumpCoachRequested,
    })
    this.setView('jump')
    return true
  }

  stepHumanJump(input: TickInput): void {
    if (this.view !== 'jump' || !this.jump) return
    this.jump.step(input)
    this.recorder?.record(input)
    if (!this.jump.finished) return
    const entrant = this.activeEntrant
    if (!entrant) throw new Error('Brak człowieka dla zakończonego skoku.')
    const result = createCompetitionJumpResult(this.jump, {
      competitionId: this.state.id,
      roundId: this.roundId,
      participantId: entrant.id,
      juryGateNumber: this.jumpJuryGateNumber,
      coachRequested: this.jumpCoachRequested,
      coachDecisionPhase: 'red',
      sessionRevision: this.revision + 1,
    })
    const replay = this.recorder?.finish(result, Date.now()) ?? null
    this.recorder = null
    this.commitScore(result, true, replay)
  }

  advanceBotChunk(maxTicks = 5000): void {
    if (this.view !== 'bots') return
    if (!this.aiRunner) {
      this.prepareCurrent(false)
      return
    }
    this.botYieldCount += 1
    if (!this.aiRunner.runChunk(maxTicks)) return
    const entrant = this.activeEntrant
    if (!entrant) throw new Error('Brak bota dla zakończonego skoku.')
    const result = createCompetitionJumpResult(this.aiRunner.sim, {
      competitionId: this.state.id,
      roundId: this.roundId,
      participantId: entrant.id,
      juryGateNumber: this.state.juryGateNumber,
      coachRequested: false,
      coachDecisionPhase: 'red',
      sessionRevision: this.revision + 1,
    })
    this.aiRunner = null
    this.commitScore(result, false)
  }

  private scoredAttempt(result: CompetitionJumpResult): CompetitionAttempt {
    return {
      kind: 'score',
      resultId: result.resultId,
      participantId: result.participantId,
      status: result.status,
      distanceHalfMeters: result.distanceHalfMeters,
      totalTenths: result.totalTenths,
      componentTenths: result.componentTenths,
      meterValueTenths: meterValueTenthsForK(this.hill.spec.kPointMeters),
    }
  }

  private applyRecordedAttempt(
    attempt: CompetitionAttempt,
    pauseForHuman: boolean,
    commit: { readonly result: CompetitionJumpResult | null; readonly replay: StoredReplay | null } | null = null,
  ): void {
    const recorded = recordAttempt(this.state, attempt)
    this.state = recorded.state
    this.lastCompletedRound = recorded.roundCompleted
    if (recorded.roundCompleted) {
      this.setView(this.state.status === 'active' ? 'round-summary' : 'finished')
      this.centerRoundSummaryOnHumans()
    } else if (pauseForHuman) {
      this.setView('result')
    } else {
      this.setView('bots')
    }
    this.emitCommit(commit?.result ?? null, commit?.replay ?? null, pauseForHuman)
  }

  /** Każdy rozliczony slot zamyka jedną transakcję: sesja, wynik, statystyki, rekord, replay. */
  private emitCommit(result: CompetitionJumpResult | null, replay: StoredReplay | null, human: boolean): void {
    this.revision += 1
    this.stats = {
      committedAttempts: this.stats.committedAttempts + 1,
      humanAttempts: this.stats.humanAttempts + (human ? 1 : 0),
      bestHumanDistanceHalfMeters: human && result
        ? Math.max(this.stats.bestHumanDistanceHalfMeters, result.distanceHalfMeters)
        : this.stats.bestHumanDistanceHalfMeters,
      bestHumanTotalTenths: human && result
        ? Math.max(this.stats.bestHumanTotalTenths, result.totalTenths)
        : this.stats.bestHumanTotalTenths,
    }
    const recordCandidate: RecordCandidate | null = result
      ? {
          context: 'competition',
          status: result.status,
          administrativeStatus: null,
          distanceHalfMeters: result.distanceHalfMeters,
          versions: result.versions,
        }
      : null
    this.onCommit?.({ session: this.toStoredSession(Date.now()), result, recordCandidate, replay })
  }

  private commitScore(result: CompetitionJumpResult, pauseForHuman: boolean, replay: StoredReplay | null = null): void {
    this.lastResult = result
    this.lastAdministrative = null
    this.applyRecordedAttempt(this.scoredAttempt(result), pauseForHuman, { result, replay })
  }

  private commitAdministrative(status: AdministrativeAttempt['status'], reason: string): void {
    const participantId = currentParticipantId(this.state)
    if (!participantId) throw new Error('Brak aktywnego slotu administracyjnego.')
    const attempt: AdministrativeAttempt = {
      kind: 'administrative',
      resultId: `${this.state.id}-${this.roundId}-${participantId}-${status}`,
      participantId,
      status,
      reason,
    }
    this.lastAdministrative = attempt
    this.lastResult = null
    this.applyRecordedAttempt(attempt, true)
  }

  continueAfterResult(enterCurrentlyDown: boolean): void {
    if (this.view !== 'result' && this.view !== 'round-summary') return
    const confirmedSummary = this.view === 'round-summary'
    this.lastCompletedRound = null
    if (confirmedSummary) this.state = clearPendingRoundSummary(this.state)
    this.prepareCurrent(enterCurrentlyDown)
    if (confirmedSummary) this.requestCheckpoint()
  }

  requestHumanWithdrawal(): void {
    if (!this.activeProfile || !['handover', 'start'].includes(this.view)) return
    const participantId = currentParticipantId(this.state)
    if (!participantId) return
    this.viewBeforeWithdrawal = this.view
    this.state = requestWithdrawal(this.state, participantId)
    this.setView('withdraw-confirm')
  }

  cancelHumanWithdrawal(): void {
    if (this.view !== 'withdraw-confirm') return
    this.state = cancelWithdrawal(this.state)
    this.setView(this.viewBeforeWithdrawal)
  }

  confirmHumanWithdrawal(): void {
    if (this.view !== 'withdraw-confirm') return
    const participantId = this.state.withdrawalRequestParticipantId
    const result = confirmWithdrawal(this.state)
    this.state = result.state
    const recorded = participantId
      ? currentRoundBeforeAdvance(this.state, result.roundCompleted).attempts[participantId]
      : undefined
    const attempt = recorded?.kind === 'administrative' && recorded.status === 'withdrawn' ? recorded : null
    this.lastAdministrative = attempt ?? null
    this.lastResult = null
    this.lastCompletedRound = result.roundCompleted
    this.setView(result.roundCompleted
      ? (this.state.status === 'active' ? 'round-summary' : 'finished')
      : 'result')
    if (result.roundCompleted) this.centerRoundSummaryOnHumans()
    this.emitCommit(null, null, true)
  }

  cancelRoundByJury(reason = 'decyzja jury — warunki uniemożliwiają dokończenie serii'): void {
    if (this.state.status !== 'active') return
    this.state = clearPendingRoundSummary(cancelCurrentRound(this.state, reason))
    this.lastCompletedRound = this.roundId
    this.setView('finished')
    this.requestCheckpoint()
  }

  ranking(): readonly RankingEntry[] {
    const completed = this.lastCompletedRound ?? this.state.pendingRoundSummary
    if ((this.view === 'round-summary' || this.state.pendingRoundSummary) && completed) {
      return completed === 'qualification'
        ? roundRankingOf(this.state, completed)
        : competitionStandings(this.state)
    }
    return this.roundId === 'qualification' && currentRound(this.state).status !== 'complete'
      ? roundRanking(this.state)
      : competitionStandings(this.state)
  }

  leadingTargetHalfMeters(): number | null {
    if (this.view !== 'jump' || !this.jump) return null
    const rule = this.hill.spec.compensation
    const referenceGate = this.hill.gate(rule.referenceGateNumber)
    const juryGate = this.hill.gate(this.jumpJuryGateNumber)
    const actualGate = this.hill.gate(this.jump.gateNumber)
    // Ta sama średnia wiatru, którą punktacja użyje w wyniku końcowym.
    // Przed kontaktem zamrożony pomiar jeszcze nie istnieje, więc używamy
    // bieżącej średniej akumulatora; po kontakcie obowiązuje pomiar końcowy.
    const scoringWindMean = this.jump.windMeasurement?.meanUserMetersPerSecond
      ?? this.jump.liveWindMeasurement?.meanUserMetersPerSecond
      ?? this.jump.currentWindUserMetersPerSecond
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
    const coachGateTenths = this.jumpCoachRequested
      ? gateCompensationTenths(juryGate.inrunLengthMeters, actualGate.inrunLengthMeters, rule.gateFactorTenthsPerInrunMeter)
      : 0
    return solveLeadingTarget({
      kPointMeters: this.hill.spec.kPointMeters,
      maximumDistanceHalfMeters: this.hill.spec.outrunEndMeters * 2,
      leaderTotalTenths: leaderTotalTenths(this.state),
      playerPreviousTenths: previousCompetitionTenths(this.state, this.jumpParticipantId()),
      // Ta sama zależna od dystansu prognoza telemarku co wynik końcowy.
      predictedStyleTenths: 525,
      predictedStyleRule: { hillSizeMeters: this.hill.spec.hillSizeMeters, landingStyle: 'telemark' },
      windTenths,
      juryGateTenths,
      coachGateTenths,
      coachDecisionAccepted: this.jumpCoachRequested,
      coachThresholdHalfMeters: rule.coachThresholdHalfMeters,
    })?.distanceHalfMeters ?? null
  }

  private jumpParticipantId(): string {
    return this.activeEntrant?.id ?? ''
  }

  snapshot(): CompetitionSessionSnapshot {
    const entrant = this.activeEntrant
    const procedure = this.startProcedure
    const standings = this.ranking()
    return {
      view: this.view,
      status: this.state.status,
      roundId: this.roundId,
      roundLabel: ROUND_LABEL[this.roundId],
      nextStartIndex: this.state.nextStartIndex,
      roundSize: currentRound(this.state).startOrder.length,
      currentParticipantId: entrant?.id ?? null,
      currentParticipantName: entrant?.name ?? null,
      currentController: entrant?.controller.kind ?? null,
      humanProfileId: entrant?.controller.kind === 'human' ? entrant.controller.profileId : null,
      handoverReady: this.handoverGate.ready,
      startPhase: procedure?.phase ?? null,
      juryHeld: procedure?.juryHeld ?? false,
      greenSecondsRemaining: procedure ? greenSecondsRemaining(procedure) : null,
      juryGateNumber: this.state.juryGateNumber,
      actualGateNumber: procedure ? actualGateNumber(procedure, this.state.juryGateNumber) : this.state.juryGateNumber,
      coachPanelOpen: procedure?.coachPanelOpen ?? false,
      coachPendingGateNumber: procedure?.pendingCoachGateNumber ?? null,
      coachDecision: procedure?.lastCoachDecision ?? 'none',
      safeGateCeiling: this.safeGateCeiling,
      roundSummaryScroll: this.roundSummaryScroll,
      humanStandings: standings
        .filter((entry) => entry.participantId.startsWith('local-'))
        .map((entry) => ({
          participantId: entry.participantId,
          name: entry.name,
          rank: entry.rank,
          totalTenths: entry.totalTenths,
        })),
      lastResult: this.lastResult,
      lastAdministrative: this.lastAdministrative,
      lastCompletedRound: this.lastCompletedRound,
      standings,
      leaderTotalTenths: leaderTotalTenths(this.state),
      botYieldCount: this.botYieldCount,
      leadingTargetHalfMeters: this.leadingTargetHalfMeters(),
      jump: this.jump
        ? {
            phase: this.jump.phase,
            tick: this.jump.tick,
            distance: this.jump.measuredDistanceMeters,
            status: this.jump.outcome?.status ?? null,
            heightAboveSurface: this.jump.heightAboveSurface(),
            targetPitchDeg: this.jump.targetPitchRad * 180 / Math.PI,
            flowDeg: Math.atan2(this.jump.velocity.y, this.jump.velocity.x) * 180 / Math.PI,
            flightSeconds: this.jump.flightSeconds,
            events: this.jump.events.map((item) => `${item.tick} ${item.type}`),
          }
        : null,
    }
  }
}

function currentRoundBeforeAdvance(
  state: CompetitionState,
  completedRound: CompetitionRoundId | null,
) {
  if (!completedRound) return currentRound(state)
  return state.rounds.find((round) => round.id === completedRound) ?? currentRound(state)
}
