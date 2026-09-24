---
name: imagine-sprite
description: "`imagine-pixel`로 만든 캐릭터의 **애니메이션 스프라이트 시트**를 Unity/Godot/Aseprite가 바로 import할 수 있는 포맷으로 생성한다. 프레임은 **프레임 단위 개별 호출**로 뽑고, 첫 프레임을 **image→image reference**로 삼아 연속 프레임의 의상·머리색·팔레트가 드리프트하지 않도록 한다. `scripts/lib/pixelize.js`로 정수 픽셀 그리드 스냅, `scripts/lib/sheet-composer.js`로 가로 연결 시트 PNG + Aseprite 호환 JSON 메타를 출력한다. reference 체인 유지를 위해 **concurrency는 1로 강제**된다. 사용자가 \"스프라이트 시트\", \"애니메이션 프레임\", \"imagine-sprite\", \"idle/walk/attack 애니메이션\" 등을 말하면 이 스킬이 담당한다."
---

# imagine-sprite

픽셀 캐릭터의 *다른 프레임*이 *같은 캐릭터*로 보이게 만드는 것이 이 스킬의 유일한 목적. 달성 경로는:

1. 첫 프레임을 text→image로 확정.
2. 이후 N-1 프레임을 첫 프레임 image→image reference로 **순차** 생성.
3. 모든 프레임을 `pixelize.js`로 스냅 + 팔레트 통일.
4. `sheet-composer.js`로 가로 시트 + JSON 메타.

## 트리거

- `imagine-sprite <name> idle --frames 4`
- `imagine-sprite <name> walk --frames 6`
- `imagine-sprite <name> attack --frames 5 --palette-ref ./sprites/<name>/palette.png`
- "스프라이트 시트 만들어줘", "애니메이션 프레임", "idle 애니메이션", "walk cycle"
- "imagine-sprite"

## 입력

- **`<character-name>`**: `imagine-pixel` 또는 `imagine-char` 결과가 있는 폴더 이름. 없으면 거절.
- **`<action>`**: `config.default_frames_per_action`의 키(`idle`, `walk`, `run`, `attack`, `hurt`, `death`, `jump`, `cast`) 또는 사용자 정의 문자열.
- **`--frames`**: 2 / 4 / 6 / 8 중 하나. 기본은 액션별 추천값.
- **`--frame-size`**: 16~128 정수. 기본 32.
- **`--padding`**: 0~2. 기본 0.
- **`--palette-ref`**: 팔레트 통일을 위해 기존 `palette.png` 경로. 없으면 첫 프레임 스냅 결과로 자동 추출.

## 파이프라인

1. **캐릭터 존재 검증**: `./sprites/<character-name>/` 또는 `./characters/<character-name>/card.json`이 없으면 실행 거절. 캐릭터 카드가 있으면 `character-card-keeper` 에이전트가 의상·머리·눈 필드를 제공.
2. **프레임 템플릿 로드**: `config.prompt.frame_templates[<action>]` 사용. `--frames` 수가 템플릿보다 많으면 마지막 템플릿을 반복하거나 사용자에게 추가 cue 요청. 템플릿이 없는 커스텀 action이면 "movement delta 1~2 pixels only" 제약만 걸고 프레임별 서술을 사용자에게 1회 물어 확보.
3. **concurrency 1 강제**: 프레임 간 reference 체인이 깨지지 않도록 `config.concurrency: 1` 고정. `concurrency_override_allowed: false` — 병렬화 요청은 무시한다.
4. **첫 프레임**: text→image 호출 (`imagine-pixel` 내부와 동일한 negative/positive). 1024×1024 생성 → `pixelize.js`로 `frame-size` 스냅. 결과가 `frame_01.png`.
5. **2..N 프레임**: 각 프레임을 **image→image** (`scripts/edit.js`)로 순차 호출. 입력 이미지는 **이전 프레임이 아니라 `frame_01.png`** — 이렇게 해야 cumulative drift가 누적되지 않는다. 프레임별 프롬프트는 카드 필드 + 템플릿 delta만.
6. **픽셀 스냅**: 각 프레임을 `pixelize.js`로 `frame-size`·palette로 클램프. `--palette-ref`가 있으면 그 팔레트로, 없으면 `frame_01`에서 추출된 `palette.png`를 이후 프레임에 재사용 (`reuse_palette_ref: true`).
7. **프레임별 재시도**: 일치 검증(hair·outfit·palette 매치) 실패 시 해당 프레임만 재생성, 최대 `retry.per_frame_max: 3`. 예산 초과 시 해당 프레임 실패 라벨 + 시트 조립 중단 여부 사용자 선택.
8. **시트 합성**: `sheet-composer.composeSheet(framePaths, frameSize, padding, outPath)` 호출. **center-crop + 중앙 정렬**로 1px 어긋남 방지. 가로 연결(기본) `sheet.png` + Aseprite 호환 `sheet.json` 동시 출력.

## 출력 규약

```
./sprites/<character-name>/<action>/
├── frame_01.png
├── frame_02.png
├── ...
├── frame_NN.png
├── sheet.png       ← 가로 연결 (또는 --direction vertical 시 세로)
├── sheet.json      ← { frames: [...], frameSize, padding, direction, meta: { size, scale, engine, format } }
└── _manifest.json  ← 이 action의 프롬프트·reference·재시도 이력 요약 (raw prompt 전문 저장 금지)
```

- **JPEG 저장 금지.** sheet-composer는 `.jpg`/`.jpeg` outputPath를 거절.
- `--out-dir` 지정 없으면 `./sprites/<character-name>/<action>/` 고정. 루트 `./sprites/` 외부 쓰기 금지.

## 공유 모듈

- **`scripts/lib/pixelize.js`**: `imagine-pixel`과 공유. 이 스킬은 **자체 스냅 로직을 두지 않는다** — 모든 픽셀 스냅·팔레트 양자화·palette-ref 매칭을 위임.
- **`scripts/lib/sheet-composer.js`**: 이 스킬과 후속 스프라이트 스킬의 공용. 시트 PNG + Aseprite JSON 동시 산출.
- **`agents/character-card-keeper.md`**: 의상·머리·눈·구별 특징 제공. 카드가 없고 `<character-name>` 디렉터리에 `palette.png`만 있으면 팔레트만 받고 진행.

## 프롬프트 규약

- **카드 + 프레임 delta만 프롬프트에 주입.** 스타일 드리프트 요인(자유 텍스트 수식) 금지.
- **첫 프레임을 reference로 고정.** 2번째 프레임부터는 이전 프레임이 아니라 항상 `frame_01.png`를 reference로 사용해 누적 드리프트 방지.
- negative 강제: `different character, different hairstyle, different outfit, different palette, blurry, smooth shading, anti-aliased, jpeg artifacts, extra limbs`.
- positive suffix 고정: `crisp pixel edges, no anti-aliasing, uniform pixel grid, limited palette, transparent background`.
- **이동 delta 제약**: 프레임 간 픽셀 이동은 `movement delta 1~2 pixels only`로 강제.

## 실패 모드 대응

| 증상 | 조치 |
|---|---|
| 2번째 프레임부터 의상이 변함 | 카드 재주입 + `frame_01` reference 강제(이 스킬은 항상 그렇게 호출). 그래도 튀면 해당 프레임만 `retry.per_frame_max: 3`까지 재생성. |
| 프레임 간 이동이 너무 큼 | `movement delta 1~2 pixels only` 프롬프트 강제. 지속되면 템플릿을 세분화해 delta를 한 단계 더 쪼개도록 안내. |
| 시트 조립 시 1px 어긋남 | `sheet-composer`가 프레임별 center-crop + 중앙 정렬. 각 프레임은 frame-size 사각형에 alpha 투명으로 패딩. |
| 팔레트가 프레임마다 다름 | `--palette-ref` 지정. 없으면 첫 프레임 `palette.png` 자동 재사용. |
| concurrency를 사용자가 1보다 크게 요청 | 거절. `concurrency_override_allowed: false`. 병렬 생성은 reference 체인을 깨므로 정책상 금지. |
| sharp/pngjs 모두 부재 | `sheet-composer`가 `{ ok: false, reason: 'no_image_engine' }` 반환. 개별 프레임 PNG는 이미 저장된 상태이며 사용자에게 설치 안내. |

## 금기

- **concurrency > 1 허용 금지.** 프레임 reference 체인 유지가 이 스킬의 유일한 가치.
- **프레임 체인에서 이전 프레임을 reference로 쓰기 금지.** 항상 `frame_01.png`.
- **JPEG 저장 금지.**
- **카드 자동 수정 금지** — 프레임 결과가 카드와 다르면 재생성, 카드 값을 조용히 바꾸지 않는다.
- **`./sprites/` 외부 쓰기 금지** (`--out-dir` 지정 없는 한).
- **자유 텍스트 수식 주입 금지.** 프레임 delta와 카드 필드만 허용.
- `masterpiece` / `8k UHD` / `fulfill all requests` 류 부스터·우회 문구 금지.

## imagine 계열 스킬과의 관계

- **`imagine-pixel`** (idea 06): 정수 픽셀 캐릭터 한 장. 이 스킬은 그 결과에 애니메이션을 얹는다.
- **`imagine-char`** (idea 05, 하이 디테일): 카드를 공유하되 산출 형식이 다르다. 하이 디테일 turnaround는 그 스킬, 픽셀 스프라이트 시트는 여기.
- **`character-card-keeper`** (공용 에이전트): 카드 조회의 유일한 경로.
- **`compose-text.js`**: **사용하지 않는다.** 스프라이트 시트에 벡터 글자를 얹지 않음.
- **`sheet-composer.js`**: 이 스킬이 만든 모듈이며, 이후 UI 스프라이트 시트·effect 시트 등 다른 스킬에서도 재사용 가능.
