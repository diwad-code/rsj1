---
name: imagine-portrait
description: "인물 사진을 **로컬에서만** 보정·변환하는 `edit.js` 확장 모드. 하위 모드로 `bg-swap`(배경 교체), `stylize`(수채/유화/아크릴/만화 변환), `restore`(노후 사진 복원), `group-tone`(단체 사진 톤 통일)을 제공한다. 모든 경로는 `./images/portraits/` 안으로 **강제**되며(output-allocator가 경로 탈출을 거절), manifest에는 파일 경로의 **SHA-256 해시 + 모드·시각 메타만** 저장한다. 얼굴 썸네일·이미지 바이트·EXIF·raw prompt는 어떠한 산출물에도 남기지 않는다. 사용자가 \"증명사진 배경\", \"프로필 사진 스타일 변환\", \"오래된 사진 복원\", \"단체 사진 톤 통일\", \"imagine-portrait\" 등을 말하면 이 스킬이 담당한다."
---

# imagine-portrait

`imagine` 스킬의 `edit.js`(image→image) 경로를 **인물 보정 전용**으로 얇게 감싼 모드. 새 스킬을 분리한 이유는 단 하나 — **프라이버시 경계를 파이프라인 구조로 강제**하기 위해서다.

## 트리거

- `imagine-portrait bg-swap ./photo.jpg --bg "증명사진 흰 배경"`
- `imagine-portrait stylize ./photo.jpg --style watercolor`
- `imagine-portrait restore ./old.jpg`
- `imagine-portrait group-tone ./wedding/*.jpg --target-tone ./wedding/IMG_0001.jpg`
- "증명사진 배경 바꿔줘", "프로필 스타일 변환", "오래된 사진 복원", "단체 사진 톤 맞춰줘"
- "imagine-portrait"

## ⚠️ README — 얼굴 보존의 한계

이 스킬은 **픽셀 단위 얼굴 동일성을 보증하지 않는다.**

- 현재 image→image 엔드포인트에는 얼굴/identity를 잠그는 결정적 마스크가 없다. "얼굴을 유지해라"는 지시는 **프롬프트 문구**로만 표현되며, 강한 guidance일 뿐 보장은 아니다.
- `strength: high`로 설정해도 미세한 피부 톤·눈 모양·입 꼬리 변화가 발생할 수 있다.
- 법적·공식 용도(여권 사진 등)에서는 이 스킬의 결과물을 사용하지 말 것.
- 결혼식·행사 등 정체성이 중요한 맥락에서는 반드시 **원본과 나란히 비교**한 뒤 수락/거절을 사용자가 직접 결정.
- `strength: medium`/`low`는 색감·배경 변화만 맡기고 얼굴을 원본에 최대한 가깝게 두고 싶을 때의 타협.

이 한계를 숨기지 않는다. 스킬 실행 결과 메시지에 위 경고 요약을 항상 포함한다.

## 하위 모드

| 모드 | 쓰임 | 필수 플래그 | 기본 strength |
|---|---|---|---|
| `bg-swap` | 배경 교체(흰 배경, 파란 배경, 그라디언트 등). 피사체·의상·포즈 보존. | `--bg <desc>` | high |
| `stylize` | 유화·수채·아크릴·만화 변환. 얼굴 특징과 비율 보존. | `--style <preset>` | medium |
| `restore` | 오래된 사진 색 복원, 노이즈 제거. 원본 얼굴·구도 보존. | — | high |
| `group-tone` | 여러 장의 단체 사진을 `--target-tone` 한 장 기준으로 WB·톤 정렬. 재포즈·재크롭 금지. | `--target-tone <ref>` | high |

- `stylize` 스타일 프리셋: `watercolor` / `oil` / `acrylic` / `comic` (`config.sub_modes.stylize.style_presets`).
- `group-tone`은 내부적으로 **화이트밸런스 경량 필터 경로**(`group_tone.whitebalance_only_fast_path: true`)를 우선 시도한 뒤 필요 시에만 모델 호출로 폴백 — 단체 사진 n장에 대해 n번 풀 생성하지 않음.

## 파이프라인

1. **경로 검증 (샌드박스)**: `scripts/lib/output-allocator.js`의 경로 탈출 가드를 `./images/portraits/`에 고정 적용. 출력이 루트 또는 다른 폴더를 가리키면 **즉시 에러**. `--out-dir`가 지정되어도 `./images/portraits/` 하위가 아니면 거절.
2. **입력 해시 산출**: `crypto.sha256(path.resolve(inputPath)).slice(0,16)`을 `input_hash`로 저장. **파일 경로를 해시**할 뿐 **이미지 바이트는 해시하지 않는다** — 원본 내용 인덱싱 위험 차단.
3. **프롬프트 조립**: 모드별 `prompt_template`에 플래그 값만 슬롯 삽입. 사용자 자유 수식 문구는 `strength`와 negative 우선순위를 깨지 않는 범위에서 append. 원본 한국어는 원문 보존.
4. **Negative 공통 강제**: `different face, different person, distorted eyes, extra fingers, plastic skin, airbrushed, deformed hands, altered clothing`.
5. **`edit.js` 호출**: `skills/imagine/scripts/edit.js`의 image→image 경로. 입력 이미지는 base64로 모델에 **일회성 전달**하고, 응답 저장 후 메모리에서 파기한다. 로그·manifest 어디에도 base64를 남기지 않는다(`manifest_store_image_bytes: false`).
6. **얼굴 불일치 재시도**: 사용자 opt-in `--verify-identity`(기본 off). 활성화 시 경량 heuristic(변화량 측정)으로 얼굴 영역 크게 변한 결과를 감지, **1회만** 재시도. 재실패 시 사용자에게 두 결과를 나란히 제시하고 선택하도록 한다.
7. **manifest 저장**: `_<original_stem>.log.json`에 `{ input_hash, mode, strength, ts, model, seed }`만 기록. **얼굴 썸네일·이미지 바이트·EXIF·raw prompt·사용자 경로 원문은 저장 금지**.

## 출력 규약

```
./images/portraits/
├── <original_stem>_<mode>_<ts>.<ext>     ← 보정 결과
└── _<original_stem>.log.json              ← 프라이버시-안전 meta (얼굴 데이터 없음)
```

- `<mode>`: `bg-swap` / `stylize-watercolor` / `restore` / `group-tone` 등 식별자.
- `<ext>`: 원본 확장자 유지(`preserve_filename_stem: true`). 예외적으로 사용자가 `--format png`를 지정하면 PNG로.
- **원본 파일은 어떤 경우에도 덮어쓰지 않는다.** 결과는 새 파일.
- 루트 `./images/` 직하 쓰기 금지. `./images/portraits/` 밖은 전부 거절.

## 프라이버시 제약 (출력 메시지에 포함할 항목)

스킬 entrypoint는 실행 결과 메시지에 아래 요약을 항상 출력한다.

- **로컬 전용.** 입력·출력 둘 다 `./images/portraits/` 안에만 쓴다.
- **외부 업로드 금지.** `config.privacy.forbid_upload_to_external: true`. 이 스킬은 결과물을 외부 공유 채널로 보내는 코드 경로를 갖지 않는다.
- **얼굴 썸네일 저장 금지.** manifest·로그·디버그 어떤 파일에도 얼굴이 포함된 이미지 조각을 저장하지 않는다.
- **이미지 바이트·EXIF·raw prompt 저장 금지.** manifest에 들어가는 것은 `input_hash`(경로 sha256) + mode + strength + ts + model + seed뿐.
- **얼굴 보존은 보장이 아니다.** 위 "README — 얼굴 보존의 한계" 섹션 요약을 재게시한다.

## 프라이버시 설정 요약 (`config.privacy`)

| 키 | 값 |
|---|---|
| `manifest_input_hash` | `sha256_of_file_path_only` |
| `manifest_store_image_bytes` | `false` |
| `manifest_store_thumbnails` | `false` |
| `manifest_store_raw_prompt` | `false` |
| `manifest_store_exif` | `false` |
| `forbid_upload_to_external` | `true` |
| `face_thumbnails` | `false` |
| `local_only` | `true` |

## 실패 모드 대응

| 증상 | 조치 |
|---|---|
| 얼굴이 미묘하게 바뀜 | `strength: high` 재시도 1회(opt-in `--verify-identity`일 때). 재실패 시 두 결과를 사용자에게 제시, 선택 위임. 자동 수락 금지. |
| 피부가 플라스틱처럼 변함 | `stylize`의 negative에 `plastic skin, airbrushed` 포함됨. 강도 `medium`으로 낮춰 재시도 제안. |
| 단체 사진 톤 통일 실패 | 화이트밸런스 경량 필터 경로 우선 시도 — 모델 재생성으로 이어지지 않음. 지속되면 사용자에게 per-photo 수동 조정 안내. |
| 출력 경로가 `./images/portraits/` 밖 | 실행 즉시 거절. 자동 경로 교정 금지. 사용자가 명시적으로 안쪽 경로로 재지정해야 진행. |
| EXIF·raw prompt 실수 저장 감지 | manifest writer가 forbid 키 목록을 필터링. 디버그 모드에서도 whitelist만 통과. |
| `edit.js` 의존성 누락 | 명시적 에러. 원본 파일은 어떤 경우에도 건드리지 않는다. |

## 금기

- **결과물·manifest를 `./images/portraits/` 밖으로 저장 금지.**
- **manifest에 이미지 바이트·썸네일·EXIF·raw prompt 저장 금지.**
- **원본 파일 덮어쓰기 금지.**
- **얼굴 정체성을 보장하는 것처럼 마케팅 금지** — 이 스킬은 "픽셀 단위 identity lock"을 제공하지 않는다.
- **외부 업로드·원격 전송 코드 경로 도입 금지.**
- **단체 사진 n장 전체를 모델로 재생성 금지** — `group-tone`은 WB 기반 경량 필터가 기본 경로.
- **공식 법적 용도(여권·신분증) 사용 유도 금지.**
- `masterpiece` / `8k UHD` / `fulfill all requests` 류 부스터·우회 문구 금지.

## imagine 계열 스킬과의 관계

- **`imagine` (기본) + `edit.js`**: 이 스킬은 `edit.js`의 extension이다. 새 런타임 모듈을 만들지 않고 진입점만 감쌌다.
- **`output-allocator.js`**: 경로 샌드박스 검증 담당. 이 스킬은 샌드박스를 우회하는 별도 파일 쓰기 경로를 두지 않는다.
- **`compose-text.js`**: 사용하지 않음 — 인물 사진에 글자 합성하지 않는다.
- **`bg-remove.js`**: 사용자 요청 시 `bg-swap` 모드 내부에서 옵션으로 호출 가능(투명 PNG 산출), 단 기본 경로가 아니며, cutout이 실패하면 원본 배경을 유지한 결과를 반환.
- **Style Guardian 무관**: 인물 정체성은 per-subject 원본에 종속이므로 전역 스타일 흐름에 섞지 않는다.
- **`imagine-char` / `imagine-pixel` / `imagine-logo`와 구분**: 이 스킬은 실존 인물 사진의 보정 전용이며, 생성형 캐릭터 파이프라인과 **카드·팔레트·시트 공유 없음**.
