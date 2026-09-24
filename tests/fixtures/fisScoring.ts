/** P13 — pełne wiersze przepisane z oficjalnych arkuszy FIS/Swiss Timing. */

export type OfficialScoringFixture = {
  readonly id: string
  readonly event: string
  readonly athlete: string
  readonly sourceUrl: string
  readonly provenance: 'official-reference'
  readonly hill: {
    readonly kPointMeters: number
    readonly hillSizeMeters: number
    readonly headWindFactorTenthsPerMps: number
    readonly tailWindFactorTenthsPerMps: number
  }
  readonly distanceMeters: number
  readonly distanceTenths: number
  readonly styleTenths: number
  /** Znak gry/FIS w arkuszu: dodatni = pod narty, ujemny = w plecy. */
  readonly windUserMetersPerSecond: number
  readonly publishedWindTenths: number
  readonly publishedGateTenths: number
  readonly expectedTotalTenths: number
}

const ZAKOPANE = 'https://medias3.fis-ski.com/pdf/2026/JP/3112/2026JP3112RLQ.pdf'
const OBERSTDORF = 'https://medias1.fis-ski.com/pdf/2026/JP/3103/2026JP3103RLQ.pdf'
const KULM = 'https://medias4.fis-ski.com/pdf/2026/JP/3156/2026JP3156RL.pdf'

export const OFFICIAL_SCORING_FIXTURES: readonly OfficialScoringFixture[] = [
  {
    id: 'F10-fettner-zakopane-2026-qualification',
    event: 'Zakopane 10.01.2026 — kwalifikacje',
    athlete: 'Manuel Fettner',
    sourceUrl: ZAKOPANE,
    provenance: 'official-reference',
    hill: { kPointMeters: 125, hillSizeMeters: 140, headWindFactorTenthsPerMps: 108, tailWindFactorTenthsPerMps: 162 },
    distanceMeters: 138,
    distanceTenths: 834,
    styleTenths: 540,
    windUserMetersPerSecond: 1.22,
    publishedWindTenths: -132,
    publishedGateTenths: 95,
    expectedTotalTenths: 1337,
  },
  {
    id: 'F10-kot-zakopane-2026-qualification',
    event: 'Zakopane 10.01.2026 — kwalifikacje',
    athlete: 'Maciej Kot',
    sourceUrl: ZAKOPANE,
    provenance: 'official-reference',
    hill: { kPointMeters: 125, hillSizeMeters: 140, headWindFactorTenthsPerMps: 108, tailWindFactorTenthsPerMps: 162 },
    distanceMeters: 124.5,
    distanceTenths: 591,
    styleTenths: 525,
    windUserMetersPerSecond: 0.39,
    publishedWindTenths: -42,
    publishedGateTenths: 48,
    expectedTotalTenths: 1122,
  },
  {
    id: 'F10-chervet-zakopane-2026-qualification',
    event: 'Zakopane 10.01.2026 — kwalifikacje',
    athlete: 'Jules Chervet',
    sourceUrl: ZAKOPANE,
    provenance: 'official-reference',
    hill: { kPointMeters: 125, hillSizeMeters: 140, headWindFactorTenthsPerMps: 108, tailWindFactorTenthsPerMps: 162 },
    distanceMeters: 132,
    distanceTenths: 726,
    styleTenths: 505,
    windUserMetersPerSecond: 1.52,
    publishedWindTenths: -164,
    publishedGateTenths: 48,
    expectedTotalTenths: 1115,
  },
  {
    id: 'F11-prevc-oberstdorf-2025-qualification',
    event: 'Oberstdorf 28.12.2025 — kwalifikacje',
    athlete: 'Domen Prevc',
    sourceUrl: OBERSTDORF,
    provenance: 'official-reference',
    hill: { kPointMeters: 120, hillSizeMeters: 137, headWindFactorTenthsPerMps: 108, tailWindFactorTenthsPerMps: 162 },
    distanceMeters: 139.5,
    distanceTenths: 951,
    styleTenths: 555,
    windUserMetersPerSecond: -0.49,
    publishedWindTenths: 79,
    publishedGateTenths: -76,
    expectedTotalTenths: 1509,
  },
  {
    id: 'F11-raimund-oberstdorf-2025-qualification',
    event: 'Oberstdorf 28.12.2025 — kwalifikacje',
    athlete: 'Philipp Raimund',
    sourceUrl: OBERSTDORF,
    provenance: 'official-reference',
    hill: { kPointMeters: 120, hillSizeMeters: 137, headWindFactorTenthsPerMps: 108, tailWindFactorTenthsPerMps: 162 },
    distanceMeters: 132.5,
    distanceTenths: 825,
    styleTenths: 540,
    windUserMetersPerSecond: -0.70,
    publishedWindTenths: 113,
    publishedGateTenths: -76,
    expectedTotalTenths: 1402,
  },
  {
    id: 'flight-prevc-kulm-2026-round-1',
    event: 'Kulm 28.02.2026 — konkurs, seria 1',
    athlete: 'Domen Prevc',
    sourceUrl: KULM,
    provenance: 'official-reference',
    hill: { kPointMeters: 200, hillSizeMeters: 235, headWindFactorTenthsPerMps: 144, tailWindFactorTenthsPerMps: 216 },
    distanceMeters: 213.5,
    distanceTenths: 1362,
    styleTenths: 535,
    windUserMetersPerSecond: -0.47,
    publishedWindTenths: 102,
    publishedGateTenths: 112,
    expectedTotalTenths: 2111,
  },
] as const
