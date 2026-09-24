/**
 * Parametry symulacji skoku. Wszystkie wartości są TUNE/ADAPT: to strojenie
 * modelu gry, a nie dane FIS ani deklaracja dokładności aerodynamicznej.
 * Każdy test i raport podaje użyty zestaw przez `physicsVersion`.
 */

export type JumpParams = {
  readonly physicsVersion: string
  readonly gravity: number
  readonly airDensity: number
  readonly massKg: number

  readonly inrun: {
    /** Współczynnik tarcia nart o tor. */
    readonly frictionCoefficient: number
    /** Iloczyn Cd × pole w pozycji dojazdowej [m²]. */
    readonly dragAreaSquareMeters: number
  }

  readonly takeoff: {
    /** Czas trwania jednego skończonego impulsu nóg [s]. */
    readonly durationSeconds: number
    /** Całkowity popęd przy pełnym wykorzystaniu impulsu [N·s]. */
    readonly impulseNewtonSeconds: number
    /** Czas zaniku zgromadzonej prędkości wyprostu po zakończeniu impulsu [s]. */
    readonly decayTimeSeconds: number
    /** Wyprzedzenie progu dające pełne pokrycie fazy prostowania [s]. */
    readonly idealLeadSeconds: number
    /** Pochylenie ciała zaraz po oderwaniu przy idealnym wybiciu [deg]. */
    readonly neutralPitchDeg: number
    /** Kara pitch za sekundę błędu timingu; dodatnia = zbyt wyprostowany [deg/s]. */
    readonly earlyPitchPenaltyDegPerSecond: number
    readonly latePitchPenaltyDegPerSecond: number
    /** Dodatkowy popęd wzdłuż toru [N·s]. */
    readonly forwardImpulseNewtonSeconds: number
    /** Wąskie okno idealnego timingu wokół optimum [s]. */
    readonly perfectWindowSeconds: number
    /**
     * PKG-008 r16-fix: jednorazowy fizyczny popęd normalny za idealny timing
     * [N·s]. Dodawany do prędkości oderwania wzdłuż normalnej progu
     * (dzielony przez masę), bez nagrody dystansowej i bez przesuwania
     * kolizji. 18 N·s / 65 kg ≈ 0,277 m/s ⊥.
     */
    readonly perfectImpulseNewtonSeconds: number
  }

  readonly flight: {
    /** Iloczyn pola odniesienia sylwetki z nartami [m²]. */
    readonly referenceAreaSquareMeters: number
    /** Skala tabeli CD; osobny mnożnik pozwala stroić opór niezależnie od nośności. */
    readonly dragScale: number
    /** Docelowy pitch zmieniany komendą ←/→ [deg/s]. */
    readonly commandRateDegPerSecond: number
    /** Ograniczone tempo dojścia do docelowego pitch [deg/s]. */
    readonly pitchRateDegPerSecond: number
    readonly minPitchDeg: number
    readonly maxPitchDeg: number
    /** Twardy limit czasu lotu chroniący przed niekończącą się symulacją [s]. */
    readonly maxDurationSeconds: number
  }

  readonly landing: {
    readonly telemarkPrepSeconds: number
    readonly parallelPrepSeconds: number
    /** Prędkość normalna, powyżej której kontakt jest nie do przyjęcia [m/s]. */
    readonly telemarkMaxNormalSpeed: number
    readonly parallelMaxNormalSpeed: number
    /** Różnica kąta nart do powierzchni, powyżej której kontakt jest nie do przyjęcia [deg]. */
    readonly telemarkMaxAngleErrorDeg: number
    readonly parallelMaxAngleErrorDeg: number
    /** Poniżej tego progu kontakt kończy się upadkiem (0..1). */
    readonly fallStabilityThreshold: number
    /** Poniżej progów ustany kontakt wymaga podpórki dwiema / jedną dłonią. */
    readonly twoHandSupportBelowStability: number
    readonly oneHandSupportBelowStability: number
    /** Bardzo wczesne podejście kończy się podpórką obiema dłońmi. */
    readonly earlyTwoHandSupportBeforeSeconds: number
    /**
     * PKG-008: próg wczesnego lądowania w wieku lotu [s] (czas
     * symulacji, nie renderera). T/R wybrane przed 1,0 s wchodzą
     * w `LandingPrep` z karą aerodynamiczną (0,60× lift, 1,60× drag),
     * a wczesny telemark spada do awaryjnych dwóch nóg bez powrotu.
     * Normalne przygotowanie (harness i AI czekają na `flightSeconds > 1`)
     * jest po progu i nie jest karane.
     */
    readonly earlyLandingCutoffFlightSeconds: number
  }

  readonly outrun: {
    readonly frictionCoefficient: number
    readonly dragAreaSquareMeters: number
    /** Prędkość, poniżej której odjazd/upadek uznajemy za zatrzymany [m/s]. */
    readonly restSpeed: number
  }

  readonly fall: {
    readonly frictionCoefficient: number
    readonly dragAreaSquareMeters: number
    /** Kontrolowany limit czasu rozliczenia upadku [s]. */
    readonly maxDurationSeconds: number
  }
}

/**
 * P42 runda 7 + PKG-008 — zeskok FIS (§4) i model V ze sterowną doskonałością ~1,42.
 * Garb 6,17° wymaga realnej nośności, więc krzywa CL/CD idzie w górę przy
 * 10–33° (CL 1,09/CD 0,77 przy 32°), a powyżej 34–35° zrywa ostro w dół
 * (przeciągnięcie: CL 0,75/CD 1,40 przy 36°), żeby bierny lot i jazda w tył
 * były wyraźnie krótsze od prowadzonego. Efektywne L/D przy 32° wynosi
 * ~1,42 przy zachowanej karze za przesterowanie i gradiencie umiejętności.
 * Powierzchnia 0,80 m², dragScale 1,00. Tempo pitch 20°/s (cel prowadzi
 * 26°/s): opóźnienie nadążania dociąga AoA w końcówce lotu, więc tor schodzi
 * w łuk pola lądowania zamiast stycznie sunąć wzdłuż stoku.
 * Dobór po WIELKOŚCIACH OBSERWOWALNYCH (belka 8 ≈ 125–129 m, K120/HS134).
 *
 * PKG-008: jawna kara za skrajny dziób w fazie `Flight`
 * (`NOSE_DOWN_PITCH_THRESHOLD_DEG` −10° w aero.ts, tylko absolutny pitch,
 * krzywa AoA bez zmian). Długi ślizg na dziobie do −26° dostaje ~0,68× lift
 * i ~1,56× drag, więc nie jest optymalnym sunącym lotem; normalny lot
 * `Flight` (idealny ~18–23°, także przedłużony wiatrem do ~−9°) jest poza
 * istotną karą i trzyma ~125 m z belki 8.
 *
 * PKG-008: wczesne lądowanie (`earlyLandingCutoffFlightSeconds`
 * 1,0 s) wchodzi w `LandingPrep` z karą podejścia (0,60× lift, 1,60× drag),
 * więc natychmiastowe T/R z belki 8 kończy ≥15 m krócej i ≤110 m (K−10);
 * wczesny telemark spada do dwóch nóg; lądowanie za HS mnoży stabilność
 * pierwiastkowo do zera na progach prowizorycznych rundy 15 (telemark 147 m,
 * dwie nogi 150 m; rekord 144,5 m pozostaje możliwy do ustania).
 *
 * P42 (`pkg008-tune-9`): sam model podmuchów wiatru (`pkg008-wind-4`,
 * offset celu sylwetki max ±5,2° przez windVelocity i pitch).
 * Aerodynamika, progi 147/150, tabela AUTO i impuls idealny bez zmian.
 */
export const DEFAULT_JUMP_PARAMS: JumpParams = {
  physicsVersion: 'pkg008-tune-9',
  gravity: 9.81,
  airDensity: 1.2,
  massKg: 65,

  inrun: {
    // Norma FIS 2018 §6.2: tarcie suche o kącie 1° dla toru lodowego —
    // tan(1°) = 0,0175. Poprzednie 0,02 odpowiadało 1,15°.
    frictionCoefficient: 0.0175,
    // Zwarta pozycja dojazdowa; przy 0,22 m² prędkość na progu z najwyższej
    // belki wynosi 92,7 km/h wobec 92,5 km/h w certyfikacie Wisły Malinki.
    dragAreaSquareMeters: 0.22,
  },

  takeoff: {
    durationSeconds: 0.21,
    impulseNewtonSeconds: 195,
    decayTimeSeconds: 0.16,
    idealLeadSeconds: 0.20,
    neutralPitchDeg: 22,
    earlyPitchPenaltyDegPerSecond: 70,
    latePitchPenaltyDegPerSecond: 45,
    forwardImpulseNewtonSeconds: 35,
    // ±1 tick przy 120 Hz: w praktyce trzy najbliższe momenty wejścia ze względu
    // na kolejność integracji kroku — świadomie trudne okno. Premia to
    // jednorazowy fizyczny popęd normalny (~0,28 m/s ⊥ przy 18 N·s / 65 kg):
    // bez nagrody dystansowej, bez przesuwania kolizji, zero RNG.
    perfectWindowSeconds: 1 / 120,
    perfectImpulseNewtonSeconds: 18,
  },

  flight: {
    referenceAreaSquareMeters: 0.8,
    // Runda 7: CL 1,09/CD 0,77 przy 32° i dragScale 1,00 dają efektywne
    // L/D ~1,42 w prowadzeniu (pozycja V), a ostre przeciągnięcie za 35°
    // karze lot bierny i jazdę w tył. Powierzchnia 0,80 m² (wcześniej 0,75)
    // domyka bilans nośności na stromym garbie FIS.
    dragScale: 1.0,
    commandRateDegPerSecond: 26,
    // Wolniejsze od komendy celowej: ciało nie nadąża za stromiejącym
    // torem w końcówce, AoA rośnie i tor schodzi w stok zamiast go mijać.
    // Wcześniejsze 48°/s trzymało tor styczny do stoku 37° (dwumodalność
    // 95/155 m przy tej samej belce).
    pitchRateDegPerSecond: 20,
    minPitchDeg: -26,
    maxPitchDeg: 46,
    maxDurationSeconds: 12,
  },

  landing: {
    telemarkPrepSeconds: 0.28,
    parallelPrepSeconds: 0.16,
    telemarkMaxNormalSpeed: 12.0,
    parallelMaxNormalSpeed: 15.0,
    telemarkMaxAngleErrorDeg: 26,
    parallelMaxAngleErrorDeg: 34,
    fallStabilityThreshold: 0.22,
    twoHandSupportBelowStability: 0.34,
    oneHandSupportBelowStability: 0.44,
    earlyTwoHandSupportBeforeSeconds: 0.35,
    earlyLandingCutoffFlightSeconds: 1.0,
  },

  outrun: {
    frictionCoefficient: 0.06,
    dragAreaSquareMeters: 0.7,
    restSpeed: 0.6,
  },

  fall: {
    frictionCoefficient: 0.55,
    dragAreaSquareMeters: 1.1,
    maxDurationSeconds: 3,
  },
}

/**
 * Parametry fizyki dla skoczni: wariant aero skoczni (H04) dopisuje sufiks do
 * `physicsVersion`, więc wyniki, rekordy i replaye nie mieszają się z bazą.
 */
export function physicsParamsForHill(
  spec: { readonly aero?: { readonly version: string } },
  params: JumpParams = DEFAULT_JUMP_PARAMS,
): JumpParams {
  if (!spec.aero) return params
  const suffix = `+${spec.aero.version}`
  if (params.physicsVersion.endsWith(suffix)) return params
  return { ...params, physicsVersion: `${params.physicsVersion}${suffix}` }
}
