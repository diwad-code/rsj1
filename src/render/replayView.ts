/**
 * PKG-006/P20 + P42 — ekran ostatniego replaya.
 *
 * P42 decyzja #5: replay renderuje się teraz pełną sceną produkcyjną
 * (`drawProductionScene` — tło z paralaksą, teren, bank klatek skoczka, cień),
 * dokładnie tym samym rendererem co żywy skok. `ReplayFrame` (format zapisu,
 * niezmieniony) dostarcza dokładnie to, czego potrzebuje `SceneActor`:
 * fazę, pozycję, pochylenie i tick — bez dotykania `storage/schema.ts`.
 */

import {
  buildProductionCamera,
  drawProductionScene,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type SceneActor,
  type TrainingSceneState,
  type WorldView,
} from './hillView'
import type { ReplayFrame, ReplayPlayer } from '../replay/player'
import type { Hill } from '../simulation/technicalHill'
import { FIXED_HZ } from '../core/fixedClock'
import { drawPixelText, type PixelTextAlign } from './pixelFont'

const COLOR = {
  ink: '#07111f',
  panel: '#0c1827',
  border: '#536c7a',
  blue: '#286bc6',
  text: '#f3ead1',
  dim: '#91b4cb',
  gold: '#f1bd79',
  red: '#d64d53',
  green: '#3fa865',
} as const

const REPLAY_SCENE_STATE: TrainingSceneState = {
  attemptNumber: 1,
  completedAttempts: 0,
  bestDistanceHalfMeters: 0,
  bestTotalTenths: 0,
  result: null,
  technicalView: false,
  snowEnabled: true,
  reducedMotion: false,
  debugEnabled: false,
  leadingTargetHalfMeters: null,
  leaderFixtureTenths: 0,
  recordHalfMeters: null,
}

function sizeToScale(size: number): number {
  return size >= 20 ? 3 : size >= 13 ? 2 : 1
}

function currentAlign(context: CanvasRenderingContext2D): PixelTextAlign {
  return context.textAlign === 'right' ? 'right' : context.textAlign === 'center' ? 'center' : 'left'
}

function text(
  context: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  color: string = COLOR.text,
  size = 16,
  align: CanvasTextAlign = 'left',
): void {
  context.textAlign = align
  const scale = sizeToScale(size)
  drawPixelText(context, value, x, y - 7 * scale, color, scale, currentAlign(context))
}

function points(tenths: number): string {
  return `${(tenths / 10).toFixed(1).replace('.', ',')} pkt`
}

function metres(halfMeters: number): string {
  return `${(halfMeters / 2).toFixed(1).replace('.', ',')} m`
}

export function actorFromFrame(hill: Hill, frame: ReplayFrame, gateNumber?: number): SceneActor {
  const ageSeconds = (eventType: string): number | undefined => {
    const event = [...frame.events].reverse().find((candidate) => candidate.type === eventType && frame.tick >= candidate.tick)
    return event ? (frame.tick - event.tick) / FIXED_HZ : undefined
  }
  const landingEvent = [...frame.events].reverse().find((candidate) => candidate.type === 'landingPrep')
  const landingMatch = landingEvent?.detail.match(/\b(telemark|parallel)\b/)
  const landingStyle = landingMatch?.[1] === 'telemark' || landingMatch?.[1] === 'parallel'
    ? landingMatch[1]
    : 'none'
  return {
    hill,
    gateNumber,
    phase: frame.phase,
    position: { x: frame.x, y: frame.y },
    pitchRad: frame.pitchRad,
    tick: frame.tick,
    events: frame.events,
    // Te same zegary co w żywej symulacji, wyprowadzone wyłącznie z zapisanych
    // zdarzeń. Nie odtwarzamy fizyki i nie zmieniamy formatu replaya.
    impulseElapsedSeconds: ageSeconds('takeoffImpulseStart'),
    flightSeconds: ageSeconds('takeoffEdge'),
    landingStyle,
  }
}

export type ReplayScreenOptions = {
  readonly visualsCompatible: boolean
  readonly notice: string
  readonly storageBytes: number
  readonly debugEnabled: boolean
  readonly reducedMotion: boolean
  readonly snowEnabled: boolean
}

export function drawReplayScreen(
  context: CanvasRenderingContext2D,
  hill: Hill,
  view: WorldView,
  player: ReplayPlayer,
  options: ReplayScreenOptions,
): void {
  context.imageSmoothingEnabled = false
  const frame = player.frame()

  if (options.visualsCompatible) {
    const actor = actorFromFrame(hill, frame, player.replay.initialState.gateNumber)
    const camera = buildProductionCamera(actor)
    drawProductionScene(
      context,
      actor,
      camera,
      { ...REPLAY_SCENE_STATE, snowEnabled: options.snowEnabled, reducedMotion: options.reducedMotion, debugEnabled: options.debugEnabled },
      frame.windUserMetersPerSecond,
    )
  } else {
    context.fillStyle = COLOR.ink
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)
    if (options.debugEnabled) drawTechnicalView(context, frame, options.notice)
    else drawCompatibilityNotice(context, options.notice)
  }

  drawHeader(context, player, options.debugEnabled)
  drawHud(context, player, frame, options)
  void view
}

function drawHeader(context: CanvasRenderingContext2D, player: ReplayPlayer, debugEnabled: boolean): void {
  const replay = player.replay
  context.fillStyle = 'rgba(6, 13, 22, 0.82)'
  context.fillRect(0, 0, VIEW_WIDTH, 16)
  text(context, 'POWTÓRKA', 8, 12, COLOR.gold, 11)
  text(
    context,
    `${replay.initialState.participantName} • BELKA ${replay.initialState.gateNumber}${debugEnabled ? ` • ${replay.sampleHz} HZ` : ''}`,
    VIEW_WIDTH - 8,
    12,
    COLOR.dim,
    7,
    'right',
  )
}

function drawCompatibilityNotice(context: CanvasRenderingContext2D, notice: string): void {
  context.fillStyle = COLOR.panel
  context.fillRect(42, 72, 396, 88)
  context.strokeStyle = COLOR.red
  context.strokeRect(42.5, 72.5, 395, 87)
  text(context, 'POWTÓRKA NIEDOSTĘPNA W TYM WYDANIU', 240, 101, COLOR.red, 11, 'center')
  text(context, notice.slice(0, 58), 240, 126, COLOR.dim, 7, 'center')
  text(context, 'BACKSPACE — MENU', 240, 148, COLOR.gold, 8, 'center')
}

function drawTechnicalView(context: CanvasRenderingContext2D, frame: ReplayFrame, notice: string): void {
  context.fillStyle = COLOR.panel
  context.fillRect(18, 20, 444, 150)
  context.strokeStyle = COLOR.border
  context.lineWidth = 1
  context.strokeRect(18.5, 20.5, 444, 150)

  text(context, 'WIDOK TECHNICZNY', 31, 39, COLOR.red, 11)
  text(context, notice, 31, 55, COLOR.dim, 7)
  text(context, `TICK        ${Math.round(frame.tick)}`, 31, 79, COLOR.text, 8)
  text(context, `FAZA        ${frame.phase}`, 31, 92, COLOR.text, 8)
  text(context, `X / Y       ${frame.x.toFixed(2)} / ${frame.y.toFixed(2)} m`, 31, 105, COLOR.text, 8)
  text(context, `POCHYLENIE  ${((frame.pitchRad * 180) / Math.PI).toFixed(1)}°`, 31, 118, COLOR.text, 8)
  text(context, `PRĘDKOŚĆ    ${frame.speedKmh.toFixed(1)} km/h`, 31, 131, COLOR.text, 8)
  text(context, `WIATR       ${frame.windUserMetersPerSecond.toFixed(2)} m/s`, 31, 144, COLOR.text, 8)
  text(context, `WYSOKOŚĆ    ${frame.heightAboveSurface.toFixed(2)} m`, 31, 157, COLOR.text, 8)

  const events = frame.events.slice(-7)
  events.forEach((event, index) => {
    text(context, `${String(event.tick).padStart(5, '0')} ${event.type}`, 280, 79 + index * 12, COLOR.dim, 7)
  })
}

function drawHud(
  context: CanvasRenderingContext2D,
  player: ReplayPlayer,
  frame: ReplayFrame,
  options: ReplayScreenOptions,
): void {
  const replay = player.replay
  const result = replay.recordedResult

  // Wąski bufor (480 px) nie mieści par lewo/prawo w jednej linii przy dłuższych
  // napisach — każdy fakt dostaje własny, lewo wyrównany wiersz.
  const panelHeight = 62
  context.fillStyle = 'rgba(6, 13, 22, 0.86)'
  context.fillRect(18, VIEW_HEIGHT - panelHeight, 444, panelHeight - 2)
  context.strokeStyle = COLOR.border
  context.lineWidth = 1
  context.strokeRect(18.5, VIEW_HEIGHT - panelHeight + 0.5, 444, panelHeight - 3)

  const rowX = 31
  let rowY = VIEW_HEIGHT - panelHeight + 10
  const row = (value: string, color: string): void => {
    text(context, value, rowX, rowY, color, 7)
    rowY += 9
  }

  row(
    `WYNIK ${metres(result.distanceHalfMeters)} • ${points(result.totalTenths)}${options.debugEnabled ? ` • FAZA ${frame.phase} • TICK ${Math.round(frame.tick)}` : ''}`,
    COLOR.gold,
  )
  if (options.debugEnabled) {
    row(`FIZYKA ${replay.versions.physics} • SKOCZNIA ${replay.versions.hill}`, COLOR.dim)
    row(`ZASADY ${replay.versions.rules}`, COLOR.dim)
  } else row(`${replay.initialState.participantName} • BELKA ${replay.initialState.gateNumber}`, COLOR.dim)

  // In debug mode the storage label has its own right lane beside the bar.
  const barWidth = options.debugEnabled ? 320 : 350
  context.fillStyle = '#14233b'
  context.fillRect(rowX, rowY - 5, barWidth, 4)
  context.fillStyle = player.playing ? COLOR.green : COLOR.gold
  context.fillRect(rowX, rowY - 5, Math.max(2, Math.round(barWidth * player.progress)), 4)
  if (options.debugEnabled) {
    text(
      context,
      `ZAPIS ${(options.storageBytes / 1024).toFixed(1)} KB`,
      449,
      rowY - 1,
      COLOR.dim,
      6,
      'right',
    )
  }
  rowY += 8

  row(
    `${player.playing ? 'ODTWARZANIE' : 'PAUZA'} ×${String(player.rate).replace('.', ',')}  ${player.elapsedSeconds.toFixed(2)} / ${player.durationSeconds.toFixed(2)} s`,
    COLOR.text,
  )
  row('SPACJA PAUZA • ←/→ PRZEWIŃ • ↑/↓ TEMPO • BACKSPACE WYJŚCIE', COLOR.dim)
}
