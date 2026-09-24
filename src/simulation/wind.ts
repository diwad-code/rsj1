/** P10 — deterministyczne, gładkie pole wiatru i pomiar ważony. */

import type { Vec2 } from './hill'

export type WindSensor = {
  readonly distanceMeters: number
  readonly weight: number
}

export type WindField = {
  readonly seed: number
  readonly version: string
  readonly prevailingMps?: number
  /** Wartość użytkowa: dodatnia = pod narty, ujemna = w plecy. */
  sampleUserMetersPerSecond(timeSeconds: number, distanceMeters: number): number
  /**
   * PKG-008/P42: łagodny offset celu sylwetki od podmuchu [deg].
   * Czysta funkcja seeda i czasu symulacji; 0 poza aktywnym podmuchem,
   * max ±5,2°. Opcjonalna dla kompatybilności ze stałymi sondami testowymi.
   */
  sampleGustOffsetDeg?: (timeSeconds: number, distanceMeters: number) => number
}

function mix32(value: number): number {
  let mixed = value >>> 0
  mixed ^= mixed >>> 16
  mixed = Math.imul(mixed, 0x7feb352d)
  mixed ^= mixed >>> 15
  mixed = Math.imul(mixed, 0x846ca68b)
  mixed ^= mixed >>> 16
  return mixed >>> 0
}

function unit(seed: number, salt: number): number {
  return mix32((seed >>> 0) ^ salt) / 0x1_0000_0000
}

export function windSeedForAttempt(baseSeed: number, attemptNumber: number): number {
  if (!Number.isInteger(attemptNumber) || attemptNumber < 1) throw new Error('Numer próby musi być dodatnią liczbą całkowitą.')
  return mix32((baseSeed >>> 0) ^ Math.imul(attemptNumber, 0x9e3779b1))
}

/**
 * P42 runda 11 — spójne warunki serii konkursu (`pkg008-wind-4`).
 *
 * Wcześniejszy model (`createWindField`) losował przeważający wiatr ±2,4 m/s
 * niezależnie dla KAŻDEJ próby — stąd huśtawka warunków co skok. Konkurs potrzebuje
 * wspólnej bazy serii z łagodnym dryfem między sąsiednimi próbami:
 *
 * - baza serii z seeda konkursu i identyfikatora serii (±1,2 m/s);
 * - finał może deterministycznie ODWRÓCIĆ kierunek bazy pierwszej serii
 *   (decyzja z seeda konkursu, prawdopodobieństwo ~40%);
 * - łagodny dryf per próba: sinus o okresie 17 prób (±0,35 m/s);
 * - podmuchy ze wspólnego modelu P42 (slot 2 s, p i amplituda rosną z siłą),
 *   żeby prognoza i automatyczna belka jury były stabilne w obrębie serii.
 *
 * Trening dalej używa `createWindField` (swobodne warunki ćwiczebne).
 */
export type SeriesWindRoundId = 'qualification' | 'first' | 'final'

const SERIES_BASE_RANGE_MPS = 1.2
const SERIES_DRIFT_AMPLITUDE_MPS = 0.35
const SERIES_DRIFT_PERIOD_ATTEMPTS = 17
const SERIES_FINAL_REVERSAL_PROBABILITY = 0.4

const ROUND_SALT: Readonly<Record<SeriesWindRoundId, number>> = {
  qualification: 0x5155,
  first: 0xf152,
  final: 0xf1a1,
}

/** Deterministyczna decyzja o odwróceniu kierunku wiatru w finale. */
export function seriesWindReversed(competitionSeed: number): boolean {
  return unit(competitionSeed >>> 0, 0xf1a7) < SERIES_FINAL_REVERSAL_PROBABILITY
}

function seriesBaseMps(competitionSeed: number, roundId: SeriesWindRoundId): number {
  const normalized = competitionSeed >>> 0
  if (roundId === 'final' && seriesWindReversed(normalized)) {
    // Okazjonalne odwrócenie: finał dziedziczy NEGACJĘ bazy pierwszej serii.
    return -((unit(normalized, ROUND_SALT.first) * 2 - 1) * SERIES_BASE_RANGE_MPS)
  }
  return (unit(normalized, ROUND_SALT[roundId]) * 2 - 1) * SERIES_BASE_RANGE_MPS
}

/** Baza serii (bez dryfu) — diagnostyka i testy determinizmu. */
export function seriesWindBaseMps(competitionSeed: number, roundId: SeriesWindRoundId): number {
  return seriesBaseMps(competitionSeed, roundId)
}

export type SeriesWindInput = {
  readonly competitionSeed: number
  readonly roundId: SeriesWindRoundId
  /** Pozycja próby w liście startowej serii (0-based). */
  readonly attemptIndex: number
}

export function createSeriesWindField(input: SeriesWindInput): WindField {
  const competitionSeed = input.competitionSeed >>> 0
  const attemptSeed = windSeedForAttempt(
    mix32(competitionSeed ^ ROUND_SALT[input.roundId]),
    input.attemptIndex + 1,
  )
  const baseMps = seriesBaseMps(competitionSeed, input.roundId)
  const driftPhase = unit(competitionSeed ^ ROUND_SALT[input.roundId], 0x0d21) * Math.PI * 2
  const drift = Math.sin((input.attemptIndex * Math.PI * 2) / SERIES_DRIFT_PERIOD_ATTEMPTS + driftPhase)
    * SERIES_DRIFT_AMPLITUDE_MPS
  // Prognoza/AUTO bez zmian: ta sama baza serii i dryf, nowy tylko model
  // podmuchów/tła (wspólny z createWindField).
  return buildGustField(attemptSeed, baseMps + drift)
}

/**
 * Trening: swobodne warunki ćwiczebne (przeważający ±2,4 m/s z seeda),
 * ten sam model podmuchów co seria.
 */
export function createWindField(seed: number): WindField {
  const normalizedSeed = seed >>> 0
  const prevailing = (unit(normalizedSeed, 0x10a1) * 2 - 1) * 2.4
  return buildGustField(normalizedSeed, prevailing)
}

/**
 * PKG-008/P42 — wspólny model wiatru z podmuchami (`pkg008-wind-4`).
 *
 * Pole jest czystą funkcją seeda i czasu symulacji (bez Math.random,
 * wall-clock ani stanu mutowalnego — kolejność odczytów nie ma znaczenia):
 *
 * - składnik przeważający (stały w skali skoku, z seeda próby/serii);
 * - łagodne tło max ±0,20 m/s, wygaszane liniowo do 0 przy
 *   |przeważający| = 1,5 m/s (słaby wiatr może wirować przez zero,
 *   od 1,5 m/s kierunek jest stabilny);
 * - deterministyczne podmuchy w slotach 2 s: jeden profil na slot
 *   (narastanie 0,30 s, utrzymanie 0,30 s, wygaszenie 0,40 s, potem 1,0 s
 *   ciszy — bez nakładania), aktywacja progiem na tym samym hashu slotu
 *   (silniejsze pole = nadzbiór aktywnych slotów), amplituda rosnąca z siłą.
 *   Podmuch zawsze wzmacnia przeważający kierunek; przy ciszy (0,0) znak
 *   jest deterministyczny z hasha slotu.
 *
 * Limity: próbka zawsze w ±3,2 m/s; offset sylwetki max ±5,2°.
 */
export const WIND_LIMIT_MPS = 3.2
export const WIND_STABLE_THRESHOLD_MPS = 1.5
export const BACKGROUND_MAX_MPS = 0.2
export const GUST_SLOT_SECONDS = 2
export const GUST_RISE_SECONDS = 0.3
export const GUST_HOLD_SECONDS = 0.3
export const GUST_DECAY_SECONDS = 0.4
/** Jedna pozycja sterowania = 5,2° efektywnego targetPitch. */
export const GUST_OFFSET_DEG = 5.2

const GUST_ACTIVE_SALT = 0x6a57
const GUST_SIGN_SALT = 0x6b19
const BACKGROUND_PHASE_SALT = 0x70a7
const SLOT_HASH_MIX = 0x9e3779b1
const SIGN_HASH_MIX = 0x85ebca6b

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/** s = clamp(|przeważający| / 3,2) — wspólna siła dla p i amplitudy. */
export function gustStrength01(prevailingMps: number): number {
  if (!Number.isFinite(prevailingMps)) throw new Error('Wiatr przeważający musi być skończony.')
  return clamp01(Math.abs(prevailingMps) / WIND_LIMIT_MPS)
}

/** Deterministyczna szansa podmuchu w slocie: p = 0,04 + 0,56·s. */
export function gustProbabilityForPrevailing(prevailingMps: number): number {
  return 0.04 + 0.56 * gustStrength01(prevailingMps)
}

/** Amplituda podmuchu [m/s]: a = 0,15 + 0,55·s. */
export function gustAmplitudeForPrevailing(prevailingMps: number): number {
  return 0.15 + 0.55 * gustStrength01(prevailingMps)
}

/**
 * Obwiednia jednego podmuchu w slocie (lokalny czas 0–2 s):
 * 0–0,3 narastanie 0→1, 0,3–0,6 trzymanie, 0,6–1,0 wygaszenie 1→0,
 * 1,0–2,0 cisza. Ciągła, na brzegach slotu równa 0.
 */
export function gustEnvelope(slotLocalSeconds: number): number {
  if (!Number.isFinite(slotLocalSeconds)) throw new Error('Czas lokalny podmuchu musi być skończony.')
  const local = slotLocalSeconds
  if (local < 0 || local >= GUST_SLOT_SECONDS) return 0
  if (local < GUST_RISE_SECONDS) return local / GUST_RISE_SECONDS
  if (local < GUST_RISE_SECONDS + GUST_HOLD_SECONDS) return 1
  const decayEnd = GUST_RISE_SECONDS + GUST_HOLD_SECONDS + GUST_DECAY_SECONDS
  if (local < decayEnd) return 1 - (local - GUST_RISE_SECONDS - GUST_HOLD_SECONDS) / GUST_DECAY_SECONDS
  return 0
}

function slotIndexAt(timeSeconds: number): number {
  return Math.floor(timeSeconds / GUST_SLOT_SECONDS)
}

function gustActiveInSlot(seed: number, prevailingMps: number, slotIndex: number): boolean {
  const draw = unit(seed >>> 0, Math.imul(slotIndex, SLOT_HASH_MIX) ^ GUST_ACTIVE_SALT)
  return draw < gustProbabilityForPrevailing(prevailingMps)
}

function gustSignInSlot(seed: number, prevailingMps: number, slotIndex: number): 1 | -1 {
  if (prevailingMps > 0) return 1
  if (prevailingMps < 0) return -1
  return unit(seed >>> 0, Math.imul(slotIndex, SIGN_HASH_MIX) ^ GUST_SIGN_SALT) < 0.5 ? -1 : 1
}

function backgroundMps(seed: number, prevailingMps: number, timeSeconds: number): number {
  const amplitude = backgroundAmplitudeMps(prevailingMps)
  if (amplitude <= 0) return 0
  const phase = unit(seed >>> 0, BACKGROUND_PHASE_SALT) * Math.PI * 2
  return Math.sin(timeSeconds * 0.45 + phase) * amplitude
}

/** Amplituda łagodnego tła [m/s]: 0,20 przy ciszy, liniowo do 0 przy 1,5 m/s. */
export function backgroundAmplitudeMps(prevailingMps: number): number {
  if (!Number.isFinite(prevailingMps)) throw new Error('Wiatr przeważający musi być skończony.')
  return BACKGROUND_MAX_MPS * Math.max(0, 1 - Math.abs(prevailingMps) / WIND_STABLE_THRESHOLD_MPS)
}

function gustMps(seed: number, prevailingMps: number, timeSeconds: number): number {
  const slotIndex = slotIndexAt(timeSeconds)
  const envelope = gustEnvelope(timeSeconds - slotIndex * GUST_SLOT_SECONDS)
  if (envelope <= 0) return 0
  if (!gustActiveInSlot(seed, prevailingMps, slotIndex)) return 0
  return gustSignInSlot(seed, prevailingMps, slotIndex) * gustAmplitudeForPrevailing(prevailingMps) * envelope
}

/** Łagodny offset sylwetki [deg]: ten sam slot/obwiednia/znak co podmuch m/s. */
export function gustOffsetDeg(seed: number, prevailingMps: number, timeSeconds: number): number {
  const slotIndex = slotIndexAt(timeSeconds)
  const envelope = gustEnvelope(timeSeconds - slotIndex * GUST_SLOT_SECONDS)
  if (envelope <= 0) return 0
  if (!gustActiveInSlot(seed, prevailingMps, slotIndex)) return 0
  return gustSignInSlot(seed, prevailingMps, slotIndex) * GUST_OFFSET_DEG * envelope
}

function buildGustField(normalizedSeed: number, prevailingMps: number): WindField {
  return {
    seed: normalizedSeed,
    version: 'pkg008-wind-4',
    prevailingMps,
    sampleUserMetersPerSecond(timeSeconds, distanceMeters) {
      if (!Number.isFinite(timeSeconds) || !Number.isFinite(distanceMeters)) {
        throw new Error('Czas i pozycja próbki wiatru muszą być skończone.')
      }
      const value = prevailingMps + backgroundMps(normalizedSeed, prevailingMps, timeSeconds)
        + gustMps(normalizedSeed, prevailingMps, timeSeconds)
      return Math.max(-WIND_LIMIT_MPS, Math.min(WIND_LIMIT_MPS, value))
    },
    sampleGustOffsetDeg(timeSeconds, distanceMeters) {
      if (!Number.isFinite(timeSeconds) || !Number.isFinite(distanceMeters)) {
        throw new Error('Czas i pozycja próbki podmuchu muszą być skończone.')
      }
      return gustOffsetDeg(normalizedSeed, prevailingMps, timeSeconds)
    },
  }
}

/**
 * Testowy helper: to samo pole przy jawnym wietrze przeważającym
 * (do granic 1,49/1,50/1,51 bez zgadywania seeda).
 */
export function createTestWindField(seed: number, prevailingMps: number): WindField {
  if (!Number.isFinite(prevailingMps)) throw new Error('Wiatr przeważający musi być skończony.')
  return buildGustField(seed >>> 0, prevailingMps)
}

/**
 * Kierunek wiatru na skoczni (P42 runda 6).
 *
 * „Wiatr pod narty" nie jest wiatrem poziomym: na skoczni powietrze płynie
 * WZDŁUŻ ZESKOKU, więc dodatnia wartość użytkowa to strumień wiejący w górę
 * stoku — ma składową przeciwną do lotu ORAZ składową pionową w górę. Dlatego
 * właśnie wiatr pod narty wydłuża skok i dlatego FIS w ogóle go kompensuje.
 *
 * Poprzednia wersja zwracała wektor czysto poziomy `(-u, 0)`. Przy słabym
 * modelu nośności to jeszcze uchodziło, ale przy realnej geometrii skoczni
 * i realnej nośności dawało wynik odwrotny do rzeczywistego: wiatr pod narty
 * SKRACAŁ skok, bo masa powietrza cofała zawodnika względem ziemi, a czas lotu
 * praktycznie się nie zmieniał (pomiar: 130,0 m / 4,51 s bez wiatru wobec
 * 123,8 m / 4,49 s przy +3 m/s).
 *
 * Kąt strumienia bierzemy jako charakterystyczne nachylenie zeskoku
 * (`WIND_SLOPE_DEG` = 35°, czyli okolice βP tej skoczni).
 */
const WIND_SLOPE_DEG = 35
const WIND_SLOPE_RAD = (WIND_SLOPE_DEG * Math.PI) / 180

/** Odwrotność `userWindToPhysicsVelocity` — wartość użytkowa z wektora fizyki. */
export function physicsVelocityToUserWind(windVelocity: Vec2): number {
  return -windVelocity.x / Math.cos(WIND_SLOPE_RAD)
}

export function userWindToPhysicsVelocity(userMetersPerSecond: number): Vec2 {
  if (!Number.isFinite(userMetersPerSecond)) throw new Error('Wiatr musi być skończony.')
  return {
    x: -userMetersPerSecond * Math.cos(WIND_SLOPE_RAD),
    y: userMetersPerSecond * Math.sin(WIND_SLOPE_RAD),
  }
}

export type WindMeasurement = {
  readonly meanUserMetersPerSecond: number
  readonly sampleCount: number
}

export class WeightedWindMeasurement {
  private weightedTimeSum = 0
  private sampleCountValue = 0

  constructor(private readonly sensors: readonly WindSensor[]) {
    if (sensors.length === 0 || sensors.some((sensor) => sensor.weight <= 0 || !Number.isFinite(sensor.weight))) {
      throw new Error('Pomiar wiatru wymaga czujników o dodatnich wagach.')
    }
  }

  observe(field: WindField, timeSeconds: number): number {
    let weightedSum = 0
    let weights = 0
    for (const sensor of this.sensors) {
      weightedSum += field.sampleUserMetersPerSecond(timeSeconds, sensor.distanceMeters) * sensor.weight
      weights += sensor.weight
    }
    const spatialMean = weightedSum / weights
    this.weightedTimeSum += spatialMean
    this.sampleCountValue += 1
    return spatialMean
  }

  result(): WindMeasurement | null {
    if (this.sampleCountValue === 0) return null
    return {
      meanUserMetersPerSecond: this.weightedTimeSum / this.sampleCountValue,
      sampleCount: this.sampleCountValue,
    }
  }
}
