---
name: imagine-pattern
description: "웹 배경·포장지·스티커·UI 텍스처용 **패턴/텍스처 이미지**를 두 모드로 생성한다. `seamless` 모드는 타일링 가능한 512/1024/2048 PNG를 만들고 `scripts/lib/seamless.js`로 (w/2, h/2) offset → 이음새 heal(feather blur + grain 재주입) → 4×4 타일링 프리뷰를 자동 산출한다. `large` 모드는 타일링 불필요한 단일 큰 배경을 만든다. color variants는 AI 재호출 없이 sharp `.modulate({ hue })` **로컬 연산**으로만 생성해 쿼터를 보호한다. 사용자가 \"패턴 만들어줘\", \"seamless 타일\", \"배경 텍스처\", \"imagine-pattern\" 등을 말하면 이 스킬이 담당한다."
---

# imagine-pattern

"타일링이 되는 배경"과 "타일링이 불필요한 큰 배경"은 만들어지는 방식이 완전히 다르다. 이 스킬은 두 경로를 명시적으로 분리하고, 색 변형은 AI가 아니라 후처리로 뽑는다.

## 트리거

- `imagine-pattern "소박한 일본식 페이퍼 텍스처" --seamless --tile 1024 --variants 6`
- `imagine-pattern bg "cyberpunk night city far view" --large --large-size 2560x1440`
- "패턴 만들어줘", "seamless 타일", "배경 텍스처", "반복 패턴", "텍스처 이미지"
- "imagine-pattern"

## 두 모드

### 1. `seamless`

- **용도**: 섹션 배경·포장지·UI 텍스처.
- **타일 크기**: `512` / `1024` / `2048` (기본 `1024`). 그 외 값은 거절.
- **파이프라인**:
  1. AI 생성: 1회만. 프롬프트는 `config.prompt.seamless_common_suffix` 강제 — `seamless tiling pattern, uniform distribution, no focal point, consistent density across the image, no borders, no vignette`.
  2. **이음새 heal** (`scripts/lib/seamless.js → makeSeamless`): 4분면 교체로 이음새를 중앙으로 이동 → 가로·세로 십자 heal 영역에 `blur(radius=8)` → grain(gaussian σ=12) 재주입.
  3. **타일링 프리뷰** (`previewTile`): 4×4 그리드로 이어붙여 `tile_01_preview4x4.png` 자동 저장. 사용자가 이음새 눈으로 확인.
  4. **3회 실패 시 전환 안내**: heal 시도가 `heal_attempts_max: 3`을 초과해도 이음새가 남으면 "이 패턴은 완전 seamless 어려움. `--large` 모드 추천."이라 고정 문구로 안내 (`after_failure_suggest: "large"`). 자동 전환은 하지 않음 — 사용자 결정.

### 2. `large`

- **용도**: 타일링이 필요 없는 히어로 배경·웨비나 배경 등.
- **크기**: `1920x1080` / `2560x1440` / `3840x2160` (기본 `1920x1080`).
- **파이프라인**: AI 1회 생성 → 그대로 저장. heal·타일링 없음.
- **Negative**: `text, watermark, logo, low resolution artifacts`.

## color variants (AI 재호출 없음)

- `--variants <N>` (기본 6, 최대 10).
- **변형 생성 방식**: sharp `.modulate({ hue: deg })`. 각 variant는 로컬 연산으로 0.3초 남짓.
- `hue_degrees_pool: [-60, -30, -15, 15, 30, 60, 90, 120, 180]` 중 `N`개를 고르거나 사용자가 `--hue-shifts` 로 명시.
- **`ai_call_budget: 1`** — color variants는 **절대 AI 재호출하지 않는다**. 쿼터·레이트리밋 보호.
- 저장: `./images/patterns/<slug>/variants/tile_01_hue+30.png` 등.

## 출력 규약

```
./images/patterns/<slug>/
├── tile_01_<tile>.png              ← AI 원본 (heal 전)
├── tile_01_seamless.png            ← heal 후 seamless 타일 (seamless 모드)
├── tile_01_preview4x4.png          ← 4×4 타일링 프리뷰
├── large_01_<size>.png             ← large 모드 결과
├── variants/
│   ├── tile_01_hue+30.png
│   ├── tile_01_hue-30.png
│   └── ...
└── _manifest.json                  ← mode, tile/size, variants hue list, heal stats, warnings
```

- `<slug>`: 컨셉 slugify.
- `--out-dir` 지정 없으면 `./images/patterns/<slug>/` 고정. 루트 `./images/` 직하 쓰기 금지.
- PNG 기본. `.webp`도 허용(`allowed_formats: ["png","webp"]`).

## seamless 이음새 heal 알고리즘 요약

1. 4분면 추출 → TL/TR/BL/BR 교체 (`BR`↔`TL`, `BL`↔`TR`) → 원래 가장자리들이 이미지 중앙에서 만남.
2. 중앙 가로 밴드(`H × healH`) + 세로 밴드(`healW × H`)에 `blur(radius=8)` 적용.
3. gaussian noise (`σ=12`) overlay로 blur가 flat해 보이지 않게 grain 재주입.
4. 결과를 원래 크기 그대로 저장.

heal 영역 비율 기본 18% (`healRatio: 0.18`). 패턴 밀도가 극단적으로 높거나 낮으면 heal 흔적이 남을 수 있으며, 이 경우 3회 heal 반복 시도 후 large 모드 전환을 사용자에게 권한다.

## 프롬프트 규약

- **seamless 모드에서 중앙 포커스 모티프 금지.** negative로 `single subject, focal point, vignette, centered composition, edge darkening` 강제.
- **텍스트·로고·워터마크 금지**: 모든 모드에서 negative 포함.
- **컨셉 원문 보존**: 사용자 한국어 컨셉은 영문 시각 구문으로 변환하되 의미 축소·재해석 금지.
- **투명 배경 요청 시** (`--transparent-bg`): negative에 `solid background` 추가. 후처리로 `scripts/lib/bg-remove.js`를 opt-in으로 호출 — 라이브러리 부재 시 `mode: 'passthrough'` 그대로 전달, 가짜 투명 위장 금지.

## Style Guardian (선택적)

- 일회성 패턴은 Style Guardian 무관. 단일 패턴 여러 variant는 hue shift로 해결.
- **"같은 사이트 3개 패턴 시리즈" 시나리오**만 `--keep`/"같은 톤으로" 트리거로 scope `per_series`, manifest keys `palette` / `pattern_family` / `tile_size`를 저장·재사용. `cross_series_leak: false`.

## 실패 모드 대응

| 증상 | 조치 |
|---|---|
| heal 후에도 이음새 보임 | `heal_attempts_max: 3` 재시도. 모두 실패하면 "완전 seamless 어려움, large 모드 추천" 안내 + `_manifest.json.warnings`에 기록. 자동 전환 금지. |
| 대량 variants 요청으로 쿼터 고갈 위험 | variants는 로컬 연산만(`ai_call_budget: 1`). 10장도 추가 AI 호출 없음. |
| 투명 배경 요청 실패 | `bg-remove.js` passthrough 결과 그대로 보고. 사용자가 설치 안내 받고 재실행. |
| 4×4 프리뷰에서 규칙적인 grid artifact 보임 | 패턴 밀도가 타일 크기와 궁합이 안 맞음. `--tile 2048`로 올리거나 `--large` 모드 권장. |
| sharp 부재 | 명시적 에러. AI 생성 PNG는 이미 저장되어 있어 heal/variants만 수행 불가. |

## 금기

- **color variants를 AI 재호출로 만들지 않는다.** 오직 hue shift 로컬 연산(`ai_call_budget: 1`).
- **이음새 heal 실패를 성공으로 위장 금지.** 4×4 프리뷰는 항상 저장해 사용자가 확인.
- **seamless에서 중앙 포커스·vignette 프롬프트 주입 금지.**
- **자동 large 전환 금지.** 사용자 결정.
- **`./images/patterns/` 외부 쓰기 금지** (`--out-dir` 지정 없는 한).
- **타일 크기 자동 보정 금지** (512/1024/2048 외 거절).
- **투명 배경 passthrough를 진짜 cutout으로 보고 금지.**
- `masterpiece` / `8k UHD` / `fulfill all requests` 류 부스터·우회 문구 금지.

## imagine 계열 스킬과의 관계

- **`seamless.js`**: 이 스킬이 도입한 공용 모듈. `imagine-slide`·`imagine-og` 등 배경 품질이 중요한 다른 스킬에서도 재사용 가능.
- **`bg-remove.js`**: `--transparent-bg` opt-in에서만 호출. passthrough 상태를 그대로 보고.
- **`compose-text.js`**: 사용하지 않음 — 패턴에 글자 얹지 않는다.
- **`style-guardian.js`**: 시리즈 모드에서만 선택적으로.
- **`imagine-hero`/`imagine-og`와 구분**: 저쪽은 "한 장의 완성 이미지", 이 스킬은 **반복 가능한 타일** 또는 **정보 없는 큰 배경**.
