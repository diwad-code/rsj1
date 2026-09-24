import { describe, expect, it } from 'vitest'
import {
  GREEN_START_LIMIT_TICKS,
  advanceStartPhase,
  changePendingCoachGate,
  confirmCoachGate,
  createStartProcedure,
  restartStartProcedure,
  setJuryHeld,
  tickStartProcedure,
} from '../src/sport/startProcedure'

describe('Q-FIS-16 — coach tylko w czerwonej fazie', () => {
  it('akceptuje obniżenie w red', async () => {
    const { openCoachPanel } = await import('../src/sport/startProcedure')
    let state = openCoachPanel(createStartProcedure(), 8)
    state = changePendingCoachGate(state, 8, -2)
    const result = confirmCoachGate(state, 8)
    expect(result.accepted).toBe(true)
    expect(result.state.acceptedCoachGateNumber).toBe(5)
  })

  it('przejście do żółtej zamyka panel i czyści belkę oczekiwaną', async () => {
    const { openCoachPanel } = await import('../src/sport/startProcedure')
    const redPanel = openCoachPanel(createStartProcedure(), 8)
    const yellow = advanceStartPhase(redPanel)
    expect(yellow.phase).toBe('yellow')
    expect(yellow.coachPanelOpen).toBe(false)
    expect(yellow.pendingCoachGateNumber).toBeNull()
  })

  it('odrzuca panel otwarty w red po przejściu do yellow i green', async () => {
    const { openCoachPanel } = await import('../src/sport/startProcedure')
    const redPanel = openCoachPanel(createStartProcedure(), 8)
    const yellow = advanceStartPhase(redPanel)
    expect(confirmCoachGate(yellow, 8)).toMatchObject({ accepted: false, state: { lastCoachDecision: 'rejected-phase' } })

    const green = advanceStartPhase(yellow)
    expect(confirmCoachGate(green, 8)).toMatchObject({ accepted: false, state: { lastCoachDecision: 'rejected-phase' } })
  })

  it('nowa czerwona procedura wymaga ponownej decyzji coacha', async () => {
    const { openCoachPanel } = await import('../src/sport/startProcedure')
    const accepted = confirmCoachGate(openCoachPanel(createStartProcedure(), 8), 8).state
    expect(accepted.acceptedCoachGateNumber).toBe(7)
    expect(restartStartProcedure(accepted).acceptedCoachGateNumber).toBeNull()
  })
})

describe('zielone i decyzje jury', () => {
  it('kończy aktywne 10 sekund, a wstrzymanie jury nie zużywa okna', () => {
    let state = advanceStartPhase(advanceStartPhase(createStartProcedure()))
    state = tickStartProcedure(state, 600)
    expect(state.timedOut).toBe(false)

    state = setJuryHeld(state, true)
    const held = tickStartProcedure(state, GREEN_START_LIMIT_TICKS)
    expect(held.activeGreenTicks).toBe(600)
    expect(held.timedOut).toBe(false)

    state = setJuryHeld(held, false)
    state = tickStartProcedure(state, 599)
    expect(state.timedOut).toBe(false)
    state = tickStartProcedure(state, 1)
    expect(state.timedOut).toBe(true)
  })
})
