import { describe, expect, it } from 'vitest'
import { roundLiveDistanceMeters } from '../src/render/hillView'

describe('HUD bieżącej odległości', () => {
  it('zaokrągla pomiar do najbliższej połówki metra', () => {
    expect(roundLiveDistanceMeters(125.24)).toBe(125)
    expect(roundLiveDistanceMeters(125.3)).toBe(125.5)
    expect(roundLiveDistanceMeters(125.74)).toBe(125.5)
    expect(roundLiveDistanceMeters(125.75)).toBe(126)
  })
})
