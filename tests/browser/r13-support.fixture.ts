import { buildProductionCamera, createDebugJumperPoseSheet, drawProductionScene, jumperVisualFrame, supportTwoVariant, type SceneActor, type TrainingSceneState } from '../../src/render/hillView'
import { buildHill } from '../../src/simulation/technicalHill'
export { render as renderFrozen } from './r12-visual.fixture'

const hill = buildHill()
const state = { snowEnabled: false, reducedMotion: true, debugEnabled: false, leadingTargetHalfMeters: null, recordHalfMeters: null } as TrainingSceneState

export function render(two: boolean, age: number, scale: number, meters = 122, reducedMotion = true, gateNumber?: number, telemark = false) {
  const canvas = document.createElement('canvas')
  canvas.width = 480
  canvas.height = 270
  canvas.style.cssText = `width:${480 * scale}px;height:${270 * scale}px;image-rendering:pixelated;display:block`
  document.body.style.cssText = 'margin:0;background:#07111f'
  document.body.replaceChildren(canvas)
  const context = canvas.getContext('2d')!
  context.imageSmoothingEnabled = false
  const actor: SceneActor = {
    hill, position: hill.surfacePositionAt(meters), pitchRad: -hill.surfaceSlopeRadAt(meters),
    phase: 'Outrun', tick: 200 + age, gateNumber, landingStyle: telemark ? 'telemark' : 'parallel', events: [
      { tick: 140, type: 'landingPrep', detail: `${telemark ? 'telemark' : 'parallel'}, wysokość 9.0 m` },
      { tick: 200, type: 'contact', detail: `${meters.toFixed(1)} m, styl ${telemark ? 'telemark' : 'parallel'}` },
      ...(!telemark ? [{ tick: 200, type: 'handSupport', detail: two ? 'obie dłonie' : 'jedna dłoń' }] : []),
    ],
  }
  const view = buildProductionCamera(actor)
  drawProductionScene(context, actor, view, { ...state, reducedMotion }, 0)
  const pixels = context.getImageData(0, 0, 480, 270).data
  const feet = view.toScreen(actor.position)
  const skin: Array<{ x: number; y: number; gap: number }> = []
  for (let y = Math.round(feet.y) - 28; y < Math.round(feet.y) + 26; y++) {
    for (let x = Math.round(feet.x) - 22; x < Math.round(feet.x) + 32; x++) {
      const i = (y * 480 + x) * 4
      if (pixels[i] !== 241 || pixels[i + 1] !== 189 || pixels[i + 2] !== 121) continue
      const worldX = actor.position.x + (x - feet.x) / view.scale
      const snowY = view.toScreen({ x: worldX, y: hill.surfaceYAtX(worldX) + 0.06 }).y
      if (Math.abs(snowY - y) <= 2) skin.push({ x, y, gap: snowY - y })
    }
  }
  // Count distinct warm palm clusters at the rendered snow edge, not metadata.
  const groups: typeof skin[] = []
  for (const pixel of skin.sort((a, b) => a.x - b.x)) {
    const group = groups.find((g) => g.some((p) => Math.abs(p.x - pixel.x) <= 1 && Math.abs(p.y - pixel.y) <= 1))
    if (group) group.push(pixel)
    else groups.push([pixel])
  }
  const connected = groups.map((group) => group.some(({ x, y }) => {
    for (let dy = -2; dy <= 0; dy++) for (let dx = -2; dx <= 2; dx++) {
      const i = ((y + dy) * 480 + x + dx) * 4
      if (pixels[i] === 140 && pixels[i + 1] === 47 && pixels[i + 2] === 62) return true
    }
    return false
  }))
  // Compare only suit/ski pixels: reduced motion intentionally changes scenery.
  const suitPixels: number[] = []
  for (let y = Math.round(feet.y) - 28; y < Math.round(feet.y) + 26; y++) {
    for (let x = Math.round(feet.x) - 22; x < Math.round(feet.x) + 32; x++) {
      const i = (y * 480 + x) * 4
      if ((pixels[i] === 140 && pixels[i + 1] === 47) || (pixels[i] === 241 && pixels[i + 1] === 189)
        || (pixels[i] === 246 && pixels[i + 1] === 207)) suitPixels.push(i, pixels[i]!, pixels[i + 1]!, pixels[i + 2]!)
    }
  }
  return { frame: jumperVisualFrame(actor, reducedMotion), variant: supportTwoVariant(actor), groups, connected, suitPixels }
}

/** Nearest-neighbour detail of the actual scene, not a separate debug sprite. */
export function crop() {
  const source = document.querySelector('canvas')!
  const canvas = document.createElement('canvas')
  canvas.width = 480; canvas.height = 270
  canvas.style.cssText = source.style.cssText
  const context = canvas.getContext('2d')!
  context.imageSmoothingEnabled = false
  context.drawImage(source, 142, 140, 80, 45, 0, 0, 480, 270)
  document.body.replaceChildren(canvas)
}

export function strip(scale: number) {
  render(false, 0, scale)
  const canvas = document.querySelector('canvas')!
  const context = canvas.getContext('2d')!
  context.fillStyle = '#101a2a'
  context.fillRect(0, 0, 480, 270)
  const support = createDebugJumperPoseSheet({ poses: ['supportOne', 'supportTwo'], columns: 3 })
  const deep = createDebugJumperPoseSheet({ poses: ['landingDeep'], columns: 5 })
  context.drawImage(support.canvas, 120, 0)
  context.drawImage(deep.canvas, 40, 180)
  return [...support.frames, ...deep.frames]
}
