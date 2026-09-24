/** P22 — ekran ustawień na logicznej siatce 480×270. Tylko Canvas2D + font bitmapowy. */
import type { GameSettings } from '../settings/settings'
import { VIEW_HEIGHT, VIEW_WIDTH } from './hillView'
import { drawPixelText, measurePixelText } from './pixelFont'

export const SETTINGS_ROWS = [
  'takeoff', 'left', 'right', 'telemark', 'parallel',
  'menuConfirm', 'menuBack', 'volume', 'scaleMode',
  'largeText', 'reducedMotion', 'reset',
] as const

export type SettingsRow = typeof SETTINGS_ROWS[number]
export type BindingRow = Extract<SettingsRow, 'takeoff' | 'left' | 'right' | 'telemark' | 'parallel' | 'menuConfirm' | 'menuBack'>

export type SettingsViewState = {
  readonly settings: GameSettings
  readonly selectedRow: SettingsRow
  readonly captureTarget: BindingRow | null
  readonly message: string | null
}

const C = {
  night: '#07111f', panel: '#0c1827', field: '#14233b', active: '#294657',
  edge: '#536c7a', blue: '#286bc6', snow: '#f3ead1', ice: '#91b4cb',
  amber: '#f1bd79', green: '#3fa865', red: '#d64d53',
} as const

const BINDING_ROWS: readonly BindingRow[] = SETTINGS_ROWS.slice(0, 7) as BindingRow[]
const OPTION_ROWS: readonly SettingsRow[] = SETTINGS_ROWS.slice(7)

const LABELS: Readonly<Record<SettingsRow, string>> = {
  takeoff: 'WYBICIE', left: 'LOT W LEWO', right: 'LOT W PRAWO',
  telemark: 'TELEMARK', parallel: 'DWIE NOGI',
  menuConfirm: 'POTWIERDŹ', menuBack: 'WSTECZ', volume: 'GŁOŚNOŚĆ',
  scaleMode: 'SKALA', largeText: 'DUŻY TEKST', reducedMotion: 'MNIEJ RUCHU',
  reset: 'PRZYWRÓĆ',
}

/** Wartości to fizyczne KeyboardEvent.code, nie znaki zależne od układu klawiatury. */
function physicalKey(code: string): string {
  const names: Record<string, string> = {
    ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→',
    Enter: 'ENTER', NumpadEnter: 'NUM ENTER', Escape: 'ESC',
    Backspace: 'BACKSPACE', Space: 'SPACJA', Tab: 'TAB',
    ShiftLeft: 'LEWY SHIFT', ShiftRight: 'PRAWY SHIFT',
    ControlLeft: 'LEWY CTRL', ControlRight: 'PRAWY CTRL',
    AltLeft: 'LEWY ALT', AltRight: 'PRAWY ALT',
    BracketLeft: '[', BracketRight: ']', Minus: '-', Equal: '+',
    Comma: ',', Period: '.', Slash: '/', Semicolon: ';',
    Backquote: '`', Quote: "'", Backslash: '\\',
  }
  if (names[code]) return names[code]
  if (/^Key[A-Z]$/.test(code)) return code.slice(3)
  if (/^Digit[0-9]$/.test(code)) return code.slice(5)
  if (/^Numpad[0-9]$/.test(code)) return `NUM ${code.slice(6)}`
  return code.replace(/([a-z])([A-Z])/g, '$1 $2').toUpperCase()
}

function clipped(text: string, maxWidth: number, scale = 1): string {
  if (measurePixelText(text, scale) <= maxWidth) return text
  let result = text
  while (result.length > 0 && measurePixelText(`${result}...`, scale) > maxWidth) result = result.slice(0, -1)
  return `${result}...`
}

function ink(context: CanvasRenderingContext2D, value: string, x: number, y: number, color: string, scale = 1, right = false): void {
  drawPixelText(context, value, x, y, color, scale, right ? 'right' : 'left')
}

function rect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  context.fillStyle = color
  context.fillRect(x, y, w, h)
}

function rim(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string): void {
  rect(context, x, y, w, 1, color)
  rect(context, x, y + h - 1, w, 1, color)
  rect(context, x, y, 1, h, color)
  rect(context, x + w - 1, y, 1, h, color)
}

function optionValue(row: SettingsRow, settings: GameSettings): string {
  switch (row) {
    case 'takeoff': case 'left': case 'right': case 'telemark': case 'parallel':
      return physicalKey(settings.bindings[row])
    case 'menuConfirm': case 'menuBack':
      return physicalKey(settings[row])
    case 'volume': return `${settings.volume}%`
    case 'scaleMode': return settings.scaleMode === 'fit' ? 'DOPASUJ' : 'RÓWNE PX'
    case 'largeText': return settings.largeText ? 'TAK' : 'NIE'
    case 'reducedMotion': return settings.reducedMotion ? 'TAK' : 'NIE'
    case 'reset': return 'DOMYŚLNE'
  }
}

function row(
  context: CanvasRenderingContext2D,
  id: SettingsRow,
  settings: GameSettings,
  selected: boolean,
  capturing: boolean,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  if (selected) {
    rect(context, x, y, width, height, C.active)
    rim(context, x, y, width, height, C.ice)
    rect(context, x, y, 3, height, capturing ? C.red : C.amber)
  } else {
    rect(context, x, y, width, height, C.field)
  }
  if (selected) ink(context, '>', x + 6, y + 7, C.amber)
  const labelX = x + 15
  ink(context, LABELS[id], labelX, y + 7, selected ? C.snow : C.ice)
  const value = capturing ? 'NACIŚNIJ...' : optionValue(id, settings)
  const valueColor = capturing ? C.amber : selected ? C.amber : C.snow
  // Ważne klawisze / wartości mają 14 fizycznych pikseli wysokości; długie
  // etykiety klawiszy pozostają czytelne i nie wchodzą na nazwę opcji.
  const available = x + width - 6 - (labelX + measurePixelText(LABELS[id]) + 9)
  const scale = id === 'reset' || available < measurePixelText(value, 2) ? 1 : 2
  ink(context, clipped(value, available, scale), x + width - 7, y + (scale === 2 ? 3 : 7), valueColor, scale, true)
  if (id === 'volume') {
    rect(context, x + 115, y + height - 4, 62, 2, C.edge)
    rect(context, x + 115, y + height - 4, Math.round(62 * settings.volume / 100), 2, C.green)
  }
}

function feedback(context: CanvasRenderingContext2D, state: SettingsViewState): void {
  const { captureTarget, message } = state
  const conflict = message !== null && /KONFLIKT|ZAJĘT|PRZYPISAN|DUPLIKAT|NIEDOZWOL|NIEPRAWIDŁOW|NIE MOŻNA/.test(message.toUpperCase())
  // Cała stopka mieści się nad dolną ramką wewnętrzną (y257); podpowiedź
  // nie dotyka ramki, nawet gdy ostatni wiersz glifu ma zapalone piksele.
  rect(context, 25, 231, 430, 25, C.panel)
  rect(context, 25, 231, 430, 2, conflict ? C.red : captureTarget ? C.amber : C.blue)
  if (captureTarget) {
    ink(context, `PRZECHWYĆ: ${LABELS[captureTarget]}`, 32, 235, conflict ? C.red : C.amber)
    ink(context, 'ESC ANULUJ', 448, 235, C.ice, 1, true)
    ink(context, clipped(message ?? 'NACIŚNIJ NOWY KLAWISZ FIZYCZNY.', 412), 32, 246, conflict ? C.red : C.snow)
    return
  }
  ink(context, clipped(message ?? 'KLAWISZE SĄ FIZYCZNE: DZIAŁAJĄ W KAŻDYM UKŁADZIE.', 412), 32, 235, conflict ? C.red : C.ice)
  ink(context, '↑/↓ WYBIERZ   ENTER ZMIEŃ   ←/→ WARTOŚĆ   BACKSPACE WRÓĆ', 32, 246, C.snow)
}

/** Bez stanu aplikacji i bez zapisu: można wołać co klatkę albo po zmianie ustawień. */
export function drawSettingsScreen(context: CanvasRenderingContext2D, state: SettingsViewState): void {
  context.imageSmoothingEnabled = false
  rect(context, 0, 0, VIEW_WIDTH, VIEW_HEIGHT, C.night)
  for (let y = 0; y < VIEW_HEIGHT; y += 8) rect(context, 0, y, VIEW_WIDTH, 1, C.field)

  rect(context, 14, 10, 452, 252, C.panel)
  rim(context, 14, 10, 452, 252, C.edge)
  rim(context, 18, 14, 444, 244, C.blue)
  rect(context, 19, 15, 119, 2, C.amber)
  rect(context, 462, 10, 4, 4, C.amber)
  ink(context, 'USTAWIENIA', 28, 19, C.amber, 3)
  ink(context, `${String(SETTINGS_ROWS.indexOf(state.selectedRow) + 1).padStart(2, '0')} / 12`, 448, 29, C.ice, 1, true)
  ink(context, 'KLAWISZE  /  DŹWIĘK  /  OBRAZ', 28, 44, C.ice)
  rect(context, 27, 53, 426, 1, C.blue)

  ink(context, 'STEROWANIE', 28, 58, C.amber)
  ink(context, 'DOSTĘPNOŚĆ', 260, 58, C.amber)
  rect(context, 28, 66, 221, 1, C.edge)
  rect(context, 260, 66, 192, 1, C.edge)

  BINDING_ROWS.forEach((id, index) => row(
    context, id, state.settings, state.selectedRow === id, state.captureTarget === id,
    28, 70 + index * 23, 221, 20,
  ))
  OPTION_ROWS.forEach((id, index) => row(
    context, id, state.settings, state.selectedRow === id, false,
    260, 70 + index * 25, 192, 21,
  ))

  rect(context, 260, 196, 192, 33, C.field)
  rect(context, 260, 196, 3, 33, C.green)
  ink(context, 'POMOC  /  BEZPIECZNY POWRÓT', 270, 201, C.green)
  ink(context, state.selectedRow === 'scaleMode' ? 'DOPASUJ / RÓWNE PIKSELE' : 'ENTER I BACKSPACE W MENU', 270, 211, C.snow)
  ink(context, 'DOMYŚLNE: OSTATNI WIERSZ', 270, 220, C.ice)
  feedback(context, state)
}
