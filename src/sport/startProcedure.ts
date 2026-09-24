/** PKG-005 / P16 — trzyfazowa procedura startowa i decyzja trenera. */

import type { StartPhase } from './compensation'

export const GREEN_START_LIMIT_TICKS = 10 * 120

export type StartProcedureState = {
  readonly phase: StartPhase
  readonly juryHeld: boolean
  readonly activeGreenTicks: number
  readonly timedOut: boolean
  readonly coachPanelOpen: boolean
  readonly pendingCoachGateNumber: number | null
  readonly acceptedCoachGateNumber: number | null
  readonly lastCoachDecision: 'none' | 'accepted' | 'rejected-phase' | 'rejected-gate'
}

export function createStartProcedure(): StartProcedureState {
  return {
    phase: 'red',
    juryHeld: false,
    activeGreenTicks: 0,
    timedOut: false,
    coachPanelOpen: false,
    pendingCoachGateNumber: null,
    acceptedCoachGateNumber: null,
    lastCoachDecision: 'none',
  }
}

export function advanceStartPhase(state: StartProcedureState): StartProcedureState {
  if (state.juryHeld || state.timedOut) return state
  // GAMEPLAY_SPEC §7: przejście czerwone→żółte zamyka edycję trenera.
  if (state.phase === 'red') {
    return {
      ...state,
      phase: 'yellow',
      coachPanelOpen: false,
      pendingCoachGateNumber: null,
    }
  }
  if (state.phase === 'yellow') return { ...state, phase: 'green', activeGreenTicks: 0 }
  return state
}

export function restartStartProcedure(state: StartProcedureState): StartProcedureState {
  return {
    ...state,
    phase: 'red',
    juryHeld: false,
    activeGreenTicks: 0,
    timedOut: false,
    coachPanelOpen: false,
    pendingCoachGateNumber: null,
    acceptedCoachGateNumber: null,
    lastCoachDecision: 'none',
  }
}

export function setJuryHeld(state: StartProcedureState, held: boolean): StartProcedureState {
  if (state.timedOut) return state
  return { ...state, juryHeld: held }
}

export function tickStartProcedure(state: StartProcedureState, ticks = 1): StartProcedureState {
  if (!Number.isInteger(ticks) || ticks < 0) throw new Error('Liczba ticków procedury musi być nieujemna i całkowita.')
  if (state.phase !== 'green' || state.juryHeld || state.timedOut || ticks === 0) return state
  const activeGreenTicks = Math.min(GREEN_START_LIMIT_TICKS, state.activeGreenTicks + ticks)
  return {
    ...state,
    activeGreenTicks,
    timedOut: activeGreenTicks >= GREEN_START_LIMIT_TICKS,
  }
}

export function openCoachPanel(
  state: StartProcedureState,
  juryGateNumber: number,
): StartProcedureState {
  if (state.phase !== 'red' || state.juryHeld || state.timedOut) {
    return { ...state, lastCoachDecision: 'rejected-phase' }
  }
  return {
    ...state,
    coachPanelOpen: true,
    pendingCoachGateNumber: Math.max(1, juryGateNumber - 1),
    lastCoachDecision: 'none',
  }
}

export function changePendingCoachGate(
  state: StartProcedureState,
  juryGateNumber: number,
  delta: number,
): StartProcedureState {
  if (!state.coachPanelOpen || !Number.isInteger(delta)) return state
  const current = state.pendingCoachGateNumber ?? Math.max(1, juryGateNumber - 1)
  return {
    ...state,
    pendingCoachGateNumber: Math.max(1, Math.min(juryGateNumber - 1, current + delta)),
  }
}

export type CoachConfirmation = {
  readonly state: StartProcedureState
  readonly accepted: boolean
}

export function confirmCoachGate(
  state: StartProcedureState,
  juryGateNumber: number,
): CoachConfirmation {
  if (!state.coachPanelOpen || state.phase !== 'red' || state.juryHeld || state.timedOut) {
    return {
      state: { ...state, coachPanelOpen: false, lastCoachDecision: 'rejected-phase' },
      accepted: false,
    }
  }
  const requestedGate = state.pendingCoachGateNumber
  if (requestedGate === null || requestedGate >= juryGateNumber || requestedGate < 1) {
    return {
      state: { ...state, coachPanelOpen: false, lastCoachDecision: 'rejected-gate' },
      accepted: false,
    }
  }
  return {
    state: {
      ...state,
      coachPanelOpen: false,
      acceptedCoachGateNumber: requestedGate,
      lastCoachDecision: 'accepted',
    },
    accepted: true,
  }
}

export function actualGateNumber(state: StartProcedureState, juryGateNumber: number): number {
  return state.acceptedCoachGateNumber ?? juryGateNumber
}

export function greenSecondsRemaining(state: StartProcedureState): number {
  return Math.max(0, (GREEN_START_LIMIT_TICKS - state.activeGreenTicks) / 120)
}
