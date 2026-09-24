/**
 * P05/P11/P42 — techniczny profil oraz produkcyjna scena boczna.
 * Oba widoki korzystają z tych samych danych skoczni i transformacji świata.
 *
 * P42: bufor logiczny 480×270 (decyzja użytkownika #1), wyłącznie rysowanie
 * pikselowe (fillRect / Bresenham) — Canvas2D antyaliasuje każdy fill()/stroke()
 * ścieżki niezależnie od imageSmoothingEnabled, więc krzywe i wielokąty terenu
 * NIE mogą już iść przez beginPath/lineTo/fill lub stroke. `fillPixelPolygon`
 * rasteryzuje wielokąty linia po linii (fillRect na wiersz), `pixelPolyline`
 * łączy punkty krzywej odcinkami Bresenhama z `pixelLine`. Font wyłącznie
 * bitmapowy (`drawPixelText`) — `label()` niżej jest cienkim adapterem na starych
 * wywołaniach, żeby nie przepisywać każdego miejsca osobno.
 */

import type { JumpSimulation } from '../simulation/jump'
import type { ProfileCurve, Vec2 } from '../simulation/hill'
import type { Hill } from '../simulation/technicalHill'
import type { PlayerBindings } from '../player/profiles'
import type { FeedbackCode, TrainingJumpResult } from '../sport/jumpResult'
import { buildSportMarkers, type PositionedMarker, type SportMarkerSet } from './sportMarkers'
import { drawPixelText, measurePixelText, type PixelTextAlign } from './pixelFont'

export const VIEW_WIDTH = 480
export const VIEW_HEIGHT = 270

/** Oznaczenia sportowe — kontrakt kolorów z ART_UI_AUDIO §5, niezależny od rodziny palety. */
const SPORT = {
  steel: '#536c7a',
  warm: '#f1bd79',
  text: '#f3ead1',
  blue: '#286bc6',
  red: '#d64d53',
  green: '#3fa865',
} as const

/**
 * P42 decyzja #3: system rampy/rodziny (opcja C, ART_UI_AUDIO §5). Startowa
 * rodzina to „skandynawska noc z reflektorami”; kolejne rodziny dokładają się
 * jako kolejne wpisy w `PALETTE_FAMILIES` bez zmiany reszty renderera.
 */
type EnvironmentPalette = {
  readonly skyBands: readonly [string, string, string, string]
  readonly snowRamp: readonly [string, string, string, string]
  readonly mountainFar: string
  readonly mountainMid: string
  readonly mountainNear: string
  readonly forestCanopy: string
  readonly forestShade: string
  readonly steelDark: string
  readonly steelMid: string
  readonly floodlightGlow: string
  readonly crowd: readonly [string, string, string, string, string]
}

const SCANDINAVIAN_NIGHT: EnvironmentPalette = {
  skyBands: ['#0c1420', '#101a2a', '#16283c', '#203b51'],
  snowRamp: ['#e7f0ef', '#c3d8de', '#91b4cb', '#6f93ab'],
  mountainFar: '#172f40',
  mountainMid: '#294657',
  mountainNear: '#334c5c',
  forestCanopy: '#244637',
  forestShade: '#17382d',
  steelDark: '#0b1725',
  steelMid: '#263e50',
  floodlightGlow: 'rgba(241, 189, 121, 0.06)',
  crowd: ['#f1bd79', '#d64d53', '#286bc6', '#e7f0ef', '#3fa865'],
} as const

const LILLEHAMMER_TWILIGHT: EnvironmentPalette = {
  skyBands: ['#17172b', '#25243e', '#333850', '#46536a'],
  snowRamp: ['#edf1f2', '#d2dce7', '#a4b9d2', '#778fae'],
  mountainFar: '#28334d',
  mountainMid: '#394760',
  mountainNear: '#4d5d70',
  forestCanopy: '#294b42',
  forestShade: '#1b3934',
  steelDark: '#19243a',
  steelMid: '#536a7b',
  floodlightGlow: 'rgba(241, 189, 121, 0.09)',
  crowd: ['#f1bd79', '#d64d53', '#286bc6', '#edf1f2', '#3fa865'],
} as const

/** H02: clear, low winter sun over Zakopane; warm timber against blue-grey rock. */
const ZAKOPANE_WINTER_DAY: EnvironmentPalette = {
  skyBands: ['#466c7d', '#7395a0', '#aeb3aa', '#dfc29a'],
  snowRamp: ['#f5f0e4', '#e3e4dc', '#b6ced0', '#839fa7'],
  mountainFar: '#78929d',
  mountainMid: '#627e86',
  mountainNear: '#536d70',
  forestCanopy: '#315b54',
  forestShade: '#244b48',
  steelDark: '#343f48',
  steelMid: '#777b78',
  floodlightGlow: 'rgba(245, 223, 178, 0.04)',
  crowd: ['#d9a66e', '#9a5250', '#526f80', '#f5f0e4', '#557665'],
} as const

/** H03: mineral-grey Alpine morning, dark bowl of firs, oxidised steel and larch. */
const SCHATTENBERG_MORNING: EnvironmentPalette = {
  skyBands: ['#42575c', '#60767b', '#879a98', '#b5bab0'],
  snowRamp: ['#f3f0df', '#dce5de', '#aac6bf', '#739b9c'],
  mountainFar: '#829993',
  mountainMid: '#557570',
  mountainNear: '#395d59',
  forestCanopy: '#294f48',
  forestShade: '#193a3a',
  steelDark: '#172e36',
  steelMid: '#66817c',
  floodlightGlow: 'rgba(230, 187, 120, 0.04)',
  crowd: ['#c58955', '#ebe3cb', '#a85843', '#728f80', '#243d40'],
} as const

/** H04: apricot light down an open Alpine valley; blue rock and petrol steel. */
const PLANICA_VALLEY: EnvironmentPalette = {
  skyBands: ['#252942', '#45506b', '#897a88', '#dfaa91'],
  snowRamp: ['#fff3db', '#e0e8df', '#a9c9d0', '#7397ab'],
  mountainFar: '#77718e',
  mountainMid: '#475770',
  mountainNear: '#303f57',
  forestCanopy: '#24515a',
  forestShade: '#152f3e',
  steelDark: '#152238',
  steelMid: '#688b98',
  floodlightGlow: 'rgba(255, 206, 156, 0.04)',
  crowd: ['#eaa778', '#e5e8db', '#4c7586', '#b8685f', '#ffdbad'],
} as const

export const PALETTE_FAMILIES = {
  scandinavianNight: SCANDINAVIAN_NIGHT,
  lillehammerTwilight: LILLEHAMMER_TWILIGHT,
  zakopaneWinterDay: ZAKOPANE_WINTER_DAY,
  schattenbergMorning: SCHATTENBERG_MORNING,
  planicaValley: PLANICA_VALLEY,
} as const
export type PaletteFamilyId = keyof typeof PALETTE_FAMILIES
let activePaletteFamily: PaletteFamilyId = 'scandinavianNight'

function paletteForHill(hillId: string): PaletteFamilyId {
  if (hillId === 'h01-lillehammer-normal') return 'lillehammerTwilight'
  if (hillId === 'h02-zakopane-large') return 'zakopaneWinterDay'
  if (hillId === 'h03-oberstdorf-large') return 'schattenbergMorning'
  if (hillId === 'h04-planica-flying') return 'planicaValley'
  return 'scandinavianNight'
}

export function setPaletteFamily(id: PaletteFamilyId): void {
  activePaletteFamily = id
}

function env(): EnvironmentPalette {
  return PALETTE_FAMILIES[activePaletteFamily]
}

const COLOR = {
  ...SPORT,
  get sky() { return env().skyBands[1] },
  get skyHigh() { return env().skyBands[3] },
  get snow() { return env().snowRamp[0] },
  get snowShade() { return env().snowRamp[2] },
  forest: SCANDINAVIAN_NIGHT.forestCanopy,
} as const

export type WorldView = {
  readonly scale: number
  toScreen(point: Vec2): Vec2
}

export function buildView(hill: Hill): WorldView {
  const xs: number[] = []
  const ys: number[] = []
  for (const curve of [hill.inrunCurve, hill.landingCurve, hill.outrunCurve]) {
    xs.push(curve.firstPoint.x, curve.lastPoint.x)
    ys.push(curve.firstPoint.y, curve.lastPoint.y)
  }
  const minX = Math.min(...xs) - 3
  const maxX = Math.max(...xs) + 3
  const minY = Math.min(...ys) - 3
  const maxY = Math.max(...ys) + 5

  const left = 9
  const right = VIEW_WIDTH - 9
  const top = 43
  // Dolne panele zaczynają się na VIEW_HEIGHT - 48; profil musi zmieścić się nad nimi.
  const bottom = VIEW_HEIGHT - 53
  const scale = Math.min((right - left) / (maxX - minX), (bottom - top) / (maxY - minY))
  const originX = left + ((right - left) - (maxX - minX) * scale) / 2 - minX * scale
  const originY = top + ((bottom - top) - (maxY - minY) * scale) / 2 + maxY * scale

  return {
    scale,
    toScreen: (point) => ({ x: originX + point.x * scale, y: originY - point.y * scale }),
  }
}

// --- Pierwotne pikselowe prymitywy ------------------------------------------

/** Bresenham + fillRect: jedyny sposób rysowania linii bez antyaliasingu Canvas2D. */
export function pixelLine(
  context: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
  thickness = 1,
): void {
  let x0 = Math.round(fromX)
  let y0 = Math.round(fromY)
  const x1 = Math.round(toX)
  const y1 = Math.round(toY)
  const dx = Math.abs(x1 - x0)
  const sx = x0 < x1 ? 1 : -1
  const dy = -Math.abs(y1 - y0)
  const sy = y0 < y1 ? 1 : -1
  let error = dx + dy
  const offset = Math.floor(thickness / 2)
  context.fillStyle = color
  while (true) {
    context.fillRect(x0 - offset, y0 - offset, thickness, thickness)
    if (x0 === x1 && y0 === y1) break
    const twiceError = error * 2
    if (twiceError >= dy) {
      error += dy
      x0 += sx
    }
    if (twiceError <= dx) {
      error += dx
      y0 += sy
    }
  }
}

/** Kolejne segmenty Bresenhama zamiast jednej antyaliasowanej ścieżki krzywej. */
function pixelPolyline(
  context: CanvasRenderingContext2D,
  points: readonly Vec2[],
  color: string,
  thickness: number,
): void {
  for (let index = 0; index + 1 < points.length; index += 1) {
    const a = points[index]
    const b = points[index + 1]
    if (!a || !b) continue
    pixelLine(context, a.x, a.y, b.x, b.y, color, thickness)
  }
}

/**
 * Górne ograniczenie wierszy skanlinii. Domyślnie wysokość ekranu, ale bufor
 * terenu jest wyższy — bez tego jego dolna połowa zostawała pusta.
 */
let polygonRowLimit = VIEW_HEIGHT + 8

export function setPolygonRowLimit(rows: number): void {
  polygonRowLimit = rows
}

/** Rasteryzacja skanliniowa (even-odd): jedyny sposób wypełnienia wielokąta bez AA. */
export function fillPixelPolygon(
  context: CanvasRenderingContext2D,
  color: string,
  points: readonly (readonly [number, number])[],
): void {
  if (points.length < 3) return
  let minY = Infinity
  let maxY = -Infinity
  for (const [, y] of points) {
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
  const top = Math.max(-8, Math.floor(minY))
  const bottom = Math.min(polygonRowLimit, Math.ceil(maxY))
  context.fillStyle = color
  for (let y = top; y < bottom; y += 1) {
    const scanY = y + 0.5
    const xs: number[] = []
    for (let index = 0; index < points.length; index += 1) {
      const a = points[index] as readonly [number, number]
      const b = points[(index + 1) % points.length] as readonly [number, number]
      const [x1, y1] = a
      const [x2, y2] = b
      if (y1 === y2) continue
      if (scanY < Math.min(y1, y2) || scanY >= Math.max(y1, y2)) continue
      const t = (scanY - y1) / (y2 - y1)
      xs.push(x1 + t * (x2 - x1))
    }
    xs.sort((a, b) => a - b)
    for (let index = 0; index + 1 < xs.length; index += 2) {
      const xStart = Math.round(xs[index] as number)
      const xEnd = Math.round(xs[index + 1] as number)
      if (xEnd > xStart) context.fillRect(xStart, y, xEnd - xStart, 1)
    }
  }
}

// --- Font bitmapowy wszędzie: adapter na starych wywołaniach label() -------

function sizeToScale(size: number): number {
  return size >= 18 ? 3 : size >= 13 ? 2 : 1
}

function currentAlign(context: CanvasRenderingContext2D): PixelTextAlign {
  return context.textAlign === 'right' ? 'right' : context.textAlign === 'center' ? 'center' : 'left'
}

function label(context: CanvasRenderingContext2D, text: string, x: number, y: number, color: string, size = 13): void {
  const scale = sizeToScale(size)
  drawPixelText(context, text, x, y - 7 * scale, color, scale, currentAlign(context))
}

/** Krótki podpis fizycznego kodu klawisza, wspólny dla HUD-u i planszy konkursu. */
export function bindingKeyHint(code: string): string {
  const arrow: Record<string, string> = { ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' }
  if (arrow[code]) return arrow[code]
  if (/^Key[A-Z]$/.test(code)) return code.slice(3)
  if (/^Digit[0-9]$/.test(code)) return code.slice(5)
  return '?'
}

/** Bez różnic w domyślnych zrzutach — nowe opisy rysujemy tylko po faktycznej zmianie bindów. */
export function hasRemappedJumpBindings(bindings?: PlayerBindings): bindings is PlayerBindings {
  return bindings !== undefined && (
    bindings.takeoff !== 'ArrowUp' || bindings.left !== 'ArrowLeft' || bindings.right !== 'ArrowRight'
    || bindings.telemark !== 'KeyT' || bindings.parallel !== 'KeyR'
  )
}

/** Zostaw prawy margines w istniejących panelach 480×270. */
export function fitBindingHint(value: string, width: number): string {
  if (measurePixelText(value, 1) <= width) return value
  let result = value
  while (result && measurePixelText(`${result}...`, 1) > width) result = result.slice(0, -1)
  return `${result}...`
}

function strokeCurve(
  context: CanvasRenderingContext2D,
  view: WorldView,
  curve: ProfileCurve,
  color: string,
  width: number,
  strideMeters = 1,
): void {
  const stride = Math.max(1, Math.round(strideMeters / curve.step))
  const points: Vec2[] = []
  for (let index = 0; index < curve.points.length; index += stride) {
    const point = curve.points[index]
    if (!point) continue
    points.push(view.toScreen(point))
  }
  points.push(view.toScreen(curve.lastPoint))
  pixelPolyline(context, points, color, width)
}

/** Kreska poprzeczna na powierzchni, prostopadła do stycznej. */
function drawSurfaceTick(
  context: CanvasRenderingContext2D,
  view: WorldView,
  hill: Hill,
  meters: number,
  lengthMeters: number,
  color: string,
  width: number,
): void {
  const base = hill.surfacePositionAt(meters)
  const normal = hill.surfaceNormalAt(meters)
  const from = view.toScreen({ x: base.x - normal.x * lengthMeters * 0.2, y: base.y - normal.y * lengthMeters * 0.2 })
  const to = view.toScreen({ x: base.x + normal.x * lengthMeters, y: base.y + normal.y * lengthMeters })
  pixelLine(context, from.x, from.y, to.x, to.y, color, width)
}

/** Boczny pas metrowy przy brzegu zeskoku, zgodnie z zakresami z danych. */
function drawSideBand(
  context: CanvasRenderingContext2D,
  view: WorldView,
  hill: Hill,
  fromMeters: number,
  toMeters: number,
  color: string,
  offsetMeters: number,
): void {
  const points: Vec2[] = []
  for (let meters = fromMeters; meters <= toMeters; meters += 1) {
    const base = hill.surfacePositionAt(meters)
    const normal = hill.surfaceNormalAt(meters)
    points.push(view.toScreen({ x: base.x + normal.x * offsetMeters, y: base.y + normal.y * offsetMeters }))
  }
  pixelPolyline(context, points, color, 2)
}

/** Wypełnienie pod powierzchnią, żeby widok techniczny czytał się jako stok. */
function fillBelowSurface(context: CanvasRenderingContext2D, view: WorldView, hill: Hill): void {
  const points: Array<[number, number]> = []
  const start = view.toScreen(hill.landingCurve.firstPoint)
  points.push([0, start.y], [start.x, start.y])
  for (const curve of [hill.landingCurve, hill.outrunCurve]) {
    const stride = Math.max(1, Math.round(0.5 / curve.step))
    for (let index = 0; index < curve.points.length; index += stride) {
      const point = curve.points[index]
      if (!point) continue
      const screen = view.toScreen(point)
      points.push([screen.x, screen.y])
    }
  }
  const end = view.toScreen(hill.outrunCurve.lastPoint)
  points.push([end.x, end.y], [VIEW_WIDTH, end.y], [VIEW_WIDTH, VIEW_HEIGHT], [0, VIEW_HEIGHT])
  fillPixelPolygon(context, hill.spec.id === 'h02-zakopane-large' ? '#344748'
    : hill.spec.id === 'h03-oberstdorf-large' ? '#223d3e'
      : hill.spec.id === 'h04-planica-flying' ? '#233c51' : '#1a2b3d', points)
}

export function drawHillProfile(
  context: CanvasRenderingContext2D,
  hill: Hill,
  view: WorldView,
  activeGate?: number,
): void {
  const { spec } = hill
  activePaletteFamily = paletteForHill(spec.id)

  fillBelowSurface(context, view, hill)
  strokeCurve(context, view, hill.outrunCurve, COLOR.snowShade, 2, 0.5)
  strokeCurve(context, view, hill.landingCurve, COLOR.snow, 2, 0.5)
  strokeCurve(context, view, hill.inrunCurve, COLOR.steel, 2, 0.5)

  const sportMarkers = buildSportMarkers(hill)
  for (const band of sportMarkers.sideBands) {
    drawBothSideBands(context, view, hill, band.fromMeters, band.toMeters, colorForBand(band.kind))
  }

  // Kreski metrowe co 5 m w zakresie [P − 10, HS]; HS jest dodatkowym markerem.
  context.textAlign = 'center'
  const namedMeters = [spec.pPointMeters, spec.kPointMeters, spec.hillSizeMeters]
  for (const marker of sportMarkers.meterLines) {
    drawSurfaceTick(context, view, hill, marker.meters, 1.1, COLOR.snowShade, 1)
    const collides = namedMeters.some((named) => Math.abs(named - marker.meters) < 3)
    // The large-hill overview compresses its K/HS sector: keep the ticks at
    // every five metres, but print only every 20 m to protect the named lines.
    const labelStep = spec.id === 'h04-planica-flying' ? 40
      : spec.id === 'h02-zakopane-large' || spec.id === 'h03-oberstdorf-large' ? 20 : 10
    if (marker.meters % labelStep === 0 && !collides) {
      const anchor = view.toScreen(marker.point)
      label(context, `${marker.meters}`, anchor.x - 11, anchor.y + 13, COLOR.steel, 9)
    }
  }
  drawSidePaddles(context, view, hill, sportMarkers,
    spec.id !== 'h02-zakopane-large' && spec.id !== 'h03-oberstdorf-large' && spec.id !== 'h04-planica-flying')

  const markers: Array<[string, PositionedMarker, string]> = [
    ['T', { meters: 0, point: hill.markers.tableEdge }, COLOR.warm],
    ['P', { meters: spec.pPointMeters, point: hill.markers.pPoint }, COLOR.text],
    ['K', sportMarkers.kPoint, COLOR.blue],
    ['HS', sportMarkers.hillSize, COLOR.red],
    ['U', { meters: spec.uPointMeters, point: hill.markers.uPoint }, COLOR.text],
    ['FALL', sportMarkers.fallLine, COLOR.warm],
  ]
  for (const [name, marker, color] of markers) {
    drawSurfaceTick(context, view, hill, marker.meters, 2.5, color, name === 'HS' ? 2 : 1)
    const anchor = view.toScreen(marker.point)
    if (spec.id === 'h02-zakopane-large' && (name === 'P' || name === 'K' || name === 'HS')) {
      // K125 and HS140 are only ~20 screen pixels apart in the full profile.
      // Their ticks stay exactly on the distance map; fine leaders connect
      // those ticks to three separate labels in the empty sky at the right.
      const row = name === 'P' ? 0 : name === 'K' ? 1 : 2
      const labelY = 149 + row * 14
      pixelLine(context, anchor.x, anchor.y - 3, 320, labelY + 3, env().steelDark, 1)
      drawH02TechnicalTag(context, `${name} ${marker.meters} M`, labelY, color)
      continue
    }
    if (spec.id === 'h03-oberstdorf-large' && (name === 'P' || name === 'K' || name === 'HS')) {
      const row = name === 'P' ? 0 : name === 'K' ? 1 : 2
      const labelY = 143 + row * 14
      pixelLine(context, anchor.x, anchor.y - 3, 320, labelY + 3, SCHATTENBERG_MORNING.steelDark, 1)
      drawH03TechnicalTag(context, `${name} ${marker.meters} M`, labelY, color)
      continue
    }
    if (spec.id === 'h04-planica-flying' && (name === 'P' || name === 'K' || name === 'HS')) {
      const row = name === 'P' ? 0 : name === 'K' ? 1 : 2
      const labelY = 138 + row * 13
      pixelLine(context, anchor.x, anchor.y - 3, 330, labelY + 3, PLANICA_VALLEY.steelDark)
      drawPlanicaTechnicalTag(context, `${name} ${marker.meters} M`, labelY, color)
      continue
    }
    const normal = hill.surfaceNormalAt(marker.meters)
    label(
      context,
      name === 'T' ? 'T 0' : `${name} ${marker.meters}`,
      anchor.x + normal.x * 2.5 * view.scale,
      anchor.y - normal.y * 2.5 * view.scale - 4,
      color,
      9,
    )
  }

  // Belki startowe na rozbiegu; aktywna belka jest wyróżniona.
  context.textAlign = 'right'
  for (const gate of hill.gates) {
    const along = spec.inrun.lengthMeters - gate.inrunLengthMeters
    const base = hill.inrunCurve.positionAt(along)
    const normal = hill.inrunCurve.normalAt(along)
    const active = gate.number === activeGate
    const reach = active ? 2.8 : 1.2
    const from = view.toScreen(base)
    const to = view.toScreen({ x: base.x + normal.x * reach, y: base.y + normal.y * reach })
    pixelLine(context, from.x, from.y, to.x, to.y, active ? COLOR.red : COLOR.steel, active ? 2 : 1)
    if (active) label(context, `BELKA ${gate.number}`, to.x + 22, to.y - 2, COLOR.red, 9)
  }
  context.textAlign = 'left'
}

/** H02 overview only: compact bitmap labels, sport color as a key, no moving the markers. */
function drawH02TechnicalTag(context: CanvasRenderingContext2D, text: string, y: number, color: string): void {
  context.fillStyle = '#243b42'
  context.fillRect(324, y - 2, 94, 11)
  context.fillStyle = color
  context.fillRect(328, y, 2, 6)
  drawPixelText(context, text, 335, y, COLOR.text, 1)
}

/** H03: dark-green annotation rail in the free right-hand margin of the overview. */
function drawH03TechnicalTag(context: CanvasRenderingContext2D, text: string, y: number, color: string): void {
  context.fillStyle = '#284848'
  context.fillRect(324, y - 2, 94, 11)
  context.fillStyle = color
  context.fillRect(328, y, 2, 6)
  drawPixelText(context, text, 335, y, COLOR.text, 1)
}

function drawPlanicaTechnicalTag(context: CanvasRenderingContext2D, text: string, y: number, color: string): void {
  context.fillStyle = '#243d55'
  context.fillRect(332, y - 2, 99, 11)
  context.fillStyle = color
  context.fillRect(335, y, 3, 6)
  drawPixelText(context, text, 343, y, PLANICA_VALLEY.snowRamp[0], 1)
}

function drawJumper(context: CanvasRenderingContext2D, view: WorldView, sim: JumpSimulation): void {
  if (sim.flightTrail.length > 1) {
    const points = sim.flightTrail.map((point) => view.toScreen(point))
    pixelPolyline(context, points, 'rgba(241, 189, 121, 0.55)', 1)
  }

  const screen = view.toScreen(sim.position)
  const pitch = sim.pitchRad
  const skiHalf = 2.2 * view.scale
  const dx = Math.cos(pitch) * skiHalf
  const dy = -Math.sin(pitch) * skiHalf

  const color = sim.phase === 'Fall' || sim.phase === 'FallSettled' ? COLOR.red : COLOR.warm
  pixelLine(context, screen.x - dx, screen.y - dy, screen.x + dx, screen.y + dy, color, 2)

  context.fillStyle = sim.phase === 'Fall' || sim.phase === 'FallSettled' ? COLOR.red : COLOR.text
  context.fillRect(Math.round(screen.x - 2), Math.round(screen.y - 5), 3, 4)
}

function drawPanel(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  context.fillStyle = 'rgba(6, 13, 22, 0.86)'
  context.fillRect(x, y, width, height)
  context.strokeStyle = COLOR.steel
  context.lineWidth = 1
  context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1)
}

const PHASE_LABEL: Record<string, string> = {
  GateGreen: 'ZIELONE — → OPUSZCZA BELKĘ',
  Inrun: 'ROZBIEG',
  Takeoff: 'PRÓG — ↑ WYBICIE',
  Flight: 'LOT — ← → POZYCJA',
  LandingPrep: 'PRZYGOTOWANIE LĄDOWANIA',
  Contact: 'KONTAKT',
  Outrun: 'ODJAZD',
  FinishLine: 'ODJAZD ZAKOŃCZONY',
  Fall: 'UPADEK',
  FallSettled: 'UPADEK ROZLICZONY',
}

function phaseWithBindings(phase: string, bindings?: PlayerBindings): string {
  if (!hasRemappedJumpBindings(bindings)) return PHASE_LABEL[phase] ?? phase
  if (phase === 'GateGreen') return `ZIELONE — ${bindingKeyHint(bindings.right)} OPUSZCZA BELKĘ`
  if (phase === 'Takeoff') return `PRÓG — ${bindingKeyHint(bindings.takeoff)} WYBICIE`
  if (phase === 'Flight') return `LOT — ${bindingKeyHint(bindings.left)} ${bindingKeyHint(bindings.right)} POZYCJA`
  return PHASE_LABEL[phase] ?? phase
}

/**
 * Profil, oznaczenia i belki są statyczne w obrębie próby, więc rysujemy je raz
 * do bufora i przepisujemy. Pętla 120 Hz ma wąski budżet klatki; przerysowanie
 * kilku tysięcy punktów polilinii w każdej klatce potrafiło go przekroczyć.
 */
let profileBuffer: HTMLCanvasElement | OffscreenCanvas | null = null
let profileBufferKey = ''

function profileLayer(hill: Hill, view: WorldView, activeGate: number): CanvasImageSource | null {
  const key = `${hill.spec.id}:${hill.spec.hillVersion}:${activePaletteFamily}:${activeGate}:${view.scale.toFixed(4)}`
  if (profileBuffer && profileBufferKey === key) return profileBuffer

  const buffer = typeof OffscreenCanvas === 'function'
    ? new OffscreenCanvas(VIEW_WIDTH, VIEW_HEIGHT)
    : Object.assign(document.createElement('canvas'), { width: VIEW_WIDTH, height: VIEW_HEIGHT })
  const bufferContext = buffer.getContext('2d') as CanvasRenderingContext2D | null
  if (!bufferContext) return null

  bufferContext.imageSmoothingEnabled = false
  drawHillProfile(bufferContext, hill, view, activeGate)
  profileBuffer = buffer
  profileBufferKey = key
  return buffer
}

function drawTechnicalJumpScreen(
  context: CanvasRenderingContext2D,
  sim: JumpSimulation,
  view: WorldView,
  state: TrainingSceneState,
): void {
  const { spec } = sim.hill
  context.imageSmoothingEnabled = false
  context.fillStyle = COLOR.sky
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)
  context.fillStyle = spec.id === 'h02-zakopane-large' || spec.id === 'h03-oberstdorf-large' || spec.id === 'h04-planica-flying'
    ? env().skyBands[0] : COLOR.skyHigh
  context.fillRect(0, 0, VIEW_WIDTH, 39)

  context.textAlign = 'left'
  const title = spec.id === 'h01-lillehammer-normal' ? 'LILLEHAMMER INSP.'
    : spec.id === 'h02-zakopane-large' ? 'ZAKOPANE INSP.'
       : spec.id === 'h03-oberstdorf-large' ? 'OBERSTDORF INSP.'
         : spec.id === 'h04-planica-flying' ? 'PLANICA MAMUT INSP.' : 'SKOCZNIA TECHNICZNA'
  label(context, `${title}  K${spec.kPointMeters} / HS${spec.hillSizeMeters}`, 10, 15, COLOR.warm, 10)
  label(
    context,
    `PROFIL ${spec.hillVersion} — ADAPT`,
    10,
    25,
    COLOR.snowShade,
    8,
  )
  label(context, `FIZYKA ${sim.params.physicsVersion} — TUNE`, 10, 34, COLOR.snowShade, 7)

  context.textAlign = 'right'
  label(context, `TICK ${sim.tick}   ${sim.speedKmh.toFixed(1)} KM/H`, VIEW_WIDTH - 10, 15, COLOR.text, 10)
  label(context, `BELKA ${sim.gateNumber} / ${sim.gateInrunLengthMeters.toFixed(2)} M`, VIEW_WIDTH - 10, 25, COLOR.snowShade, 8)
  label(context, 'NIE JEST KOPIĄ FIS', VIEW_WIDTH - 10, 34, COLOR.snowShade, 7)
  context.textAlign = 'left'

  const layer = profileLayer(sim.hill, view, sim.gateNumber)
  if (layer) context.drawImage(layer, 0, 0)
  else drawHillProfile(context, sim.hill, view, sim.gateNumber)
  drawDynamicMarkers(context, view, sim.hill, buildSportMarkers(sim.hill, {
    leadingTargetHalfMeters: state.leadingTargetHalfMeters,
    recordHalfMeters: state.recordHalfMeters,
  }), true)
  drawJumper(context, view, sim)

  drawPanel(context, 9, VIEW_HEIGHT - 48, 210, 39)
  label(context, fitBindingHint(phaseWithBindings(sim.phase, state.bindingHints), 198), 15, VIEW_HEIGHT - 36, COLOR.warm, 9)
  const distanceText = sim.measuredDistanceMeters === null ? '—' : `${sim.measuredDistanceMeters.toFixed(1)} M`
  label(context, `ODLEGŁOŚĆ: ${distanceText}`, 15, VIEW_HEIGHT - 25, COLOR.text, 9)
  const bindings = state.bindingHints
  const styleText = sim.landingStyle === 'none'
    ? hasRemappedJumpBindings(bindings)
      ? `BRAK (${bindingKeyHint(bindings.telemark)} / ${bindingKeyHint(bindings.parallel)})`
      : 'BRAK (T / R)'
    : sim.landingStyle === 'telemark' ? 'TELEMARK' : 'DWIE NOGI'
  label(context, fitBindingHint(`PRZYGOTOWANIE: ${styleText}`, 198), 15, VIEW_HEIGHT - 15, COLOR.snowShade, 9)

  const journal = sim.events.slice(-5)
  drawPanel(context, 226, VIEW_HEIGHT - 48, VIEW_WIDTH - 235, 39)
  journal.forEach((event, index) => {
    label(
      context,
      `${String(event.tick).padStart(5, '0')} ${event.type} — ${event.detail}`.slice(0, 72),
      231,
      VIEW_HEIGHT - 40 + index * 7,
      index === journal.length - 1 ? COLOR.text : COLOR.snowShade,
      9,
    )
  })

  if (sim.outcome) drawOutcome(context, sim)
}

function drawOutcome(context: CanvasRenderingContext2D, sim: JumpSimulation): void {
  const outcome = sim.outcome
  if (!outcome) return

  // Panel wyniku trzymamy w pustym obszarze nieba, żeby nie zasłaniał śladu lotu.
  const panelX = 278
  const panelY = 48
  drawPanel(context, panelX, panelY, 192, 82)
  context.textAlign = 'center'
  const centerX = panelX + 96
  const landed = outcome.status === 'landed'
  const supportLabel = outcome.supportHands === 1
    ? 'PODPÓRKA — 1 DŁOŃ'
    : outcome.supportHands === 2 ? 'PODPÓRKA — 2 DŁONIE' : null
  label(context, landed ? (supportLabel ?? 'SKOK USTANY') : 'UPADEK', centerX, panelY + 17, landed ? COLOR.green : COLOR.red, 13)
  label(context, `${outcome.distanceMeters.toFixed(1)} M`, centerX, panelY + 37, COLOR.text, 18)
  label(context, `STAN KOŃCOWY: ${outcome.terminalPhase}`, centerX, panelY + 49, COLOR.snowShade, 9)
  label(
    context,
    `LĄDOWANIE: ${outcome.style === 'none' ? 'BRAK PRZYGOTOWANIA' : outcome.style === 'telemark' ? 'TELEMARK' : 'DWIE NOGI'}`,
    centerX,
    panelY + 59,
    COLOR.snowShade,
    9,
  )
  label(
    context,
    outcome.reachedFallLine ? 'OSIĄGNIĘTO FALL LINE' : `ZATRZYMANIE NA ${outcome.settledDistanceMeters.toFixed(1)} M`,
    centerX,
    panelY + 68,
    COLOR.snowShade,
    9,
  )
  label(context, 'ENTER — NASTĘPNA PRÓBA / BACKSPACE — MENU', centerX, panelY + 78, COLOR.warm, 6)
  context.textAlign = 'left'
}

function drawBothSideBands(
  context: CanvasRenderingContext2D,
  view: WorldView,
  hill: Hill,
  fromMeters: number,
  toMeters: number,
  color: string,
): void {
  // Pasy sektorowe są malowane NA śniegu przy krawędziach zeskoku. W rzucie
  // z boku krawędzie leżą w osi głębi, więc jedyne, co z nich widać, to barwa
  // na powierzchni. Przy skali 1:1 dawny offset ±1,45 m wzdłuż normalnej dał
  // dwie kreski 17 px nad i pod stokiem, wiszące w powietrzu.
  drawSideBand(context, view, hill, fromMeters, toMeters, color, -0.08)
}

function colorForBand(kind: SportMarkerSet['sideBands'][number]['kind']): string {
  if (kind === 'blue') return COLOR.blue
  if (kind === 'red') return COLOR.red
  return COLOR.green
}

function drawSidePaddles(
  context: CanvasRenderingContext2D,
  view: WorldView,
  hill: Hill,
  markers: SportMarkerSet,
  labelsVisible: boolean,
): void {
  for (const marker of markers.sidePaddles) {
    const normal = hill.surfaceNormalAt(marker.meters)
    const base = view.toScreen({
      x: marker.point.x - normal.x * 1.45,
      y: marker.point.y - normal.y * 1.45,
    })
    const length = marker.meters % 5 === 0 ? 2 : 1
    context.fillStyle = marker.meters % 5 === 0 ? COLOR.text : COLOR.steel
    context.fillRect(Math.round(base.x - length), Math.round(base.y - 1), length, 1)
    if (labelsVisible && marker.meters % 10 === 0) {
      context.textAlign = 'right'
      label(context, `${marker.meters}`, base.x - 3, base.y + 2, COLOR.steel, 7)
    }
  }
  context.textAlign = 'left'
}

function drawDynamicMarkers(
  context: CanvasRenderingContext2D,
  view: WorldView,
  hill: Hill,
  markers: SportMarkerSet,
  technical = false,
): void {
  const h02Technical = technical && hill.spec.id === 'h02-zakopane-large'
  const h03Technical = technical && hill.spec.id === 'h03-oberstdorf-large'
  const h04Technical = technical && hill.spec.id === 'h04-planica-flying'
  const target = markers.leadingTarget
  if (target) {
    drawSurfaceTick(context, view, hill, target.meters, 2.4, COLOR.green, 1)
    if (h02Technical) drawH02TechnicalTag(context, `CEL ~${decimal(target.meters)} M`, 96, COLOR.green)
    else if (h03Technical) drawH03TechnicalTag(context, `CEL ~${decimal(target.meters)} M`, 90, COLOR.green)
    else if (h04Technical) drawPlanicaTechnicalTag(context, `CEL ~${decimal(target.meters)} M`, 96, COLOR.green)
    else {
      const anchor = view.toScreen(target.point)
      context.textAlign = 'center'
      drawPixelText(context, `CEL ~${decimal(target.meters)} M`, anchor.x, anchor.y - 24, COLOR.green, 1, 'center')
    }
  }

  const record = markers.record
  if (record) {
    const normal = hill.surfaceNormalAt(record.meters)
    const anchor = view.toScreen({
      x: record.point.x - normal.x * 1.8,
      y: record.point.y - normal.y * 1.8,
    })
    context.fillStyle = COLOR.warm
    context.fillRect(Math.round(anchor.x - 2), Math.round(anchor.y - 2), 3, 3)
    context.fillStyle = COLOR.sky
    context.fillRect(Math.round(anchor.x - 1), Math.round(anchor.y - 1), 1, 1)
    if (h02Technical) drawH02TechnicalTag(context, `REK ${decimal(record.meters)} M`, 110, COLOR.warm)
    else if (h03Technical) drawH03TechnicalTag(context, `REK ${decimal(record.meters)} M`, 104, COLOR.warm)
    else if (h04Technical) drawPlanicaTechnicalTag(context, `REK. ${decimal(record.meters)} M`, 110, COLOR.warm)
    else {
      context.textAlign = 'center'
      drawPixelText(context, `REK ${decimal(record.meters)} M`, anchor.x, anchor.y + 5, COLOR.warm, 1, 'center')
    }
  }
  context.textAlign = 'left'
}

function drawNamedSportMarker(
  context: CanvasRenderingContext2D,
  view: WorldView,
  hill: Hill,
  marker: PositionedMarker,
  name: string,
  color: string,
  technical: boolean,
): void {
  // Linie K i HS są poprzeczkami na zeskoku (ICR 417.3 — gałązki świerku na
  // szerokość stoku), więc z boku to krótka kreska przy powierzchni, a nie
  // maszt. W widoku technicznym zostaje dawna, czytelna długość.
  const tickMeters = technical ? (name === 'HS' ? 2.6 : 2.2) : (name === 'HS' ? 1.0 : 0.8)
  drawSurfaceTick(context, view, hill, marker.meters, tickMeters, color, name === 'HS' ? 2 : 1)
  const anchor = view.toScreen(marker.point)
  context.textAlign = 'center'
  label(context, `${name} ${marker.meters}`, anchor.x, anchor.y - (technical ? 12 : 11), color, technical ? 9 : 8)
  if (name === 'HS') {
    context.fillStyle = color
    context.fillRect(Math.round(anchor.x - 4), Math.round(anchor.y - 1), 2, 2)
    context.fillRect(Math.round(anchor.x + 2), Math.round(anchor.y - 1), 2, 2)
  }
  context.textAlign = 'left'
}

export type TrainingSceneState = {
  readonly mode?: 'training' | 'competition'
  readonly bindingHints?: PlayerBindings
  readonly competitorName?: string
  readonly roundLabel?: string
  readonly attemptNumber: number
  readonly completedAttempts: number
  readonly bestDistanceHalfMeters: number
  readonly bestTotalTenths: number
  readonly result: TrainingJumpResult | null
  readonly technicalView: boolean
  readonly snowEnabled: boolean
  readonly reducedMotion: boolean
  readonly debugEnabled: boolean
  readonly leadingTargetHalfMeters: number | null
  readonly leaderFixtureTenths: number
  readonly recordHalfMeters: number | null
  readonly trainingGateMode?: 'auto' | 'manual'
  readonly trainingGateForecastMean?: number | null
  readonly trainingGateAutoNumber?: number | null
}

const DEFAULT_SCENE_STATE: TrainingSceneState = {
  mode: 'training',
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
  leaderFixtureTenths: 1400,
  recordHalfMeters: null,
}

/**
 * Minimalny kontrakt sceny produkcyjnej. `JumpSimulation` spełnia go strukturalnie
 * (ma dodatkowe pola), a `ReplayPlayer` buduje z tego samego kształtu adapter na
 * podstawie `ReplayFrame` — bez zmiany formatu zapisanego replaya (decyzja #5).
 */
export type SceneActor = {
  readonly hill: Hill
  /** Wybrana belka; replay starszego formatu może jej nie przekazać. */
  readonly gateNumber?: number
  readonly phase: string
  readonly position: Vec2
  readonly pitchRad: number
  readonly tick: number
  /** Dostępne w żywej symulacji; replay może polegać na geometrycznym fallbacku. */
  readonly impulseElapsedSeconds?: number
  readonly flightSeconds?: number
  readonly landingStyle?: 'telemark' | 'parallel' | 'none'
  readonly contact?: { readonly distanceMeters: number } | null
  readonly events?: readonly { readonly tick: number; readonly type: string; readonly detail?: string }[]
}

/**
 * Skala sceny produkcyjnej — P42 runda 6.
 *
 * Do tej rundy kamera rysowała 2,075 px na metr, a sprite zawodnika był
 * rysowany w proporcjach ~11,6 px/m (narta 29 px). Zawodnik „mierzył" więc
 * 14 m nart i 10,6 m wzrostu — stąd wrażenie giganta na skoczni. Teraz skala
 * kamery jest ZGODNA ze sprite'em: 29 px narty to dokładnie 2,50 m, a 21 px
 * sylwetki to 1,81 m. Cała reszta sceny (pas śniegu, próg, estakada, linie
 * metrowe) dostaje przez to rzeczywiste rozmiary.
 *
 * Konsekwencja: w kadrze mieści się 41,4 × 23,3 m świata zamiast 231 × 130 m,
 * czyli kamera jedzie za zawodnikiem tak jak w Ski Jump International 3
 * (tam narta 2,5 m zajmuje ~44–48 px przy 640 px szerokości, u nas 29 px przy
 * 480 px — ta sama proporcja).
 */
export const PRODUCTION_SCALE_PIXELS_PER_METER = 11.6

/** Stały zoom; kamera utrzymuje zawodnika przy 38% szerokości bez skoków zoomu. */
export function buildProductionCamera(actor: SceneActor): WorldView {
  const scale = PRODUCTION_SCALE_PIXELS_PER_METER
  const anchorX = VIEW_WIDTH * 0.38
  // Okno kamery ma 23 m wysokości, a w szczycie lotu zawodnik bywa 19 m nad
  // śniegiem — przy sztywnej kotwicy albo on, albo zeskok wypadałby z kadru.
  // Im wyżej leci, tym wyżej siedzi w kadrze, więc stok zawsze zostaje pod nim.
  // UWAGA: `surfaceYAtX` opisuje ZESKOK. Na rozbiegu zawodnik jest kilkadziesiąt
  // metrów nad tą powierzchnią, więc liczony stamtąd prześwit wypychałby kadr
  // w górę przez cały najazd. Na śniegu prześwit jest z definicji zerowy.
  const onSnow = actor.phase === 'GateGreen' || actor.phase === 'Inrun' || actor.phase === 'Takeoff'
  const groundY = actor.hill.surfaceYAtX(actor.position.x)
  const clearance = onSnow ? 0 : Math.max(0, actor.position.y - groundY)
  const lift = Math.min(clearance, 18) / 18
  const anchorY = VIEW_HEIGHT * (0.62 - 0.46 * lift)
  const focus = actor.position
  return {
    scale,
    toScreen: (point) => ({
      x: anchorX + (point.x - focus.x) * scale,
      y: anchorY - (point.y - focus.y) * scale,
    }),
  }
}

/**
 * Warstwy paralaksy kosztują dużo (wielokąty gór/lasu/trybun rasteryzowane
 * skanliniowo, bez antyaliasingu — patrz `fillPixelPolygon`). Rysowanie ich
 * na nowo w każdej klatce mierzalnie obciążało budżet 120 Hz (P15). Zamiast
 * tego renderujemy każdą warstwę RAZ do bufora szerszego niż ekran, a co
 * klatkę tylko przesuwamy ją całkowitą liczbą pikseli przez `drawImage`
 * (tania operacja) — piksele w obrębie warstwy się nie zmieniają, tylko jej
 * pozycja pozioma zależna od paralaksy (decyzja #4, P42 §5 opcja D).
 */
/** Margines poza kadrem, na którym wielokąty terenu wciąż mają punkty. */
const SCENE_MARGIN_PX = 32
/** Krok próbkowania krzywych terenu; przy 11,6 px/m to ~5 px na segment. */
const TERRAIN_STEP_METERS = 1.2
/**
 * Wypełnienie ziemi to jedyny wielokąt sięgający całej wysokości bufora, więc
 * jego liczba punktów kosztuje najwięcej w skanlinii — a jest tylko tłem pod
 * pasami śniegu, gdzie dokładność 3 m jest niewidoczna.
 */
const TERRAIN_BODY_STEP_METERS = 3.2
/** Przygotowana grubość śniegu — ICR 417.2 wymaga min. 30 cm na zeskoku. */
const SNOW_DEPTH_METERS = 0.45

const BG_MARGIN = 50
const BG_LAYER_OFFSET = 40 + BG_MARGIN
const BG_LAYER_WIDTH = 560 + BG_MARGIN * 2
let backgroundLayers: { far: OffscreenCanvas | HTMLCanvasElement; mid: OffscreenCanvas | HTMLCanvasElement; near: OffscreenCanvas | HTMLCanvasElement } | null = null
let backgroundLayersFamily: PaletteFamilyId | null = null

function makeLayerCanvas(): OffscreenCanvas | HTMLCanvasElement {
  return typeof OffscreenCanvas === 'function'
    ? new OffscreenCanvas(BG_LAYER_WIDTH, VIEW_HEIGHT)
    : Object.assign(document.createElement('canvas'), { width: BG_LAYER_WIDTH, height: VIEW_HEIGHT })
}

function buildBackgroundLayers(): void {
  if (activePaletteFamily === 'planicaValley') {
    buildPlanicaBackgroundLayers()
    return
  }
  if (activePaletteFamily === 'zakopaneWinterDay') {
    buildZakopaneBackgroundLayers()
    return
  }
  if (activePaletteFamily === 'schattenbergMorning') {
    buildSchattenbergBackgroundLayers()
    return
  }
  const palette = env()
  const o = BG_LAYER_OFFSET

  const far = makeLayerCanvas()
  const farContext = far.getContext('2d') as CanvasRenderingContext2D
  farContext.imageSmoothingEnabled = false
  fillPixelPolygon(farContext, palette.mountainFar, [[-40 + o, 152], [7 + o, 88], [45 + o, 123], [113 + o, 63], [165 + o, 126], [234 + o, 77], [297 + o, 130], [362 + o, 59], [520 + o, 136], [520 + o, 210], [-40 + o, 210]])

  const mid = makeLayerCanvas()
  const midContext = mid.getContext('2d') as CanvasRenderingContext2D
  midContext.imageSmoothingEnabled = false
  fillPixelPolygon(midContext, palette.mountainNear, [[8 + o, 114], [27 + o, 88], [40 + o, 104], [133 + o, 63], [155 + o, 91], [254 + o, 77], [267 + o, 94], [382 + o, 59], [402 + o, 85], [427 + o, 102], [520 + o, 136], [520 + o, 146], [-40 + o, 146]])
  fillPixelPolygon(midContext, palette.mountainMid, [[-40 + o, 166], [46 + o, 121], [97 + o, 155], [166 + o, 106], [231 + o, 159], [300 + o, 115], [363 + o, 163], [429 + o, 109], [520 + o, 146], [520 + o, 210], [-40 + o, 210]])
  // Dalekie tło pozostaje spokojne. Trybuny i maszty są landmarkami świata
  // rysowanymi razem z terenem, więc naturalnie wchodzą i wychodzą z kadru.

  const near = makeLayerCanvas()
  const nearContext = near.getContext('2d') as CanvasRenderingContext2D
  nearContext.imageSmoothingEnabled = false
  for (const [x, height] of [[-24, 26], [0, 18], [16, 24], [35, 16], [53, 29], [65, 20], [88, 25], [112, 17], [147, 27], [175, 21], [202, 25]] as const) {
    const bx = x + o
    fillPixelPolygon(nearContext, palette.forestCanopy, [[bx, 201], [bx + 7, 201 - height], [bx + 13, 201], [bx + 13, 215], [bx, 215]])
    nearContext.fillStyle = palette.forestShade
    nearContext.fillRect(Math.round(bx + 5), 201 - Math.floor(height * 0.55), 3, Math.floor(height * 0.55) + 14)
  }

  backgroundLayers = { far, mid, near }
  backgroundLayersFamily = activePaletteFamily
}

/** Three original, parallax-ready pixel layers: sleeping ridge, jagged Tatras, spruce belt. */
function buildZakopaneBackgroundLayers(): void {
  const p = ZAKOPANE_WINTER_DAY
  const o = BG_LAYER_OFFSET
  const far = makeLayerCanvas()
  const farContext = far.getContext('2d') as CanvasRenderingContext2D
  farContext.imageSmoothingEnabled = false
  // A pale, squared-off low sun; no gradient, glow, or imported photographic pixels.
  farContext.fillStyle = '#f3dcaf'
  farContext.fillRect(433 + o, 43, 14, 13)
  farContext.fillRect(430 + o, 46, 20, 7)
  farContext.fillStyle = '#f9e9c5'
  farContext.fillRect(435 + o, 45, 10, 9)
  fillPixelPolygon(farContext, p.mountainFar, [
    [-90 + o, 169], [28 + o, 147], [65 + o, 131], [100 + o, 143],
    [146 + o, 111], [164 + o, 119], [190 + o, 88], [201 + o, 100],
    [222 + o, 77], [237 + o, 95], [255 + o, 70], [270 + o, 100],
    [288 + o, 77], [314 + o, 112], [337 + o, 84], [353 + o, 105],
    [382 + o, 75], [403 + o, 99], [422 + o, 87], [458 + o, 118],
    [487 + o, 102], [514 + o, 124], [570 + o, 138], [570 + o, 217], [-90 + o, 217],
  ])
  for (const crest of [
    [[188, 91], [190, 88], [200, 100], [197, 98]],
    [[216, 84], [222, 77], [237, 95], [231, 92]],
    [[251, 77], [255, 70], [270, 100], [265, 92]],
    [[376, 83], [382, 75], [403, 99], [395, 94]],
  ] as const) {
    fillPixelPolygon(farContext, '#d9dcd3', crest.map(([x, y]) => [x + o, y]))
  }
  // Only selected snow facets: readable rock clusters rather than all-over noise.
  for (const [x, y, width] of [[237, 100, 8], [279, 109, 12], [335, 105, 8], [402, 112, 11]] as const) {
    farContext.fillStyle = '#aebfc0'
    farContext.fillRect(x + o, y, width, 2)
  }

  const mid = makeLayerCanvas()
  const midContext = mid.getContext('2d') as CanvasRenderingContext2D
  midContext.imageSmoothingEnabled = false
  // Giewont-inspired reclining, broad stepped massif. Stylised, not a traced skyline.
  fillPixelPolygon(midContext, p.mountainMid, [
    [-90 + o, 177], [-48 + o, 146], [-14 + o, 146], [12 + o, 134],
    [40 + o, 134], [53 + o, 128], [72 + o, 128], [81 + o, 120],
    [99 + o, 120], [108 + o, 108], [120 + o, 108], [131 + o, 96],
    [145 + o, 96], [154 + o, 101], [175 + o, 101], [187 + o, 108],
    [211 + o, 108], [223 + o, 119], [245 + o, 119], [269 + o, 138],
    [316 + o, 151], [360 + o, 158], [417 + o, 151], [475 + o, 165],
    [570 + o, 170], [570 + o, 218], [-90 + o, 218],
  ])
  pixelLine(midContext, 106 + o, 109, 118 + o, 109, '#c5c9c0', 2)
  pixelLine(midContext, 131 + o, 96, 144 + o, 96, '#e5e1d6', 2)
  pixelLine(midContext, 154 + o, 102, 174 + o, 102, '#aabdbc', 2)
  fillPixelPolygon(midContext, p.mountainNear, [
    [-90 + o, 194], [-18 + o, 172], [45 + o, 178], [91 + o, 159],
    [140 + o, 170], [188 + o, 160], [229 + o, 178], [286 + o, 160],
    [333 + o, 177], [390 + o, 162], [438 + o, 174], [502 + o, 160],
    [570 + o, 175], [570 + o, 220], [-90 + o, 220],
  ])

  const near = makeLayerCanvas()
  const nearContext = near.getContext('2d') as CanvasRenderingContext2D
  nearContext.imageSmoothingEnabled = false
  // Uneven, cold-lit spruce stands, with deliberate gaps to let the warm sky breathe.
  for (let index = 0; index < 32; index += 1) {
    const x = -74 + index * 20 + (index % 3) * 3 + o
    const height = 13 + (index * 11 % 20)
    const foot = 214 + (index % 4) * 2
    fillPixelPolygon(nearContext, p.forestShade, [
      [x + 7, foot - height - 4], [x + 14, foot - 9],
      [x + 11, foot - 9], [x + 17, foot], [x - 3, foot],
      [x + 3, foot - 9], [x, foot - 9],
    ])
    pixelLine(nearContext, x + 7, foot - height, x + 3, foot - 7, p.forestCanopy, 2)
    nearContext.fillStyle = '#73918a'
    nearContext.fillRect(x + 6, foot - height + 4, 2, 2)
  }
  backgroundLayers = { far, mid, near }
  backgroundLayersFamily = activePaletteFamily
}

/** H03: a wooded amphitheatre rather than H02's pointed Tatras or H01's lake. */
function buildSchattenbergBackgroundLayers(): void {
  const o = BG_LAYER_OFFSET
  const far = makeLayerCanvas()
  const f = far.getContext('2d') as CanvasRenderingContext2D
  f.imageSmoothingEnabled = false
  // Two broad shoulders leave a low, open pocket of sky over the jump arena.
  fillPixelPolygon(f, '#a3aba1', [
    [-90 + o, 108], [-35 + o, 82], [6 + o, 63], [42 + o, 69], [94 + o, 91],
    [135 + o, 111], [188 + o, 140], [247 + o, 149], [304 + o, 147],
    [353 + o, 126], [399 + o, 100], [449 + o, 69], [483 + o, 61],
    [525 + o, 74], [570 + o, 96], [570 + o, 224], [-90 + o, 224],
  ])
  fillPixelPolygon(f, SCHATTENBERG_MORNING.mountainFar, [
    [-90 + o, 133], [-18 + o, 82], [27 + o, 80], [65 + o, 93],
    [112 + o, 120], [160 + o, 146], [224 + o, 167], [288 + o, 168],
    [351 + o, 156], [400 + o, 132], [455 + o, 87], [506 + o, 84],
    [570 + o, 112], [570 + o, 224], [-90 + o, 224],
  ])
  // Sparing snow pockets following the contour, not photographic texture.
  for (const [x, y, length] of [[-4, 88, 23], [56, 101, 15], [445, 92, 26], [489, 89, 16]] as const) {
    pixelLine(f, x + o, y, x + o + length, y + 6, '#d8d9c9', 2)
    pixelLine(f, x + o + 6, y + 5, x + o + length - 2, y + 9, '#bec9bb', 1)
  }

  const mid = makeLayerCanvas()
  const m = mid.getContext('2d') as CanvasRenderingContext2D
  m.imageSmoothingEnabled = false
  fillPixelPolygon(m, SCHATTENBERG_MORNING.mountainMid, [
    [-90 + o, 115], [-48 + o, 105], [-15 + o, 124], [29 + o, 118],
    [71 + o, 133], [115 + o, 147], [167 + o, 171], [213 + o, 188],
    [279 + o, 194], [333 + o, 179], [381 + o, 151], [428 + o, 127],
    [480 + o, 107], [528 + o, 111], [570 + o, 124], [570 + o, 230], [-90 + o, 230],
  ])
  // Terraced, densely wooded banks run down into the valley on both sides.
  fillPixelPolygon(m, '#355c56', [
    [-90 + o, 153], [-21 + o, 134], [35 + o, 147], [84 + o, 160],
    [132 + o, 180], [185 + o, 198], [247 + o, 211], [307 + o, 208],
    [361 + o, 189], [418 + o, 153], [486 + o, 128], [570 + o, 144],
    [570 + o, 230], [-90 + o, 230],
  ])
  for (const [x, y, length] of [[-17, 139, 32], [89, 166, 22], [150, 189, 26], [364, 184, 26], [431, 149, 33]] as const) {
    pixelLine(m, x + o, y, x + o + length, y + 8, '#74938a', 1)
  }
  // The small practice hills are silhouettes inside the arena, not mapped objects.
  for (const [x, top, foot] of [[341, 155, 200], [377, 142, 196], [409, 133, 189]] as const) {
    pixelLine(m, x + o, top, x + 26 + o, foot, '#253f40', 3)
    pixelLine(m, x + 2 + o, top, x + 28 + o, foot, '#e0e7dc', 2)
    pixelLine(m, x - 2 + o, top - 6, x - 2 + o, top + 7, '#203c3d', 2)
    pixelLine(m, x - 7 + o, top - 6, x + 4 + o, top - 6, '#b79a70', 2)
  }

  const near = makeLayerCanvas()
  const n = near.getContext('2d') as CanvasRenderingContext2D
  n.imageSmoothingEnabled = false
  // Uneven fir groups follow the curved bowl. Broad tiered boughs read at 480 px.
  for (let i = 0; i < 37; i += 1) {
    const x = -77 + i * 18 + (i % 4) * 2 + o
    const distanceFromMiddle = Math.abs(-77 + i * 18 - 258)
    const foot = 206 - Math.floor(distanceFromMiddle * 0.10) + (i % 3) * 2
    const height = 15 + (i * 13 % 18)
    const color = i % 4 === 0 ? '#214741' : SCHATTENBERG_MORNING.forestShade
    fillPixelPolygon(n, color, [
      [x + 7, foot - height], [x + 12, foot - height + 11], [x + 10, foot - height + 11],
      [x + 16, foot - 7], [x + 12, foot - 7], [x + 19, foot], [x - 4, foot],
      [x + 2, foot - 7], [x - 1, foot - 7], [x + 5, foot - height + 11],
      [x + 3, foot - height + 11],
    ])
    pixelLine(n, x + 5, foot - height + 12, x + 10, foot - height + 13, '#6f8f80', 1)
    pixelLine(n, x + 2, foot - 7, x + 12, foot - 8, '#40645b', 1)
    n.fillStyle = '#2c4b45'
    n.fillRect(x + 6, foot - 1, 3, 5)
  }
  backgroundLayers = { far, mid, near }
  backgroundLayersFamily = activePaletteFamily
}

/** H04: a wide glacial opening framed by two high, broken ridges, not an amphitheatre. */
function buildPlanicaBackgroundLayers(): void {
  const o = BG_LAYER_OFFSET
  const far = makeLayerCanvas()
  const f = far.getContext('2d') as CanvasRenderingContext2D
  f.imageSmoothingEnabled = false
  fillPixelPolygon(f, '#b4a1a7', [
    [-90 + o, 147], [-40 + o, 99], [7 + o, 88], [49 + o, 37],
    [74 + o, 76], [92 + o, 59], [137 + o, 121], [193 + o, 154],
    [263 + o, 174], [322 + o, 159], [374 + o, 112], [414 + o, 30],
    [432 + o, 55], [462 + o, 48], [490 + o, 79], [533 + o, 67],
    [570 + o, 107], [570 + o, 233], [-90 + o, 233],
  ])
  fillPixelPolygon(f, PLANICA_VALLEY.mountainFar, [
    [-90 + o, 166], [-25 + o, 112], [20 + o, 97], [49 + o, 37],
    [62 + o, 68], [84 + o, 82], [92 + o, 59], [129 + o, 123],
    [190 + o, 164], [271 + o, 183], [329 + o, 161], [385 + o, 112],
    [414 + o, 30], [430 + o, 58], [462 + o, 48], [487 + o, 87],
    [539 + o, 69], [570 + o, 112], [570 + o, 233], [-90 + o, 233],
  ])
  // Sparse, hand-plotted snow shelves and high triangular patches.
  for (const facet of [
    [[28, 78], [49, 37], [63, 69], [51, 62], [43, 78]],
    [[82, 80], [92, 59], [107, 84], [97, 79]],
    [[393, 76], [414, 30], [432, 57], [419, 49], [414, 68]],
    [[450, 60], [462, 48], [481, 76], [469, 67]],
    [[524, 80], [539, 69], [553, 89]],
  ] as const) fillPixelPolygon(f, '#eee1d2', facet.map(([x, y]) => [x + o, y]))
  for (const [x, y, length] of [[-15, 126, 24], [112, 112, 17], [353, 135, 20], [482, 103, 27]] as const) {
    pixelLine(f, x + o, y, x + o + length, y + 9, '#c9bbc0', 2)
  }

  const mid = makeLayerCanvas()
  const m = mid.getContext('2d') as CanvasRenderingContext2D
  m.imageSmoothingEnabled = false
  fillPixelPolygon(m, PLANICA_VALLEY.mountainMid, [
    [-90 + o, 153], [-31 + o, 126], [13 + o, 133], [54 + o, 119],
    [86 + o, 141], [127 + o, 159], [159 + o, 186], [228 + o, 208],
    [304 + o, 212], [351 + o, 199], [404 + o, 167], [448 + o, 145],
    [510 + o, 111], [570 + o, 131], [570 + o, 238], [-90 + o, 238],
  ])
  fillPixelPolygon(m, '#334960', [
    [-90 + o, 178], [-36 + o, 158], [15 + o, 165], [58 + o, 144],
    [98 + o, 161], [151 + o, 197], [206 + o, 217], [294 + o, 223],
    [358 + o, 211], [424 + o, 173], [486 + o, 146], [570 + o, 158],
    [570 + o, 240], [-90 + o, 240],
  ])
  // The valley's thin cable crossing is background scale, not a sport line.
  pixelLine(m, -40 + o, 123, 202 + o, 171, '#20374b')
  pixelLine(m, 202 + o, 171, 517 + o, 116, '#20374b')
  for (const [x, y] of [[28, 137], [104, 152], [178, 166], [266, 160], [347, 146], [435, 130]] as const) {
    pixelLine(m, x + o, y, x + o, y + 6, '#24374b')
    m.fillStyle = '#f5c49b'
    m.fillRect(x - 2 + o, y + 5, 5, 3)
    m.fillStyle = '#22344a'
    m.fillRect(x - 3 + o, y + 8, 7, 1)
  }
  for (const [x, y, length] of [[-8, 166, 42], [91, 169, 25], [410, 177, 31], [482, 152, 40]] as const) {
    pixelLine(m, x + o, y, x + o + length, y + 8, '#8597a0', 1)
  }

  const near = makeLayerCanvas()
  const n = near.getContext('2d') as CanvasRenderingContext2D
  n.imageSmoothingEnabled = false
  // Split pine belts: the middle remains open for the mammoth's long flight.
  for (let i = 0; i < 31; i += 1) {
    const x = i < 15 ? -81 + i * 16 : 378 + (i - 15) * 17
    const foot = i < 15 ? 199 + Math.floor(i * 0.85) : 213 - Math.floor((i - 15) * 1.6)
    const height = 14 + (i * 17 % 19)
    const bx = x + o
    fillPixelPolygon(n, i % 4 === 0 ? '#316170' : PLANICA_VALLEY.forestShade, [
      [bx + 5, foot - height], [bx + 9, foot - height + 7],
      [bx + 7, foot - height + 7], [bx + 13, foot - 4],
      [bx - 3, foot - 4], [bx + 3, foot - height + 7],
      [bx + 1, foot - height + 7],
    ])
    n.fillStyle = '#3e6e79'
    n.fillRect(bx + 4, foot - 7, 3, 1)
  }
  backgroundLayers = { far, mid, near }
  backgroundLayersFamily = activePaletteFamily
}

/** H04's original miniature for the existing keyboard hill selector, on the same pixel grid. */
export function drawPlanicaThumbnail(context: CanvasRenderingContext2D, x: number, y: number): void {
  context.save()
  context.translate(Math.round(x), Math.round(y))
  context.imageSmoothingEnabled = false
  context.fillStyle = '#45506b'
  context.fillRect(0, 0, 175, 32)
  context.fillStyle = '#dfaa91'
  context.fillRect(0, 10, 175, 12)
  fillPixelPolygon(context, '#77718e', [
    [0, 17], [17, 3], [28, 10], [40, 2], [52, 13], [79, 21],
    [114, 22], [141, 5], [154, 11], [175, 7], [175, 24], [0, 24],
  ])
  fillPixelPolygon(context, '#303f57', [
    [0, 20], [20, 15], [48, 20], [77, 24], [113, 25],
    [152, 16], [175, 17], [175, 24], [0, 24],
  ])
  pixelLine(context, 26, 4, 26, 18, '#152238', 3)
  pixelLine(context, 24, 4, 38, 4, '#fff3db', 2)
  pixelLine(context, 30, 8, 64, 20, '#e0e8df', 2)
  for (const [sx, height] of [[34, 9], [46, 7], [57, 5]] as const) {
    pixelLine(context, sx, 12, sx + 2, 12 + height, '#152238')
  }
  pixelLine(context, 67, 17, 102, 23, '#fff3db', 2)
  pixelLine(context, 102, 23, 156, 18, '#fff3db', 2)
  context.fillStyle = '#152238'
  context.fillRect(0, 25, 175, 7)
  drawPixelText(context, 'REKORD SKOCZNI 254,5 M', 5, 25, '#fff3db', 1)
  context.restore()
}

function drawProductionBackground(
  context: CanvasRenderingContext2D,
  tick: number,
  snowEnabled: boolean,
  windUserMetersPerSecond: number,
  focusMeters: number,
  focusHeightMeters: number,
  scale: number,
  reducedMotion: boolean,
  lillehammer = false,
): void {
  const palette = env()
  context.fillStyle = palette.skyBands[0]
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)
  if (activePaletteFamily === 'planicaValley') {
    context.fillStyle = palette.skyBands[3]
    context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)
    for (const [color, top, height] of [
      [palette.skyBands[0], 0, 43], [palette.skyBands[1], 43, 47],
      [palette.skyBands[2], 90, 58],
    ] as const) {
      context.fillStyle = color
      context.fillRect(0, top, VIEW_WIDTH, height)
    }
  } else {
    palette.skyBands.forEach((color, index) => {
      context.fillStyle = color
      context.fillRect(0, index * 37, VIEW_WIDTH, 38)
    })
  }

  if (!backgroundLayers || backgroundLayersFamily !== activePaletteFamily) buildBackgroundLayers()
  const layers = backgroundLayers
  if (layers) {
    // Paralaksa: warstwy dalsze przesuwają się wolniej niż kamera (decyzja #4).
    // Tło jest daleko, więc jego ruch EKRANOWY nie może urosnąć razem ze skalą
    // pierwszego planu — współczynniki są przeliczone przez 2,075/11,6, żeby
    // góry i trybuny przesuwały się dokładnie tak jak przed zmianą zoomu.
    const parallax = 2.075 / PRODUCTION_SCALE_PIXELS_PER_METER
    const farShift = -focusMeters * scale * 0.06 * parallax
    const midShift = -focusMeters * scale * 0.1 * parallax
    const nearShift = -focusMeters * scale * 0.15 * parallax
    // Kamera przy skali 1:1 zjeżdża w pionie o kilkadziesiąt metrów świata,
    // więc tło musi opadać razem z nią — inaczej góry i trybuny wiszą na stałej
    // wysokości ekranu i „przeklejają się" przez zeskok.
    const vertical = (focusHeightMeters + 30) * scale * parallax
    const farRise = vertical * 0.10
    const midRise = vertical * 0.16
    const nearRise = vertical * 0.24
    context.drawImage(layers.far, Math.round(farShift) - BG_LAYER_OFFSET, Math.round(farRise))
    context.drawImage(layers.mid, Math.round(midShift) - BG_LAYER_OFFSET, Math.round(midRise))
    context.drawImage(layers.near, Math.round(nearShift) - BG_LAYER_OFFSET, Math.round(nearRise))
  }

  if (lillehammer) drawLillehammerPanorama(context, focusMeters, focusHeightMeters)
  if (!snowEnabled || reducedMotion) return
  for (let index = 0; index < (activePaletteFamily === 'zakopaneWinterDay' ? 18
    : activePaletteFamily === 'schattenbergMorning' ? 12 : activePaletteFamily === 'planicaValley' ? 10 : 38); index += 1) {
    const drift = -windUserMetersPerSecond * (1.2 + (index % 4) * 0.3)
    const x = ((index * 41 + tick * (0.23 + (index % 3) * 0.09) + drift * tick * 0.04) % VIEW_WIDTH + VIEW_WIDTH) % VIEW_WIDTH
    const y = (index * 24 + tick * (0.38 + (index % 2) * 0.18)) % 210
    const large = index % 11 === 0
    context.fillStyle = large ? 'rgba(243, 234, 209, 0.68)' : 'rgba(231, 240, 239, 0.46)'
    context.fillRect(Math.round(x), Math.round(y), 1, large ? 2 : 1)
  }
}

/** Original pixel clusters inspired by the venue, not traced photographs.
 * Kept in the distant background: neither chairs nor stairs replace sport lines.
 */
function drawLillehammerPanorama(context: CanvasRenderingContext2D, focus: number, height: number): void {
  const p = env()
  const dx = Math.round(-focus * 0.16)
  const dy = Math.round((height + 30) * 0.28)
  context.save()
  context.translate(dx, dy)
  // Mjøsa: a long quiet water band, with a broken, warm shoreline.
  fillPixelPolygon(context, '#315d76', [[130, 170], [253, 164], [515, 169], [515, 180], [204, 177]])
  for (let i = 0; i < 49; i += 1) {
    const x = 144 + i * 8
    const y = 162 + (i * 7 % 5)
    context.fillStyle = p.steelDark
    context.fillRect(x, y - 3, 5, 4)
    context.fillStyle = i % 3 === 0 ? COLOR.warm : p.steelMid
    context.fillRect(x + 1, y, 1, 1)
  }
  // Long external stepped access, separate from the existing inrun elevator.
  for (let i = 0; i < 48; i += 1) {
    const x = 32 + i * 4
    const y = 75 + i * 2
    pixelLine(context, x, y, x + 4, y, p.steelMid, 1)
    pixelLine(context, x + 4, y, x + 4, y + 2, p.steelMid, 1)
    if (i % 4 === 0) pixelLine(context, x, y - 5, x, y + 4, p.steelDark, 1)
  }
  pixelLine(context, 32, 70, 224, 166, p.steelDark, 1)
  // Chairlift cable, suspended chairs and small upper station.
  pixelLine(context, 57, 65, 327, 159, p.steelDark, 1)
  for (let i = 0; i < 7; i += 1) {
    const x = 71 + i * 37
    const y = 70 + i * 13
    pixelLine(context, x, y, x, y + 7, p.steelMid, 1)
    pixelLine(context, x - 3, y + 5, x - 3, y + 10, p.steelDark, 1)
    pixelLine(context, x - 3, y + 10, x + 5, y + 10, p.steelDark, 2)
  }
  context.fillStyle = p.steelDark
  context.fillRect(40, 57, 25, 12)
  context.fillStyle = p.steelMid
  context.fillRect(38, 55, 29, 3)
  context.fillStyle = COLOR.warm
  context.fillRect(45, 60, 4, 3)
  context.fillRect(53, 60, 4, 3)
  context.restore()
}

type CurveWindow = { readonly from: number; readonly to: number }

/**
 * Rozmiar płótna, na które właśnie rysujemy teren. Bufor jest większy od
 * ekranu, więc przycinanie do `VIEW_WIDTH`/`VIEW_HEIGHT` zostawiało jego prawą
 * i dolną część pustą — pas śniegu zeskoku po prostu znikał w połowie kadru.
 */
let paintWidth = VIEW_WIDTH
let paintHeight = VIEW_HEIGHT

/**
 * Odwzorowanie ekranu na metry: `WorldView.toScreen` jest przekształceniem
 * afinicznym, więc wystarczą dwie sondy, żeby je odwrócić.
 */
function worldXRange(view: WorldView): { from: number; to: number } {
  const originX = view.toScreen({ x: 0, y: 0 }).x
  const unitX = view.toScreen({ x: 1, y: 0 }).x - originX
  if (Math.abs(unitX) < 1e-9) return { from: 0, to: 0 }
  const a = (-SCENE_MARGIN_PX - originX) / unitX
  const b = (paintWidth + SCENE_MARGIN_PX - originX) / unitX
  return { from: Math.min(a, b), to: Math.max(a, b) }
}

/**
 * Zakres metrażu krzywej widoczny w oknie kamery. Krzywe profilu są
 * monotoniczne po x, więc granice znajduje wyszukiwanie binarne — liniowe
 * skanowanie całej skoczni dla KAŻDEGO pasa (a jest ich sześć) kosztowało
 * kilka tysięcy `positionAt` na klatkę i wywracało budżet pętli 120 Hz.
 */
function curveWindow(view: WorldView, curve: ProfileCurve, stepMeters: number): CurveWindow | null {
  const world = worldXRange(view)
  const first = curve.positionAt(curve.startDistanceMeters).x
  const last = curve.positionAt(curve.endDistanceMeters).x
  if (last < world.from || first > world.to) return null

  const solve = (targetX: number): number => {
    let lo = curve.startDistanceMeters
    let hi = curve.endDistanceMeters
    for (let step = 0; step < 24; step += 1) {
      const mid = (lo + hi) / 2
      if (curve.positionAt(mid).x < targetX) lo = mid
      else hi = mid
    }
    return (lo + hi) / 2
  }

  const from = world.from <= first ? curve.startDistanceMeters : solve(world.from)
  const to = world.to >= last ? curve.endDistanceMeters : solve(world.to)
  if (!(to > from)) return null
  return {
    from: Math.max(curve.startDistanceMeters, from - stepMeters),
    to: Math.min(curve.endDistanceMeters, to + stepMeters),
  }
}

/** Punkt powierzchni przesunięty o `offsetMeters` wzdłuż normalnej, w pikselach. */
function offsetPoint(
  view: WorldView,
  curve: ProfileCurve,
  meters: number,
  offsetMeters: number,
): [number, number] {
  const base = curve.positionAt(meters)
  const normal = curve.normalAt(meters)
  const screen = view.toScreen({ x: base.x + normal.x * offsetMeters, y: base.y + normal.y * offsetMeters })
  return [screen.x, screen.y]
}

/**
 * Pas o STAŁEJ GRUBOŚCI W METRACH wzdłuż powierzchni. Wcześniej śnieg rysował
 * się jako polilinia o grubości podanej w pikselach — przy skali 2,075 px/m
 * pas 6 px „znaczył" 2,9 m śniegu. Teraz grubość jest wielkością świata, więc
 * zostaje prawdziwa niezależnie od zoomu kamery.
 */
function drawSurfaceBand(
  context: CanvasRenderingContext2D,
  view: WorldView,
  curve: ProfileCurve,
  window: CurveWindow,
  color: string,
  topOffsetMeters: number,
  bottomOffsetMeters: number,
  extendBackMeters = 0,
): void {
  const top: Array<[number, number]> = []
  const bottom: Array<[number, number]> = []

  // Śnieg nie kończy się tam, gdzie kończą się dane krzywej: podstawa progu
  // leży POD stołem, więc pas przedłużamy w tył stycznie do pierwszego
  // odcinka. Bez tego biała wstęga garbu urywała się tępo w powietrzu.
  if (extendBackMeters > 0 && window.from <= curve.startDistanceMeters + TERRAIN_STEP_METERS) {
    const base = curve.positionAt(curve.startDistanceMeters)
    const slope = curve.slopeRadAt(curve.startDistanceMeters)
    const normal = curve.normalAt(curve.startDistanceMeters)
    const back = { x: base.x - Math.cos(slope) * extendBackMeters, y: base.y + Math.sin(slope) * extendBackMeters }
    const at = (offset: number): [number, number] => {
      const screen = view.toScreen({ x: back.x + normal.x * offset, y: back.y + normal.y * offset })
      return [screen.x, screen.y]
    }
    top.push(at(topOffsetMeters))
    bottom.push(at(bottomOffsetMeters))
  }

  for (let meters = window.from; meters <= window.to; meters += TERRAIN_STEP_METERS) {
    const base = curve.positionAt(meters)
    const normal = curve.normalAt(meters)
    const a = view.toScreen({ x: base.x + normal.x * topOffsetMeters, y: base.y + normal.y * topOffsetMeters })
    const b = view.toScreen({ x: base.x + normal.x * bottomOffsetMeters, y: base.y + normal.y * bottomOffsetMeters })
    top.push([a.x, a.y])
    bottom.push([b.x, b.y])
  }
  top.push(offsetPoint(view, curve, window.to, topOffsetMeters))
  bottom.push(offsetPoint(view, curve, window.to, bottomOffsetMeters))
  if (top.length < 2) return
  fillPixelPolygon(context, color, [...top, ...bottom.reverse()])
}

/** Ziemia pod powierzchnią zeskoku i wybiegu — wypełnienie do dołu ekranu. */
function fillTerrainBody(
  context: CanvasRenderingContext2D,
  view: WorldView,
  surfaces: ReadonlyArray<{ curve: ProfileCurve; window: CurveWindow }>,
): void {
  const points: Array<[number, number]> = []
  let started = false
  for (const { curve, window } of surfaces) {
    for (let meters = window.from; meters <= window.to; meters += TERRAIN_BODY_STEP_METERS) {
      points.push(offsetPoint(view, curve, meters, 0))
      started = true
    }
    points.push(offsetPoint(view, curve, window.to, 0))
  }
  if (!started || points.length < 2) return
  const first = points[0] as [number, number]
  const second = points[1] as [number, number]
  const last = points[points.length - 1] as [number, number]
  const beforeLast = points[points.length - 2] as [number, number]
  // Poza kadrem kontynuujemy NACHYLENIE skrajnych odcinków zamiast ciąć teren
  // poziomo. Poziome cięcie robiło pod progiem czarną półkę na wysokości
  // początku zeskoku — teren zdawał się kończyć w powietrzu.
  const leftSlope = second[0] !== first[0] ? (second[1] - first[1]) / (second[0] - first[0]) : 0
  const rightSlope = last[0] !== beforeLast[0] ? (last[1] - beforeLast[1]) / (last[0] - beforeLast[0]) : 0
  const leftX = -SCENE_MARGIN_PX
  const rightX = paintWidth + SCENE_MARGIN_PX
  fillPixelPolygon(context, activePaletteFamily === 'zakopaneWinterDay' ? '#344748'
    : activePaletteFamily === 'schattenbergMorning' ? '#203b3a'
      : activePaletteFamily === 'planicaValley' ? '#263c50' : '#152838', [
    [leftX, first[1] + (leftX - first[0]) * leftSlope],
    ...points,
    [rightX, last[1] + (rightX - last[0]) * rightSlope],
    [rightX, paintHeight + SCENE_MARGIN_PX],
    [leftX, paintHeight + SCENE_MARGIN_PX],
  ])
}

/**
 * Konstrukcja rozbiegu w wymiarach rzeczywistych: najazd stoi na stalowej
 * estakadzie, a jej wysokość rośnie ku górze skoczni. Przy skali 1:1 podpory
 * co 12 m są ~139 px od siebie, więc w kadrze widać jedną–dwie naraz.
 */
function drawInrunStructure(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  if (hill.spec.id === 'h04-planica-flying') {
    drawPlanicaInrun(context, hill, view)
    return
  }
  if (hill.spec.id === 'h02-zakopane-large') {
    drawZakopaneInrun(context, hill, view)
    return
  }
  if (hill.spec.id === 'h03-oberstdorf-large') {
    drawSchattenbergInrun(context, hill, view)
    return
  }
  const palette = env()
  const curve = hill.inrunCurve
  const window = curveWindow(view, curve, 1)
  if (!window) return

  for (let meters = 6; meters <= curve.endDistanceMeters - 8; meters += 12) {
    if (meters < window.from - 14 || meters > window.to + 14) continue
    const top = view.toScreen(curve.positionAt(meters))
    // Estakada schodzi do terenu; im wyżej na rozbiegu, tym jest wyższa.
    const legMeters = 4 + (curve.endDistanceMeters - meters) * 0.22
    const footY = top.y + legMeters * view.scale
    const halfTop = 1.1 * view.scale
    pixelLine(context, top.x - halfTop, top.y + 2, top.x - halfTop * 2.2, footY, '#3c5565', 2)
    pixelLine(context, top.x + halfTop, top.y + 2, top.x + halfTop * 2.2, footY, palette.steelMid, 2)
    for (let brace = 1; brace <= 3; brace += 1) {
      const t = brace / 4
      const y = top.y + (footY - top.y) * t
      const half = halfTop * (1 + 1.2 * t)
      pixelLine(context, top.x - half, y, top.x + half, y, palette.steelMid, 1)
    }
  }

  // Boczne schody serwisowe: pod śniegiem, na tej samej estakadzie.
  // Wspólny odstęp 1,2 m jest też poziomem oparcia wybranej belki.
  // OPT: krok 1,8 m, jedna ciągła belka nośna + 2 krótkie kreski na stopień.
  const accessDrop = Math.round(1.2 * view.scale)
  const STAIR_STEP_METERS = 1.8
  const stairFrom = Math.max(0, Math.floor((window.from - 1) / STAIR_STEP_METERS) * STAIR_STEP_METERS)
  const stairTo = Math.min(curve.endDistanceMeters - 8, window.to + 1)
  if (stairTo > stairFrom) {
    const track: Array<{ ax: number; ay: number; ty: number }> = []
    for (let meters = stairFrom; meters < stairTo; meters += STAIR_STEP_METERS) {
      const p = view.toScreen(curve.positionAt(meters))
      const ty = Math.round(p.y)
      track.push({ ax: Math.round(p.x), ay: ty + accessDrop, ty })
    }
    const endPoint = view.toScreen(curve.positionAt(stairTo))
    const endTy = Math.round(endPoint.y)
    track.push({ ax: Math.round(endPoint.x), ay: endTy + accessDrop, ty: endTy })
    if (track.length > 1) {
      pixelPolyline(
        context,
        track.map((point) => ({ x: point.ax, y: point.ay + 3 })),
        palette.steelDark,
        3,
      )
    }
    for (let index = 0; index + 1 < track.length; index += 1) {
      const a = track[index] as { ax: number; ay: number; ty: number }
      const b = track[index + 1] as { ax: number; ay: number; ty: number }
      pixelLine(context, a.ax, a.ay, b.ax, a.ay, COLOR.steel, 1)
      if (index % 3 === 2) pixelLine(context, a.ax, a.ty + 3, a.ax, a.ay + 3, palette.steelMid, 1)
      else pixelLine(context, b.ax, a.ay, b.ax, b.ay, palette.steelMid, 1)
    }
  }

  // Wieża startowa nad najwyższą belką i smukły szyb do jej wejścia.
  const towerBase = view.toScreen(curve.positionAt(0))
  const wide = 3.2 * view.scale
  const high = 5.0 * view.scale
  const shaftX = Math.round(towerBase.x - wide * 0.5)
  const shaftTop = Math.round(towerBase.y - high * 0.35)
  const shaftBottom = Math.round(towerBase.y + (4 + curve.endDistanceMeters * 0.22) * view.scale)
  const shaftWidth = Math.max(5, Math.round(0.8 * view.scale))
  context.fillStyle = palette.steelDark
  context.fillRect(shaftX, shaftTop, shaftWidth, shaftBottom - shaftTop)
  pixelLine(context, shaftX, shaftTop, shaftX, shaftBottom, COLOR.steel, 1)
  pixelLine(context, shaftX + shaftWidth, shaftTop, shaftX + shaftWidth, shaftBottom, palette.steelMid, 1)
  for (let floorY = shaftTop + 12; floorY < shaftBottom; floorY += 18) {
    pixelLine(context, shaftX + 1, floorY, shaftX + shaftWidth - 1, floorY, palette.steelMid, 1)
  }
  pixelLine(context, shaftX, Math.round(towerBase.y) + accessDrop, Math.round(towerBase.x), Math.round(towerBase.y) + accessDrop, COLOR.steel, 2)
  context.fillStyle = palette.steelDark
  context.fillRect(Math.round(towerBase.x - wide * 0.5), Math.round(towerBase.y - high), Math.round(wide), Math.round(high))
  context.fillStyle = COLOR.steel
  context.fillRect(Math.round(towerBase.x - wide * 0.5), Math.round(towerBase.y - high), Math.round(wide), 1)
  context.fillStyle = COLOR.warm
  context.fillRect(Math.round(towerBase.x - wide * 0.3), Math.round(towerBase.y - high * 0.7), 4, 3)
}

/** H02's open timber A-frames and broad pitched start lodge, not H01's elevator shaft. */
function drawZakopaneInrun(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  const curve = hill.inrunCurve
  const window = curveWindow(view, curve, 1)
  if (!window) return
  const wood = '#6b5045'
  const shadow = '#3b4042'
  const edge = '#a98061'
  for (let meters = 7; meters < curve.endDistanceMeters - 5; meters += 9) {
    if (meters < window.from - 10 || meters > window.to + 10) continue
    const deck = view.toScreen(curve.positionAt(meters))
    const x = Math.round(deck.x)
    const y = Math.round(deck.y)
    const foot = Math.round(y + (4 + (curve.endDistanceMeters - meters) * 0.15) * view.scale)
    // Wide timber trestle with diagonal bracing; snow/track goes on top later.
    pixelLine(context, x - 9, y + 4, x - 18, foot, shadow, 3)
    pixelLine(context, x + 10, y + 4, x + 19, foot, wood, 3)
    pixelLine(context, x - 16, foot - 5, x + 13, y + 16, edge, 2)
    pixelLine(context, x - 14, foot - 11, x + 16, foot - 11, wood, 2)
    context.fillStyle = '#d9d7cc'
    context.fillRect(x - 19, foot, 8, 2)
    context.fillRect(x + 14, foot, 8, 2)
  }

  // Separate stepped walk alongside the inrun and a continuous handrail.
  const step = 1.35
  const rail: Vec2[] = []
  const first = Math.max(0, Math.floor(window.from / step) * step)
  for (let meters = first; meters <= Math.min(curve.endDistanceMeters - 4, window.to + step); meters += step) {
    const a = view.toScreen(curve.positionAt(meters))
    const x = Math.round(a.x)
    const y = Math.round(a.y + 1.25 * view.scale)
    rail.push({ x, y: y - 7 })
    pixelLine(context, x, y, x + 10, y, edge, 2)
    if (Math.round(meters / step) % 3 === 0) pixelLine(context, x, y - 7, x, y + 3, shadow, 1)
  }
  pixelPolyline(context, rail, shadow, 2)

  const base = view.toScreen(curve.positionAt(0))
  if (base.x < -100 || base.x > paintWidth + 100) return
  const x = Math.round(base.x)
  const y = Math.round(base.y)
  const bottom = Math.round(y + (6 + curve.endDistanceMeters * 0.16) * view.scale)
  // Tower base is airy, with bays you can see through — no Lillehammer-style box.
  pixelLine(context, x - 22, y - 9, x - 30, bottom, shadow, 4)
  pixelLine(context, x + 22, y - 9, x + 30, bottom, wood, 4)
  for (let bayY = y + 11; bayY < bottom; bayY += 22) {
    pixelLine(context, x - 24, bayY, x + 24, bayY, edge, 2)
    pixelLine(context, x - 24, bayY, x + 24, bayY + 22, wood, 2)
  }
  // Podhale-style pitched timber start shelter: deep eaves, layered roof snow.
  context.fillStyle = wood
  context.fillRect(x - 25, y - 45, 50, 35)
  context.fillStyle = '#866851'
  for (let plankY = y - 42; plankY < y - 10; plankY += 6) context.fillRect(x - 23, plankY, 46, 1)
  context.fillStyle = shadow
  context.fillRect(x - 18, y - 34, 10, 10)
  context.fillRect(x + 7, y - 34, 10, 10)
  context.fillStyle = '#ddb178'
  context.fillRect(x - 16, y - 32, 6, 5)
  context.fillRect(x + 9, y - 32, 6, 5)
  fillPixelPolygon(context, shadow, [[x - 32, y - 43], [x, y - 69], [x + 32, y - 43], [x + 32, y - 39], [x - 32, y - 39]])
  pixelLine(context, x - 34, y - 44, x, y - 71, '#f5f0e4', 3)
  pixelLine(context, x, y - 71, x + 34, y - 44, '#e2e5dc', 3)
  pixelLine(context, x - 30, y - 9, x + 29, y - 9, edge, 3)
  for (let post = x - 25; post <= x + 25; post += 10) pixelLine(context, post, y - 19, post, y - 9, shadow, 1)
}

/** H03: long steel-and-larch trussed deck, inclining lift and a high glazed start pod. */
function drawSchattenbergInrun(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  const curve = hill.inrunCurve
  const window = curveWindow(view, curve, 1)
  if (!window) return
  const dark = SCHATTENBERG_MORNING.steelDark
  const steel = SCHATTENBERG_MORNING.steelMid
  const timber = '#aa805d'
  const rail: Vec2[] = []
  const lift: Vec2[] = []
  const first = Math.max(0, Math.floor(window.from / 1.6) * 1.6)
  const last = Math.min(curve.endDistanceMeters, window.to + 1.6)
  for (let meters = first; meters <= last; meters += 1.6) {
    const deck = view.toScreen(curve.positionAt(meters))
    rail.push({ x: deck.x, y: deck.y + 8 })
    lift.push({ x: deck.x - 21, y: deck.y + 30 })
    // Close-set larch slats under the icy track, unlike the open H02 timber trestles.
    pixelLine(context, deck.x - 2, deck.y + 5, deck.x + 5, deck.y + 12, timber, 2)
  }
  pixelPolyline(context, rail, dark, 4)
  pixelPolyline(context, rail.map((p) => ({ x: p.x, y: p.y - 1 })), timber, 1)
  // The diagonal lift has a solid track and repeating windows, not hanging chairs.
  pixelPolyline(context, lift, dark, 5)
  pixelPolyline(context, lift.map((p) => ({ x: p.x - 1, y: p.y - 3 })), '#d5c7a4', 1)
  for (let meters = 4; meters < curve.endDistanceMeters - 4; meters += 6) {
    if (meters < window.from - 7 || meters > window.to + 7) continue
    const deck = view.toScreen(curve.positionAt(meters))
    const x = Math.round(deck.x)
    const y = Math.round(deck.y)
    const liftY = y + 30
    pixelLine(context, x - 18, liftY - 4, x - 24, liftY + 5, '#b58a63', 2)
    pixelLine(context, x - 20, liftY - 8, x + 2, y + 13, steel, 1)
    pixelLine(context, x + 5, y + 9, x - 17, liftY + 5, dark, 2)
    if (meters % 12 === 4) {
      const footY = Math.round(y + (5 + (curve.endDistanceMeters - meters) * 0.19) * view.scale)
      pixelLine(context, x + 3, y + 12, x + 17, footY, dark, 3)
      pixelLine(context, x + 9, y + 17, x + 11, footY, steel, 2)
      pixelLine(context, x - 15, liftY + 6, x + 13, footY - 5, steel, 2)
      pixelLine(context, x + 5, y + 12, x + 10, footY - 19, timber, 1)
      pixelLine(context, x + 9, footY - 25, x + 16, footY - 25, '#85978a', 2)
    }
  }

  const start = view.toScreen(curve.positionAt(0))
  const x = Math.round(start.x)
  const y = Math.round(start.y)
  if (x < -80 || x > paintWidth + 80) return
  // Vertical service core and massive cantilevered start house: steel frame,
  // timber skin and a continuous strip of glass, not H01's shaft or H02's gable.
  const foot = Math.round(y + (5 + curve.endDistanceMeters * 0.19) * view.scale)
  context.fillStyle = dark
  context.fillRect(x - 24, y - 37, 12, Math.max(1, foot - y + 37))
  pixelLine(context, x - 27, y - 40, x - 27, foot, steel, 2)
  for (let level = y - 28; level < foot; level += 19) {
    pixelLine(context, x - 24, level, x - 13, level, '#77948c', 2)
    pixelLine(context, x - 23, level + 2, x - 14, level + 13, '#4e6e68', 1)
  }
  pixelLine(context, x - 25, y - 6, x + 32, y - 6, timber, 3)
  fillPixelPolygon(context, dark, [
    [x - 30, y - 45], [x + 27, y - 45], [x + 37, y - 36],
    [x + 37, y - 12], [x - 30, y - 12],
  ])
  context.fillStyle = '#966f54'
  for (let slat = x - 27; slat < x - 5; slat += 4) context.fillRect(slat, y - 42, 2, 27)
  context.fillStyle = '#c5b999'
  context.fillRect(x - 4, y - 38, 35, 16)
  context.fillStyle = '#486361'
  context.fillRect(x - 2, y - 36, 31, 12)
  for (let frame = x + 5; frame < x + 30; frame += 9) pixelLine(context, frame, y - 37, frame, y - 21, dark, 2)
  pixelLine(context, x - 32, y - 47, x + 29, y - 47, '#d7c29b', 2)
  pixelLine(context, x + 29, y - 47, x + 39, y - 37, steel, 2)
  pixelLine(context, x - 29, y - 11, x + 38, y - 11, '#b5865d', 2)
  for (let post = x - 26; post < x + 39; post += 8) pixelLine(context, post, y - 17, post, y - 11, steel, 1)
}

/** H04: a narrow, exceptionally long flying ramp suspended from paired triangular pylons. */
function drawPlanicaInrun(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  const curve = hill.inrunCurve
  const window = curveWindow(view, curve, 1)
  if (!window) return
  const dark = PLANICA_VALLEY.steelDark
  const steel = PLANICA_VALLEY.steelMid
  const underside: Vec2[] = []
  const railing: Vec2[] = []
  const first = Math.max(0, Math.floor(window.from / 1.6) * 1.6)
  const last = Math.min(curve.endDistanceMeters, window.to + 1.6)
  for (let meters = first; meters <= last; meters += 1.6) {
    const point = view.toScreen(curve.positionAt(meters))
    underside.push({ x: point.x, y: point.y + 12 })
    railing.push({ x: point.x, y: point.y - 9 })
  }
  pixelPolyline(context, underside, dark, 5)
  pixelPolyline(context, underside.map((point) => ({ x: point.x, y: point.y + 3 })), steel, 1)
  // Banda rozbiegu w stali konstrukcji (ciemna + krawędź), by nie zlewała się z jasnym niebem.
  pixelPolyline(context, railing, dark, 2)
  pixelPolyline(context, railing.map((point) => ({ x: point.x, y: point.y - 1 })), steel, 1)
  for (let meters = 4; meters < curve.endDistanceMeters - 3; meters += 7) {
    if (meters < window.from - 8 || meters > window.to + 8) continue
    const a = view.toScreen(curve.positionAt(meters))
    const b = view.toScreen(curve.positionAt(Math.min(meters + 7, curve.endDistanceMeters)))
    pixelLine(context, a.x, a.y + 11, b.x, b.y + 15, steel)
    pixelLine(context, a.x, a.y + 11, a.x, a.y - 9, dark)
    // Deep V-shaped braces hang under the thin deck: a flying hill, not a hut.
    if (Math.floor(meters / 7) % 2 === 0) {
      pixelLine(context, a.x, a.y + 14, (a.x + b.x) / 2, (a.y + b.y) / 2 + 30, dark, 2)
      pixelLine(context, (a.x + b.x) / 2, (a.y + b.y) / 2 + 30, b.x, b.y + 14, steel, 2)
    }
  }
  for (let meters = 13; meters < curve.endDistanceMeters - 5; meters += 17) {
    if (meters < window.from - 18 || meters > window.to + 18) continue
    const deck = view.toScreen(curve.positionAt(meters))
    const foot = Math.round(deck.y + (8 + (curve.endDistanceMeters - meters) * 0.13) * view.scale)
    const x = Math.round(deck.x)
    const y = Math.round(deck.y)
    pixelLine(context, x - 6, y + 15, x - 24, foot, dark, 3)
    pixelLine(context, x + 7, y + 15, x + 24, foot, steel, 3)
    pixelLine(context, x - 20, foot - 16, x + 14, y + 32, '#ac8c83', 1)
    pixelLine(context, x + 19, foot - 16, x - 13, y + 32, steel, 1)
    pixelLine(context, x - 22, foot - 6, x + 22, foot - 6, dark, 2)
  }

  const start = view.toScreen(curve.positionAt(0))
  const x = Math.round(start.x)
  const y = Math.round(start.y)
  if (x < -95 || x > paintWidth + 95) return
  const foot = Math.round(y + 30 * view.scale)
  // A tall forked observation mast and light, overhanging start deck.
  pixelLine(context, x - 24, y - 33, x - 38, foot, dark, 4)
  pixelLine(context, x - 9, y - 32, x + 7, foot, steel, 4)
  for (let level = y - 13; level < foot; level += 22) {
    pixelLine(context, x - 25, level, x - 8, level, steel, 2)
    pixelLine(context, x - 25, level, x - 8, level + 21, dark)
  }
  fillPixelPolygon(context, dark, [
    [x - 43, y - 54], [x - 34, y - 64], [x + 14, y - 65],
    [x + 30, y - 55], [x + 27, y - 45], [x - 43, y - 45],
  ])
  context.fillStyle = '#87a6ac'
  context.fillRect(x - 32, y - 59, 46, 8)
  for (let frame = x - 29; frame < x + 15; frame += 9) pixelLine(context, frame, y - 59, frame, y - 50, dark, 2)
  pixelLine(context, x - 42, y - 65, x + 15, y - 66, '#fff0d5', 2)
  pixelLine(context, x + 15, y - 66, x + 31, y - 56, '#d9ad95', 2)
  pixelLine(context, x - 45, y - 44, x + 32, y - 44, '#d0a88e', 2)
}

/**
 * Krawędź progu: stalowy nos wysunięty nad garb. Odstęp nad początkiem
 * zeskoku pochodzi z `tableClearanceMeters` danej skoczni; długość stołu
 * z ostatniego odcinka jej profilu rozbiegu. W skali 1:1 czyta się to jako
 * charakterystyczny „balkon", niewidoczny przy poprzednim zoomie.
 */
function drawTakeoffTable(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  const edge = view.toScreen({ x: 0, y: 0 })
  if (edge.x < -120 || edge.x > paintWidth + 120) return
  const palette = env()
  const curve = hill.inrunCurve
  const keyframes = hill.spec.inrun.keyframes
  const tableStart = curve.positionAt(keyframes[keyframes.length - 2]!.distanceMeters)

  // Spód progu: cienki, stalowy klin pod ostatnimi metrami najazdu, a nie
  // pełna płyta do samego garbu. Grubość 0,9 m to realna konstrukcja stołu.
  const deckTop = view.toScreen(tableStart)
  const deckBottomBack = view.toScreen({ x: tableStart.x, y: tableStart.y - 0.9 })
  const deckBottomFront = view.toScreen({ x: 0, y: -0.75 })
  fillPixelPolygon(context, palette.steelDark, [
    [deckTop.x, deckTop.y],
    [edge.x, edge.y],
    [deckBottomFront.x, deckBottomFront.y],
    [deckBottomBack.x, deckBottomBack.y],
  ])

  // Dwie podpory z progu do garbu — tyle widać z boku pod krawędzią.
  for (const offsetMeters of [-1.2, -4.4]) {
    const top = view.toScreen({ x: offsetMeters, y: -0.6 })
    const footY = view.toScreen({ x: offsetMeters, y: -hill.spec.tableClearanceMeters - 0.4 })
    pixelLine(context, top.x, top.y, footY.x, footY.y, palette.steelMid, 2)
  }

  // Jasna krawędź progu — to od niej mierzy się każdy skok.
  context.fillStyle = COLOR.warm
  context.fillRect(Math.round(edge.x) - 2, Math.round(edge.y) - 2, 3, 3)
}

function drawWorldLandmarks(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  if (hill.spec.id === 'h04-planica-flying') {
    drawPlanicaLandmarks(context, hill, view)
    return
  }
  if (hill.spec.id === 'h02-zakopane-large') {
    drawZakopaneLandmarks(context, hill, view)
    return
  }
  if (hill.spec.id === 'h03-oberstdorf-large') {
    drawSchattenbergLandmarks(context, hill, view)
    return
  }
  const palette = env()
  const drawCabin = (meters: number, widthMeters: number, heightMeters: number, lit: boolean): void => {
    const surface = hill.surfacePositionAt(meters)
    const anchor = view.toScreen(surface)
    const width = Math.round(widthMeters * view.scale)
    const height = Math.round(heightMeters * view.scale)
    if (anchor.x + width < -20 || anchor.x - width > paintWidth + 20) return
    context.fillStyle = palette.steelDark
    context.fillRect(Math.round(anchor.x - width / 2), Math.round(anchor.y - height), width, height)
    context.fillStyle = palette.steelMid
    context.fillRect(Math.round(anchor.x - width / 2), Math.round(anchor.y - height), width, 2)
    if (lit) {
      context.fillStyle = COLOR.warm
      for (let x = Math.round(anchor.x - width / 2 + 5); x < anchor.x + width / 2 - 3; x += 8) {
        context.fillRect(x, Math.round(anchor.y - height + 5), 3, 2)
      }
    }
  }

  // Mała kabina sędziowska w środku zeskoku.
  drawCabin(Math.round(hill.spec.kPointMeters * 0.57), 5.2, 2.7, true)
  if (hill.spec.id === 'h01-lillehammer-normal') {
    // Compact judges' annex and two floodlight masts on the back bank.
    drawCabin(56, 3.2, 3.8, true)
    for (const meters of [38, 76]) {
      const a = view.toScreen(hill.surfacePositionAt(meters))
      const x = Math.round(a.x)
      const top = Math.round(a.y - 8 * view.scale)
      pixelLine(context, x, top, x, a.y, palette.steelMid, 2)
      context.fillStyle = palette.steelDark
      context.fillRect(x - 7, top - 3, 15, 5)
      context.fillStyle = COLOR.warm
      for (let lamp = 0; lamp < 3; lamp += 1) context.fillRect(x - 5 + lamp * 4, top - 2, 2, 2)
    }
  }

  // Bez szerokiej bryły trybuny przy HS: w bocznym ujęciu przecinała zeskok.
  // Linie sportowe są niezależną warstwą w paintTerrain i pozostają bez zmian.

  // Wieża na wybiegu domyka trasę i pomaga ocenić ruch kamery.
  drawCabin(Math.min(hill.spec.outrunEndMeters - 7, hill.spec.fallLineMeters + 15), 3.4, 6.2, false)
}

/** Timber judges' huts, stepped spectators and wind-sculpted banks tied to H02's world. */
function drawZakopaneLandmarks(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  const lodge = (meters: number, widthMeters: number, heightMeters: number): void => {
    const surface = view.toScreen(hill.surfacePositionAt(meters))
    const width = Math.round(widthMeters * view.scale)
    const height = Math.round(heightMeters * view.scale)
    const x = Math.round(surface.x - width / 2)
    // Set the uphill end on the snow; on a steep landing slope the downhill
    // end stands on visible wooden feet instead of disappearing into the bank.
    const y = Math.round(surface.y - width * 0.35)
    if (x > paintWidth + 60 || x + width < -60) return
    for (const postX of [x + 4, x + width - 5]) {
      const worldX = hill.surfacePositionAt(meters).x + (postX - surface.x) / view.scale
      const snowY = view.toScreen({ x: worldX, y: hill.surfaceYAtX(worldX) }).y
      pixelLine(context, postX, y - 1, postX, snowY, '#554b45', 2)
    }
    context.fillStyle = '#554b45'
    context.fillRect(x, y - height, width, height)
    context.fillStyle = '#92715b'
    for (let row = y - height + 4; row < y - 3; row += 5) context.fillRect(x + 2, row, width - 4, 1)
    const roof = Math.round(height * 0.6)
    fillPixelPolygon(context, '#343e42', [
      [x - 7, y - height + 3], [x + Math.round(width / 2), y - height - roof],
      [x + width + 7, y - height + 3], [x + width + 7, y - height + 7], [x - 7, y - height + 7],
    ])
    pixelLine(context, x - 8, y - height + 2, x + Math.round(width / 2), y - height - roof - 1, '#f0ece1', 2)
    pixelLine(context, x + Math.round(width / 2), y - height - roof - 1, x + width + 8, y - height + 2, '#e1e3db', 2)
    for (let offset = 8; offset + 7 < width; offset += 14) {
      context.fillStyle = '#303c41'
      context.fillRect(x + offset, y - height + 10, 7, 8)
      context.fillStyle = '#d9ac70'
      context.fillRect(x + offset + 1, y - height + 11, 5, 5)
      context.fillStyle = '#554b45'
      context.fillRect(x + offset + 3, y - height + 11, 1, 6)
    }
    // Small drift follows the actual slope; it cannot float under the raised hut.
    const bankX = x - 16
    const worldX = hill.surfacePositionAt(meters).x + (bankX - surface.x) / view.scale
    const bankY = Math.round(view.toScreen({ x: worldX, y: hill.surfaceYAtX(worldX) }).y)
    fillPixelPolygon(context, '#d8e3de', [
      [bankX, bankY + 2], [bankX + 5, bankY - 3], [bankX + 13, bankY - 2], [bankX + 20, bankY + 9],
    ])
  }

  lodge(hill.spec.kPointMeters * 0.38, 4.2, 2.5)
  lodge(hill.spec.kPointMeters * 0.61, 2.8, 2.2)

  const standsAt = Math.min(hill.spec.uPointMeters - 5, hill.spec.hillSizeMeters + 18)
  const anchor = view.toScreen(hill.surfacePositionAt(standsAt))
  const x = Math.round(anchor.x - 47)
  // A raised hillside grandstand; the two posts descend independently to
  // the sloped ground, so lower terraces stay above the snow at both ends.
  const y = Math.round(anchor.y - 3 * view.scale)
  if (x > paintWidth + 70 || x + 100 < -70) return
  const p = ZAKOPANE_WINTER_DAY
  // Five ascending terraces, under one steep gabled canopy, not a flat steel box.
  for (let row = 0; row < 5; row += 1) {
    const start = x + row * 5
    const end = x + 96 - row * 3
    const level = y - 8 - row * 7
    pixelLine(context, start, level + 3, end, level + 3, '#424646', 3)
    pixelLine(context, start, level, end, level, '#a27c5b', 2)
    for (let seat = start + 8; seat < end - 4; seat += 11) {
      context.fillStyle = p.crowd[(row + Math.floor(seat / 11)) % p.crowd.length] as string
      context.fillRect(seat, level - 3, 2, 3)
    }
  }
  for (const postX of [x + 4, x + 95]) {
    const worldX = hill.surfacePositionAt(standsAt).x + (postX - anchor.x) / view.scale
    const snowY = view.toScreen({ x: worldX, y: hill.surfaceYAtX(worldX) }).y
    pixelLine(context, postX, y - 47, postX, snowY, '#4b4a44', 2)
  }
  fillPixelPolygon(context, '#444847', [
    [x - 5, y - 46], [x + 44, y - 60], [x + 101, y - 46], [x + 101, y - 42], [x - 5, y - 42],
  ])
  pixelLine(context, x - 6, y - 47, x + 44, y - 62, '#f5f0e4', 2)
  pixelLine(context, x + 44, y - 62, x + 102, y - 47, '#e3e4dc', 2)
}

/** H03: angular Faltenbach-inspired spectator terraces and a separate stream footbridge. */
function drawSchattenbergLandmarks(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  const p = SCHATTENBERG_MORNING
  const standsAt = Math.min(hill.spec.uPointMeters - 13, hill.spec.hillSizeMeters + 32)
  const anchor = view.toScreen(hill.surfacePositionAt(standsAt))
  const x = Math.round(anchor.x)
  const y = Math.round(anchor.y)
  if (x > -115 && x < paintWidth + 115) {
    // Four stepped rows lift away from the snow, opening a void beneath the canopy.
    for (let row = 0; row < 4; row += 1) {
      const left = x - 59 + row * 5
      const right = x + 59 - row * 8
      const level = y - 42 - row * 9
      pixelLine(context, left, level + 3, right, level + 3, p.steelDark, 3)
      pixelLine(context, left, level, right, level, '#a48061', 2)
      for (let seat = left + 7; seat < right - 3; seat += 8) {
        context.fillStyle = p.crowd[(row + Math.floor(seat / 8)) % p.crowd.length] as string
        context.fillRect(seat, level - 4, 3, 3)
      }
    }
    for (const postX of [x - 52, x - 10, x + 51]) {
      const worldX = hill.surfacePositionAt(standsAt).x + (postX - anchor.x) / view.scale
      const groundY = Math.round(view.toScreen({ x: worldX, y: hill.surfaceYAtX(worldX) }).y)
      pixelLine(context, postX, y - 44, postX, groundY, p.steelDark, 3)
      pixelLine(context, postX, y - 48, postX + 21, y - 70, p.steelMid, 1)
    }
    // One long shallow wing roof; H02 has a pitched snow gable instead.
    fillPixelPolygon(context, '#1b353a', [
      [x - 70, y - 78], [x - 29, y - 91], [x + 23, y - 89],
      [x + 70, y - 74], [x + 70, y - 68], [x + 19, y - 82],
      [x - 26, y - 83], [x - 70, y - 72],
    ])
    pixelLine(context, x - 70, y - 79, x - 29, y - 92, '#d8dfcf', 2)
    pixelLine(context, x - 29, y - 92, x + 23, y - 90, '#f0ebd4', 2)
    pixelLine(context, x + 23, y - 90, x + 70, y - 75, '#c2cbbd', 2)
    // A pale horizontal fascia marks the spectator structure without branding.
    context.fillStyle = '#bb8b61'
    context.fillRect(x - 37, y - 82, 69, 3)
  }

  // At the far end of the runout: a footbridge above a stylised stream bank.
  // Both are safely beyond the fall-line marker, whose position remains map-driven.
  const bridgeMeters = Math.min(hill.spec.outrunEndMeters - 35, hill.spec.fallLineMeters + 16)
  const bridge = view.toScreen(hill.surfacePositionAt(bridgeMeters))
  const bx = Math.round(bridge.x)
  const by = Math.round(bridge.y)
  if (bx < -90 || bx > paintWidth + 90) return
  for (const footX of [bx - 53, bx + 53]) {
    const worldX = hill.surfacePositionAt(bridgeMeters).x + (footX - bridge.x) / view.scale
    const groundY = Math.round(view.toScreen({ x: worldX, y: hill.surfaceYAtX(worldX) }).y)
    pixelLine(context, footX, by - 52, footX, groundY, p.steelDark, 3)
    pixelLine(context, footX - 4, by - 53, footX + 4, by - 53, '#a78364', 2)
  }
  fillPixelPolygon(context, '#172e36', [
    [bx - 64, by - 61], [bx - 21, by - 66], [bx + 32, by - 66],
    [bx + 64, by - 61], [bx + 64, by - 56], [bx - 64, by - 56],
  ])
  pixelLine(context, bx - 63, by - 62, bx - 21, by - 67, '#d1c5a6', 2)
  pixelLine(context, bx - 21, by - 67, bx + 32, by - 67, '#d1c5a6', 2)
  pixelLine(context, bx + 32, by - 67, bx + 63, by - 62, '#d1c5a6', 2)
  for (let panel = bx - 52; panel <= bx + 51; panel += 13) {
    pixelLine(context, panel, by - 57, panel, by - 41, p.steelMid, 2)
    pixelLine(context, panel, by - 53, panel + 13, by - 43, '#997453', 1)
  }
  pixelLine(context, bx - 55, by - 41, bx + 55, by - 41, p.steelDark, 3)
  // The brook is a small broken band behind the bridge, not a foreground lake.
  for (let i = 0; i < 5; i += 1) {
    pixelLine(context, bx - 60 + i * 27, by - 13 + (i % 2) * 2, bx - 48 + i * 27, by - 13 + (i % 2) * 2, '#87aaa5', 2)
  }
}

/** H04: low spectator shelves in the valley and wind pennants beyond the steep bowl. */
function drawPlanicaLandmarks(context: CanvasRenderingContext2D, hill: Hill, view: WorldView): void {
  const at = (meters: number): { x: number; y: number } => {
    const point = view.toScreen(hill.surfacePositionAt(meters))
    return { x: Math.round(point.x), y: Math.round(point.y) }
  }
  for (const meters of [96, 287]) {
    const { x, y } = at(meters)
    if (x < -100 || x > paintWidth + 100) continue
    // Bank-side, deliberately short: the athlete, snow and metric lines remain on top.
    for (let row = 0; row < 3; row += 1) {
      const level = y - 30 - row * 7
      pixelLine(context, x - 51 + row * 5, level, x + 31 + row * 5, level - 4, '#1a3545', 3)
      pixelLine(context, x - 49 + row * 5, level - 2, x + 29 + row * 5, level - 6, '#b59589')
      for (let seat = x - 45 + row * 5; seat < x + 25 + row * 5; seat += 9) {
        context.fillStyle = PLANICA_VALLEY.crowd[((row + Math.floor(seat / 9)) % 5 + 5) % 5] as string
        context.fillRect(seat, level - 7, 2, 2)
      }
    }
    for (const post of [x - 49, x + 37]) {
      pixelLine(context, post, y - 31, post, y + 3, '#1a3545', 2)
    }
    // Taut canopy with a pale underside; unlike H03's large wing it hugs the bank.
    fillPixelPolygon(context, '#263b52', [
      [x - 57, y - 60], [x - 13, y - 65], [x + 37, y - 62],
      [x + 41, y - 58], [x - 57, y - 55],
    ])
    pixelLine(context, x - 56, y - 61, x - 13, y - 66, '#f0dac0', 2)
    pixelLine(context, x - 13, y - 66, x + 37, y - 63, '#f0dac0', 2)
  }
  // Small coloured pennants on the flat far outrun, safely after the fall line.
  for (const meters of [365, 380, 395]) {
    const { x, y } = at(meters)
    if (x < -22 || x > paintWidth + 22) continue
    pixelLine(context, x, y - 34, x, y, PLANICA_VALLEY.steelDark, 2)
    fillPixelPolygon(context, meters === 380 ? '#e9a27f' : '#8cc0ca', [
      [x + 1, y - 32], [x + 16, y - 29], [x + 1, y - 23],
    ])
  }
}

function drawTakeoffSignal(context: CanvasRenderingContext2D, view: WorldView, actor: SceneActor, reducedMotion: boolean): void {
  const edge = view.toScreen(actor.hill.markers.tableEdge)
  if (edge.x < -10 || edge.x > VIEW_WIDTH + 10) return
  context.fillStyle = COLOR.warm
  context.fillRect(Math.round(edge.x) - 1, Math.round(edge.y) - 6, 2, 7)
  context.fillStyle = COLOR.red
  context.fillRect(Math.round(edge.x) + 2, Math.round(edge.y) - 5, 2, 3)
  // Tylko idealny timing dostaje sygnał: lekki, deterministyczny rozbryzg
  // śniegu od krawędzi progu. Zwykłe wybicie nie pokazuje fałszywej nagrody.
  const age = recentEvent(actor, 'perfectTakeoff', 24)
  if (age === null) return
  const frame = reducedMotion ? 2 : age
  const particles = [
    [-2, -1], [-4, -3], [-6, -2], [-7, -5], [-9, -3], [-5, -7], [-2, -5],
  ] as const
  for (let index = 0; index < particles.length; index += 1) {
    const [baseX, baseY] = particles[index] as readonly [number, number]
    const drift = Math.floor(frame / 3)
    const x = Math.round(edge.x + baseX - drift * (1 + index % 2))
    const y = Math.round(edge.y + baseY - Math.min(4, Math.floor(frame / 2)) + Math.floor(frame * frame / 40))
    context.fillStyle = index % 3 === 0 ? COLOR.snowShade : COLOR.snow
    context.fillRect(x, y, index === 0 ? 2 : 1, 1)
  }
}

/** Wybrana belka startowa i jej stalowe wsporniki — warstwa dynamiczna, bo numer zmienia jury. */
function drawSelectedStartGate(context: CanvasRenderingContext2D, view: WorldView, actor: SceneActor): void {
  if (actor.gateNumber === undefined) return
  const gate = actor.hill.gate(actor.gateNumber)
  const along = actor.hill.spec.inrun.lengthMeters - gate.inrunLengthMeters
  const point = view.toScreen(actor.hill.inrunCurve.positionAt(along))
  if (point.x < -20 || point.x > VIEW_WIDTH + 20 || point.y < -20 || point.y > VIEW_HEIGHT + 20) return

  // Z boku poprzeczna belka jest krótkim, wyraźnym siedziskiem pod cofniętym
  // biodrem; dwie nogi schodzą do konstrukcji najazdu. Wszystko na pełnych px.
  const pitch = -actor.hill.inrunCurve.slopeRadAt(along)
  const angle = bucketAngle(pitch, ANGLE_RANGE_DEG[0], ANGLE_RANGE_DEG[1], ANGLE_BUCKETS).angleRad
  const hip = POSE_FRAMES.gate[0]!.hip
  // Ta sama kotwica biodra i korekta narty co w bitmapie zawodnika.
  // Obiekt pozostaje przy wybranej belce, także po zakończeniu odepchnięcia.
  const x = Math.round(point.x) + Math.round(hip[0] * Math.cos(angle) - hip[1] * Math.sin(angle))
  const y = Math.round(point.y - 2) + Math.round(-hip[0] * Math.sin(angle) - hip[1] * Math.cos(angle)) + 2
  context.fillStyle = env().steelDark
  context.fillRect(x - 7, y, 13, 3)
  context.fillStyle = COLOR.red
  context.fillRect(x - 7, y, 13, 1)
  context.fillStyle = COLOR.warm
  context.fillRect(x - 6, y, 3, 1)
  // Wsporniki są za torem: śnieg zasłania ich górne odcinki. Schodkowa
  // maska na pełnych pikselach nie dodaje AA na ukośnej krawędzi śniegu.
  context.save()
  context.beginPath()
  for (let column = x - 10; column <= x + 5; column += 1) {
    const snowBottom = Math.round(point.y + (column - point.x) * Math.tan(pitch)) + 3
    context.rect(column, snowBottom, 1, 40)
  }
  context.clip()
  // Stopy dotykają schodów (1,2 m poniżej rozbiegu), nie kończą się w tle.
  const accessDrop = Math.round(1.2 * view.scale)
  const rearFootY = Math.round(point.y + (x - 5 - point.x) * Math.tan(pitch)) + accessDrop
  const frontFootY = Math.round(point.y + (x + 4 - point.x) * Math.tan(pitch)) + accessDrop
  pixelLine(context, x - 5, y + 3, x - 5, rearFootY, env().steelMid, 2)
  pixelLine(context, x + 4, y + 3, x + 4, frontFootY, COLOR.steel, 2)
  pixelLine(context, x - 7, rearFootY, x - 3, rearFootY, env().steelMid, 2)
  pixelLine(context, x + 2, frontFootY, x + 5, frontFootY, COLOR.steel, 2)
  context.restore()
}

/**
 * OKIENNY bufor terenu.
 *
 * Teren jest nieruchomy w świecie — rusza się tylko kamera — więc rysowanie go
 * co klatkę jest czystą stratą: pomiar w przeglądarce dał ~35 ms na klatkę
 * (28 fps) i wywracał limit nadrabiania pętli 120 Hz. Z drugiej strony przy
 * skali 1:1 cała skocznia to ~3500×1700 px (24 MB), więc dawny bufor „na całą
 * skocznię" też odpada.
 *
 * Rozwiązanie: bufor wielkości trzech ekranów, rysowany raz i przesuwany
 * `drawImage`, przebudowywany dopiero gdy kamera dojdzie do jego marginesu —
 * przy 25 m/s zdarza się to rzadziej niż raz na sekundę.
 */
const TERRAIN_BUFFER_WIDTH = VIEW_WIDTH * 2
const TERRAIN_BUFFER_HEIGHT = VIEW_HEIGHT * 2
/** Zapas na krawędzi bufora, po którego przekroczeniu rysujemy go od nowa. */
const TERRAIN_BUFFER_MARGIN_PX = 96

type TerrainBuffer = {
  readonly canvas: HTMLCanvasElement | OffscreenCanvas
  /** Punkt świata odwzorowany na lewy górny róg bufora. */
  readonly originX: number
  readonly originY: number
  readonly scale: number
  readonly key: string
}

let terrainBuffer: TerrainBuffer | null = null

function bufferView(originX: number, originY: number, scale: number): WorldView {
  return {
    scale,
    toScreen: (point) => ({ x: (point.x - originX) * scale, y: (originY - point.y) * scale }),
  }
}

/** Rysuje nieruchomą część sceny w układzie bufora. */
function paintTerrain(
  context: CanvasRenderingContext2D,
  hill: Hill,
  view: WorldView,
  width: number,
  height: number,
): void {
  paintWidth = width
  paintHeight = height
  setPolygonRowLimit(height + 8)
  const surfaces: Array<{ curve: ProfileCurve; window: CurveWindow }> = []
  for (const curve of [hill.landingCurve, hill.outrunCurve]) {
    const window = curveWindow(view, curve, TERRAIN_STEP_METERS)
    if (window) surfaces.push({ curve, window })
  }
  fillTerrainBody(context, view, surfaces)
  drawInrunStructure(context, hill, view)
  drawWorldLandmarks(context, hill, view)

  for (const { curve, window } of surfaces) {
    const back = curve === hill.landingCurve ? 9 : 0
    drawSurfaceBand(context, view, curve, window, COLOR.snowShade, 0, -SNOW_DEPTH_METERS - 0.35, back)
    drawSurfaceBand(context, view, curve, window, COLOR.snow, 0.06, -SNOW_DEPTH_METERS, back)
  }
  const inrunWindow = curveWindow(view, hill.inrunCurve, TERRAIN_STEP_METERS)
  if (inrunWindow) {
    // Estakada pod torem i sam tor: dwa pasy wystarczą. Rowki najazdu
    // (13 cm szerokości, rozstaw 32 cm — ICR 417.1) dają przy 11,6 px/m
    // ułamek piksela, więc osobny pas był kosztem bez efektu.
    drawSurfaceBand(context, view, hill.inrunCurve, inrunWindow, env().steelMid, 0, -0.55)
    drawSurfaceBand(context, view, hill.inrunCurve, inrunWindow, COLOR.snow, 0.04, -0.3)
  }

  drawTakeoffTable(context, hill, view)

  const markers = buildSportMarkers(hill)
  for (const band of markers.sideBands) {
    drawBothSideBands(context, view, hill, band.fromMeters, band.toMeters, colorForBand(band.kind))
  }
  context.textAlign = 'center'
  for (const marker of markers.meterLines) {
    drawSurfaceTick(context, view, hill, marker.meters, 1.05, COLOR.steel, 1)
    const normal = hill.surfaceNormalAt(marker.meters)
    const point = view.toScreen({ x: marker.point.x + normal.x * 1.3, y: marker.point.y + normal.y * 1.3 })
    // H03's pale bowl passes behind the landing track: a one-pixel ink shadow
    // keeps the map-derived metre numerals readable on both stone and firs.
    if (hill.spec.id === 'h03-oberstdorf-large') {
      drawPixelText(context, `${marker.meters}`, point.x + 1, point.y - 3, '#193a3a', 1, 'center')
    }
    label(context, `${marker.meters}`, point.x, point.y + 3, COLOR.text, 6)
  }
  context.textAlign = 'left'
  drawSidePaddles(context, view, hill, markers, false)
  drawNamedSportMarker(context, view, hill, markers.kPoint, 'K', COLOR.blue, false)
  drawNamedSportMarker(context, view, hill, markers.hillSize, 'HS', COLOR.red, false)
  drawNamedSportMarker(context, view, hill, markers.fallLine, 'FALL', COLOR.warm, false)
}

function ensureTerrainBuffer(hill: Hill, view: WorldView, focus: Vec2): TerrainBuffer {
  const key = `${hill.spec.id}:${hill.spec.hillVersion}:${activePaletteFamily}:${view.scale.toFixed(3)}`
  if (terrainBuffer && terrainBuffer.key === key) {
    // Bufor jest ważny, dopóki całe okno kamery mieści się w nim z zapasem.
    const origin = view.toScreen({ x: terrainBuffer.originX, y: terrainBuffer.originY })
    const insideLeft = -origin.x
    const insideTop = -origin.y
    const okX = insideLeft >= TERRAIN_BUFFER_MARGIN_PX
      && TERRAIN_BUFFER_WIDTH - insideLeft - VIEW_WIDTH >= TERRAIN_BUFFER_MARGIN_PX
    const okY = insideTop >= TERRAIN_BUFFER_MARGIN_PX
      && TERRAIN_BUFFER_HEIGHT - insideTop - VIEW_HEIGHT >= TERRAIN_BUFFER_MARGIN_PX
    if (okX && okY) return terrainBuffer
  }

  const canvas = typeof OffscreenCanvas === 'function'
    ? new OffscreenCanvas(TERRAIN_BUFFER_WIDTH, TERRAIN_BUFFER_HEIGHT)
    : Object.assign(document.createElement('canvas'), { width: TERRAIN_BUFFER_WIDTH, height: TERRAIN_BUFFER_HEIGHT })
  const context = canvas.getContext('2d') as CanvasRenderingContext2D
  context.imageSmoothingEnabled = false
  context.clearRect(0, 0, TERRAIN_BUFFER_WIDTH, TERRAIN_BUFFER_HEIGHT)
  // Bufor NIE jest centrowany na zawodniku, tylko przesunięty w stronę, w którą
  // on jedzie (w prawo i w dół) — zapas z przodu jest wtedy dwa razy większy,
  // więc przebudowa zdarza się o połowę rzadziej. Każda przebudowa to jedna
  // droższa klatka, a te wchodzą w limit nadrabiania pętli 120 Hz.
  const originX = focus.x - (TERRAIN_BUFFER_WIDTH * 0.28) / view.scale
  const originY = focus.y + (TERRAIN_BUFFER_HEIGHT * 0.28) / view.scale
  paintTerrain(
    context,
    hill,
    bufferView(originX, originY, view.scale),
    TERRAIN_BUFFER_WIDTH,
    TERRAIN_BUFFER_HEIGHT,
  )
  paintWidth = VIEW_WIDTH
  paintHeight = VIEW_HEIGHT
  setPolygonRowLimit(VIEW_HEIGHT + 8)
  terrainBuffer = { canvas, originX, originY, scale: view.scale, key }
  return terrainBuffer
}

function drawProductionTerrain(
  context: CanvasRenderingContext2D,
  actor: SceneActor,
  view: WorldView,
  state: TrainingSceneState,
): void {
  const hill = actor.hill
  const buffer = ensureTerrainBuffer(hill, view, actor.position)
  const origin = view.toScreen({ x: buffer.originX, y: buffer.originY })
  context.drawImage(buffer.canvas, Math.round(origin.x), Math.round(origin.y))

  // Markery zależne od żywego stanu (wiatr, cel prowadzenia, rekord) nie mogą
  // trafić do bufora — rysują się co klatkę, ale to kilka kresek.
  const dynamicMarkers = buildSportMarkers(hill, {
    leadingTargetHalfMeters: state.leadingTargetHalfMeters,
    recordHalfMeters: state.recordHalfMeters,
  })
  context.textAlign = 'center'
  drawDynamicMarkers(context, view, hill, dynamicMarkers)
  context.textAlign = 'left'

  drawJumperShadow(context, view, actor)
}

/** Płaski, ciemny cień rzutowany na śnieg pod skoczkiem (opcja E, REPORT.md §5). */
function drawJumperShadow(context: CanvasRenderingContext2D, view: WorldView, actor: SceneActor): void {
  const curve = actor.position.x <= actor.hill.landingCurve.lastPoint.x
    ? actor.hill.landingCurve
    : actor.hill.outrunCurve
  const groundY = curve.surfaceYAtX(actor.position.x)
  const heightAboveSurface = Math.max(0, actor.position.y - groundY)
  if (heightAboveSurface > 36) return
  const meters = curve.distanceAtPoint({ x: actor.position.x, y: groundY })
  const tangent = curve.tangentAt(meters)
  const ground = view.toScreen(curve.positionAt(meters))
  const fade = Math.max(0.12, 1 - heightAboveSurface / 36)
  const halfLength = Math.max(3, 9 - heightAboveSurface * 0.14)
  const halfDepth = Math.max(1, 2.2 * fade)
  const tangentScreen = { x: tangent.x, y: -tangent.y }
  const normalScreen = { x: -tangentScreen.y, y: tangentScreen.x }
  const points: Array<[number, number]> = [
    [ground.x - tangentScreen.x * halfLength, ground.y - tangentScreen.y * halfLength],
    [ground.x - normalScreen.x * halfDepth, ground.y - normalScreen.y * halfDepth],
    [ground.x + tangentScreen.x * halfLength, ground.y + tangentScreen.y * halfLength],
    [ground.x + normalScreen.x * halfDepth, ground.y + normalScreen.y * halfDepth],
  ]
  fillPixelPolygon(context, `rgba(7, 17, 31, ${(0.5 * fade).toFixed(2)})`, points)
}

/**
 * Tryskający śnieg przy kontakcie nart z podłożem — jedyny nowy efekt
 * odczucia skoku (rozbieżność #8, REPORT.md PKG-007 §4). Czysta funkcja
 * fazy/wysokości/ticku, bez stanu między klatkami i bez zmiany fizyki.
 */
function recentEvent(actor: SceneActor, type: string, durationTicks: number): number | null {
  const event = [...(actor.events ?? [])].reverse().find((candidate) => candidate.type === type && actor.tick >= candidate.tick)
  if (!event || actor.tick - event.tick > durationTicks) return null
  return actor.tick - event.tick
}

function drawContactSpray(context: CanvasRenderingContext2D, view: WorldView, actor: SceneActor, reducedMotion: boolean): void {
  if (reducedMotion) return
  const fallAge = recentEvent(actor, 'fall', 18)
  const contactAge = recentEvent(actor, 'contact', 13)
  const age = fallAge ?? contactAge
  if (age === null) return
  const heavy = fallAge !== null
  const curve = actor.position.x <= actor.hill.landingCurve.lastPoint.x ? actor.hill.landingCurve : actor.hill.outrunCurve
  const groundY = curve.surfaceYAtX(actor.position.x)
  const meters = curve.distanceAtPoint({ x: actor.position.x, y: groundY })
  const tangent = curve.tangentAt(meters)
  const normal = curve.normalAt(meters)
  const ground = view.toScreen(curve.positionAt(meters))
  const count = heavy ? 12 : 7
  for (let index = 0; index < count; index += 1) {
    const spread = 3 + ((index * 7 + age * 2) % (heavy ? 16 : 10))
    const lift = 1 + ((index * 5 + age) % (heavy ? 8 : 5))
    const dx = -tangent.x * spread + normal.x * lift
    const dy = tangent.y * spread - normal.y * lift
    context.fillStyle = index % 3 === 0 ? 'rgba(243, 234, 209, 0.85)' : 'rgba(231, 240, 239, 0.6)'
    context.fillRect(Math.round(ground.x + dx), Math.round(ground.y + dy), 1, 1)
  }
}

// --- P42: bank klatek skoczka (dyskretny, bez ciągłej rotacji proceduralnej) -

export type JumperPose =
  | 'gate'
  | 'gatePush'
  | 'inrun'
  | 'takeoff'
  | 'flight'
  | 'landingPrep'
  | 'landingParallel'
  | 'landingDeep'
  | 'supportOne'
  | 'supportTwo'
  | 'outrun'
  | 'fall'

export const JUMPER_ART_VERSION = 'pkg008-jumper-solid-silhouette-8'
export const JUMPER_ART_SCALE = { skiPixels: 29, standingPixels: 22 } as const

/** Budżet klatek na fazę — decyzja #7 (4 / 6-8 / 4+3 / 2-3 / 2-3). */
export const JUMPER_POSE_FRAME_COUNTS: Readonly<Record<JumperPose, number>> = {
  gate: 1,
  gatePush: 4,
  inrun: 3,
  takeoff: 6,
  flight: 8,
  // `landingPrep` łączy budżet „przygotowanie” (4) i „lądowanie” (3): faza
  // Contact jest w tym samym synchronicznym kroku nadpisywana na Outrun/Fall
  // (REPORT.md PKG-007 §4 #12) i nie jest obserwowalna przez renderer, więc
  // trzy klatki „lądowania” to końcowe klatki podejścia w obrębie LandingPrep.
  // Numer klatki bierze się tu z wysokości nad zeskokiem, nie z pochylenia —
  // patrz `jumperFrame`.
  landingPrep: 7,
  landingParallel: 7,
  landingDeep: 5,
  supportOne: 3,
  supportTwo: 3,
  outrun: 3,
  fall: 3,
}

const RAD_PER_DEG = Math.PI / 180

type SupportTwoVariant = 'front' | 'back'

/** Only recorded contact data: identical in live play and replay, at every age. */
export function supportTwoVariant(actor: SceneActor): SupportTwoVariant {
  const contact = [...(actor.events ?? [])].reverse().find((event) => event.type === 'contact')
  // Prefer the recorded precision even when live contact contains more decimals.
  const meters = Number(contact?.detail?.match(/^([\d.]+) m/)?.[1] ?? 0)
  let hash = Math.imul((contact?.tick ?? 0) ^ Math.round(meters * 2), 0x45d9f3b)
  hash = Math.imul(hash ^ (hash >>> 16) ^ (actor.gateNumber ?? 0), 0x45d9f3b)
  return ((hash ^ (hash >>> 16)) & 1) === 0 ? 'front' : 'back'
}

function jumperPose(actor: SceneActor): JumperPose {
  if (actor.phase === 'Fall' || actor.phase === 'FallSettled') return 'fall'
  if (actor.phase === 'GateGreen') return 'gate'
  if (actor.phase === 'Inrun' && recentEvent(actor, 'gateOpen', 27) !== null) return 'gatePush'
  if (actor.phase === 'Inrun') return 'inrun'
  if (actor.phase === 'Takeoff') return 'takeoff'
  if (actor.phase === 'Flight') return 'flight'
  if (actor.phase === 'LandingPrep') return actor.landingStyle === 'parallel' ? 'landingParallel' : 'landingPrep'
  if (actor.phase === 'Outrun') {
    const supportEvent = [...(actor.events ?? [])].reverse().find(
      (candidate) => candidate.type === 'handSupport' && actor.tick >= candidate.tick && actor.tick - candidate.tick <= 72,
    )
    if (supportEvent) return supportEvent.detail?.includes('obie') ? 'supportTwo' : 'supportOne'
    // Wyłącznie oprawa: wiek kontaktu i zapisane dane, bez wpływu na wynik.
    // Replay zachowuje szczegóły zdarzeń, więc nie potrzebuje nowego formatu.
    const contact = [...(actor.events ?? [])].reverse().find((event) => event.type === 'contact' && event.tick <= actor.tick)
    const prep = [...(actor.events ?? [])].reverse().find((event) => event.type === 'landingPrep' && event.tick <= (contact?.tick ?? actor.tick))
    const height = Number(prep?.detail?.match(/wysokość ([\d.]+) m/)?.[1] ?? 0)
    const meters = actor.contact?.distanceMeters ?? Number(contact?.detail?.match(/^([\d.]+) m/)?.[1] ?? 0)
    const parallel = actor.landingStyle === 'parallel' || contact?.detail?.includes('styl parallel')
    if (parallel && contact && actor.tick - contact.tick <= 72
      && (height >= 6 || meters > actor.hill.spec.hillSizeMeters)) return 'landingDeep'
  }
  // Contact znika w tym samym kroku symulacji. Przez pierwsze ticki odjazdu
  // zachowujemy końcową sylwetkę wybranego lądowania, dopiero potem obie
  // ścieżki przechodzą do wspólnego, spokojnego odjazdu.
  if (actor.phase === 'Outrun' && recentEvent(actor, 'contact', actor.landingStyle === 'telemark' ? 54 : 18) !== null) {
    if (actor.landingStyle === 'parallel') return 'landingParallel'
    if (actor.landingStyle === 'telemark') return 'landingPrep'
  }
  return 'outrun'
}

function bucketAngle(valueRad: number, minDeg: number, maxDeg: number, count: number): { index: number; angleRad: number } {
  if (count <= 1) return { index: 0, angleRad: ((minDeg + maxDeg) / 2) * RAD_PER_DEG }
  const min = minDeg * RAD_PER_DEG
  const max = maxDeg * RAD_PER_DEG
  const t = Math.max(0, Math.min(1, (valueRad - min) / (max - min)))
  const index = Math.min(count - 1, Math.floor(t * count))
  const bucketWidth = (max - min) / count
  const angleRad = min + bucketWidth * (index + 0.5)
  return { index, angleRad }
}

/**
 * Kubełki kąta narty wspólne dla wszystkich póz. Kąt jest zapieczony w bitmapie,
 * więc musi wchodzić do klucza cache'u — inaczej pierwsza klatka danej pozy
 * zamraża swoje nachylenie na całą sesję (tak było przed tą rundą: sylwetka na
 * rozbiegu trzymała kąt z pierwszego ticku mimo krzywej przejściowej).
 */
const ANGLE_BUCKETS = 20
const ANGLE_RANGE_DEG: [number, number] = [-52, 52]

/** Zwraca dyskretny numer klatki, kubełek kąta i reprezentatywny kąt sylwetki. */
function jumperFrame(
  actor: SceneActor,
  heightAboveSurface: number,
  reducedMotion = false,
): { pose: JumperPose; frameIndex: number; angleIndex: number; angleRad: number } {
  const pose = jumperPose(actor)
  const count = JUMPER_POSE_FRAME_COUNTS[pose]
  const edgeAge = recentEvent(actor, 'takeoffEdge', 54)
  const flightSeconds = actor.flightSeconds ?? (edgeAge === null ? undefined : edgeAge / 120)
  // Fizyka przełącza pitch na kąt lotu od razu. Grafika kontynuuje styczną
  // progu i dopiero podczas wyprostu dochodzi do niego — bez szarpnięcia w tył.
  const transition = pose === 'flight' && flightSeconds !== undefined
    ? Math.max(0, Math.min(1, flightSeconds / 0.45)) : 1
  const tablePitch = -actor.hill.inrunCurve.slopeRadAt(actor.hill.inrunCurve.endDistanceMeters)
  const visualPitch = tablePitch + (actor.pitchRad - tablePitch) * transition
  const angle = bucketAngle(visualPitch, ANGLE_RANGE_DEG[0], ANGLE_RANGE_DEG[1], ANGLE_BUCKETS)
  const frame = (frameIndex: number) => ({ pose, frameIndex, angleIndex: angle.index, angleRad: angle.angleRad })

  if (pose === 'inrun' || pose === 'outrun') {
    if (pose === 'inrun' && recentEvent(actor, 'gateOpen', 37) !== null) return frame(0)
    // Tor pochylenia jest tu prawie stały — cykl klatek idzie po ticku
    // (powolne, powtarzalne kołysanie kuca/postawy), nie po kącie.
    return frame(reducedMotion ? 1 : Math.floor(actor.tick / 10) % count)
  }
  if (pose === 'gate') return frame(0)
  if (pose === 'gatePush') {
    const age = recentEvent(actor, 'gateOpen', 27) ?? 0
    return frame(Math.min(count - 1, Math.floor(age / 7)))
  }
  if (pose === 'fall') {
    // Upadek jest jednokierunkowy: po zakończeniu krótkiego okna efektów nie
    // wolno wracać z klatki 2 do 0 przed przejściem do FallSettled.
    const event = [...(actor.events ?? [])].reverse().find((candidate) => candidate.type === 'fall' && actor.tick >= candidate.tick)
    const age = event ? actor.tick - event.tick : 0
    return frame(actor.phase === 'FallSettled' ? count - 1 : Math.min(count - 1, Math.floor(age / 8)))
  }
  if (pose === 'supportOne' || pose === 'supportTwo') {
    const age = recentEvent(actor, 'handSupport', 72) ?? 0
    return frame(Math.min(count - 1, Math.floor(age / 24)))
  }
  if (pose === 'landingDeep') {
    const age = recentEvent(actor, 'contact', 72) ?? 0
    return frame(age < 8 ? 0 : age < 18 ? 1 : age < 42 ? 2 : age < 56 ? 3 : 4)
  }
  if (pose === 'takeoff') {
    // Wyprost jest ruchem, nie pochodną kąta stołu (ten jest prawie stały).
    // W żywej symulacji śledzimy trwający 0,21 s impuls; replay bez tego
     // pola dostaje stabilny fallback z położenia na progu danej skoczni.
     const keyframes = actor.hill.spec.inrun.keyframes
     const tableMeters = actor.hill.spec.inrun.lengthMeters - keyframes[keyframes.length - 2]!.distanceMeters
     const progress = actor.impulseElapsedSeconds === undefined
       ? Math.max(0, Math.min(1, (actor.position.x + tableMeters) / tableMeters))
      : Math.max(0, Math.min(1, actor.impulseElapsedSeconds / 0.21))
    return frame(Math.min(count - 1, Math.floor(progress * count)))
  }
  if (pose === 'flight') {
    // Pierwsze 0,45 s domyka wyprost z progu do pozycji lotnej (ok. 75°→28°).
    // Potem sylwetka pozostaje spokojna i zwarta, a sterowanie zmienia kąt całej
    // narty/pozy, nie anatomię zawodnika.
    if (flightSeconds !== undefined) {
      const progress = Math.max(0, Math.min(1, flightSeconds / 0.45))
      return frame(Math.min(count - 1, Math.floor(progress * count)))
    }
  }
  if (pose === 'landingPrep' || pose === 'landingParallel') {
    // Oba warianty rozwijają się z WYSOKOŚCI nad zeskokiem. Mają wspólny
    // zegar, lecz osobne, jawne banki klatek: telemark rozsuwa narty wzdłużnie,
    // parallel ugina oba kolana razem bez pól backBoot/backSki.
    const progress = Math.max(0, Math.min(1, 1 - heightAboveSurface / 9))
    return frame(Math.min(count - 1, Math.floor(progress * count)))
  }
  return frame(bucketAngle(actor.pitchRad, -26, 46, count).index)
}

/** Stabilny, obserwowalny wybór klatki dla testów przeglądarkowych i replaya. */
export function jumperVisualFrame(actor: SceneActor, reducedMotion = false): { pose: JumperPose; frameIndex: number } {
  const groundY = actor.hill.surfaceYAtX(actor.position.x)
  const selected = jumperFrame(actor, Math.max(0, actor.position.y - groundY), reducedMotion)
  return { pose: selected.pose, frameIndex: selected.frameIndex }
}

// --- P42 runda „świeże oczy": sylwetka budowana z brył, nie z kresek --------
//
// Diagnoza starego banku (patrz dowody `pkg008-crop-skoczek-*.png`): wszystko
// wychodziło z JEDNEGO punktu (`feet`) i było rysowane 2-3-pikselowymi liniami
// pod niemal tym samym kątem co narta, więc narta przechodziła przez tułów i
// całość czytała się jako jedna ukośna kreska. Referencja (SJ3 `s0A` klatka 1,
// `s16`) robi to inaczej i to jest wzorzec tej przebudowy:
//
//   1. narta to CIENKA, JASNA linia leżąca na śniegu, wystająca daleko przed
//      i za sylwetkę — pod ciałem, nigdy przez nie;
//   2. ciało to ZWARTA BRYŁA nad nartą (wypełnione czworokąty kończyn, nie
//      kreski), z tłem widocznym między nartą a biodrem;
//   3. na rozbiegu tułów leży prawie równolegle do nart, biodra z tyłu, kolana
//      przed butem, głowa nisko z przodu — głęboki kuc, nie postawa stojąca;
//   4. ręce idą WZDŁUŻ tułowia do tyłu, dłonie przy biodrach (jedyny wyjątek to
//      lądowanie: ręce na zewnątrz dla równowagi — `real-telemark-landing-side.jpg`);
//   5. całość dostaje 1-pikselowy ciemny obrys z maski alfa, żeby sylwetka
//      czytała się i na śniegu, i na nocnym niebie (dyscyplina kontrastu DSJ2).

const FRAME_SIZE = 72
const FRAME_ANCHOR = { x: 36, y: 46 }
const frameCache = new Map<string, HTMLCanvasElement | OffscreenCanvas>()

/**
 * Jeden współdzielony bufor roboczy na składanie klatki i obrys. `getImageData`
 * na płótnie akcelerowanym GPU to odczyt zwrotny z pamięci karty, więc
 * deklarujemy `willReadFrequently` (bufor po stronie CPU) i używamy wciąż tego
 * samego płótna, zamiast alokować nowe na każdą klatkę banku. Pomiar w
 * przeglądarce na pełnym skoku: p50 17,6 ms, p99 18,9 ms, maks. 20,4 ms,
 * zero klatek powyżej progu przeciążenia 66,7 ms.
 */
let scratchCanvas: HTMLCanvasElement | OffscreenCanvas | null = null
let scratchContext: CanvasRenderingContext2D | null = null

function makeFrameCanvas(): HTMLCanvasElement | OffscreenCanvas {
  return typeof OffscreenCanvas === 'function'
    ? new OffscreenCanvas(FRAME_SIZE, FRAME_SIZE)
    : Object.assign(document.createElement('canvas'), { width: FRAME_SIZE, height: FRAME_SIZE })
}

function frameScratch(): CanvasRenderingContext2D | null {
  if (scratchContext) {
    scratchContext.clearRect(0, 0, FRAME_SIZE, FRAME_SIZE)
    return scratchContext
  }
  scratchCanvas = makeFrameCanvas()
  const context = scratchCanvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D | null
  if (!context) return null
  context.imageSmoothingEnabled = false
  scratchContext = context
  return context
}

/** Barwy sylwetki — wyłącznie odcienie już obecne w palecie pakietu. */
const SUIT = {
  outline: '#07111f',
  main: '#d64d53',
  shade: '#8c2f3e',
  light: '#f3ead1',
  skin: '#f1bd79',
  skiNear: '#f6cf69',
  skiFar: '#c1903f',
} as const

/** Punkt w układzie narty: `u` wzdłuż nart (w przód), `v` prostopadle w górę. */
type SkiPoint = readonly [number, number]

/**
 * Jedna poza w układzie narty. Wszystkie wartości są w pikselach bufora 480×270,
 * liczone od punktu styku buta z nartą (0, 0) — dlatego „narta pod ciałem" jest
 * własnością danych, a nie szczęśliwym trafem rysowania.
 */
type PoseShape = {
  readonly skiFrom: number
  readonly skiTo: number
  readonly boot: SkiPoint
  readonly knee: SkiPoint
  readonly hip: SkiPoint
  readonly chest: SkiPoint
  readonly head: SkiPoint
  readonly elbow: SkiPoint
  readonly hand: SkiPoint
  /** Ręka dalsza — domyślnie towarzyszy bliższej; przy lądowaniu idzie w tył. */
  readonly farElbow?: SkiPoint
  readonly farHand?: SkiPoint
  /** Telemark: druga noga i druga narta przesunięte w tył. */
  readonly backBoot?: SkiPoint
  readonly backKnee?: SkiPoint
  readonly backSkiFrom?: number
  readonly backSkiTo?: number
  /** Rozwarcie V na czubku dalszej narty (px). 0 = narty równoległe w torach. */
  readonly vTip?: number
  /** Lądowanie R: drugi komplet narta/noga dokładnie równolegle, bez wykroku. */
  readonly parallelPair?: true
}

function pose(
  ski: readonly [number, number], boot: SkiPoint, knee: SkiPoint, hip: SkiPoint,
  chest: SkiPoint, head: SkiPoint, elbow: SkiPoint, hand: SkiPoint,
  details: Partial<PoseShape> = {},
): PoseShape {
  return { skiFrom: ski[0], skiTo: ski[1], boot, knee, hip, chest, head, elbow, hand, ...details }
}

/** Jawny, ręcznie dopracowany bank klatek. Żadna klatka nie powstaje przez interpolację. */
const POSE_FRAMES: Record<JumperPose, readonly PoseShape[]> = {
  gate: [
    // Pozycja na belce: biodra cofnięte i nisko nad siedziskiem, narty już
    // w torach, tułów podniesiony względem zwartej pozycji najazdowej.
    pose([-12, 17], [0, 1.2], [4.0, 5.3], [-5.2, 8.0], [-8.5, 14.0], [-9.0, 17.0], [-10.0, 11.5], [-8.0, 7.0]),
  ],
  gatePush: [
    pose([-12, 17], [0, 1.2], [4.0, 5.3], [-5.2, 8.0], [-8.5, 14.0], [-9.0, 17.0], [-10.0, 11.5], [-8.0, 7.0]),
    pose([-12, 17], [0, 1.2], [4.4, 5.0], [-3.8, 8.3], [-4.0, 12.5], [-2.0, 15.0], [-7.0, 10.5], [-8.0, 7.0]),
    pose([-12, 17], [0, 1.2], [4.6, 4.7], [-2.8, 7.8], [0.5, 10.2], [4.0, 11.5], [-3.0, 9.0], [-5.0, 6.8]),
    pose([-12, 17], [0, 1.2], [4.5, 4.4], [-2.3, 7.2], [4.6, 8.0], [9.0, 8.2], [1.9, 7.3], [-1.9, 6.7]),
  ],
  inrun: [
    pose([-12, 17], [0, 1.2], [4.5, 4.4], [-2.3, 7.2], [4.6, 8.0], [9.0, 8.2], [1.9, 7.3], [-1.9, 6.7]),
    pose([-12, 17], [0, 1.2], [4.9, 4.8], [-2.0, 7.8], [5.2, 8.7], [9.7, 8.9], [2.5, 7.9], [-1.4, 7.2]),
    pose([-12, 17], [0, 1.2], [4.6, 4.5], [-2.2, 7.4], [4.8, 8.2], [9.3, 8.4], [2.1, 7.5], [-1.7, 6.9]),
  ],
  takeoff: [
    pose([-11, 18], [0, 1.2], [4.6, 4.5], [-2.2, 7.3], [4.8, 8.1], [9.2, 8.2], [2.1, 7.4], [-1.7, 6.8], { vTip: 0 }),
    pose([-11, 18], [0, 1.2], [4.3, 5.0], [-1.5, 8.0], [4.6, 9.5], [8.8, 10.0], [2.0, 8.4], [-1.3, 7.2], { vTip: 0 }),
    pose([-10, 19], [0, 1.2], [3.9, 5.5], [-0.8, 9.0], [4.3, 11.8], [8.0, 12.8], [2.1, 10.1], [-0.8, 8.1], { vTip: 0.2 }),
    pose([-10, 19], [0, 1.2], [3.3, 6.0], [0.0, 10.1], [4.0, 14.2], [7.0, 15.8], [2.2, 12.0], [-0.3, 9.4], { vTip: 0.3 }),
    pose([-9, 20], [0, 1.2], [2.7, 6.4], [0.7, 11.0], [3.5, 16.6], [5.9, 18.7], [2.0, 13.9], [0.0, 10.7], { vTip: 0.5 }),
    pose([-9, 20], [0, 1.2], [2.1, 6.6], [1.2, 11.8], [3.1, 18.5], [4.9, 21.0], [1.8, 15.3], [0, 11.8], { vTip: 0.7 }),
  ],
  flight: [
    pose([-9, 20], [0, 1.2], [2.1, 6.6], [1.2, 11.8], [3.1, 18.5], [4.9, 21.0], [1.8, 15.3], [0, 11.8], { vTip: 0.7 }),
    pose([-9, 20], [0, 1.2], [2.6, 6.2], [2.2, 10.9], [4.5, 17.1], [6.8, 19.3], [2.9, 14.2], [0.9, 10.9], { vTip: 0.9 }),
    pose([-9, 20], [0, 1.2], [3.1, 5.8], [3.5, 9.9], [6.2, 15.5], [8.8, 17.5], [4.4, 12.8], [2.2, 9.7], { vTip: 1.1 }),
    pose([-8, 21], [0, 1.2], [3.7, 5.2], [5.0, 8.7], [8.4, 13.8], [11.4, 15.5], [6.3, 11.1], [3.8, 8.6], { vTip: 1.2 }),
    pose([-8, 21], [0, 1.2], [4.3, 4.6], [6.5, 7.6], [11.1, 12.0], [14.3, 13.5], [8.7, 9.7], [5.6, 7.5], { vTip: 1.2 }),
    pose([-8, 21], [0, 1.2], [4.8, 3.8], [7.8, 6.3], [13.5, 10.2], [16.9, 11.6], [10.6, 8.0], [7.3, 6.2], { vTip: 1.1 }),
    pose([-8, 21], [0, 1.2], [5.1, 3.0], [9.0, 4.9], [15.5, 8.6], [19.0, 9.9], [12.0, 6.5], [8.5, 5.0], { vTip: 1.0 }),
    pose([-8, 21], [0, 1.2], [5.2, 2.5], [9.8, 3.8], [16.8, 7.5], [20.2, 8.8], [12.8, 5.4], [9.2, 4.2], { vTip: 0.9 }),
  ],
  landingPrep: [
    pose([-8, 21], [0, 1.2], [5.2, 2.5], [9.8, 3.8], [16.8, 7.5], [20.2, 8.8], [12.8, 5.4], [9.2, 4.2], { vTip: 0.8 }),
    pose([-8, 21], [0, 1.2], [5.2, 3.0], [9.0, 4.8], [15.2, 8.8], [18.5, 10.4], [12.2, 7.0], [9.0, 5.1], { vTip: 0.6 }),
    pose([-9, 20], [0, 1.2], [5.1, 3.7], [8.0, 6.0], [13.3, 10.6], [16.2, 12.5], [11.5, 9.6], [10.5, 11.8], { farElbow: [8.1, 9.4], farHand: [6.1, 11.2], vTip: 0.4 }),
    pose([-9, 20], [0, 1.2], [5.0, 4.4], [6.5, 7.5], [10.5, 12.8], [12.9, 15.2], [10.2, 13.6], [13.0, 15.6], { farElbow: [6.8, 13.1], farHand: [4.4, 15.0], vTip: 0.2 }),
    pose([-9, 20], [1.0, 1.2], [5.0, 5.4], [4.8, 8.8], [7.6, 14.4], [9.8, 17.1], [8.4, 15.6], [11.7, 17.5], { backBoot: [-0.7, 1.2], backKnee: [-1.8, 4.8], backSkiFrom: -12, backSkiTo: 17, farElbow: [4.0, 15.4], farHand: [1.1, 17.1], vTip: 0 }),
    pose([-10, 19], [1.8, 1.2], [4.8, 6.4], [2.4, 9.8], [5.0, 15.4], [7.1, 18.3], [7.6, 16.6], [11.0, 18.7], { backBoot: [-1.3, 1.2], backKnee: [-3.1, 5.0], backSkiFrom: -13, backSkiTo: 16, farElbow: [1.8, 16.5], farHand: [-1.1, 18.4], vTip: 0 }),
    pose([-10, 19], [2.3, 1.2], [4.5, 7.1], [0, 10.5], [3.0, 16.0], [5.1, 19.0], [7.1, 17.1], [11, 19], { backBoot: [-1.7, 1.2], backKnee: [-4.1, 5.1], backSkiFrom: -14, backSkiTo: 15, farElbow: [0.2, 17.2], farHand: [-2.8, 19], vTip: 0 }),
  ],
  // R — obie narty mają ten sam zakres 29 px i pozostają równoległe. Druga
  // noga jest rysowana przez `parallelPair` z tym samym położeniem buta/kolana,
  // tylko o jeden piksel głębiej; żadna klatka nie używa telemarkowych pól
  // backBoot/backKnee/backSki.
  landingParallel: [
    pose([-8, 21], [0, 1.2], [5.2, 2.5], [9.8, 3.8], [16.8, 7.5], [20.2, 8.8], [12.8, 5.4], [9.2, 4.2], { parallelPair: true }),
    pose([-8, 21], [0, 1.2], [5.0, 3.2], [8.8, 5.2], [14.8, 9.2], [18.0, 10.8], [11.8, 7.2], [8.8, 5.3], { parallelPair: true }),
    pose([-9, 20], [0, 1.2], [4.8, 4.1], [7.3, 6.8], [12.1, 11.2], [15.0, 13.2], [10.5, 10.0], [9.0, 11.8], { farElbow: [7.4, 9.8], farHand: [5.2, 11.7], parallelPair: true }),
    pose([-9, 20], [0, 1.2], [4.4, 5.1], [5.8, 8.6], [9.3, 13.7], [11.8, 16.2], [9.5, 14.3], [12.5, 16.1], { farElbow: [6.1, 14.0], farHand: [3.2, 15.9], parallelPair: true }),
    pose([-10, 19], [0, 1.2], [4.0, 6.0], [3.7, 10.0], [6.2, 15.5], [8.3, 18.4], [7.1, 16.6], [10.5, 18.5], { farElbow: [3.7, 16.4], farHand: [0.5, 18.2], parallelPair: true }),
    pose([-10, 19], [0, 1.2], [4.8, 5.4], [3.4, 8.5], [5.5, 13.9], [7.6, 16.8], [7.2, 15.0], [10.6, 16.8], { farElbow: [3.0, 14.9], farHand: [-0.1, 16.5], parallelPair: true }),
    pose([-10, 19], [0, 1.2], [4.5, 5.8], [3.1, 9.2], [5.2, 14.8], [7.2, 17.8], [7.0, 15.9], [10.4, 17.8], { farElbow: [2.7, 15.8], farHand: [-0.4, 17.5], parallelPair: true }),
  ],
  landingDeep: [
    pose([-10, 19], [0, 1.2], [4.8, 5.4], [2.2, 7.8], [5.0, 13.0], [7.2, 16.0], [8, 13], [11, 15], { farElbow: [2, 13], farHand: [-1, 15], parallelPair: true }),
    pose([-10, 19], [0, 1.2], [5.3, 4.5], [-0.8, 5.7], [4.4, 9.7], [7.6, 12.2], [8, 10], [12, 12], { farElbow: [1, 10], farHand: [-3, 12], parallelPair: true }),
    pose([-10, 19], [0, 1.2], [5.5, 3.8], [-2.5, 4.1], [3.6, 7.5], [7, 10], [7.5, 8], [11.5, 10], { farElbow: [0, 8], farHand: [-4, 10], parallelPair: true }),
    pose([-10, 19], [0, 1.2], [5, 4.8], [-0.5, 6.5], [3.5, 11.4], [6, 14.3], [7, 12], [10, 14], { farElbow: [0, 12], farHand: [-3, 14], parallelPair: true }),
    pose([-10, 19], [0, 1.2], [3.8, 5.8], [1.2, 9], [2.5, 15], [4, 18], [5, 14], [7, 13], { farElbow: [0, 14], farHand: [-2, 13], parallelPair: true }),
  ],
  // Podpórka po kontakcie: narty zostają pod zawodnikiem, a dłoń/dłonie
  // rzeczywiście dochodzą do powierzchni. Trzy klatki pokazują dotknięcie,
  // utrzymanie i odzyskanie równowagi bez zamiany zdarzenia w upadek.
  supportOne: [
    pose([-10, 19], [0, 1], [5, 4], [-1, 6], [6, 8], [10, 10], [11, 5], [10, 0], { farElbow: [1, 11], farHand: [-4, 12], parallelPair: true }),
    pose([-10, 19], [0, 1], [5, 3], [-2, 4], [5, 6], [9, 8], [10, 4], [10, 0], { farElbow: [0, 9], farHand: [-5, 10], parallelPair: true }),
    pose([-10, 19], [0, 1], [4, 5], [0, 8], [5, 12], [8, 15], [10, 9], [11, 5], { farElbow: [1, 13], farHand: [-3, 14], parallelPair: true }),
  ],
  supportTwo: [
    pose([-10, 19], [0, 1], [5, 4], [-2, 5], [5, 6], [9, 8], [9, 3], [10, 0], { farElbow: [5, 3], farHand: [6, 0], parallelPair: true }),
    pose([-10, 19], [0, 1], [5, 3], [-2, 4], [5, 5], [9, 7], [9, 3], [10, 0], { farElbow: [5, 2], farHand: [6, 0], parallelPair: true }),
    pose([-10, 19], [0, 1], [4, 5], [0, 8], [5, 11], [8, 14], [9, 9], [10, 5], { farElbow: [5, 8], farHand: [6, 4], parallelPair: true }),
  ],
  outrun: [
    pose([-12, 17], [0, 1.2], [1.6, 6.2], [0.5, 10.8], [0.4, 16.8], [0.9, 20.0], [-1.4, 14.2], [-2.4, 11.2]),
    pose([-12, 17], [0, 1.2], [2.0, 6.0], [0.9, 10.2], [1.0, 16.0], [1.5, 19.2], [-0.8, 13.6], [-1.9, 10.7]),
    pose([-12, 17], [0, 1.2], [1.7, 6.1], [0.6, 10.6], [0.5, 16.5], [1.0, 19.7], [-1.2, 14.0], [-2.2, 11.0]),
  ],
  fall: [
    pose([-10, 19], [0, 1.2], [-2.4, 4.5], [-6.4, 6.4], [-11.2, 8.5], [-14.6, 9.5], [-8.8, 9.8], [-5.0, 10.7]),
    pose([-10, 19], [0, 1.2], [-4.5, 3.2], [-9.0, 3.8], [-14.4, 5.0], [-17.6, 6.4], [-12.0, 7.4], [-8.4, 8.6]),
    pose([-10, 19], [0, 1.2], [-5.0, 2.4], [-9.8, 2.6], [-15.4, 3.2], [-18.6, 4.2], [-13.0, 5.2], [-9.6, 6.0]),
  ],
}

// Seated balance loss: a normal-length torso leans back, elbows and palms
// share the snow plane. It is not the front pose with stretched sleeves.
const SUPPORT_TWO_BACK: readonly PoseShape[] = [
  pose([-10, 19], [0, 1], [5, 4], [1, 3], [-5, 6], [-5, 10], [-9, 0], [-13, 0], { farElbow: [-6, 0], farHand: [-9, 0], parallelPair: true }),
  pose([-10, 19], [0, 1], [5, 3], [1, 2], [-5, 5], [-5, 9], [-9, 0], [-13, 0], { farElbow: [-6, 0], farHand: [-9, 0], parallelPair: true }),
  pose([-10, 19], [0, 1], [4, 5], [0, 7], [-3, 13], [-2, 16], [-7, 10], [-9, 6], { farElbow: [-6, 9], farHand: [-11, 6], parallelPair: true }),
]

function poseShape(poseName: JumperPose, frameIndex: number, variant: SupportTwoVariant = 'front'): PoseShape {
  const frames = poseName === 'supportTwo' && variant === 'back' ? SUPPORT_TWO_BACK : POSE_FRAMES[poseName]
  return frames[Math.max(0, Math.min(frames.length - 1, frameIndex))] as PoseShape
}

/** Wypełniony czworokąt „kończyny": odcinek a→b o zadanych półszerokościach. */
function limbQuad(
  context: CanvasRenderingContext2D,
  toScreen: (u: number, v: number) => readonly [number, number],
  a: SkiPoint,
  b: SkiPoint,
  halfA: number,
  halfB: number,
  color: string,
): void {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const length = Math.hypot(dx, dy) || 1
  const nx = -dy / length
  const ny = dx / length
  // Rdzen Bresenhama najpierw: cienki, ukosny czworokat gubi cale wiersze
  // skanlinii (konczyna rozsypywala sie w kreski), linia tego nie robi.
  const from = toScreen(a[0], a[1])
  const to = toScreen(b[0], b[1])
  pixelLine(context, from[0], from[1], to[0], to[1], color, Math.min(2, Math.max(1, Math.round(halfA + halfB))))
  fillPixelPolygon(context, color, [
    toScreen(a[0] + nx * halfA, a[1] + ny * halfA),
    toScreen(b[0] + nx * halfB, b[1] + ny * halfB),
    toScreen(b[0] - nx * halfB, b[1] - ny * halfB),
    toScreen(a[0] - nx * halfA, a[1] - ny * halfA),
  ])
}

/**
 * Kreska 4-spójna: krok tylko w jednej osi na iterację. `pixelLine` chodzi po
 * skosie, przez co jednopikselowa narta ma wcięcia, które obrys z maski alfa
 * wypełnia na ciemno — narta wychodziła przerywana. Tu wcięć nie ma.
 */
function thinStroke(
  context: CanvasRenderingContext2D,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  color: string,
): void {
  let x = Math.round(fromX)
  let y = Math.round(fromY)
  const x1 = Math.round(toX)
  const y1 = Math.round(toY)
  const dx = Math.abs(x1 - x)
  const dy = Math.abs(y1 - y)
  const stepX = x < x1 ? 1 : -1
  const stepY = y < y1 ? 1 : -1
  let error = dx - dy
  context.fillStyle = color
  for (let guard = 0; guard < 512; guard += 1) {
    context.fillRect(x, y, 1, 1)
    if (x === x1 && y === y1) return
    if (error * 2 > -dy) {
      error -= dy
      x += stepX
    } else {
      error += dx
      y += stepY
    }
  }
}

/**
 * Narta: jedna CIĄGŁA, jednopikselowa linia leżąca na v≈0 z zadartym czubkiem.
 * Ciemny obrys dokłada się później z maski alfa, więc na ekranie wychodzi
 * ciemny-jasny-ciemny — dokładnie jak żółta narta SJ3 na krawędzi śniegu.
 * Wielokąt tu nie działa: przy grubości 1 px skanlinia gubi wiersze i narta
 * rozsypuje się w przerywaną kreskę (widać to na pierwszym podglądzie rundy).
 */
function drawSki(
  context: CanvasRenderingContext2D,
  toScreen: (u: number, v: number) => readonly [number, number],
  from: number,
  to: number,
  offsetV: number,
  vTip: number,
  color: string,
): void {
  const flat = toScreen(to - 4, offsetV + vTip * (to - 4 - from) / (to - from))
  const tail = toScreen(from, offsetV)
  const tip = toScreen(to, offsetV + 1.1 + vTip)
  thinStroke(context, tail[0], tail[1], flat[0], flat[1], color)
  thinStroke(context, flat[0], flat[1], tip[0], tip[1], color)
}

/** Głowa: ciemna czapa kasku i 2 px twarzy na czubku osi ciała. */
function drawHelmet(
  context: CanvasRenderingContext2D,
  toScreen: (u: number, v: number) => readonly [number, number],
  head: SkiPoint,
  chest: SkiPoint,
): void {
  const dx = head[0] - chest[0]
  const dy = head[1] - chest[1]
  const length = Math.hypot(dx, dy) || 1
  const fx = dx / length
  const fy = dy / length
  // Kask CIEMNY, nie jasny: jasny grzbiet biegnie tuż obok głowy, więc jasna
  // skorupa skleja się z nim w jedną kremową plamę („dziób" z rundy 1). Ciemna
  // czapa + 2 px twarzy to jedyne miejsce ze skórą na całej sylwetce — dzięki
  // temu głowa jest punktem, który oko znajduje pierwszy.
  const shell: Array<readonly [number, number]> = []
  for (let index = 0; index < 8; index += 1) {
    const angle = (index / 8) * Math.PI * 2
    shell.push(toScreen(head[0] + Math.cos(angle) * 1.5, head[1] + Math.sin(angle) * 1.4))
  }
  fillPixelPolygon(context, SUIT.outline, shell)
  const face = toScreen(head[0] + fx * 1.1 - fy * 0.7, head[1] + fy * 1.1 + fx * 0.7)
  context.fillStyle = SUIT.skin
  context.fillRect(Math.round(face[0]), Math.round(face[1]), 2, 2)
}

/**
 * 1-pikselowy obrys z maski alfa — sylwetka czyta się i na śniegu, i na nocnym
 * niebie, bez obrysowywania każdej kończyny osobno (to dawało podwójne kreski
 * w miejscach styku). Obrys wchodzi jednym `putImageData` zamiast kilkuset
 * jednopikselowych `fillRect`: klatki banku powstają leniwie, w środku skoku,
 * a pętla 120 Hz pauzuje grę już przy jednej przerwie ponad 66 ms
 * (`MAX_STEPS_PER_FRAME`), więc trzymamy ten koszt nisko z zapasem.
 */
const OUTLINE_RGBA = [0x07, 0x11, 0x1f, 0xff] as const

function outlineSilhouette(context: CanvasRenderingContext2D): void {
  const image = context.getImageData(0, 0, FRAME_SIZE, FRAME_SIZE)
  const pixels = image.data
  const solid = new Uint8Array(FRAME_SIZE * FRAME_SIZE)
  for (let index = 0; index < solid.length; index += 1) {
    solid[index] = (pixels[index * 4 + 3] as number) > 0 ? 1 : 0
  }
  for (let y = 0; y < FRAME_SIZE; y += 1) {
    for (let x = 0; x < FRAME_SIZE; x += 1) {
      const here = y * FRAME_SIZE + x
      if (solid[here]) continue
      const touches =
        (x > 0 && solid[here - 1]) ||
        (x + 1 < FRAME_SIZE && solid[here + 1]) ||
        (y > 0 && solid[here - FRAME_SIZE]) ||
        (y + 1 < FRAME_SIZE && solid[here + FRAME_SIZE])
      if (!touches) continue
      const base = here * 4
      pixels[base] = OUTLINE_RGBA[0]
      pixels[base + 1] = OUTLINE_RGBA[1]
      pixels[base + 2] = OUTLINE_RGBA[2]
      pixels[base + 3] = OUTLINE_RGBA[3]
    }
  }
  context.putImageData(image, 0, 0)
}

/** Rysuje jedną klatkę banku w lokalnych współrzędnych (styk buta w `FRAME_ANCHOR`). */
function renderJumperFrame(pose: JumperPose, frameIndex: number, angleRad: number,
  palms?: { near: SkiPoint; far?: SkiPoint }, variant: SupportTwoVariant = 'front',
  fitted?: (u: number, v: number) => SkiPoint): HTMLCanvasElement | OffscreenCanvas | null {
  const context = frameScratch()
  if (!context || !scratchCanvas) return null

  const shape = poseShape(pose, frameIndex, variant)
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)
  // Narta = (cos, -sin), pion sylwetki = (-sin, -cos): ta sama konwencja co
  // reszta renderera (ekranowe Y rośnie w dół).
  const toScreen = (u: number, v: number): readonly [number, number] => {
    if (fitted) return fitted(u, v)
    // The wrist and sleeve end share the actual snow pixel, not an overlay.
    if (palms && u === shape.hand[0] && v === shape.hand[1]) return palms.near
    if (palms?.far && u === shape.farHand?.[0] && v === shape.farHand[1]) return palms.far
    return [FRAME_ANCHOR.x + u * cos - v * sin, FRAME_ANCHOR.y - u * sin - v * cos]
  }

  const main = SUIT.main
  const shade = SUIT.shade
  const light = SUIT.light
  // Pełna druga narta w każdej pozie. Ogony pozostają blisko siebie, a wraz
  // z pochyleniem otwierają się głównie czubki — czytelne V zamiast dwóch
  // szeroko rozstawionych, niemal równoległych kresek w stylu H.
  const lean = Math.max(0, Math.min(1, (35 - angleRad / RAD_PER_DEG) / 55))
  const opening = pose === 'flight' ? frameIndex / 7
    : pose === 'landingPrep' ? Math.max(0, 1 - frameIndex / 4) : 0
  const vOpening = Math.max(0, Math.min(4, 4 * lean * opening))
  const farOffset = 2
  const vTip = (shape.vTip ?? 0) * (1 - 0.6 * lean * opening) + vOpening
  drawSki(context, toScreen, shape.backSkiFrom ?? shape.skiFrom,
    shape.backSkiTo ?? shape.skiTo, farOffset, vTip, SUIT.skiFar)
  drawSki(context, toScreen, shape.skiFrom, shape.skiTo, 0, 0, SUIT.skiNear)

  // 2. Dalsza noga (telemark) i dalsza ręka — ciemniejsze, żeby dały głębię.
  if (shape.parallelPair) {
    const shifted = (point: SkiPoint): SkiPoint => [point[0], point[1] + 0.9]
    limbQuad(context, toScreen, shifted(shape.hip), shifted(shape.knee), 1.2, 1, shade)
    limbQuad(context, toScreen, shifted(shape.knee), shifted(shape.boot), 1, 0.8, shade)
    const farBoot = toScreen(shape.boot[0], shape.boot[1] + 0.9)
    context.fillStyle = SUIT.outline
    context.fillRect(Math.round(farBoot[0]) - 1, Math.round(farBoot[1]) - 1, 2, 2)
  } else if (shape.backBoot && shape.backKnee) {
    limbQuad(context, toScreen, shape.hip, shape.backKnee, 1.2, 1, shade)
    limbQuad(context, toScreen, shape.backKnee, shape.backBoot, 1, 0.8, shade)
    const backBoot = toScreen(shape.backBoot[0], shape.backBoot[1])
    context.fillStyle = SUIT.outline
    context.fillRect(Math.round(backBoot[0]) - 1, Math.round(backBoot[1]) - 1, 3, 2)
  } else if ((pose === 'flight' || pose === 'takeoff') && (shape.vTip ?? 0) + vOpening > 0.5) {
    // W V zawsze widać także dalszą nogę. Łączy wspólne biodro z butem
    // osadzonym na dalszej narcie, więc przy mocniejszym rozwarciu nie powstaje
    // anatomiczna niemożliwość „dwie narty, jedna noga”.
    const farHip: SkiPoint = [shape.hip[0] - 0.3, shape.hip[1] + 0.5]
    const farKnee: SkiPoint = [shape.knee[0] - 0.8, shape.knee[1] + 1.1 + vOpening * 0.2]
    const farBoot: SkiPoint = [shape.boot[0] - 0.4, shape.boot[1] + farOffset]
    limbQuad(context, toScreen, farHip, farKnee, 1.2, 1, shade)
    limbQuad(context, toScreen, farKnee, farBoot, 1, 0.8, shade)
    const boot = toScreen(farBoot[0], farBoot[1])
    context.fillStyle = SUIT.outline
    context.fillRect(Math.round(boot[0]) - 1, Math.round(boot[1]) - 1, 2, 2)
  }
  // Dalsza ręka tylko tam, gdzie faktycznie odchodzi od ciała (lądowanie).
  // W pozostałych pozach pokrywała się z bliższą i dokładała ciemną obwódkę.
  if (shape.farHand && shape.farElbow) {
    limbQuad(context, toScreen, shape.chest, shape.farElbow, 0.9, 0.7, shade)
    limbQuad(context, toScreen, shape.farElbow, shape.farHand, 0.7, 0.6, shade)
  }

  // 3. Noga bliższa: udo i podudzie jako smukłe bryły. Grubości są „ludzkie"
  //    w skali 11,6 px/m (narta 2,5 m = 29 px): udo ~2 px, podudzie ~1,5 px —
  //    grubsze kończyny zlewały wszystko w jedną kiełbasę.
  limbQuad(context, toScreen, shape.hip, shape.knee, 1.35, 1.1, main)
  limbQuad(context, toScreen, shape.knee, shape.boot, 1.1, 0.9, main)

  // 4. But z wiązaniem — styk z nartą musi być jednym wyraźnym, ciemnym blokiem.
  const boot = toScreen(shape.boot[0], shape.boot[1])
  context.fillStyle = SUIT.outline
  context.fillRect(Math.round(boot[0]) - 1, Math.round(boot[1]) - 1, 2, 2)

  // 5. Tułów, szyja i ręka bliższa w barwie kombinezonu.
  limbQuad(context, toScreen, shape.hip, shape.chest, 1.6, 1.7, main)
  limbQuad(context, toScreen, shape.chest, shape.head, 1.2, 1, main)
  limbQuad(context, toScreen, shape.chest, shape.elbow, 1, 0.9, shade)
  limbQuad(context, toScreen, shape.elbow, shape.hand, 0.9, 0.7, shade)
  // Rękawica: 1 px ciepłego akcentu na końcu ramienia — dokładnie tak SJ3
  // zaznacza dłonie zamachnięte za plecami (żółte piksele w `s0A`).
  const hand = toScreen(shape.hand[0], shape.hand[1])
  context.fillStyle = SUIT.skin
  context.fillRect(Math.round(hand[0]), Math.round(hand[1]), 1, 1)

  if ((pose === 'supportOne' || pose === 'supportTwo') && frameIndex < 2) {
    // Small palms integrated into the outlined sprite. No groove or particles.
    const planted = pose === 'supportTwo' ? [shape.hand, shape.farHand!] : [shape.hand]
    for (const point of planted) {
      const palm = toScreen(point[0], point[1])
      thinStroke(context, palm[0], palm[1], palm[0] + cos, palm[1] - sin, SUIT.skin)
    }
  }

  // 6. Jasny grzbiet NA WIERZCHU: w SJ3 (s0A klatka 1, s16) górna krawędź
  //    sylwetki to jedna jasna kreska od bioder po bark — to ona robi „płaski
  //    grzbiet kuca". Rysowana przed ręką i szyją ginęła pod czerwienią.
  const backDx = shape.chest[0] - shape.hip[0]
  const backDy = shape.chest[1] - shape.hip[1]
  const backLength = Math.hypot(backDx, backDy) || 1
  const nx = -backDy / backLength
  const ny = backDx / backLength
  limbQuad(
    context,
    toScreen,
    [shape.hip[0] + nx * 1, shape.hip[1] + ny * 1],
    [shape.chest[0] + nx * 1.1, shape.chest[1] + ny * 1.1],
    0.5,
    0.6,
    light,
  )

  drawHelmet(context, toScreen, shape.head, shape.chest)
  outlineSilhouette(context)

  // Gotową klatkę przenosimy na własne płótno — bufor roboczy jest wspólny
  // i zostanie wyczyszczony przy następnej klatce banku.
  const canvas = makeFrameCanvas()
  const target = canvas.getContext('2d') as CanvasRenderingContext2D | null
  if (!target) return null
  target.imageSmoothingEnabled = false
  target.drawImage(scratchCanvas as CanvasImageSource, 0, 0)
  return canvas
}

function jumperFrameBitmap(
  pose: JumperPose,
  frameIndex: number,
  angleIndex: number,
  angleRad: number,
  variant: SupportTwoVariant = 'front',
): HTMLCanvasElement | OffscreenCanvas | null {
  const key = `${pose}:${frameIndex}:${angleIndex}:${variant}`
  const cached = frameCache.get(key)
  if (cached) return cached
  const bitmap = renderJumperFrame(pose, frameIndex, angleRad, undefined, variant)
  // Klucz: poza × klatka × kubełek kąta × wariant podpórki. W jednym
  // skoku powstaje kilkadziesiąt klatek. Limit jest wyraźnie wyższy niż zasięg
  // jednego konkursu (klatka to 72×72×4 B ≈ 21 kB), żeby czyszczenie nie
  // wpadało w pętlę „wyczyść → odbuduj" w środku skoku.
  if (frameCache.size > 288) frameCache.clear()
  if (bitmap) frameCache.set(key, bitmap)
  return bitmap
}

const DEBUG_POSE_ORDER: readonly JumperPose[] = ['gate', 'gatePush', 'inrun', 'takeoff', 'flight', 'landingPrep', 'supportOne', 'supportTwo', 'outrun', 'fall']

export type DebugPoseSheet = {
  readonly canvas: HTMLCanvasElement
  readonly frames: readonly { readonly pose: JumperPose; readonly frameIndex: number }[]
}

/**
 * Test-only visual evidence. It is reachable only through the `?debug` hook in
 * main.ts and never appears in the normal game UI.
 */
export function createDebugJumperPoseSheet(options: {
  readonly silhouette?: boolean
  readonly poses?: readonly JumperPose[]
  readonly columns?: number
} = {}): DebugPoseSheet {
  const poses = options.poses ?? DEBUG_POSE_ORDER
  const frames = poses.flatMap((poseName) => Array.from(
    { length: JUMPER_POSE_FRAME_COUNTS[poseName] },
    (_, frameIndex) => ({ pose: poseName, frameIndex }),
  ))
  const columns = Math.max(1, Math.min(options.columns ?? 8, Math.max(1, frames.length)))
  const cellWidth = 80
  const cellHeight = 84
  const canvas = document.createElement('canvas')
  canvas.width = columns * cellWidth
  canvas.height = Math.ceil(frames.length / columns) * cellHeight
  const context = canvas.getContext('2d')
  if (!context) return { canvas, frames }
  context.imageSmoothingEnabled = false
  context.fillStyle = options.silhouette ? '#e7f0ef' : '#101a2a'
  context.fillRect(0, 0, canvas.width, canvas.height)

  frames.forEach(({ pose: poseName, frameIndex }, index) => {
    const x = (index % columns) * cellWidth
    const y = Math.floor(index / columns) * cellHeight
    const bitmap = renderJumperFrame(poseName, frameIndex, 0)
    if (bitmap) {
      if (options.silhouette) {
        const mask = document.createElement('canvas')
        mask.width = FRAME_SIZE
        mask.height = FRAME_SIZE
        const maskContext = mask.getContext('2d')
        if (maskContext) {
          maskContext.imageSmoothingEnabled = false
          maskContext.drawImage(bitmap, 0, 0)
          maskContext.globalCompositeOperation = 'source-in'
          maskContext.fillStyle = '#000000'
          maskContext.fillRect(0, 0, FRAME_SIZE, FRAME_SIZE)
          context.drawImage(mask, x + 4, y)
        }
      } else {
        context.drawImage(bitmap, x + 4, y)
      }
    }
    const shortPose = poseName === 'landingPrep' ? 'TELE' : poseName === 'landingParallel' ? 'PARA'
      : poseName === 'landingDeep' ? 'DEEP' : poseName === 'supportOne' ? 'POD1' : poseName === 'supportTwo' ? 'POD2'
        : poseName === 'gatePush' ? 'START' : poseName.toUpperCase()
    drawPixelText(context, `${shortPose} ${frameIndex + 1}`, x + cellWidth / 2, y + 74, options.silhouette ? '#07111f' : '#f3ead1', 1, 'center')
  })
  return { canvas, frames }
}

export type DebugShadowSheet = {
  readonly canvas: HTMLCanvasElement
  readonly heights: readonly number[]
}

export type DebugPerfectTakeoffSheet = {
  readonly canvas: HTMLCanvasElement
  readonly ages: readonly number[]
}

/** Test-only strip animacji śniegu dla idealnego wybicia. */
export function createDebugPerfectTakeoffSheet(hill: Hill, ages: readonly number[] = [0, 6, 12, 20]): DebugPerfectTakeoffSheet {
  const cellWidth = 96
  const cellHeight = 74
  const scale = 2
  const canvas = document.createElement('canvas')
  canvas.width = cellWidth * ages.length * scale
  canvas.height = cellHeight * scale
  const context = canvas.getContext('2d')
  if (!context) return { canvas, ages }
  context.imageSmoothingEnabled = false
  context.scale(scale, scale)
  ages.forEach((age, index) => {
    const left = index * cellWidth
    context.fillStyle = env().skyBands[1]
    context.fillRect(left, 0, cellWidth, cellHeight)
    pixelLine(context, left + 19, 48, left + 76, 59, COLOR.snow, 3)
    const view: WorldView = {
      scale: 1,
      toScreen: () => ({ x: left + 55, y: 54 }),
    }
    drawTakeoffSignal(context, view, {
      hill,
      phase: 'Flight',
      position: { x: 0, y: 0 },
      pitchRad: 0,
      tick: age,
      events: [{ tick: 0, type: 'perfectTakeoff', detail: 'debug' }],
    }, false)
    drawPixelText(context, `${age} T`, left + cellWidth / 2, 64, COLOR.text, 1, 'center')
  })
  return { canvas, ages }
}

/** Test-only sheet proving the shadow fade/size at explicit flight heights. */
export function createDebugShadowHeightSheet(
  hill: Hill,
  heights: readonly number[] = [1, 5, 10, 20, 30],
): DebugShadowSheet {
  const cellWidth = 96
  const evidenceScale = 2
  const canvas = document.createElement('canvas')
  canvas.width = cellWidth * heights.length * evidenceScale
  canvas.height = 104 * evidenceScale
  const context = canvas.getContext('2d')
  if (!context) return { canvas, heights }
  context.imageSmoothingEnabled = false
  context.scale(evidenceScale, evidenceScale)
  const surface = hill.surfacePositionAt(105)

  heights.forEach((height, index) => {
    const left = index * cellWidth
    context.fillStyle = '#203b51'
    context.fillRect(left, 0, cellWidth, 68)
    context.fillStyle = '#e7f0ef'
    context.fillRect(left, 68, cellWidth, 36)
    const view: WorldView = {
      scale: 6,
      toScreen: (point) => ({
        x: left + cellWidth / 2 + (point.x - surface.x) * 6,
        y: 68 - (point.y - surface.y) * 6,
      }),
    }
    drawJumperShadow(context, view, {
      hill,
      phase: 'Flight',
      position: { x: surface.x, y: surface.y + height },
      pitchRad: 0,
      tick: 0,
    })
    drawPixelText(context, `${height} M`, left + cellWidth / 2, 86, '#07111f', 1, 'center')
  })
  return { canvas, heights }
}

/** Blituje klatkę z banku (bez rotacji/skalowania w locie — kąt jest już zapieczony w bitmapie). */
function drawProductionJumper(context: CanvasRenderingContext2D, view: WorldView, actor: SceneActor, reducedMotion: boolean): void {
  const groundY = actor.hill.surfaceYAtX(actor.position.x)
  const heightAboveSurface = Math.max(0, actor.position.y - groundY)
  const { pose, frameIndex, angleIndex, angleRad } = jumperFrame(actor, heightAboveSurface, reducedMotion)
  const feet = view.toScreen(actor.position)
  // Kotwica fizyki leży na MATEMATYCZNEJ powierzchni, a widoczny pas śniegu
  // rysuje się wyśrodkowanym obrysem: `strokeCurve(..., 6)` na zeskoku kładzie
  // biel od `y-3` do `y+3`, a `strokeCurve(..., 3)` na rozbiegu od `y-1` do
  // `y+2`. Bez korekty narta siedzi w połowie białego pasa („wbita w ziemię"),
  // więc podnosimy blit dokładnie o te 3 / 2 px — wtedy jasny rdzeń narty leży
  // na górnej krawędzi pasa, a jej ciemny spód czyta się jako cień na śniegu.
  // Po przejściu na skalę 1:1 pas śniegu nie jest już rysowany jako gruba
  // polilinia wyśrodkowana na krzywej, tylko jako wielokąt, którego GÓRNA
  // krawędź leży ~6 cm nad matematyczną powierzchnią. Narta ma więc spocząć
  // tuż nad kotwicą fizyki — stąd jednakowe 2 px dla wszystkich póz zamiast
  // dawnych 2/3 px kompensujących połowę grubości pasa.
  const groundLift: Record<JumperPose, number> = {
    gate: 2,
    gatePush: 2,
    inrun: 2,
    takeoff: 2,
    flight: 2,
    landingPrep: 2,
    landingParallel: 2,
    landingDeep: 2,
    supportOne: 2,
    supportTwo: 2,
    outrun: 2,
    fall: 2,
  }
  // Wygaszanie korekty tylko w fazach powietrznych. Na rozbiegu `surfaceYAtX`
  // opisuje ZESKOK (wspólna mapa metrażu zaczyna się pod progiem), więc liczona
  // stamtąd „wysokość" to kilkadziesiąt metrów i wygaszenie zerowałoby korektę
  // dokładnie tam, gdzie jest potrzebna.
  const airborne = pose === 'takeoff' || pose === 'flight' || pose === 'landingPrep' || pose === 'landingParallel'
  const lift = groundLift[pose] * (airborne ? Math.max(0, 1 - heightAboveSurface) : 1)
  const left = Math.round(feet.x - FRAME_ANCHOR.x)
  const top = Math.round(feet.y - FRAME_ANCHOR.y - lift)
  let bitmap: HTMLCanvasElement | OffscreenCanvas | null
  const variant = pose === 'supportTwo' ? supportTwoVariant(actor) : 'front'
  if ((pose === 'supportOne' || pose === 'supportTwo') && frameIndex < 2) {
    const shape = poseShape(pose, frameIndex, variant)
    const onSnow = (point: SkiPoint): SkiPoint => {
      const x = left + Math.round(FRAME_ANCHOR.x + point[0] * Math.cos(angleRad))
      const worldX = actor.position.x + (x - feet.x) / view.scale
      const snow = view.toScreen({ x: worldX, y: actor.hill.surfaceYAtX(worldX) + 0.06 })
      return [x - left, Math.round(snow.y) - 1 - top]
    }
    // Fit only the two contact frames; recovery keeps the variant-aware cache.
    if (pose === 'supportTwo') {
      // Rigid anatomy aligned to the actual tangent, not a quantized angle.
      // Only points on the snow plane (palms AND back elbows) follow curvature;
      // the torso and sleeve lengths stay intact instead of reaching down.
      const angle = -actor.hill.surfaceSlopeRadAt(actor.hill.surfaceDistanceAtPoint(actor.position))
      const cos = Math.cos(angle)
      const sin = Math.sin(angle)
      const origin = onSnow([0, 0])
      const fitted = (u: number, v: number): SkiPoint => {
        const x = FRAME_ANCHOR.x + u * cos - v * sin
        if (v === 0) {
          const worldX = actor.position.x + (left + x - feet.x) / view.scale
          return [x, Math.round(view.toScreen({ x: worldX, y: actor.hill.surfaceYAtX(worldX) + 0.06 }).y) - 1 - top]
        }
        return [x, origin[1] - u * sin - v * cos]
      }
      bitmap = renderJumperFrame(pose, frameIndex, angle, undefined, variant, fitted)
    } else bitmap = renderJumperFrame(pose, frameIndex, angleRad, {
      near: onSnow(shape.hand),
    })
  } else bitmap = jumperFrameBitmap(pose, frameIndex, angleIndex, angleRad, variant)
  if (bitmap) context.drawImage(bitmap, left, top)
}

function decimal(value: number, digits = 1): string {
  return value.toFixed(digits).replace('.', ',')
}

/** Bieżący pomiar HUD zaokrągla się do najbliższej połówki metra. */
export function roundLiveDistanceMeters(value: number): number {
  return Math.round(value * 2) / 2
}

function points(tenths: number): string {
  return decimal(tenths / 10)
}

function signedPoints(tenths: number): string {
  return `${tenths >= 0 ? '+' : ''}${points(tenths)}`
}

function compensationColor(tenths: number): string {
  if (tenths > 0) return COLOR.green
  if (tenths < 0) return COLOR.red
  return COLOR.snowShade
}

function distance(halfMeters: number): string {
  return decimal(halfMeters / 2)
}

const FEEDBACK: Record<FeedbackCode, string> = {
  'takeoff-too-early': 'WYBICIE ZA WCZEŚNIE — POCZEKAJ NA KRAWĘDŹ PROGU.',
  'takeoff-too-late': 'WYBICIE ZA PÓŹNO — ZACZNIJ WYPROST PRZED PROGIEM.',
  'excessive-pitch': 'NADMIERNE POCHYLENIE — KORYGUJ POZYCJĘ KRÓCEJ.',
  'late-landing-prep': 'SPÓŹNIONE PRZYGOTOWANIE — WYBIERZ LĄDOWANIE WYŻEJ.',
  'no-telemark': 'BRAK TELEMARKU — T DAJE LEPSZĄ NOTĘ, ALE WYMAGA CZASU.',
  'one-hand-support': 'PODPÓRKA JEDNĄ DŁONIĄ — 3,0 PKT KARY U KAŻDEGO SĘDZIEGO.',
  'two-hand-support': 'PODPÓRKA OBIEMA DŁOŃMI — 4,5 PKT KARY U KAŻDEGO SĘDZIEGO.',
  'fall-before-fall-line': 'NIESTABILNY ODJAZD — USTABILIZUJ KONTAKT PRZED FALL LINE.',
  'unstable-outrun': 'NIESTABILNY ODJAZD — UTRZYMAJ POZYCJĘ DO FALL LINE.',
  clean: 'CZYSTA PRÓBA — POWTÓRZ TEN TIMING I POZYCJĘ.',
}

function drawLiveHud(context: CanvasRenderingContext2D, sim: JumpSimulation, state: TrainingSceneState): void {
  const wind = sim.currentWindUserMetersPerSecond
  const arrow = wind > 0.05 ? '←' : wind < -0.05 ? '→' : '·'
  const signedWind = `${wind >= 0 ? '+' : ''}${decimal(wind)}`
  const target = state.leadingTargetHalfMeters === null
    ? 'DO PROWADZENIA — NIEOSIĄGALNE'
    : `DO PROWADZENIA ~${distance(state.leadingTargetHalfMeters)} M`
  const activeMotion = sim.phase === 'Inrun'
    || sim.phase === 'Takeoff'
    || sim.phase === 'Flight'
    || sim.phase === 'LandingPrep'
    || sim.phase === 'Outrun'
    || sim.phase === 'Fall'

  const gateSuffix = state.trainingGateMode === 'manual'
    ? ' (RĘCZNA)'
    : state.trainingGateMode === 'auto'
      ? ' (AUTO)'
      : ''

  if (activeMotion && !state.result) {
    // DSJ2-owa dyscyplina: w ruchu jedna niska belka danych sportowych zamiast
    // trzech paneli i pełnej instrukcji. Cel ustępuje zmierzonej odległości.
    drawPanel(context, 7, 6, VIEW_WIDTH - 14, 20)
    drawPixelText(context, `${decimal(sim.speedKmh)} KM/H`, 14, 12, COLOR.text, 1, 'left')
    drawPixelText(context, `WIATR ${arrow} ${signedWind} M/S`, 88, 12, wind >= 0 ? COLOR.green : COLOR.red, 1, 'left')
    drawPixelText(context, `BELKA ${sim.gateNumber}${gateSuffix}`, 211, 12, COLOR.snowShade, 1, 'left')
    const contextValue = sim.measuredDistanceMeters === null
      ? target
      : `ODLEGŁOŚĆ ${decimal(roundLiveDistanceMeters(sim.measuredDistanceMeters))} M`
    drawPixelText(
      context,
      contextValue,
      VIEW_WIDTH - 14,
      12,
      sim.measuredDistanceMeters === null
        ? (state.leadingTargetHalfMeters === null ? COLOR.red : COLOR.green)
        : COLOR.warm,
      1,
      'right',
    )
    // Dyskretny skrót pozostaje czytelny również pod bannerem pauzy, ale nie
    // tworzy drugiego panelu ani nie konkuruje z zawodnikiem.
    const bindings = state.bindingHints
    const controls = hasRemappedJumpBindings(bindings)
      ? `${bindingKeyHint(bindings.takeoff)}  ${bindingKeyHint(bindings.left)}${bindingKeyHint(bindings.right)}  ${bindingKeyHint(bindings.telemark)}/${bindingKeyHint(bindings.parallel)}`
      : '↑  ←→  T/R'
    drawPixelText(context, fitBindingHint(controls, 182), VIEW_WIDTH - 9, VIEW_HEIGHT - 10, COLOR.steel, 1, 'right')
    return
  }

  // Belka i stany końcowe są miejscem nauki: pełne nazwy oraz sterowanie mogą
  // być tu jawne, zanim zacznie się ruch albo gdy gracz analizuje wynik.
  drawPanel(context, 7, 6, VIEW_WIDTH - 14, 29)
  const title = state.mode === 'competition'
    ? `${state.roundLabel ?? 'KONKURS'}  ${state.competitorName ?? ''}`
    : `TRENING ${state.attemptNumber}  K${sim.hill.spec.kPointMeters} / HS${sim.hill.spec.hillSizeMeters}`
  drawPixelText(context, title, 14, 11, COLOR.warm, 1, 'left')
  label(context, `K${sim.hill.spec.kPointMeters} / HS${sim.hill.spec.hillSizeMeters}`, 14, 29, COLOR.snowShade, 7)
  context.textAlign = 'right'
  label(context, `${decimal(sim.speedKmh)} KM/H  •  BELKA ${sim.gateNumber}${gateSuffix}`, VIEW_WIDTH - 14, 18, COLOR.text, 9)
  label(context, `WIATR ${arrow} ${signedWind} M/S`, VIEW_WIDTH - 14, 29, wind >= 0 ? COLOR.green : COLOR.red, 8)
  context.textAlign = 'left'

  drawPanel(context, 291, 39, 182, 25)
  drawPixelText(context, target, VIEW_WIDTH - 14, 43, state.leadingTargetHalfMeters === null ? COLOR.red : COLOR.green, 1, 'right')
  context.textAlign = 'right'
  label(
    context,
    `${state.mode === 'competition' ? 'LIDER KONKURSU' : 'LIDER KONTROLNY'} ${points(state.leaderFixtureTenths)} PKT`,
    VIEW_WIDTH - 14,
    60,
    COLOR.snowShade,
    6,
  )

  if (!state.result) {
    context.textAlign = 'left'
    drawPanel(context, 7, VIEW_HEIGHT - 32, VIEW_WIDTH - 14, 25)
    label(context, fitBindingHint(phaseWithBindings(sim.phase, state.bindingHints), 295), 14, VIEW_HEIGHT - 24, COLOR.warm, 8)
    if (sim.phase === 'GateGreen') {
      drawPixelText(context, '[ ] BELKA', 250, VIEW_HEIGHT - 31, COLOR.snowShade, 1, 'left')
    }
    context.textAlign = 'right'
    label(
      context,
      `S ŚNIEG ${state.snowEnabled ? 'WŁ.' : 'WYŁ.'}${state.debugEnabled ? '  D DEBUG' : ''}`,
      VIEW_WIDTH - 14,
      VIEW_HEIGHT - 24,
      COLOR.snowShade,
      6,
    )
    context.textAlign = 'center'
    const bindings = state.bindingHints
    const controls = hasRemappedJumpBindings(bindings)
      ? `${bindingKeyHint(bindings.right)} START  ${bindingKeyHint(bindings.takeoff)} WYBICIE  ${bindingKeyHint(bindings.left)} ${bindingKeyHint(bindings.right)} POZYCJA  ${bindingKeyHint(bindings.telemark)} TELEMARK  ${bindingKeyHint(bindings.parallel)} DWIE NOGI`
      : '→ START  ↑ WYBICIE  ← → POZYCJA  T TELEMARK  R DWIE NOGI'
    label(context, fitBindingHint(controls, VIEW_WIDTH - 30), VIEW_WIDTH / 2, VIEW_HEIGHT - 10, COLOR.text, 7)
  }
  context.textAlign = 'left'
}

export function drawResultMarks(context: CanvasRenderingContext2D, result: Pick<TrainingJumpResult, 'marksTenths' | 'droppedJudgeIndexes'>, top = 102): void {
  // Otwarty wiersz not: odstęp zamiast ramek, X i przekreślenie zamiast samego koloru.
  result.marksTenths.forEach((mark, index) => {
    const centerX = 96 + index * 72
    const dropped = result.droppedJudgeIndexes.includes(index)
    drawPixelText(context, `S${index + 1}${dropped ? ' X' : ''}`, centerX, top, dropped ? COLOR.red : COLOR.snowShade, 1, 'center')
    drawPixelText(context, points(mark), centerX, top + 11, COLOR.text, 2, 'center')
    if (dropped) pixelLine(context, centerX - 23, top + 18, centerX + 23, top + 18, COLOR.red, 1)
  })
  context.textAlign = 'left'
}

function drawResultScreen(context: CanvasRenderingContext2D, sim: JumpSimulation, state: TrainingSceneState): void {
  const result = state.result
  if (!result) return
  // Wynik ma pierwszeństwo nad żywym HUD-em i sceną. Delikatne przygaszenie
  // całego kadru usuwa wizualny bałagan pozostawiony poza obrysem panelu.
  context.fillStyle = 'rgba(3, 7, 13, 0.72)'
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)
  context.fillStyle = 'rgba(3, 7, 13, 0.96)'
  context.fillRect(18, 39, 444, 210)
  context.strokeStyle = result.status === 'landed' ? COLOR.green : COLOR.red
  context.lineWidth = 2
  context.strokeRect(18.5, 39.5, 443, 209)

  context.textAlign = 'center'
  drawPixelText(context, result.status === 'landed' ? 'WYNIK - SKOK USTANY' : 'WYNIK - UPADEK', 240, 48, result.status === 'landed' ? COLOR.green : COLOR.red, 1, 'center')
  label(context, `${distance(result.distanceHalfMeters)} M`, 150, 81, COLOR.text, 18)
  label(context, `SUMA ${points(result.totalTenths)} PKT`, 329, 78, COLOR.warm, 13)
  label(context, 'NOTY S1-S5 • X: NOTA ODRZUCONA', 240, 99, COLOR.snowShade, 7)
  drawResultMarks(context, result)

  context.textAlign = 'left'
  label(context, `DŁUGOŚĆ  ${points(result.componentTenths.distance)} PKT`, 69, 141, COLOR.text, 9)
  label(context, `STYL      ${points(result.componentTenths.style)} PKT`, 69, 153, COLOR.text, 9)
  label(context, `WIATR     ${signedPoints(result.componentTenths.wind)} PKT`, 69, 165, compensationColor(result.componentTenths.wind), 9)
  label(context, `JURY      ${signedPoints(result.componentTenths.juryGate)} PKT`, 69, 177, compensationColor(result.componentTenths.juryGate), 9)
  label(context, `TRENER    ${signedPoints(result.componentTenths.coachGate)} PKT`, 69, 189, compensationColor(result.componentTenths.coachGate), 9)
  label(
    context,
    `WIATR ${result.wind.measuredMeanUserMetersPerSecond >= 0 ? '+' : ''}${decimal(result.wind.measuredMeanUserMetersPerSecond)} M/S × ${decimal(result.wind.factorTenthsPerMps / 10)} PKT/(M/S)`,
    69,
    201,
    COLOR.snowShade,
    6,
  )

  // Osobna, lewo wyrównana kolumna. Dawny długi wiersz „PRÓBY • NAJLEPIEJ”
  // wchodził pionowo i poziomo na wiersz JURY przy logicznych 480×270.
  context.textAlign = 'left'
  label(context, `BAZA ${points(result.collectiveTenths)} PKT`, 250, 141, COLOR.snowShade, 7)
  label(context, `PRÓBY ${state.completedAttempts}`, 250, 153, COLOR.snowShade, 6)
  label(context, `NAJLEPIEJ ${distance(state.bestDistanceHalfMeters)} M`, 250, 165, COLOR.snowShade, 6)
  label(context, `PUNKTY ${points(state.bestTotalTenths)} PKT`, 250, 177, COLOR.snowShade, 6)
  label(
    context,
    state.trainingGateMode === 'manual'
      ? `BELKA ${result.gate.juryGateNumber} — RĘCZNA (AUTO ${state.trainingGateAutoNumber ?? '—'})`
      : `BELKA ${result.gate.juryGateNumber} — AUTO (WIATR ${decimal(state.trainingGateForecastMean ?? result.wind.measuredMeanUserMetersPerSecond)})`,
    250,
    189,
    COLOR.snowShade,
    6,
  )
  if (result.landingSupportHands > 0) {
    label(context, `PODPÓRKA ${result.landingSupportHands === 1 ? '1 DŁOŃ' : '2 DŁONIE'}`, 250, 201, COLOR.red, 6)
  }
  context.textAlign = 'center'
  const feedback = result.feedbackCode === 'no-telemark' && hasRemappedJumpBindings(state.bindingHints)
    ? FEEDBACK['no-telemark'].replace(' — T ', ` — ${bindingKeyHint(state.bindingHints.telemark)} `)
    : FEEDBACK[result.feedbackCode]
  label(context, feedback, 240, 215, COLOR.warm, 7)
  label(context, 'ENTER — NASTĘPNA PRÓBA     BACKSPACE — MENU', 240, 231, COLOR.text, 8)
  if (state.debugEnabled) label(context, `${sim.hill.spec.id} V${sim.hill.spec.hillVersion}`, 240, 243, COLOR.snowShade, 6)
  context.textAlign = 'left'
}

/** Produkcyjny widok P11; D przełącza zachowany widok techniczny P05. */
export function drawJumpScreen(
  context: CanvasRenderingContext2D,
  sim: JumpSimulation,
  technicalView: WorldView,
  state: TrainingSceneState = DEFAULT_SCENE_STATE,
): void {
  activePaletteFamily = paletteForHill(sim.hill.spec.id)
  if (state.technicalView) {
    drawTechnicalJumpScreen(context, sim, technicalView, state)
    if (sim.hill.spec.id === 'h02-zakopane-large' || sim.hill.spec.id === 'h03-oberstdorf-large'
      || sim.hill.spec.id === 'h04-planica-flying') {
      context.textAlign = 'right'
      label(context, 'D — SCENA', VIEW_WIDTH - 10, 54, COLOR.warm, 7)
      context.textAlign = 'left'
    } else label(context, 'D — POWRÓT DO SCENY PRODUKCYJNEJ', 10, 41, COLOR.warm, 7)
    return
  }

  context.imageSmoothingEnabled = false
  drawProductionScene(context, sim, buildProductionCamera(sim), state, sim.currentWindUserMetersPerSecond)
  drawLiveHud(context, sim, state)
  if (state.result) drawResultScreen(context, sim, state)
}

/**
 * Tło + teren + skoczek + cień, bez HUD-u ekranu gry. Współdzielony przez
 * scenę treningu/konkursu i produkcyjną scenę powtórki (decyzja #5).
 */
export function drawProductionScene(
  context: CanvasRenderingContext2D,
  actor: SceneActor,
  view: WorldView,
  state: TrainingSceneState,
  windUserMetersPerSecond: number,
): void {
  context.imageSmoothingEnabled = false
  activePaletteFamily = paletteForHill(actor.hill.spec.id)
  drawProductionBackground(
    context,
    actor.tick,
    state.snowEnabled,
    windUserMetersPerSecond,
    actor.position.x,
    actor.position.y,
    view.scale,
    state.reducedMotion,
    actor.hill.spec.id === 'h01-lillehammer-normal',
  )
  drawProductionTerrain(context, actor, view, state)
  drawTakeoffSignal(context, view, actor, state.reducedMotion)
  drawSelectedStartGate(context, view, actor)
  // The rear support occupies the spray area: keep its elbow/palm contacts
  // readable rather than punching snow-coloured holes into the sleeves.
  const twoHandSupport = jumperPose(actor) === 'supportTwo'
  if (twoHandSupport) drawContactSpray(context, view, actor, state.reducedMotion)
  drawProductionJumper(context, view, actor, state.reducedMotion)
  if (!twoHandSupport) drawContactSpray(context, view, actor, state.reducedMotion)
}
