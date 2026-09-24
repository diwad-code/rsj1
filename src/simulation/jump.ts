/**
 * P06–P08 — zintegrowana symulacja jednego skoku.
 *
 * Moduł jest czysty: nie importuje DOM, Canvas ani audio. Jednostki SI,
 * stały krok `dt = 1/120 s`, integracja semi-implicit Euler. Wejście przychodzi
 * jako gotowy `TickInput` z bufora wejścia, więc częstość renderowania nie
 * wpływa na rezultat.
 */

import { FIXED_HZ } from '../core/fixedClock'
import { aerodynamicForce } from './aero'
import { sweepContact, type Vec2 } from './hill'
import { DEFAULT_JUMP_PARAMS, physicsParamsForHill, type JumpParams } from './params'
import { buildHill, hsStabilityMultiplier, type Hill } from './technicalHill'
import {
  WeightedWindMeasurement,
  physicsVelocityToUserWind,
  userWindToPhysicsVelocity,
  type WindField,
  type WindMeasurement,
} from './wind'
import type { TickInput } from '../input/keyboard'

export const SIM_DT = 1 / FIXED_HZ

/** Długość stołu progowego; od niej zaczyna się faza `Takeoff`. */
export const TAKEOFF_TABLE_METERS = 6.5

export type JumpPhase =
  | 'GateGreen'
  | 'Inrun'
  | 'Takeoff'
  | 'Flight'
  | 'LandingPrep'
  | 'Contact'
  | 'Outrun'
  | 'FinishLine'
  | 'Fall'
  | 'FallSettled'

export type LandingStyle = 'telemark' | 'parallel' | 'none'
export type LandingSupportHands = 0 | 1 | 2

export type JumpEventType =
  | 'gateOpen'
  | 'takeoffImpulseStart'
  | 'perfectTakeoff'
  | 'takeoffEdge'
  | 'landingPrep'
  | 'contact'
  | 'handSupport'
  | 'measured'
  | 'outrunStopped'
  | 'finishLine'
  | 'fall'
  | 'fallSettled'
  | 'flightTimeout'

export type JumpEvent = {
  readonly tick: number
  readonly type: JumpEventType
  readonly detail: string
}

export type ContactReport = {
  readonly distanceMeters: number
  /** Pełna prędkość zawodnika w chwili kontaktu [m/s]. */
  readonly speed: number
  readonly normalSpeed: number
  readonly angleErrorDeg: number
  readonly readiness: number
  readonly stability: number
  readonly style: LandingStyle
  /** Podpórka po kontakcie: 0 = bez podpórki, 1/2 = liczba dłoni na śniegu. */
  readonly supportHands: LandingSupportHands
  readonly point: Vec2
  /** Progresywny mnożnik za HS (1 na/w przed HS, 0 na progu niemożliwym). */
  readonly hsStabilityMultiplier: number
}

export type JumpOutcome = {
  readonly status: 'landed' | 'fall'
  readonly terminalPhase: 'FinishLine' | 'FallSettled'
  readonly distanceMeters: number
  readonly style: LandingStyle
  readonly supportHands: LandingSupportHands
  readonly reachedFallLine: boolean
  readonly settledDistanceMeters: number
}

export type JumpConfig = {
  readonly hill?: Hill
  readonly params?: JumpParams
  readonly gateNumber?: number
  readonly windVelocity?: Vec2
  readonly windField?: WindField
  /** Rozbieg rusza natychmiast, bez czekania na →. Używane przez testy. */
  readonly autoStart?: boolean
}

const RADIANS_PER_DEGREE = Math.PI / 180

function degrees(radians: number): number {
  return radians / RADIANS_PER_DEGREE
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export class JumpSimulation {
  readonly hill: Hill
  readonly params: JumpParams
  readonly gateNumber: number
  windVelocity: Vec2
  readonly windField: WindField | null

  phase: JumpPhase = 'GateGreen'
  tick = 0
  position: Vec2 = { x: 0, y: 0 }
  velocity: Vec2 = { x: 0, y: 0 }
  pitchRad = 0
  targetPitchRad = 0
  angleOfAttackDeg = 0

  /** Przebyta długość łuku rozbiegu, liczona od najwyższej belki. */
  inrunDistanceMeters: number
  inrunSpeed = 0

  impulseStartTick: number | null = null
  impulseElapsedSeconds = 0
  extensionSpeed = 0
  deliveredImpulseNewtonSeconds = 0
  takeoffTimingOffsetSeconds: number | null = null
  takeoffSpeed = 0
  takeoffNormalSpeed = 0
  perfectTakeoff = false
  /** Pochylenie sylwetki w chwili oderwania od progu [rad]. */
  takeoffPitchRad: number | null = null

  landingStyle: LandingStyle = 'none'
  landingPrepSeconds = 0
  flightSeconds = 0
  /**
   * PKG-008: zatrzask wczesnego podejścia (wejście
   * w `LandingPrep` przed 1,0 s lotu) oraz awaryjnego telemarku
   * (pierwsze T przed progiem → skuteczne dwie nogi bez powrotu).
   */
  landingApproachEarly = false
  landingPrepStartedFlightSeconds: number | null = null
  earlyTelemarkFallback = false
  currentWindUserMetersPerSecond = 0
  /** PKG-008/P42: bieżący łagodny offset celu sylwetki od podmuchu [deg]. */
  currentGustOffsetDeg = 0
  windMeasurement: WindMeasurement | null = null
  private flightPostureErrorSumDeg = 0
  private flightPostureSamples = 0

  contact: ContactReport | null = null
  measuredDistanceMeters: number | null = null

  surfaceDistanceMeters = 0
  surfaceSpeed = 0
  fallSeconds = 0

  outcome: JumpOutcome | null = null
  readonly events: JumpEvent[] = []
  /** Rzadko próbkowany ślad lotu; używany przez podgląd i dowody. */
  readonly flightTrail: Vec2[] = []

  private readonly startInrunDistance: number
  private readonly autoStart: boolean
  private readonly windMeasurementAccumulator: WeightedWindMeasurement | null

  constructor(config: JumpConfig = {}) {
    this.hill = config.hill ?? buildHill()
    this.params = physicsParamsForHill(this.hill.spec, config.params ?? DEFAULT_JUMP_PARAMS)
    this.gateNumber = config.gateNumber ?? 8
    this.windVelocity = config.windVelocity ?? { x: 0, y: 0 }
    this.currentWindUserMetersPerSecond = physicsVelocityToUserWind(this.windVelocity)
    this.windField = config.windField ?? null
    this.windMeasurementAccumulator = this.windField
      ? new WeightedWindMeasurement(this.hill.spec.windMeasurement.sensors)
      : null
    this.autoStart = config.autoStart ?? false

    const gate = this.hill.gate(this.gateNumber)
    this.startInrunDistance = this.hill.spec.inrun.lengthMeters - gate.inrunLengthMeters
    this.inrunDistanceMeters = this.startInrunDistance
    this.position = this.hill.inrunCurve.positionAt(this.inrunDistanceMeters)
    this.pitchRad = -this.hill.inrunCurve.slopeRadAt(this.inrunDistanceMeters)
    this.targetPitchRad = this.pitchRad
    this.updateWind(false)

    if (this.autoStart) this.openGate()
  }

  get finished(): boolean {
    return this.phase === 'FinishLine' || this.phase === 'FallSettled'
  }

  get gateInrunLengthMeters(): number {
    return this.hill.gate(this.gateNumber).inrunLengthMeters
  }

  get meanFlightPostureErrorDeg(): number {
    return this.flightPostureSamples === 0 ? 0 : this.flightPostureErrorSumDeg / this.flightPostureSamples
  }

  /** Średnia ważona czujników od wybicia do pomiaru; P13 przeliczy ją na punkty. */
  get compensationWind(): number | null {
    return this.windMeasurement?.meanUserMetersPerSecond ?? null
  }

  /**
   * Bieżąca średnia akumulatora wiatru w locie (ta sama baza co punktacja
   * końcowa). Przed kontaktem `windMeasurement` jest jeszcze nullem, więc cel
   * prowadzenia musi korzystać z tego gettera; po kontakcie obowiązuje
   * zamrożony `windMeasurement`.
   */
  get liveWindMeasurement(): WindMeasurement | null {
    return this.windMeasurementAccumulator?.result() ?? null
  }

  /** Prędkość prezentowana w HUD [km/h]. */
  get speedKmh(): number {
    const speed = this.phase === 'Inrun' || this.phase === 'Takeoff'
      ? this.inrunSpeed
      : this.phase === 'Outrun' || this.phase === 'Fall'
        ? this.surfaceSpeed
        : Math.hypot(this.velocity.x, this.velocity.y)
    return speed * 3.6
  }

  step(input: TickInput): void {
    if (this.finished) return

    const measureWind = this.phase === 'Flight' || this.phase === 'LandingPrep' || this.phase === 'Contact'
    this.updateWind(measureWind)

    switch (this.phase) {
      case 'GateGreen':
        if (input.pressed.includes('right')) this.openGate()
        break
      case 'Inrun':
      case 'Takeoff':
        this.stepTrack(input)
        break
      case 'Flight':
      case 'LandingPrep':
      case 'Contact':
        this.stepFlight(input)
        break
      case 'Outrun':
        this.stepOutrun()
        break
      case 'Fall':
        this.stepFall()
        break
      default:
        break
    }

    this.tick += 1
  }

  private record(type: JumpEventType, detail: string): void {
    this.events.push({ tick: this.tick, type, detail })
  }

  private openGate(): void {
    this.phase = 'Inrun'
    this.record('gateOpen', `belka ${this.gateNumber}, rozbieg ${this.gateInrunLengthMeters.toFixed(2)} m`)
  }

  // --- P06: rozbieg i wybicie -------------------------------------------------

  private stepTrack(input: TickInput): void {
    const { params } = this
    const curve = this.hill.inrunCurve
    const slopeRad = curve.slopeRadAt(this.inrunDistanceMeters)

    if (input.pressed.includes('takeoff') && this.impulseStartTick === null) {
      this.impulseStartTick = this.tick
      this.impulseElapsedSeconds = 0
      this.record('takeoffImpulseStart', `tick ${this.tick}, v ${this.inrunSpeed.toFixed(2)} m/s`)
    }

    const gravityAlong = params.gravity * Math.sin(slopeRad)
    const friction = params.inrun.frictionCoefficient * params.gravity * Math.cos(slopeRad)
    const drag =
      (0.5 * params.airDensity * params.inrun.dragAreaSquareMeters * this.inrunSpeed * this.inrunSpeed) /
      params.massKg

    this.inrunSpeed = Math.max(0, this.inrunSpeed + (gravityAlong - friction - drag) * SIM_DT)
    this.inrunDistanceMeters += this.inrunSpeed * SIM_DT
    this.position = curve.positionAt(this.inrunDistanceMeters)
    this.pitchRad = -curve.slopeRadAt(this.inrunDistanceMeters)

    this.advanceImpulse()

    const tableStart = this.hill.spec.inrun.lengthMeters - TAKEOFF_TABLE_METERS
    if (this.phase === 'Inrun' && this.inrunDistanceMeters >= tableStart) {
      this.phase = 'Takeoff'
    }

    if (this.inrunDistanceMeters >= this.hill.spec.inrun.lengthMeters) {
      this.leaveTable()
    }
  }

  /**
   * Jeden skończony impuls nóg. Profil siły jest półsinusoidą o zadanym
   * popędzie. Po zakończeniu wyprostu, gdy narty nadal mają kontakt z torem,
   * zgromadzona prędkość zanika — dlatego zbyt wczesne naciśnięcie traci część
   * efektu, a zbyt późne nie zdąża dostarczyć całego popędu.
   */
  private advanceImpulse(): void {
    if (this.impulseStartTick === null) return
    const { takeoff } = this.params

    if (this.impulseElapsedSeconds < takeoff.durationSeconds) {
      const phaseFraction = this.impulseElapsedSeconds / takeoff.durationSeconds
      const force =
        ((takeoff.impulseNewtonSeconds / takeoff.durationSeconds) * Math.PI * Math.sin(Math.PI * phaseFraction)) / 2
      const step = force * SIM_DT
      this.deliveredImpulseNewtonSeconds += step
      this.extensionSpeed += step / this.params.massKg
      this.impulseElapsedSeconds += SIM_DT
    } else {
      this.extensionSpeed *= Math.exp(-SIM_DT / takeoff.decayTimeSeconds)
    }
  }

  private leaveTable(): void {
    const { takeoff, flight } = this.params
    const curve = this.hill.inrunCurve
    const edge = this.hill.spec.inrun.lengthMeters
    const slopeRad = curve.slopeRadAt(edge)
    const tangent = { x: Math.cos(slopeRad), y: -Math.sin(slopeRad) }
    const normal = { x: Math.sin(slopeRad), y: Math.cos(slopeRad) }

    const deliveredFraction = this.deliveredImpulseNewtonSeconds / takeoff.impulseNewtonSeconds
    let timingOffsetSeconds: number | null = null
    if (this.impulseStartTick !== null) {
      const leadSeconds = (this.tick - this.impulseStartTick) * SIM_DT
      timingOffsetSeconds = leadSeconds - takeoff.idealLeadSeconds
      this.takeoffTimingOffsetSeconds = timingOffsetSeconds
    }
    this.perfectTakeoff = timingOffsetSeconds !== null
      && Math.abs(timingOffsetSeconds) <= takeoff.perfectWindowSeconds + 1e-9
    // PKG-008 r16-fix: jednorazowy fizyczny popęd normalny. Bez nagrody
    // dystansowej i bez przesuwania kolizji — punkt kontaktu to rzeczywisty
    // wynik sweepu. Dokładnie raz, w chwili oderwania.
    const perfectNormalGain = this.perfectTakeoff
      ? takeoff.perfectImpulseNewtonSeconds / this.params.massKg
      : 0
    const forwardGain = (takeoff.forwardImpulseNewtonSeconds * deliveredFraction) / this.params.massKg
    const alongSpeed = this.inrunSpeed + forwardGain
    const launchNormalSpeed = this.extensionSpeed + perfectNormalGain

    this.position = { x: 0, y: 0 }
    this.velocity = {
      x: tangent.x * alongSpeed + normal.x * launchNormalSpeed,
      y: tangent.y * alongSpeed + normal.y * launchNormalSpeed,
    }
    this.takeoffSpeed = Math.hypot(this.velocity.x, this.velocity.y)
    this.takeoffNormalSpeed = launchNormalSpeed

    let pitchDeg = takeoff.neutralPitchDeg
    if (timingOffsetSeconds !== null) {
      pitchDeg += timingOffsetSeconds >= 0
        ? timingOffsetSeconds * takeoff.earlyPitchPenaltyDegPerSecond
        : timingOffsetSeconds * takeoff.latePitchPenaltyDegPerSecond
    }

    this.pitchRad = clamp(pitchDeg, flight.minPitchDeg, flight.maxPitchDeg) * RADIANS_PER_DEGREE
    this.targetPitchRad = this.pitchRad
    this.takeoffPitchRad = this.pitchRad
    this.phase = 'Flight'
    this.flightSeconds = 0
    if (this.perfectTakeoff) {
      this.record(
        'perfectTakeoff',
        `okno ±${takeoff.perfectWindowSeconds.toFixed(4)} s, impuls +${takeoff.perfectImpulseNewtonSeconds.toFixed(1)} N·s (+${(takeoff.perfectImpulseNewtonSeconds / this.params.massKg).toFixed(3)} m/s ⊥)`,
      )
    }
    this.record(
      'takeoffEdge',
      `v ${this.takeoffSpeed.toFixed(2)} m/s, wyprost ${this.extensionSpeed.toFixed(2)} m/s, ` +
        `popęd ${(deliveredFraction * 100).toFixed(0)}%, pitch ${degrees(this.pitchRad).toFixed(1)}°, ` +
        `timing ${this.takeoffTimingOffsetSeconds === null ? 'brak ↑' : `${this.takeoffTimingOffsetSeconds >= 0 ? '+' : ''}${this.takeoffTimingOffsetSeconds.toFixed(3)} s`}`,
    )
  }

  // --- P07: lot i korekta pozycji --------------------------------------------

  private stepFlight(input: TickInput): void {
    const { params } = this

    this.applyLandingSelection(input)

    // PKG-008/P42: podmuch odchyla EFEKTYWNY cel o max ±5,2° (jedna pozycja).
    // Bazowy target gracza zostaje w `targetPitchRad` (kontrowanie działa),
    // ciało dochodzi limitem 20°/s, offset nie akumuluje się co tick.
    const gustOffsetRad = this.currentGustOffsetDeg * RADIANS_PER_DEGREE
    let effectiveTargetRad: number
    if (this.phase === 'LandingPrep') {
      this.landingPrepSeconds += SIM_DT
      const projected = this.hill.surfaceDistanceAtPoint(this.position)
      this.targetPitchRad = -this.hill.surfaceSlopeRadAt(projected)
      effectiveTargetRad = this.targetPitchRad + gustOffsetRad
    } else {
      if (input.horizontal !== 0) {
        const deltaDeg = -input.horizontal * params.flight.commandRateDegPerSecond * SIM_DT
        const nextDeg = clamp(
          degrees(this.targetPitchRad) + deltaDeg,
          params.flight.minPitchDeg,
          params.flight.maxPitchDeg,
        )
        this.targetPitchRad = nextDeg * RADIANS_PER_DEGREE
      }
      const effectiveDeg = clamp(
        degrees(this.targetPitchRad) + this.currentGustOffsetDeg,
        params.flight.minPitchDeg,
        params.flight.maxPitchDeg,
      )
      effectiveTargetRad = effectiveDeg * RADIANS_PER_DEGREE
    }

    const maxPitchStep = params.flight.pitchRateDegPerSecond * RADIANS_PER_DEGREE * SIM_DT
    const pitchError = effectiveTargetRad - this.pitchRad
    this.pitchRad += clamp(pitchError, -maxPitchStep, maxPitchStep)

    const aero = aerodynamicForce({
      velocity: this.velocity,
      windVelocity: this.windVelocity,
      pitchRad: this.pitchRad,
      airDensity: params.airDensity,
      referenceAreaSquareMeters: params.flight.referenceAreaSquareMeters,
      dragScale: params.flight.dragScale,
      coefficientCurve: this.hill.spec.aero?.curve,
      // Kara za dziób tylko w swobodnym locie; kara podejścia tylko we
      // wczesnym przygotowaniu (rozłączne fazy).
      applyNoseDownPenalty: this.phase === 'Flight',
      applyLandingApproachPenalty: this.phase === 'LandingPrep' && this.landingApproachEarly,
    })
    this.angleOfAttackDeg = aero.angleOfAttackDeg
    this.flightPostureErrorSumDeg += Math.abs(aero.angleOfAttackDeg - 32)
    this.flightPostureSamples += 1

    this.velocity = {
      x: this.velocity.x + (aero.force.x / params.massKg) * SIM_DT,
      y: this.velocity.y + (aero.force.y / params.massKg - params.gravity) * SIM_DT,
    }

    const next: Vec2 = {
      x: this.position.x + this.velocity.x * SIM_DT,
      y: this.position.y + this.velocity.y * SIM_DT,
    }

    const hit = sweepContact(this.hill.surfaceCurves, this.position, next)
    if (hit) {
      // PKG-008 r16-fix: rzeczywisty punkt sweepu, bez przesuwania o bonus.
      const distanceMeters = Math.min(
        this.hill.spec.outrunEndMeters,
        hit.distanceMeters,
      )
      this.position = this.hill.surfacePositionAt(distanceMeters)
      this.resolveContact(
        distanceMeters,
        this.hill.surfaceSlopeRadAt(distanceMeters),
        this.hill.surfaceNormalAt(distanceMeters),
      )
      return
    }

    this.position = next
    this.flightSeconds += SIM_DT
    if (this.tick % 4 === 0) this.flightTrail.push(next)

    if (this.flightSeconds > params.flight.maxDurationSeconds) {
      this.record('flightTimeout', `lot przekroczył ${params.flight.maxDurationSeconds} s`)
      this.beginFall(this.hill.surfaceDistanceAtPoint(this.position), Math.hypot(this.velocity.x, this.velocity.y))
    }
  }

  private updateWind(measure: boolean): void {
    if (!this.windField) return
    const timeSeconds = this.tick * SIM_DT
    const surfaceDistance = this.hill.surfaceDistanceAtPoint(this.position)
    this.currentWindUserMetersPerSecond = this.windField.sampleUserMetersPerSecond(timeSeconds, surfaceDistance)
    this.windVelocity = userWindToPhysicsVelocity(this.currentWindUserMetersPerSecond)
    this.currentGustOffsetDeg = this.windField.sampleGustOffsetDeg?.(timeSeconds, surfaceDistance) ?? 0
    if (measure) this.windMeasurementAccumulator?.observe(this.windField, timeSeconds)
  }

  private applyLandingSelection(input: TickInput): void {
    // Przy T i R w tym samym ticku wygrywa R jako bezpieczniejszy wariant.
    const wantsParallel = input.pressed.includes('parallel')
    const wantsTelemark = input.pressed.includes('telemark')
    if (!wantsParallel && !wantsTelemark) return

    // Zatrzask awaryjny: pierwsze T przed progiem spadło do dwóch nóg
    // i nie wraca do telemarku (samo T jest ignorowane, czas leci dalej).
    if (this.earlyTelemarkFallback && wantsTelemark && !wantsParallel) {
      this.record('landingPrep', `wczesny telemark zablokowany — pozostają dwie nogi (lot ${this.flightSeconds.toFixed(2)} s)`)
      return
    }

    const early = this.flightSeconds < this.params.landing.earlyLandingCutoffFlightSeconds
    let next: LandingStyle
    if (wantsParallel) {
      next = 'parallel'
    } else if (early) {
      // Wczesne T: skuteczne dwie nogi z zatrzaskiem bez powrotu.
      this.earlyTelemarkFallback = true
      next = 'parallel'
    } else {
      next = 'telemark'
    }
    const changed = next !== this.landingStyle
    this.landingStyle = next
    if (this.phase === 'Flight') {
      this.phase = 'LandingPrep'
      this.landingPrepSeconds = 0
      this.landingApproachEarly = early
      this.landingPrepStartedFlightSeconds = this.flightSeconds
      if (early && !wantsParallel) {
        this.record('landingPrep', `wczesny telemark → awaryjne dwie nogi (lot ${this.flightSeconds.toFixed(2)} s), wysokość ${this.heightAboveSurface().toFixed(1)} m`)
      } else if (early) {
        this.record('landingPrep', `wczesne dwie nogi (lot ${this.flightSeconds.toFixed(2)} s), wysokość ${this.heightAboveSurface().toFixed(1)} m`)
      } else {
        this.record('landingPrep', `${next}, wysokość ${this.heightAboveSurface().toFixed(1)} m`)
      }
    } else if (changed) {
      // Zmiana wariantu nie resetuje czasu przygotowania.
      this.record('landingPrep', `zmiana na ${next} po ${this.landingPrepSeconds.toFixed(2)} s`)
    }
  }

  heightAboveSurface(): number {
    return this.position.y - this.hill.surfaceYAtX(this.position.x)
  }

  // --- P08: kontakt, lądowanie i odjazd --------------------------------------

  private requiredPrepSeconds(): number {
    if (this.landingStyle === 'telemark') return this.params.landing.telemarkPrepSeconds
    if (this.landingStyle === 'parallel') return this.params.landing.parallelPrepSeconds
    return Number.POSITIVE_INFINITY
  }

  private resolveContact(distanceMeters: number, slopeRad: number, normal: Vec2): void {
    const { landing } = this.params
    this.phase = 'Contact'
    this.windMeasurement = this.windMeasurementAccumulator?.result() ?? {
      meanUserMetersPerSecond: this.currentWindUserMetersPerSecond,
      sampleCount: this.flightPostureSamples,
    }

    const normalSpeed = Math.abs(this.velocity.x * normal.x + this.velocity.y * normal.y)
    const tangent = { x: Math.cos(slopeRad), y: -Math.sin(slopeRad) }
    const tangentSpeed = this.velocity.x * tangent.x + this.velocity.y * tangent.y
    const angleErrorDeg = Math.abs(degrees(this.pitchRad + slopeRad))
    const readiness = clamp(this.landingPrepSeconds / this.requiredPrepSeconds(), 0, 1)

    const maxNormalSpeed = this.landingStyle === 'telemark'
      ? landing.telemarkMaxNormalSpeed
      : landing.parallelMaxNormalSpeed
    const maxAngleErrorDeg = this.landingStyle === 'telemark'
      ? landing.telemarkMaxAngleErrorDeg
      : landing.parallelMaxAngleErrorDeg

    const normalPenalty = normalSpeed / maxNormalSpeed
    const anglePenalty = angleErrorDeg / maxAngleErrorDeg
    // PKG-008: za HS stabilność mnożymy pierwiastkowo do zera
    // na progu niemożliwym stylu (runda 15: telemark 147 m, dwie nogi
    // 150 m). Na/przed HS mnożnik wynosi 1 (ciągłość); odległość nie
    // jest cięta. Deterministycznie, bez losowości.
    const hsMultiplier = hsStabilityMultiplier(
      this.hill.spec.hillSizeMeters,
      this.hill.spec.safety,
      this.landingStyle,
      distanceMeters,
    )
    const stability = clamp(readiness * (1 - 0.6 * normalPenalty - 0.4 * anglePenalty) * hsMultiplier, 0, 1)
    const supportHands = this.classifyLandingSupport(stability)

    // Pomiar wykonujemy dokładnie raz.
    if (this.measuredDistanceMeters === null) {
      this.measuredDistanceMeters = distanceMeters
      this.record('measured', `${distanceMeters.toFixed(2)} m`)
    }

    this.contact = {
      distanceMeters,
      speed: Math.hypot(this.velocity.x, this.velocity.y),
      normalSpeed,
      angleErrorDeg,
      readiness,
      stability,
      style: this.landingStyle,
      supportHands,
      point: this.position,
      hsStabilityMultiplier: hsMultiplier,
    }
    this.record(
      'contact',
      `${distanceMeters.toFixed(1)} m, v ${Math.hypot(this.velocity.x, this.velocity.y).toFixed(1)} m/s, ` +
        `v⊥ ${normalSpeed.toFixed(2)} m/s, ` +
        `kąt ${angleErrorDeg.toFixed(1)}°, gotowość ${(readiness * 100).toFixed(0)}%, ` +
        `stabilność ${stability.toFixed(2)}, styl ${this.landingStyle}` +
        (hsMultiplier < 1 ? `, HS×${hsMultiplier.toFixed(2)}` : ''),
    )

    if (stability < landing.fallStabilityThreshold) {
      this.beginFall(distanceMeters, Math.abs(tangentSpeed))
      return
    }

    if (supportHands > 0) {
      this.record(
        'handSupport',
        `${supportHands === 1 ? 'jedna dłoń' : 'obie dłonie'}, stabilność ${stability.toFixed(2)}`,
      )
    }

    this.phase = 'Outrun'
    this.surfaceDistanceMeters = distanceMeters
    this.surfaceSpeed = Math.max(0, tangentSpeed)
  }

  /**
   * Deterministyczne rozstrzygnięcie marginalnego, ale ustananego kontaktu.
   * FIS Style Judging Guidelines rozróżniają dotknięcie jedną dłonią (3,0 pkt)
   * i utratę kontroli z obiema dłońmi (4,0–5,0 pkt). Zbyt wczesne podejście
   * może wymusić podpórkę nawet przy łagodnym kontakcie; spóźnienie i dystans
   * za HS obniżają `stability`, przechodząc kolejno przez 1 dłoń, 2 dłonie i
   * upadek. Brak losowości: identyczny stan zawsze daje identyczny wynik.
   */
  private classifyLandingSupport(stability: number): LandingSupportHands {
    const { landing } = this.params
    if (stability < landing.fallStabilityThreshold) return 0

    if (this.landingApproachEarly) {
      const startedAt = this.landingPrepStartedFlightSeconds ?? landing.earlyLandingCutoffFlightSeconds
      return startedAt < landing.earlyTwoHandSupportBeforeSeconds ? 2 : 1
    }
    if (stability < landing.twoHandSupportBelowStability) return 2
    if (stability < landing.oneHandSupportBelowStability) return 1
    return 0
  }

  private beginFall(distanceMeters: number, speed: number): void {
    this.phase = 'Fall'
    this.surfaceDistanceMeters = distanceMeters
    this.surfaceSpeed = Math.max(0, speed)
    this.fallSeconds = 0
    this.record('fall', `${distanceMeters.toFixed(1)} m, v ${speed.toFixed(2)} m/s`)
  }

  private slide(friction: number, dragArea: number): void {
    const { params } = this
    const slopeRad = this.hill.surfaceSlopeRadAt(this.surfaceDistanceMeters)
    const gravityAlong = params.gravity * Math.sin(slopeRad)
    const frictionDecel = friction * params.gravity * Math.cos(slopeRad)
    const drag = (0.5 * params.airDensity * dragArea * this.surfaceSpeed * this.surfaceSpeed) / params.massKg

    this.surfaceSpeed = Math.max(0, this.surfaceSpeed + (gravityAlong - frictionDecel - drag) * SIM_DT)
    this.surfaceDistanceMeters = Math.min(
      this.hill.spec.outrunEndMeters,
      this.surfaceDistanceMeters + this.surfaceSpeed * SIM_DT,
    )
    this.position = this.hill.surfacePositionAt(this.surfaceDistanceMeters)
    this.pitchRad = -slopeRad
    this.velocity = {
      x: Math.cos(slopeRad) * this.surfaceSpeed,
      y: -Math.sin(slopeRad) * this.surfaceSpeed,
    }
  }

  private stepOutrun(): void {
    this.slide(this.params.outrun.frictionCoefficient, this.params.outrun.dragAreaSquareMeters)

    if (this.surfaceDistanceMeters >= this.hill.spec.fallLineMeters) {
      this.phase = 'FinishLine'
      this.record('finishLine', `odjazd zakończony na ${this.surfaceDistanceMeters.toFixed(1)} m`)
      this.finish('landed', 'FinishLine', true)
      return
    }

    if (this.surfaceSpeed <= this.params.outrun.restSpeed) {
      this.phase = 'FinishLine'
      this.record('outrunStopped', `zatrzymanie na ${this.surfaceDistanceMeters.toFixed(1)} m, przed fall line`)
      this.finish('landed', 'FinishLine', false)
    }
  }

  private stepFall(): void {
    this.slide(this.params.fall.frictionCoefficient, this.params.fall.dragAreaSquareMeters)
    this.fallSeconds += SIM_DT

    const stopped = this.surfaceSpeed <= this.params.outrun.restSpeed
    // Półkrokowy margines chroni limit przed dryfem akumulacji zmiennoprzecinkowej.
    const timedOut = this.fallSeconds >= this.params.fall.maxDurationSeconds - SIM_DT * 0.5
    if (!stopped && !timedOut) return

    this.phase = 'FallSettled'
    this.record(
      'fallSettled',
      `${stopped ? 'ustanie ruchu' : 'limit czasu'} na ${this.surfaceDistanceMeters.toFixed(1)} m` +
        (this.surfaceDistanceMeters < this.hill.spec.fallLineMeters ? ', przed fall line' : ''),
    )
    this.finish('fall', 'FallSettled', this.surfaceDistanceMeters >= this.hill.spec.fallLineMeters)
  }

  private finish(status: 'landed' | 'fall', terminalPhase: 'FinishLine' | 'FallSettled', reachedFallLine: boolean): void {
    this.outcome = {
      status,
      terminalPhase,
      distanceMeters: this.measuredDistanceMeters ?? 0,
      style: this.landingStyle,
      supportHands: this.contact?.supportHands ?? 0,
      reachedFallLine,
      settledDistanceMeters: this.surfaceDistanceMeters,
    }
  }
}
