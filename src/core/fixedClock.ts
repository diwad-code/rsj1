export const FIXED_HZ = 120
export const FIXED_STEP_MS = 1000 / FIXED_HZ
export const MAX_STEPS_PER_FRAME = 8

export type FrameResult = {
  steps: number
  overloaded: boolean
}

export class FixedStepClock {
  private accumulatorMs = 0
  private lastFrameMs: number | null = null

  reset(nowMs?: number): void {
    this.accumulatorMs = 0
    this.lastFrameMs = nowMs ?? null
  }

  frame(nowMs: number, step: () => void): FrameResult {
    if (this.lastFrameMs === null) {
      this.lastFrameMs = nowMs
      return { steps: 0, overloaded: false }
    }

    const elapsedMs = nowMs - this.lastFrameMs
    if (elapsedMs < 0) {
      return { steps: 0, overloaded: false }
    }
    this.lastFrameMs = nowMs

    if (elapsedMs > FIXED_STEP_MS * MAX_STEPS_PER_FRAME) {
      this.accumulatorMs = 0
      return { steps: 0, overloaded: true }
    }

    this.accumulatorMs += elapsedMs
    const stepsDue = Math.floor((this.accumulatorMs + 1e-7) / FIXED_STEP_MS)
    if (stepsDue > MAX_STEPS_PER_FRAME) {
      this.accumulatorMs = 0
      return { steps: 0, overloaded: true }
    }

    for (let index = 0; index < stepsDue; index += 1) {
      step()
    }
    this.accumulatorMs -= stepsDue * FIXED_STEP_MS

    return {
      steps: stepsDue,
      overloaded: false,
    }
  }
}
