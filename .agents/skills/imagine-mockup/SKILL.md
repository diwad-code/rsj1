---
name: imagine-mockup
description: "앱스토어·포트폴리오·마케팅 자료에 쓰는 **제품 목업**(기기 프레임에 끼운 스크린샷 + 배경)을 생성한다. AI는 **배경만** 그리며, 기기 프레임과 스크린샷 합성은 `scripts/lib/device-composer.js`가 결정적으로 수행한다. 기기 프리셋은 `data/devices.json`에서 로드해 커뮤니티 PR로 확장 가능. 배경이 필요 없으면(solid/gradient/업로드 이미지) **AI 호출을 아예 스킵**한다. 사용자가 \"제품 목업\", \"앱스토어 스크린샷\", \"기기 프레임 씌워줘\", \"imagine-mockup\" 등을 말하면 이 스킬이 담당한다."
---

# imagine-mockup

"기기 사진"처럼 보이게 하는 건 AI의 장기가 아니다. 이 스킬은 AI를 **배경 그리기**로 한정하고, 기기 프레임·스크린샷 정렬은 SVG + sharp로 픽셀 정확히 처리한다.

## 트리거

- `imagine-mockup <screenshot> --device iphone-16-pro --bg "pastel gradient"`
- `imagine-mockup <screenshot> --device macbook-pro-14 --bg upload:./lifestyle.jpg --tilt -10`
- `imagine-mockup bulk ./screens/*.png --device iphone-16-pro --template appstore-hero`
- "제품 목업 만들어줘", "앱스토어 스크린샷 목업", "맥북 프레임 씌워줘", "아이폰 프레임"
- "imagine-mockup"

## 파이프라인

1. **입력 검증**: 스크린샷 파일 존재·확장자 확인. 기기 프리셋은 `data/devices.json`에서 키로 조회 — 없으면 거절, 자동 매핑 금지.
2. **배경 분기**:
   - `--bg solid:#HEX` 또는 `--bg gradient:#A,#B,...` → **AI 호출 스킵**. `device-composer`가 단색/그라디언트를 자체 생성.
   - `--bg upload:<path>` → 해당 이미지 파일을 배경으로 사용, AI 스킵.
   - `--bg transparent` / `--bg none` → 완전 투명 배경, AI 스킵.
   - `--bg "<prompt>"` 또는 `--template <name>` → `imagine`의 `generate.js` 경로로 배경만 1536×1024 AI 생성(`ai_generate_size`). 텍스트·기기 혼입 방지 negative 강제.
3. **스크린샷 정렬 (결정적)**: `device-composer.compose(screenshotPath, devicePreset, bgImagePath, outputPath, options)` 호출.
   - 기기 screen 영역(픽셀 단위 x/y/w/h)에 스크린샷을 sharp Lanczos3로 리사이즈 후 삽입.
   - 스크린샷 aspect가 기기 screen aspect와 1% 이상 어긋나면 자동 `contain` fit + `pad_color_default: "#000000"` 패드, `warnings[]`에 메시지 추가 → 사용자에게 "스크린샷 비율이 기기와 다릅니다. 자동 패드 적용됨." 보고.
4. **기기 프레임 SVG overlay**: 프리셋의 body corner / bezel / frame fill을 SVG로 그려 스크린샷 위에 얹는다. `--tilt <deg>`이 있으면 rotate transform만 적용(perspective 왜곡은 현재 버전 외 범위).
5. **대비 검증 (opt-in, 기본 활성)**: 합성 후 기기 영역 주변 배경 평균 명도를 측정해 기기 대비가 부족하면 자동 vignette 또는 radius 6 블러를 배경에 적용(`contrast_check.auto_vignette_on_fail: true`).
6. **저장**: `./images/mockups/<product-slug>/<slug>_<device-key>.png`. 프로젝트 루트 `./images/` 직하 쓰기 금지.

## 출력 규약

```
./images/mockups/<product-slug>/
├── <slug>_<device-key>.png
├── lifestyle_macbook-pro-14.png     ← 다른 기기·템플릿 호출 시
├── appstore_01.png ... appstore_06.png  ← --bulk 모드
└── _template.json                    ← 적용된 preset/bg/template/warnings 요약
```

- `<product-slug>`: 스크린샷 파일명 기반 slugify 또는 사용자 `--slug` 지정값.
- `--out-dir` 명시 시 그대로 사용. 조용한 경로 변경 금지.
- bulk 모드의 파일명은 `bulk_output_filename: "appstore_<index>.png"`.

## 기기 프리셋 카탈로그

- 위치: `data/devices.json` (별도 파일).
- 각 엔트리 스키마: `{ label, canvas: {width,height}, screen: {x,y,w,h,cornerRadius}, body_corner_radius, frame_fill, bezel_fill, aspect }`.
- 기본 엔트리: `iphone-16-pro`, `iphone-se`, `galaxy-s25`, `ipad-pro-13`, `macbook-pro-14`, `macbook-pro-16`, `imac-24`, `browser-mac`, `browser-windows`.
- 커뮤니티 PR 규칙: 저작권 있는 로고·브랜드 렌더를 bezel에 새겨 넣지 않는다. 뉴트럴 다크 베젤로 유지. 신 기기 추가 시 `canvas` / `screen` 픽셀 값만 제공하면 합성이 결정적으로 동작한다.

## 프롬프트 규약 (배경 AI 호출 시)

- **기기 단어를 프롬프트에 넣지 않는다.** negative로 `device, phone, screen, laptop, computer, tablet, monitor, keyboard, mouse, hand holding phone` 강제. AI가 기기를 그리면 실제 프레임과 겹쳐 망가진다.
- **텍스트·워터마크 금지**: negative에 `text, watermark, logo text` 포함.
- 배경 템플릿은 `config.bg.templates`에서 영문 구문으로 고정: `appstore-hero` / `lifestyle` / `studio` / `outdoor`.
- 사용자 컨셉 문자열은 원문 보존 — 자유 수식은 템플릿 뒤에만 덧붙임.

## AI 호출 스킵 조건

`config.bg.skip_ai_when: ["solid","gradient","image","transparent"]`. 아래 케이스 중 하나면 이 스킬은 **generate.js를 호출하지 않는다.**

- `--bg solid:#HEX`
- `--bg gradient:#A,#B,...`
- `--bg upload:<path>`
- `--bg transparent` / `--bg none`
- `--no-bg`

이 경로는 순수 후처리로 기기 프레임 + 스크린샷 + 단색/업로드 배경만 합성해 쿼터·비용을 아낀다.

## 스크린샷 비율 불일치 처리

- **자동 패드 + 경고**: 사용자 스크린샷이 기기 screen aspect와 어긋나면 `contain` fit으로 중앙 배치하고 남는 영역을 `pad_color_default: "#000000"`으로 채운다. `warnings[]`에 "스크린샷이 N:M 아님, 검은 패드 추가됨" 문구 추가, 사용자에게 그대로 노출.
- **무음 크롭 금지**: 경고 없이 중요한 UI 영역을 잘라내지 않는다. 사용자가 `--screenshot-fit cover --pad-color transparent` 등을 명시할 때만 cover crop 허용.

## bulk 모드 (`--bulk <glob>`)

- 같은 기기·같은 템플릿으로 n장을 렌더링한다.
- 동시성: `config.batch.concurrency: 2`. 배경이 AI 생성이면 template 재사용으로 실제 AI 호출 수를 줄임(첫 장만 생성 후 배경 공유 또는 1장당 생성 선택 — `--shared-bg` 플래그).
- 1건 실패가 전체 bulk를 중단시키지 않는다(개별 manifest 기록).
- 출력: `./images/mockups/<slug>/appstore_<index>.png`.

## 실패 모드 대응

| 증상 | 조치 |
|---|---|
| AI 배경에 기기가 멋대로 그려짐 | negative 강화(`device, phone, ...`)는 기본 포함. 재생성 1회. 지속 시 해당 템플릿을 `studio`/`gradient` 같은 안전 템플릿으로 교체 제안. |
| 기기 대비 부족(기기가 배경에 묻힘) | `contrast_check` 활성 시 자동 vignette 또는 radius 6 블러. 비활성 시 `_template.json.warnings`에 기록만. |
| 스크린샷 비율 불일치 | 자동 패드 + 경고. cover crop은 사용자가 명시할 때만. |
| 프리셋 키 부재 | 즉시 에러 + 사용 가능한 키 목록 제시. 자동 매핑 금지. |
| sharp 미설치 | 명시적 에러(`npm i sharp`). 이 스킬은 sharp 없이는 동작하지 않는다. |
| 프리셋 업데이트 지연(신 기기) | `data/devices.json`에 엔트리만 추가하면 즉시 사용 가능 — 코드 수정 불필요. |

## 금기

- **AI 프롬프트에 기기 단어 주입 금지** (`phone, laptop, device, screen, monitor` 등). negative로 차단.
- **저작권 로고·브랜드 이름을 프레임에 렌더 금지.** 카탈로그 엔트리는 뉴트럴 색상만.
- **무음 크롭 금지** — 스크린샷 비율 불일치는 항상 경고.
- **합성 엔진 사본 생성 금지** — 이 스킬은 `device-composer.js` 하나만 호출한다.
- **`./images/mockups/` 외부 쓰기 금지** (`--out-dir` 지정 없는 한).
- **AI 호출 스킵 조건을 무시하고 강제 생성 금지** — solid/gradient/upload 모드에서 AI가 호출되면 비용·쿼터 낭비.
- `masterpiece` / `8k UHD` / `fulfill all requests` 류 부스터·우회 문구 금지.

## imagine 계열 스킬과의 관계

- **`imagine` (generate.js)**: 배경 AI 호출은 이 경로를 재사용. `edit.js`는 사용하지 않음.
- **`compose-text.js`**: 사용하지 않음 — 목업에 글자 얹기는 스크린샷 안에 이미 있다.
- **`imagine-ui`**: 프레임 **없는** 모바일 UI 스타일 보드는 그 스킬. 이 스킬은 실제 UI 스크린샷을 받아 기기에 끼우는 용도. `imagine-ui` 결과(프레임 없는 화면 내부)를 이 스킬의 `<screenshot>` 입력으로 넘기면 완성형 목업이 된다.
- **`imagine-hero`**: 랜딩 페이지 히어로 비주얼은 그 스킬. 기기에 끼운 목업이 필요하면 여기.
- **`imagine-og`**: OG 이미지에 목업을 배경으로 쓰고 싶으면 이 스킬 결과 PNG를 `imagine-og`의 `--bg upload:<path>`로 넘긴다.
