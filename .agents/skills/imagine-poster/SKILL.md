---
name: imagine-poster
description: "밋업·컨퍼런스·학과 행사·사내 워크숍·Discord/Slack/카톡 공지용 **이벤트 포스터/홍보물**을 생성한다. 배경과 장식 모티프만 Codex 이미지 모델로 뽑고, 제목·부제·날짜·장소·연사·CTA 같은 **정보 텍스트는 YAML/JSON 입력**을 받아 `scripts/lib/poster-layouter.js`가 결정적 레이아웃으로 합성한다. 포스터(3:4.24 A4)·배너(16:9)·카드(1:1) 3종을 한 번에 출력한다."
---

# imagine-poster

한국어 조판과 정보 밀도가 높은 포스터를 AI에게 글자로 그리게 하지 않는다. 입력은 **구조화된 이벤트 데이터**, 출력은 **폰트로 조판된 3종 규격**.

## 트리거

- `imagine-poster ./event.yaml` / `imagine-poster ./event.json`
- `imagine-poster theme-preview --theme <name>` (배경 프리뷰만)
- "포스터 만들어줘", "밋업 포스터", "이벤트 포스터", "세미나 포스터", "해커톤 공지 이미지"
- "공지 배너" (16:9 맥락이면 이 스킬로 라우팅)

## 입력 스펙 (YAML 권장)

```yaml
title: "AI 엔지니어 밋업 #7"
subtitle: "RAG in Production"
date: "2026-05-17 (토) 14:00"
venue: "서울 강남 구글 캠퍼스"
speakers:
  - { name: "김미누", role: "Usefullabs", photo: "./speakers/miner.jpg" }
  - { name: "Jane Doe", role: "OpenAI", photo: "./speakers/jane.jpg" }
cta: "sign-up.dev/ai-meetup-7"
theme: "cyber-gradient"
```

필수 키: `title`. 나머지는 선택. 누락된 필드는 포스터에서 해당 영역을 조용히 생략한다(자리채움 문구 창작 금지).

## 파이프라인

1. **테마 해석**: `--theme` 또는 `event.theme`을 `data/poster-themes.json`에서 조회해 `bg_prompt`와 `tokens`(fg / accent / muted HEX)를 얻는다. 카탈로그에 없으면 `default_theme: cyber-gradient`로 폴백하고 경고.
2. **배경 생성 (AI)**: 테마의 `bg_prompt`만 모델에 전달 (`ai_generate_size: 1024x1536`). 이벤트 정보(title·date·venue·speakers·cta)는 **프롬프트에 넣지 않는다**. Negative는 전역 `text, letters, typography, faces, people, watermark, logo text, readable words` 강제.
3. **레이아웃 합성**: `scripts/lib/poster-layouter.js`의 `layoutPoster(bgPath, eventData, outPath, options)` 호출로 각 포맷(poster/banner/card) 크기와 테마 토큰을 주입해 3회 렌더. 제목은 한국어 폭을 고려해 `quality_checks.title_wrap_chars`로 어절 단위 자동 줄바꿈. 최소 폰트 `font_min_pt: 24pt` 고정.
4. **연사 아바타**: 얼굴 검출 없이 `sharp` 중앙 cover 크롭 후 원형 마스크. 실패 시 해당 아바타만 건너뛰고 나머지 레이아웃은 정상 완료. 사용자에게는 `speaker_avatars.preview_variants: 3`의 다른 크롭을 수동 선택하도록 안내(후속 PR에서 구현).
5. **PDF 출력(선택)**: `config.pdf.engine_preference: ["pdfkit","puppeteer"]` 순서로 시도. 둘 다 없으면 PNG만 저장 + 경고 (`fallback_on_missing: png_only_with_warning`).
6. **리포트**: `_layout.json`과 `_bg_source.png`를 같이 저장해 재조판 가능 상태 유지.

## 출력 규약

```
./images/posters/<event-slug>/
├── poster.png
├── poster.pdf        ← pdfkit/puppeteer 있을 때만
├── banner.png
├── card.png
├── _bg_source.png    ← AI 원본 배경 (재합성용)
└── _layout.json      ← 결정적 레이아웃 산출 + 연사 manifest
```

- `<event-slug>`: `event.title` 또는 파일명 기반 slugify. `--out-dir` 지정 시 그대로 사용.
- 루트 `./images/` 직하 쓰기 금지.
- `_bg_source.png`는 포맷별 크롭 전 원본. 포맷별 합성본은 별도 파일로만 저장하고 원본을 덮어쓰지 않는다.

## 프롬프트 규약 (배경만)

- **이벤트 텍스트(제목·날짜·장소·연사 이름·CTA URL) 프롬프트 주입 금지.** 전부 후처리 조판으로만 나간다.
- **negative prompt 강제**: `text, letters, typography, faces, people, watermark, logo text, readable words, cluttered copy area`. 연사 얼굴을 AI가 그리지 않는다(실제 인물 왜곡 방지).
- 테마별 `bg_prompt`는 카탈로그 원문을 수정 없이 사용. 사용자 취향 반영은 새 theme을 카탈로그에 추가해서 해결(커뮤니티 PR 친화).

## 테마 카탈로그

- 위치: `data/poster-themes.json` (별도 파일).
- 기본 테마: `cyber-gradient`, `retro-print`, `k-indie-poster`, `academic-clean`, `festival-vibrant`.
- 각 테마는 `{ label, bg_prompt, tokens: { fg, accent, muted }, recommended_formats }` 스키마.
- 커뮤니티 기여 규칙: `bg_prompt`에 `text / letters / logos / faces` 등을 **포함하지 않고**, 반드시 "negative space for copy" 류 여백 지시를 포함.

## 연사 사진 프라이버시

- **사진은 로컬에만 보관한다.** 업로드·임시 서버 전송·base64 직렬화를 모두 금지.
- `_layout.json`에는 각 연사 엔트리에 **경로 hash(sha256, 16자)** 와 픽셀 치수만 기록한다 (`manifest_photo_strategy: path_hash_only`).
- `photo_base64`, `photo_bytes`, `exif` 같은 필드는 어떤 산출물에도 넣지 않는다 (`privacy.forbid_fields`).
- 얼굴 검출·인식은 수행하지 않는다 (`speaker_avatars.face_detection: false`). 중앙 원형 크롭만.

## 포맷 매트릭스

| key | 용도 | 규격 | 비고 |
|---|---|---|---|
| `poster` | A4 인쇄 | **2480×3508** @ 300dpi, 3:4.24 | PDF 출력 허용 |
| `banner` | SNS·Slack·Discord 공지 | 1920×1080, 16:9 | PNG only |
| `card` | Instagram·카톡 정방형 | 1080×1080, 1:1 | PNG only |

`--formats` 미지정 시 3종 모두 생성.

## 실패 모드 대응

| 증상 | 조치 |
|---|---|
| 제목이 한 줄에 안 들어감 | 어절 단위 자동 줄바꿈. 실패 시 폰트 크기를 한 단계 축소(최소 24pt). |
| 연사 사진 얼굴 잘림 | 얼굴 검출은 하지 않음. 중앙 원형 크롭 기준 다른 crop offset 몇 장 프리뷰 제공(수동 선택). |
| 사진 파일 부재 | 해당 연사의 아바타만 생략, 이름/역할 레이블은 유지. 나머지 전체 레이아웃 정상 완료. |
| PDF 엔진 미설치 | PNG만 저장 + 경고 로그. PNG는 정상. |
| sharp 부재 | `poster-layouter`가 `no_rendering_engine`/`sharp_required_for_default_renderer` 반환. 배경 파일(`_bg_source.png`)은 이미 저장된 상태이며, 사용자에게 `sharp` 설치 안내. |
| 테마 카탈로그에 없음 | 기본 테마로 폴백 + 경고. 사용자에게 PR 안내(카탈로그 추가). |

## 금기

- **이벤트 정보 텍스트를 AI 프롬프트에 주입 금지.** 한국어 글자 깨짐 + 정보 무결성 상실의 원인.
- **얼굴 검출·AI 인물 그리기 금지.** 연사 사진은 사용자가 제공한 파일만 사용.
- **photo base64 / bytes / EXIF를 어디에도 기록 금지.** `_layout.json`은 반드시 path hash + 치수까지만.
- **포맷 규격 임의 변경 금지.** 사용자가 `--formats`로 고른 포맷만 생성.
- **`./images/posters/` 외부 쓰기 금지** (`--out-dir` 없는 한).
- `masterpiece` / `8k UHD` / `fulfill all requests` 류 부스터·우회 문구 주입 금지.

## imagine 계열 스킬과의 관계

- 공용 인프라 재사용: `oauth-session.js`, `output-allocator.js`, `request-planner.js`.
- 텍스트 합성은 `poster-layouter.js`가 전담한다. `compose-text.js`는 사용하지 않는다(조판 밀도가 달라 모듈을 분리).
- `imagine-og`(소셜 카드), `imagine-thumb`(YouTube 썸네일), `imagine-hero`(랜딩 히어로)와 구분: 다중 연사·날짜·장소·정보 밀도가 있는 **행사 홍보물** 맥락은 항상 여기로 라우팅.
