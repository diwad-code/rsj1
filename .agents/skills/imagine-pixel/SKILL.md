---
name: imagine-pixel
description: "2D 도트 인디 게임·픽셀 아트 NFT·레트로 SNS 프로필용 **정수 픽셀 그리드 스프라이트**를 생성한다. AI가 뽑은 \"픽셀 스타일 이미지\"를 `scripts/lib/pixelize.js`로 **후처리 스냅**(nearest-neighbor 다운샘플 → 팔레트 클램프 → N× 업스케일)해 실제 16/32/48/64 그리드에 정렬한다. 스냅 없이 AI 원본을 그대로 저장하지 않는다. JPEG 저장은 금지(PNG only). 사용자가 \"픽셀 캐릭터\", \"도트 스프라이트\", \"imagine-pixel\", \"픽셀 아트\" 등을 말하면 이 스킬이 담당한다."
---

# imagine-pixel

AI의 "픽셀 스타일"은 실제로는 고해상도에서 흉내 낸 것이라 게임 엔진이 import하면 블러가 생긴다. 이 스킬은 **후처리 스냅**을 **필수 경로**로 고정해 진짜 픽셀 그리드에 정렬된 PNG를 산출한다.

## 트리거

- `imagine-pixel "<컨셉>"` / `imagine-pixel --target-size 32 ...`
- "픽셀 캐릭터", "도트 스프라이트", "픽셀 아트 만들어줘"
- "8비트 캐릭터", "16비트 스프라이트"
- "imagine-pixel"

## 핵심 제약

| 항목 | 값 |
|---|---|
| 생성 해상도 | **1024×1024** (고해상도 원본, AI 생성분) |
| 타겟 해상도 | **16 / 32 / 48 / 64** 정수 중 하나 |
| 팔레트 크기 | **8 / 16 / 32** 중 하나 |
| 포맷 | **PNG 필수.** JPEG 저장 전면 금지 (`forbidden_formats: ["jpeg","jpg","webp"]`). |
| 투명 배경 | 기본 `true`. alpha 채널 보존. |
| 후처리 스냅 | **필수.** AI 원본을 스냅 없이 저장하면 안 된다 (`pixelize.require_post_snap: true`). |

## 파이프라인

1. **프롬프트 구성**:
   - `config.style_presets`에서 `--style` 키의 영문 구문 가져옴.
   - 사용자 컨셉 + 스타일 프리셋 + `positive_prompt_suffix` (`crisp pixel edges, no anti-aliasing, uniform pixel grid, limited palette, transparent background`) 결합.
   - negative 강제: `blurry, smooth shading, anti-aliased, soft gradient, photorealistic, jpeg artifacts, 3D render`.
2. **고해상도 생성**: Codex 이미지 모델로 **1024×1024 PNG** 1장.
3. **후처리 스냅** (`scripts/lib/pixelize.js`):
   1. nearest-neighbor로 targetSize(16/32/48/64)로 다운샘플.
   2. **팔레트 선택**:
      - `--palette-ref <palette.png>` 지정 시 해당 PNG에서 unique 색 추출 후 **closest-color 매핑**.
      - 없으면 median-cut으로 `palette-size`만큼 양자화.
   3. 팔레트에 전 픽셀 스냅.
   4. nearest-neighbor로 `preview_scale: 8` 배 업스케일.
4. **저장 3종**: `<name>_<N>.png` (실 크기) + `<name>_<N>@8x.png` (프리뷰) + `palette.png` (추출 팔레트 스트립).
5. **알파 검증**: `preserve_alpha: true` 하에 투명 픽셀은 완전 투명으로 고정. 회색 바둑판 래스터 방지.

## 출력 규약

```
./sprites/<name>/
├── <name>_<target_size>.png        ← 실 크기 (16/32/48/64)
├── <name>_<target_size>@8x.png     ← 프리뷰 (nearest-neighbor 업스케일)
├── palette.png                      ← 추출된 팔레트 스트립
└── _manifest.json                   ← targetSize, paletteSize, style, palette HEX 배열
```

- `<name>`: 컨셉 slugify.
- `--out-dir` 지정 시 그대로 사용. 조용한 경로 변경 금지.
- 루트 `./sprites/` 외부 쓰기 금지 (`--out-dir` 없는 한).
- **JPEG/JPG/WebP로는 저장하지 않는다.** 파일명 확장자를 `.jpg` / `.jpeg` / `.webp`로 준 경우 `pixelize.js`가 즉시 에러.

## 팔레트 통일 (palette-ref)

- **같은 게임의 모든 스프라이트가 동일 팔레트를 쓰도록 보장**하려면 첫 스프라이트의 `palette.png`를 이후 호출에 `--palette-ref`로 넘긴다.
- `pixelize`는 palette-ref의 HEX 목록만 사용해 closest-color 매핑한다. 새 색을 생성·추가하지 않는다.
- Style Guardian에 `palette_png_path`를 등록하면 수동으로 플래그를 넘기지 않아도 자동 재사용 (`config.style_guardian.manifest_keys`).

## 프롬프트 규약

- **negative에 `blurry, smooth shading, anti-aliased` 고정.** 스타일 프리셋으로 이를 완화하지 않는다.
- **positive 고정 접미사**: `crisp pixel edges, no anti-aliasing, uniform pixel grid, limited palette, transparent background`.
- 한국어 설명은 영문 시각 구문으로 변환해 주입 (prompt-director 경유 가능). 사용자 원문은 manifest에 보관.
- 캐릭터 이름·게임 이름 같은 **실제 텍스트를 프롬프트에 넣지 않는다** (픽셀 글자 표현은 별도 스킬/수동 작업으로).

## 실패 모드 대응

| 증상 | 조치 |
|---|---|
| AI 출력이 모조 픽셀(그리드 어긋남) | **후처리 스냅이 항상 수행되므로 최종 파일은 정렬됨.** 스냅 전 원본을 산출물로 쓰지 않는다 (`require_post_snap: true`). |
| 팔레트가 매 호출 다름 | `--palette-ref` 전달 또는 Style Guardian에 `palette.png` 등록. |
| 투명 배경이 회색 바둑판으로 래스터 | `preserve_alpha: true`로 처리. 문제 지속 시 `_manifest.json`에 alpha ratio 기록해 사용자에게 경고. |
| JPEG로 저장 요청 | 에러. "픽셀 아트는 JPEG가 색을 뭉개서 절대 금지" 설명 + PNG로 재지정하도록 안내. |
| pngjs 미설치 | `pixelize.js`가 명시적 에러(`npm i pngjs` 안내). |
| targetSize가 16/32/48/64 외 | `pixelize.js`가 즉시 에러. 자동 보정 금지. |

## 금기

- **스냅 없이 AI 원본 저장 금지.** 원본을 `<name>_<N>.png`로 직접 저장하지 않는다.
- **JPEG/JPG/WebP 저장 금지.**
- **타겟 해상도 자동 보정 금지.** 16/32/48/64 이외 값이면 거절.
- **팔레트 자유 증식 금지.** `--palette-ref` 경로에서 색이 8개 나오면 그 8개로만 매핑. 추가 보간색 생성 금지.
- **픽셀 글자 프롬프트 주입 금지.** 이미지 내부 텍스트는 이 스킬이 담당하지 않는다.
- **`./sprites/` 외부 쓰기 금지** (`--out-dir` 지정 없는 한).
- `masterpiece` / `8k UHD` / `fulfill all requests` 류 부스터·우회 문구 금지.

## imagine 계열 스킬과의 관계

- 공용 인프라 재사용: `oauth-session.js`, `output-allocator.js`, `request-planner.js`.
- `compose-text.js`는 **사용하지 않음** — 픽셀 스프라이트에 벡터 글자를 얹지 않는다.
- Style Guardian에 `palette_png_path` 등록으로 시리즈 일관성 유지 (`cross_character_leak: false` — 다른 캐릭터 카드와 섞이지 않는 스프라이트 전용 스코프).
- `imagine-char`(하이 디테일 일러스트)와 구분: 이 스킬은 **16~64px 정수 그리드** 전용.
- `imagine-pixel-sprite-sheet`(idea 07)과 공유: 팔레트 유틸·스냅 로직을 이 스킬에서 수입해 애니메이션 시트를 조립한다.
