import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * P07 — rdzeń symulacji nie importuje DOM, Canvas, audio ani magazynu danych.
 * Sprawdzamy to na źródłach, bo w Vitest globalne API przeglądarki i tak nie
 * istnieją, więc sam udany przebieg testów nie jest dowodem.
 */

const SIMULATION_DIR = resolve(process.cwd(), 'src/simulation')

/** Komentarze opisują zakaz, więc badamy sam kod. */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
}
const FORBIDDEN = [
  /\bdocument\b/,
  /\bwindow\b/,
  /\bAudioContext\b/,
  /\bCanvas(Rendering|Image)?/,
  /\bindexedDB\b/,
  /from '\.\.\/(render|app|audio|storage)/,
]

describe('czystość symulacji', () => {
  const files = readdirSync(SIMULATION_DIR).filter((name) => name.endsWith('.ts'))

  it('obejmuje wszystkie moduły symulacji', () => {
    expect(files.sort()).toEqual(['aero.ts', 'hill.ts', 'jump.ts', 'params.ts', 'technicalHill.ts', 'wind.ts'])
  })

  it.each(files)('%s nie sięga do DOM, Canvas ani audio', (name) => {
    const source = stripComments(readFileSync(resolve(SIMULATION_DIR, name), 'utf8'))
    for (const pattern of FORBIDDEN) {
      expect(source, `${name} zawiera ${pattern}`).not.toMatch(pattern)
    }
  })

  it('importuje wyłącznie rdzeń czasu i wejścia', () => {
    const imports = new Set<string>()
    for (const name of files) {
      const source = readFileSync(resolve(SIMULATION_DIR, name), 'utf8')
      for (const match of source.matchAll(/from '([^']+)'/g)) {
        const target = match[1]
        if (target && !target.startsWith('./')) imports.add(target)
      }
    }
    expect([...imports].sort()).toEqual(['../core/fixedClock', '../input/keyboard'])
  })
})
