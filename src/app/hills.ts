/**
 * Explicit catalog of playable hills. H01–H04 are inspired, game-tuned
 * variants; historical data uses separate hillVersion values.
 *
 * No dynamic loader/framework: explicit list, explicit resolver.
 * No other real hill is included before its own package.
 */

import { TECHNICAL_K120, buildHill, type Hill, type HillSpec } from '../simulation/technicalHill'
import { LILLEHAMMER_NORMAL } from '../simulation/hills/lillehammerNormal'
import { ZAKOPANE_LARGE } from '../simulation/hills/zakopaneLarge'
import { OBERSTDORF_LARGE } from '../simulation/hills/oberstdorfLarge'
import { PLANICA_FLYING } from '../simulation/hills/planicaFlying'
import {
  H01_COMPETITION_SESSION_ID,
  H02_COMPETITION_SESSION_ID,
  H03_COMPETITION_SESSION_ID,
  H04_COMPETITION_SESSION_ID,
  defaultCompetitionSessionIdForHillId,
} from './competitionSession'
import type { StoredReplay, StoredSession } from '../storage/schema'

export { H01_COMPETITION_SESSION_ID, H02_COMPETITION_SESSION_ID, H03_COMPETITION_SESSION_ID, H04_COMPETITION_SESSION_ID }

export const PLAYABLE_HILL_SPECS: readonly HillSpec[] = [TECHNICAL_K120, LILLEHAMMER_NORMAL, ZAKOPANE_LARGE, OBERSTDORF_LARGE, PLANICA_FLYING] as const
export const PROVISIONAL_HILL_SPECS: readonly HillSpec[] = [] as const
export const HILL_SPECS: readonly HillSpec[] = [...PLAYABLE_HILL_SPECS, ...PROVISIONAL_HILL_SPECS]

export function isPlayableHillId(hillId: string): boolean {
  return PLAYABLE_HILL_SPECS.some((spec) => spec.id === hillId)
}

export function hillSpecById(hillId: string): HillSpec {
  const found = HILL_SPECS.find((spec) => spec.id === hillId)
  if (!found) throw new Error(`Nieznana skocznia: ${hillId}.`)
  return found
}

export function buildHillById(hillId: string): Hill {
  return buildHill(hillSpecById(hillId))
}

/** Hill-specific competition session id so one hill cannot silently resume another. */
export function hillCompetitionSessionId(hillId: string): string {
  return defaultCompetitionSessionIdForHillId(hillId)
}

/**
 * StoredSession v2 niesie literalne hillId (primary) + hillVersion
 * (versions.hill + competition.versions.hill) + hill-specific competition id.
 * Mismatched hill restores must reject/throw safely — CompetitionSession
 * sprawdza to samo w konstruktorze; ten helper jest dla callerów przed
 * konstrukcją.
 */
export function assertSessionMatchesHill(
  stored: StoredSession,
  expectedHillId: string,
): void {
  const expected = hillSpecById(expectedHillId)
  const expectedSessionId = hillCompetitionSessionId(expectedHillId)
  if (stored.hillId !== expected.id) {
    throw new Error(
      `Zapis z innej skoczni: hillId ${String(stored.hillId)} != ${expected.id}.`,
    )
  }
  if (stored.versions.hill !== expected.hillVersion) {
    throw new Error(
      `Zapis z innej skoczni: versions.hill ${String(stored.versions.hill)} != ${expected.hillVersion}.`,
    )
  }
  const competitionHill = (stored.competition as { versions?: { hill?: unknown } }).versions?.hill
  if (competitionHill !== expected.hillVersion) {
    throw new Error(
      `Zapis z innej skoczni: competition.versions.hill ${String(competitionHill)} != ${expected.hillVersion}.`,
    )
  }
  if (stored.id !== expectedSessionId || stored.competition.id !== expectedSessionId) {
    throw new Error(
      `Zapis z innej skoczni: session id ${String(stored.id)}/${String(stored.competition.id)} != ${expectedSessionId}.`,
    )
  }
}

/** StoredReplay already carries versions.hill + initialState.hillId; reject mismatch safely. */
export function assertReplayMatchesHill(replay: StoredReplay, expectedHillId: string): void {
  const expected = hillSpecById(expectedHillId)
  if (replay.initialState.hillId !== expected.id || replay.versions.hill !== expected.hillVersion) {
    throw new Error(
      `Replay z innej skoczni: ${String(replay.initialState.hillId)}@${String(replay.versions.hill)} != ${expected.id}@${expected.hillVersion}.`,
    )
  }
}
