/** PKG-005/P42 — ekrany DOS konkursu i hotseat, bufor 480×270, font wyłącznie bitmapowy. */

import { hotseatSlotIndexes, LOCAL_PROFILES, type PlayerBindings } from '../player/profiles'
import {
  LARGE_ROUND_SUMMARY_VISIBLE_ROWS,
  ROUND_SUMMARY_VISIBLE_ROWS,
  type CompetitionSessionSnapshot,
} from '../app/competitionSession'
import type { AiDifficulty, RankingEntry } from '../sport/competition'
import {
  bindingKeyHint, drawResultMarks, fitBindingHint, hasRemappedJumpBindings, VIEW_HEIGHT, VIEW_WIDTH,
} from './hillView'
import { drawPixelText, measurePixelText, type PixelTextAlign } from './pixelFont'

const COLOR = {
  ink: '#07111f',
  panel: '#0c1827',
  panelAlt: '#14233b',
  border: '#536c7a',
  blue: '#286bc6',
  text: '#f3ead1',
  dim: '#91b4cb',
  gold: '#f1bd79',
  red: '#d64d53',
  yellow: '#e7b842',
  green: '#3fa865',
} as const

const DIFFICULTY_LABEL: Readonly<Record<AiDifficulty, string>> = {
  easy: 'ŁATWA',
  normal: 'NORMALNA',
  hard: 'TRUDNA',
}

function clear(context: CanvasRenderingContext2D): void {
  context.imageSmoothingEnabled = false
  context.fillStyle = COLOR.ink
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT)
  context.fillStyle = '#14233b'
  for (let y = 0; y < VIEW_HEIGHT; y += 4) context.fillRect(0, y, VIEW_WIDTH, 1)
}

function panel(context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number): void {
  context.fillStyle = COLOR.panel
  context.fillRect(x, y, width, height)
  context.strokeStyle = COLOR.dim
  context.lineWidth = 1
  context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1)
  context.strokeStyle = COLOR.blue
  context.strokeRect(x + 3.5, y + 3.5, width - 7, height - 7)
}

function sizeToScale(size: number): number {
  return size >= 30 ? 4 : size >= 20 ? 3 : size >= 13 ? 2 : 1
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
  size = 18,
  align: CanvasTextAlign = 'left',
): void {
  context.textAlign = align
  const scale = sizeToScale(size)
  drawPixelText(context, value, x, y - 7 * scale, color, scale, currentAlign(context))
}

function header(context: CanvasRenderingContext2D, title: string, subtitle: string): void {
  // Tytuł i podtytuł na osobnych wierszach — przy 480 px szerokości długie
  // podtytuły kolidowałyby z tytułem w jednej linii.
  text(context, title, 18, 16, COLOR.gold, 13)
  text(context, subtitle, 18, 28, COLOR.dim, 7)
  context.fillStyle = COLOR.blue
  context.fillRect(18, 33, 444, 1)
}

function points(value: number | null): string {
  return value === null ? '—' : `${(value / 10).toFixed(1).replace('.', ',')} pkt`
}

function distance(value: number): string {
  return `${(value / 2).toFixed(1).replace('.', ',')} m`
}

function statusLabel(status: RankingEntry['status']): string {
  const labels: Record<RankingEntry['status'], string> = {
    waiting: 'CZEKA',
    landed: 'USTANY',
    fall: 'UPADEK',
    dns: 'DNS',
    nps: 'NPS',
    dsq: 'DSQ',
    withdrawn: 'REZYGNACJA',
  }
  return labels[status]
}

function fitTableText(value: string, width: number, scale: number): string {
  if (measurePixelText(value, scale) <= width) return value
  let clipped = value
  while (clipped.length > 0 && measurePixelText(`${clipped}...`, scale) > width) clipped = clipped.slice(0, -1)
  return `${clipped}...`
}

const RESULT_FEEDBACK: Readonly<Record<string, string>> = {
  'takeoff-too-early': 'WYBICIE ZA WCZEŚNIE',
  'takeoff-too-late': 'WYBICIE ZA PÓŹNO',
  'excessive-pitch': 'SKRÓĆ KOREKTĘ POZYCJI',
  'late-landing-prep': 'WCZEŚNIEJ PRZYGOTUJ LĄDOWANIE',
  'no-telemark': 'TELEMARK PODNIESIE NOTY',
  'one-hand-support': 'PODPÓRKA JEDNĄ DŁONIĄ (-3,0)',
  'two-hand-support': 'PODPÓRKA OBIEMA DŁOŃMI (-4,5)',
  'fall-before-fall-line': 'UTRZYMAJ ODJAZD DO FALL LINE',
  'unstable-outrun': 'USTABILIZUJ ODJAZD',
  clean: 'CZYSTA PRÓBA',
}

export type CompetitionSetupPersistence = {
  readonly hillLabel?: string
  readonly resumeAvailable: boolean
  readonly resumeLabel: string
  readonly replayAvailable: boolean
  readonly recordHalfMeters: number | null
  readonly bindingHints?: PlayerBindings
}

export function drawCompetitionSetup(
  context: CanvasRenderingContext2D,
  profileCount: number,
  difficulty: AiDifficulty,
  persistence: CompetitionSetupPersistence = {
    resumeAvailable: false,
    resumeLabel: 'BRAK ZAPISANEJ SESJI',
    replayAvailable: false,
    recordHalfMeters: null,
  },
): void {
  clear(context)
  header(context, 'KONKURS STANDARDOWY', `${persistence.hillLabel ?? 'TECHNICZNA • K120/HS134'} • 75 MIEJSC • ZAPIS LOKALNY`)
  panel(context, 18, 42, 180, 196)
  text(context, 'USTAWIENIA', 31, 60, COLOR.gold, 11)
  text(context, `LUDZIE   <  ${profileCount}  >`, 33, 83, COLOR.text, 12)
  text(context, `RYWALE   ↑  ${DIFFICULTY_LABEL[difficulty]}  ↓`, 33, 104, COLOR.text, 9)
  text(context, 'KWALIFIKACJE 75 → 50', 33, 127, COLOR.dim, 8)
  text(context, 'SERIA 1 → FINAŁ 30', 33, 139, COLOR.dim, 8)
  text(
    context,
    persistence.recordHalfMeters === null
      ? 'REKORD KONKURSOWY: BRAK'
      : `REKORD KONKURSOWY ${distance(persistence.recordHalfMeters)}`,
    33,
    151,
    COLOR.dim,
    8,
  )
  text(context, persistence.resumeLabel.slice(0, 34), 33, 163, persistence.resumeAvailable ? COLOR.gold : COLOR.dim, 7)
  context.fillStyle = COLOR.green
  context.fillRect(30, 171, 156, 25)
  text(
    context,
    'NACIŚNIJ ENTER',
    108,
    188,
    COLOR.ink,
    9,
    'center',
  )
  text(context, persistence.resumeAvailable ? 'WZNÓW KONKURS' : 'ROZPOCZNIJ KONKURS', 108, 208, COLOR.green, 7, 'center')
  text(
    context,
    persistence.resumeAvailable ? 'N — NOWY KONKURS (NADPISZE ZAPIS)' : 'N — NOWY KONKURS',
    108,
    222,
    COLOR.dim,
    7,
    'center',
  )
  if (persistence.replayAvailable) text(context, 'POWTÓRKA DOSTĘPNA W MENU', 108, 234, COLOR.dim, 6, 'center')

  panel(context, 210, 42, 252, 196)
  const slots = hotseatSlotIndexes(profileCount)
  const bindings = persistence.bindingHints
  const remapped = hasRemappedJumpBindings(bindings)
  if (profileCount === 1) {
    const profile = LOCAL_PROFILES[0]
    text(context, 'TWÓJ ZAWODNIK', 336, 65, COLOR.dim, 9, 'center')
    if (profile) {
      // Prosta, czytelna karta postaci zamiast anonimowego prostokąta koloru.
      context.fillStyle = COLOR.panelAlt
      context.fillRect(228, 76, 68, 79)
      context.fillStyle = COLOR.gold
      context.fillRect(228, 76, 3, 79)
      context.fillStyle = profile.suitColor
      context.fillRect(252, 94, 21, 32)
      context.fillRect(247, 101, 6, 23)
      context.fillRect(273, 101, 6, 23)
      context.fillRect(253, 126, 7, 15)
      context.fillRect(265, 126, 7, 15)
      context.fillStyle = COLOR.gold
      context.fillRect(256, 82, 13, 12)
      context.fillStyle = COLOR.ink
      context.fillRect(256, 82, 13, 3)
      context.fillStyle = profile.skiColor
      context.fillRect(238, 142, 51, 2)
      text(context, profile.name, 365, 98, COLOR.gold, 13, 'center')
      text(context, `NUMER #${String((slots[0] ?? 0) + 1).padStart(2, '0')}`, 365, 119, COLOR.text, 8, 'center')
      const launch = remapped
        ? `${bindingKeyHint(bindings.right)} START  ${bindingKeyHint(bindings.takeoff)} WYBICIE  ${bindingKeyHint(bindings.left)}/${bindingKeyHint(bindings.right)} LOT`
        : '↑ WYBICIE  •  ← → LOT'
      const land = remapped
        ? `${bindingKeyHint(bindings.telemark)} TELEMARK  •  ${bindingKeyHint(bindings.parallel)} DWIE NOGI`
        : 'T TELEMARK  •  R DWIE NOGI'
      text(context, fitBindingHint(launch, 230), 336, 166, COLOR.text, 8, 'center')
      text(context, fitBindingHint(land, 230), 336, 181, COLOR.dim, 7, 'center')
    }
  } else {
    text(context, `${profileCount} GRACZY — WSPÓLNA KLAWIATURA`, 223, 60, COLOR.gold, 9)
    for (let index = 0; index < profileCount; index += 1) {
      const profile = LOCAL_PROFILES[index]
      if (!profile) continue
      const y = 78 + index * 14
      context.fillStyle = profile.suitColor
      context.fillRect(224, y - 7, 6, 6)
      text(context, `#${String((slots[index] ?? 0) + 1).padStart(2, '0')}  ${profile.name}`, 236, y, COLOR.text, 8)
    }
    if (remapped) {
      text(context, fitBindingHint(`${bindingKeyHint(bindings.right)} START  ${bindingKeyHint(bindings.takeoff)} WYBICIE  ${bindingKeyHint(bindings.left)}/${bindingKeyHint(bindings.right)} LOT`, 230), 336, 216, COLOR.text, 7, 'center')
      text(context, fitBindingHint(`${bindingKeyHint(bindings.telemark)} TELEMARK  ${bindingKeyHint(bindings.parallel)} DWIE NOGI`, 230), 336, 228, COLOR.dim, 7, 'center')
    }
  }
  text(context, '←/→ GRACZE  •  ↑/↓ TRUDNOŚĆ', remapped && profileCount > 1 ? 336 : 310, remapped && profileCount > 1 ? 257 : 227, COLOR.dim, 7, 'center')
  text(context, 'BACKSPACE — MENU', 18, 257, COLOR.gold, 8)
}

function drawTable(
  context: CanvasRenderingContext2D,
  standings: readonly RankingEntry[],
  x: number,
  y: number,
  width: number,
  rows: number,
  highlightedIds: readonly string[] | null,
  largeText = false,
): void {
  const narrow = largeText && width < 300
  const rowHeight = largeText ? (narrow ? 32 : 22) : 15
  context.fillStyle = COLOR.panelAlt
  context.fillRect(x, y, width, rows * rowHeight + (largeText ? 18 : 17))
  text(context, 'M.', x + 6, y + (largeText && !narrow ? 16 : 12), COLOR.dim, largeText && !narrow ? 13 : 7)
  text(context, 'ZAWODNIK', x + (largeText && !narrow ? 38 : 29), y + (largeText && !narrow ? 16 : 12), COLOR.dim, largeText && !narrow ? 13 : 7)
  text(context, largeText && narrow ? 'WYNIK' : 'WYNIK / STATUS', x + width - 6, y + (largeText && !narrow ? 16 : 12), COLOR.dim, largeText && !narrow ? 13 : 7, 'right')
  const visible = standings.slice(0, rows)
  const highlighted = (highlightedIds ?? [])
    .map((highlightedId) => standings.find((entry) => entry.participantId === highlightedId))
    .filter((entry): entry is RankingEntry => entry !== undefined)
  if (highlighted.length > 0) {
    const first = highlighted[0]
    if (first && !visible.some((entry) => entry.participantId === first.participantId)) {
      visible[visible.length - 1] = first
    }
  }
  visible.forEach((entry, index) => {
    const active = highlighted.some((candidate) => candidate.participantId === entry.participantId)
    const local = entry.participantId.startsWith('local-')
    const rowY = y + 26 + index * 15
    const rowTop = y + (narrow ? 20 : 21) + index * rowHeight
    if (active) {
      context.fillStyle = '#294657'
      context.fillRect(x + 2, largeText ? rowTop - 2 : rowY - 10, width - 4, largeText ? rowHeight : 13)
      context.fillStyle = COLOR.gold
      context.fillRect(x + 2, largeText ? rowTop - 2 : rowY - 10, 2, largeText ? rowHeight : 13)
    } else if (local) {
      context.fillStyle = '#1b3445'
      context.fillRect(x + 2, largeText ? rowTop - 2 : rowY - 10, width - 4, largeText ? rowHeight : 13)
    }
    const rank = entry.rank === null ? '—' : String(entry.rank)
    const rowColor = active ? COLOR.gold : local ? COLOR.green : COLOR.text
    if (largeText) {
      const status = entry.totalTenths === null ? statusLabel(entry.status) : points(entry.totalTenths)
      const statusWidth = measurePixelText(status, 2)
      const nameX = x + (narrow ? 34 : 38)
      const nameWidth = narrow ? width - 42 : width - 44 - statusWidth - 8
      drawPixelText(context, rank.padStart(2, ' '), x + 6, rowTop, rowColor, 2)
      drawPixelText(context, fitTableText(`${local ? 'TY ' : ''}${entry.name}`, nameWidth, 2), nameX, rowTop, rowColor, 2)
      drawPixelText(context, status, x + width - 6, rowTop + (narrow ? 16 : 0), entry.totalTenths === null ? COLOR.red : COLOR.dim, 2, 'right')
      return
    }
    text(context, rank.padStart(2, ' '), x + 6, rowY, rowColor, 7)
    text(context, `${local ? 'TY ' : ''}${entry.name.slice(0, 20)}`, x + 29, rowY, rowColor, 7)
    text(
      context,
      entry.totalTenths === null ? statusLabel(entry.status) : points(entry.totalTenths),
      x + width - 6,
      rowY,
      entry.totalTenths === null ? COLOR.red : COLOR.dim,
      7,
      'right',
    )
  })
}

export function drawHandover(context: CanvasRenderingContext2D, snapshot: CompetitionSessionSnapshot, bindingHints?: PlayerBindings): void {
  clear(context)
  header(context, 'PRZEKAŻ KLAWIATURĘ', `${snapshot.roundLabel} • ${snapshot.nextStartIndex + 1}/${snapshot.roundSize}`)
  panel(context, 46, 52, 388, 163)
  text(context, 'NASTĘPNY ZAWODNIK', 240, 82, COLOR.dim, 9)
  text(context, snapshot.currentParticipantName ?? '—', 240, 123, COLOR.gold, 19, 'center')
  text(context, `BELKA JURY ${snapshot.juryGateNumber}`, 240, 146, COLOR.text, 9, 'center')
  context.fillStyle = snapshot.handoverReady ? COLOR.green : COLOR.red
  context.fillRect(115, 168, 250, 26)
  text(
    context,
    snapshot.handoverReady ? 'NACIŚNIJ ENTER' : 'ZWOLNIJ ENTER…',
    240,
    185,
    COLOR.ink,
    11,
    'center',
  )
  if (hasRemappedJumpBindings(bindingHints)) {
    const controls = `${bindingKeyHint(bindingHints.right)} START  ${bindingKeyHint(bindingHints.takeoff)} WYB.  ${bindingKeyHint(bindingHints.left)}/${bindingKeyHint(bindingHints.right)} LOT  ${bindingKeyHint(bindingHints.telemark)} TELE.  ${bindingKeyHint(bindingHints.parallel)} 2 NOGI`
    text(context, fitBindingHint(controls, 356), 240, 209, COLOR.dim, 7, 'center')
  }
  text(context, 'Q — rezygnacja z potwierdzeniem', 240, 237, COLOR.dim, 7, 'center')
}

export function drawStartProcedure(context: CanvasRenderingContext2D, snapshot: CompetitionSessionSnapshot, bindingHints?: PlayerBindings): void {
  clear(context)
  header(context, snapshot.roundLabel, `${snapshot.currentParticipantName ?? '—'} • BELKA ${snapshot.actualGateNumber}`)
  panel(context, 36, 46, 408, 183)
  text(context, 'PROCEDURA STARTOWA', 55, 66, COLOR.gold, 11)

  const phases = [
    { id: 'red', label: 'CZERWONE', color: COLOR.red },
    { id: 'yellow', label: 'ŻÓŁTE', color: COLOR.yellow },
    { id: 'green', label: 'ZIELONE', color: COLOR.green },
  ] as const
  phases.forEach((phase, index) => {
    const x = 82 + index * 123
    context.fillStyle = snapshot.startPhase === phase.id ? phase.color : '#263344'
    context.fillRect(x, 82, 70, 40)
    text(context, phase.label, x + 35, 106, snapshot.startPhase === phase.id ? COLOR.ink : COLOR.dim, 9, 'center')
  })

  if (snapshot.startPhase === 'green') {
    text(
      context,
      snapshot.juryHeld ? 'JURY: WSTRZYMANE' : `${snapshot.greenSecondsRemaining?.toFixed(1).replace('.', ',')} S`,
      240,
      148,
      snapshot.juryHeld ? COLOR.red : COLOR.green,
      snapshot.juryHeld ? 11 : 17,
      'center',
    )
    context.fillStyle = snapshot.juryHeld ? COLOR.red : COLOR.green
    context.fillRect(158, 157, 164, 23)
    text(context, startProcedurePrimaryCopy(snapshot, bindingHints), 240, 173, COLOR.ink, 10, 'center')
  } else if (!snapshot.coachPanelOpen) {
    text(context, snapshot.juryHeld ? 'JURY: WSTRZYMANE' : 'ENTER — NASTĘPNA FAZA', 240, 150, snapshot.juryHeld ? COLOR.red : COLOR.text, 10, 'center')
  }

  if (snapshot.coachPanelOpen) {
    const pending = snapshot.coachPendingGateNumber ?? snapshot.juryGateNumber
    panel(context, 52, 147, 376, 62)
    text(context, 'PANEL TRENERA — OBNIŻ BELKĘ JURY', 240, 162, COLOR.gold, 8, 'center')
    text(context, `JURY ${snapshot.juryGateNumber}`, 190, 181, COLOR.text, 12, 'center')
    text(context, '→', 240, 181, COLOR.dim, 12, 'center')
    text(
      context,
      `TRENER ${pending}`,
      290,
      181,
      pending < snapshot.juryGateNumber ? COLOR.green : COLOR.red,
      12,
      'center',
    )
    text(
      context,
      snapshot.juryHeld
        ? 'JURY: WSTRZYMANE — C ODRZUCI DECYZJĘ'
        : '[ / ] ZMIANA • C ZATWIERDŹ • ENTER — ZAMKNIJ',
      240,
      201,
      snapshot.juryHeld ? COLOR.red : COLOR.dim,
      7,
      'center',
    )
  } else {
    const coach = snapshot.coachDecision === 'accepted'
      ? `TRENER: PRZYJĘTO BELKĘ ${snapshot.actualGateNumber}`
      : snapshot.coachDecision.startsWith('rejected')
        ? 'TRENER: ODRZUCONO — NIE CZERWONE'
        : 'C — PANEL TRENERA (TYLKO CZERWONE, TYLKO OBNIŻENIE)'
    text(context, coach, 240, 195, snapshot.coachDecision.startsWith('rejected') ? COLOR.red : COLOR.dim, 8, 'center')
    text(context, '[ / ] BELKA JURY  •  J WSTRZYMAJ  •  X ANULUJ SERIĘ', 240, 213, COLOR.dim, 7, 'center')
  }
}

/** Stabilny kontrakt tekstu przycisku, używany też przez regresję przeglądarkową. */
export function startProcedurePrimaryCopy(snapshot: Pick<CompetitionSessionSnapshot, 'juryHeld'>, bindingHints?: PlayerBindings): string {
  return snapshot.juryHeld ? 'START ZABLOKOWANY'
    : hasRemappedJumpBindings(bindingHints) ? `${bindingKeyHint(bindingHints.right)} OPUŚĆ BELKĘ` : '→ OPUŚĆ BELKĘ'
}

function drawJudgeNote(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  judgeNumber: number,
  markText: string,
  dropped: boolean,
): void {
  drawPixelText(context, `S${judgeNumber}`, x + 3, y + 2, COLOR.dim, 1, 'left')
  if (dropped) drawPixelText(context, 'X', x + width - 8, y + 2, COLOR.red, 1, 'left')
  drawPixelText(context, markText, x + width / 2, y + 11, COLOR.text, 1, 'center')
  if (dropped) {
    context.fillStyle = COLOR.red
    context.fillRect(x + 2, y + 12, width - 4, 2)
  }
}

function humanSummaryLine(snapshot: CompetitionSessionSnapshot): string {
  if (snapshot.humanStandings.length === 0) return 'BRAK LOKALNEGO ZAWODNIKA W TABELI'
  return snapshot.humanStandings
    .slice(0, 3)
    .map((entry) => `${entry.name} — MIEJSCE ${entry.rank ?? '—'} (${points(entry.totalTenths)})`)
    .join(' • ')
    + (snapshot.humanStandings.length > 3 ? ` • +${snapshot.humanStandings.length - 3}` : '')
}

export function drawRoundSummary(context: CanvasRenderingContext2D, snapshot: CompetitionSessionSnapshot, largeText = false): void {
  clear(context)
  const completedLabels = {
    qualification: 'KWALIFIKACJE',
    first: 'PIERWSZA SERIA',
    final: 'FINAŁ',
  } as const
  const completed = snapshot.lastCompletedRound ?? snapshot.roundId
  const completedLabel = completedLabels[completed]
  header(context, `${completedLabel} — ZAKOŃCZONA`, 'PEŁNA TABELA SERII • ZATWIERDŹ ENTEREM')

  panel(context, 18, 42, 444, 186)
  const total = snapshot.standings.length
  const visibleRows = largeText ? LARGE_ROUND_SUMMARY_VISIBLE_ROWS : ROUND_SUMMARY_VISIBLE_ROWS
  const maximumStart = Math.max(0, total - visibleRows)
  const start = Math.min(maximumStart, Math.max(0, snapshot.roundSummaryScroll))
  const slice = snapshot.standings.slice(start, start + visibleRows)
  drawTable(
    context,
    slice,
    28,
    54,
    424,
    visibleRows,
    snapshot.humanStandings.map((entry) => entry.participantId),
    largeText,
  )

  text(context, largeText ? fitTableText(humanSummaryLine(snapshot), 424, 1) : humanSummaryLine(snapshot), 240, 246, COLOR.gold, 7, 'center')
  text(
    context,
    total === 0
      ? 'BRAK WYNIKÓW SERII • ENTER — DALEJ'
      : `POZYCJE ${total === 0 ? 0 : start + 1}–${start + slice.length} Z ${total} • ↑/↓ PRZEWIŃ • ENTER — DALEJ`,
    240,
    261,
    COLOR.dim,
    7,
    'center',
  )
}

export function drawCompetitionProgress(context: CanvasRenderingContext2D, snapshot: CompetitionSessionSnapshot, largeText = false): void {
  clear(context)
  const title = snapshot.view === 'finished'
    ? (snapshot.status === 'cancelled' ? 'KONKURS ANULOWANY' : 'WYNIK KOŃCOWY')
    : snapshot.view === 'round-summary'
      ? `${snapshot.lastCompletedRound === 'qualification' ? 'KWALIFIKACJE' : 'PIERWSZA SERIA'} — ZAKOŃCZONA`
      : snapshot.view === 'result'
        ? 'WYNIK SKOKU'
        : 'KONKURS TRWA'
  header(context, title, `${snapshot.roundLabel} • ${Math.min(snapshot.nextStartIndex, snapshot.roundSize)}/${snapshot.roundSize}`)

  if (snapshot.view === 'result' && snapshot.lastResult) {
    const result = snapshot.lastResult
    panel(context, 18, 42, 444, 196)
    text(context, result.status === 'landed' ? 'SKOK USTANY' : 'UPADEK', 32, 59, result.status === 'landed' ? COLOR.green : COLOR.red, 9)
    text(context, distance(result.distanceHalfMeters), 32, 83, COLOR.gold, 16)
    text(context, points(result.totalTenths), 448, 83, COLOR.text, 16, 'right')
    text(context, 'NOTY S1-S5 • X: NOTA ODRZUCONA', 240, 98, COLOR.dim, 7, 'center')
    drawResultMarks(context, result)
    const parts = result.componentTenths
    text(context, `DŁUGOŚĆ ${points(parts.distance)}   STYL ${points(parts.style)}`, 32, 143, COLOR.text, 7)
    text(context, `WIATR ${points(parts.wind)}   JURY ${points(parts.juryGate)}   TRENER ${points(parts.coachGate)}`, 32, 156, COLOR.dim, 7)
    drawTable(context, snapshot.standings, 28, 165, 424, largeText ? 2 : 3, [result.participantId], largeText)
    text(context, RESULT_FEEDBACK[result.feedbackCode] ?? 'WYNIK ZAPISANY', 240, 249, COLOR.dim, 7, 'center')
    text(context, 'ENTER — DALEJ', 240, 263, COLOR.gold, 8, 'center')
    return
  }

  panel(context, 18, 42, 175, 195)
  if (snapshot.lastResult) {
    const result = snapshot.lastResult
    text(context, result.status === 'landed' ? 'SKOK USTANY' : 'UPADEK', 31, 61, result.status === 'landed' ? COLOR.green : COLOR.red, 10)
    text(context, distance(result.distanceHalfMeters), 31, 84, COLOR.gold, 16)
    text(context, points(result.totalTenths), 31, 103, COLOR.text, 12)
    text(context, 'NOTY: X ODRZUCONA', 31, 118, COLOR.dim, 7)
    result.marksTenths.forEach((mark, index) => {
      drawJudgeNote(
        context,
        31 + index * 30,
        120,
        27,
        index + 1,
        (mark / 10).toFixed(1).replace('.', ','),
        result.droppedJudgeIndexes.includes(index),
      )
    })
    text(context, `DŁUGOŚĆ ${points(result.componentTenths.distance)}`, 31, 151, COLOR.dim, 7)
    text(context, `STYL     ${points(result.componentTenths.style)}`, 31, 163, COLOR.dim, 7)
    text(context, `WIATR    ${points(result.componentTenths.wind)}`, 31, 175, COLOR.dim, 7)
    text(context, `JURY     ${points(result.componentTenths.juryGate)}`, 31, 187, COLOR.dim, 7)
    text(context, `TRENER   ${points(result.componentTenths.coachGate)}`, 31, 199, COLOR.dim, 7)
  } else if (snapshot.lastAdministrative) {
    text(context, statusLabel(snapshot.lastAdministrative.status), 31, 71, COLOR.red, 13)
    text(context, snapshot.lastAdministrative.reason.slice(0, 31), 31, 92, COLOR.dim, 7)
  } else {
    text(context, snapshot.currentParticipantName ?? 'TRWA KONKURS', 31, 66, COLOR.gold, 9)
    text(context, 'TRWAJĄ SKOKI', 31, 91, COLOR.dim, 9)
    text(context, 'POZOSTAŁYCH', 31, 105, COLOR.dim, 9)
    text(context, 'ZAWODNIKÓW', 31, 119, COLOR.dim, 9)
  }
  if (snapshot.view === 'result' && snapshot.lastResult) {
    const resultHuman = snapshot.humanStandings.find(
      (entry) => entry.participantId === snapshot.lastResult?.participantId,
    )
    if (resultHuman) {
      text(
        context,
        `MIEJSCE ${resultHuman.rank ?? '—'} (PROWIZ.)`,
        31,
        211,
        COLOR.gold,
        7,
      )
    }
  }
  if (snapshot.view === 'finished' && snapshot.humanStandings.length > 0) {
    const firstHuman = snapshot.humanStandings[0]
    if (firstHuman) {
      text(
        context,
        `TY — MIEJSCE ${firstHuman.rank ?? '—'} (${points(firstHuman.totalTenths)})`,
        31,
        211,
        COLOR.gold,
        7,
      )
    }
  }
  text(context, `LIDER ${points(snapshot.leaderTotalTenths)}`, 31, 223, COLOR.gold, 8)

  panel(context, 205, 42, 257, 195)
  const spotlight = snapshot.lastResult?.participantId ?? snapshot.currentParticipantId
  const humanIds = snapshot.humanStandings.map((entry) => entry.participantId)
  drawTable(
    context,
    snapshot.standings,
    215,
    54,
    237,
    largeText ? 5 : 11,
    snapshot.view === 'finished' ? humanIds : spotlight ? [spotlight] : [],
    largeText,
  )

  if (snapshot.lastResult) {
    text(context, RESULT_FEEDBACK[snapshot.lastResult.feedbackCode] ?? 'WYNIK ZAPISANY', 240, 247, COLOR.dim, 7, 'center')
  }
  const instruction = snapshot.view === 'finished'
    ? 'ENTER — MENU'
    : snapshot.view === 'result' || snapshot.view === 'round-summary'
      ? 'ENTER — DALEJ'
      : 'TRWAJĄ SKOKI ZAWODNIKÓW'
  text(context, instruction, 240, 261, snapshot.view === 'bots' ? COLOR.dim : COLOR.gold, 8, 'center')
}

export function drawWithdrawalConfirmation(context: CanvasRenderingContext2D, snapshot: CompetitionSessionSnapshot): void {
  clear(context)
  header(context, 'POTWIERDŹ REZYGNACJĘ', snapshot.roundLabel)
  panel(context, 60, 66, 360, 135)
  text(context, snapshot.currentParticipantName ?? '—', 240, 104, COLOR.gold, 15, 'center')
  text(context, 'REZYGNACJA ZAPISZE STATUS, NIE 0 PKT.', 240, 133, COLOR.dim, 8, 'center')
  context.fillStyle = COLOR.red
  context.fillRect(106, 159, 268, 24)
  text(context, 'ENTER — POTWIERDŹ   •   BACKSPACE — WRÓĆ', 240, 175, COLOR.ink, 8, 'center')
}
