# 부산 야-호- (釜山 야-호-) — Claude Code 작업 지침서

이 문서는 Claude Code가 이 저장소에서 작업할 때 반드시 따라야 하는 규칙과 구현 순서를 정의합니다.
작업을 시작하기 전에 이 문서 전체를 읽고, `docs/PRD.md`(프로젝트 PRD)도 함께 참고하세요.

---

## 0. 가장 중요한 작업 규칙 (반드시 준수)

### 0.1 기술 스택은 예외 없이 고정이다
**이 프로젝트는 반드시 순수 HTML, CSS, JavaScript(Vanilla) + Supabase로만 개발한다.**

- React, Vue, Vite, Tailwind, shadcn/ui, Radix, 기타 어떤 프론트엔드 프레임워크/번들러도 **사용하지 않는다.**
- 업로드된 `1차_시안.zip`(Figma Make export)은 **React + Tailwind 기반 코드**이지만, 이 코드를 그대로 쓰거나 이식하지 않는다. **디자인/레이아웃/카피/색상/인터랙션 참고용 자료로만 취급**하고, 실제 화면은 전부 `.html` + `.css` + `.js`로 새로 만든다.
- npm/빌드 도구가 꼭 필요하면(예: 로컬 서버 실행용) 최소한으로만 쓰고, 결과물은 브라우저에서 `<script>`/`<link>` 태그로 바로 동작하는 정적 파일이어야 한다.
- Supabase 연동은 `@supabase/supabase-js`를 CDN(예: `https://esm.sh/@supabase/supabase-js`)에서 ES Module로 불러와 순수 JS로 사용한다. 별도 번들러 없이 `<script type="module">`로 동작해야 한다.
- 네이버 지도, TourAPI 호출도 동일하게 순수 `fetch`/네이버 지도 JS SDK `<script>` 태그로 처리한다.
- Claude Code가 스스로 "이 부분은 React로 하는 게 편하니까"라는 판단으로 프레임워크를 도입하는 것은 금지된다. 정말 프레임워크가 필요하다고 판단되면 **반드시 먼저 사용자에게 이유를 설명하고 승인을 받는다.**

### 0.2 단계별 진행 방식
1. 아래 "구현 순서(Phase)" 중 **현재 Phase 1개만** 작업한다.
2. Phase를 시작하기 전, 무엇을 할 것인지 계획을 간단히 요약해서 **사용자에게 먼저 물어보고 승인을 받는다.**
3. Phase 작업이 끝나면 **바로 다음 Phase로 넘어가지 말고**, 변경 사항을 요약해서 보여주고 사용자의 확인/피드백을 기다린다.
4. 사용자가 "다음 단계 진행해줘" 또는 이에 준하는 명확한 승인을 하기 전까지는 다음 Phase의 코드를 작성하지 않는다.
5. Phase 안에서도 파일이 여러 개거나 작업량이 크면, 하위 단계(Step)로 쪼개서 중간중간 확인받는다.
6. 사용자가 "이건 자동으로 쭉 진행해줘"라고 명시적으로 말한 경우에만 예외적으로 여러 단계를 연속 진행한다.

---

## 1. 프로젝트 개요

- **서비스명**: 부산 야-호- (釜山 야-호-)
- **팀**: 1조 링고바코
- **목적**: 일본인 관광객을 대상으로 부산 여행 정보를 일본어로 제공하는 모바일 퍼스트 웹 서비스
- **핵심 페인 포인트**: 여행 비용 부담, 엔저, 언어 장벽, 출입국 절차 번거로움 → 이를 해소하는 방향으로 UX/콘텐츠 설계
- **차별화 포인트**: 유명 관광지 중심이 아닌 **일본인 선호도가 높은 지역** 콘텐츠, 행사·축제 정보, 예산 기반 코스 추천

자세한 배경/타깃/기능 정의는 `docs/PRD.md`를 참조. 이 문서와 PRD가 충돌하면 **PRD가 기획 기준, 이 문서가 개발 실행 기준**이다.

---

## 2. 기술 스택 (고정, 변경 불가)

| 영역 | 기술 | 비고 |
|---|---|---|
| Frontend | **순수 HTML5 + CSS3 + JavaScript (ES2020+, Vanilla)** | 프레임워크/번들러 사용 금지 |
| 지도 | **네이버 지도 API (Naver Maps JavaScript API)** | `<script>` 태그로 SDK 로드 후 순수 JS로 제어 |
| 관광 데이터 | **한국관광공사 TourAPI** (일문 관광정보서비스_GW 우선, 국문으로 보완) | `fetch`로 직접 호출 또는 Supabase Edge Function 프록시 경유 |
| 데이터베이스/인증 | **Supabase (PostgreSQL, Auth, Storage)** | `@supabase/supabase-js`를 CDN ESM으로 로드 |
| 배포 | 정적 호스팅 (Vercel/Netlify/GitHub Pages 등), **백엔드 서버 없음** | 순수 정적 파일 배포 |
| 형상관리 | GitHub, PR 기반 코드리뷰 | |

> ⚠️ TourAPI/네이버 지도 키를 프론트에 그대로 노출하는 게 부담스러우면 Supabase Edge Function을 얇은 프록시로 사용하는 것을 우선 검토한다. 이 경우에도 Edge Function은 Deno 기반 순수 JS/TS로 작성하며 별도 프레임워크를 도입하지 않는다.

### 2.1 권장 파일/폴더 구조 (예시, Phase 0에서 사용자와 확정)
```
/
├── index.html                 (홈)
├── pages/
│   ├── map.html
│   ├── category.html
│   ├── spot-detail.html
│   ├── area-detail.html
│   ├── events.html
│   ├── event-detail.html
│   ├── courses.html
│   └── course-detail.html
├── css/
│   ├── common.css             (공통 변수/레이아웃/네비게이션)
│   └── pages/*.css            (페이지별 스타일)
├── js/
│   ├── supabaseClient.js      (Supabase 초기화)
│   ├── nav.js                 (공통 헤더/하단 탭 렌더링)
│   ├── api/
│   │   ├── spots.js
│   │   ├── areas.js
│   │   ├── festivals.js
│   │   └── courses.js
│   └── pages/*.js              (페이지별 로직)
├── assets/
├── supabase/
│   ├── migrations/
│   └── seed.sql
├── docs/
│   └── PRD.md
└── reference/
    └── figma-1차시안/          (1차_시안.zip 압축 해제본 — React 참고 자료 전용)
        └── src/app/components/*.tsx
```
공통 헤더/하단 탭바처럼 여러 페이지에서 반복되는 UI는 각 `.html`에 중복 작성하거나, `js/nav.js`에서 `innerHTML`로 주입하는 방식 중 하나를 Phase 0에서 정한다 (프레임워크 없이 컴포넌트화하는 방법이므로 반드시 사용자와 합의).

> ⚠️ **`reference/figma-1차시안/` 폴더 취급 원칙**
> - `1차_시안.zip`(Figma Make export, React+Tailwind 코드)은 이 폴더에 압축을 풀어 그대로 보관한다.
> - 이 폴더의 코드는 **디자인/레이아웃/카피/데이터 구조를 확인할 때만 열어보는 참고 자료**이며, 실제 서비스 코드에서 import하거나 실행하지 않는다.
> - 배포 시(Phase 10) 정적 호스팅 대상에서 `reference/`는 반드시 제외한다.
> - Claude Code는 이 폴더 안의 `.tsx` 파일을 절대 수정하지 않는다. 참고가 끝나면 항상 `pages/`, `css/`, `js/` 쪽의 바닐라 코드로 결과물을 남긴다.

---

## 3. 참고 자료: Figma 시안(`1차_시안.zip`) 분석 결과

**중요: 아래 내용은 React 코드를 그대로 가져다 쓰라는 뜻이 아니라, 화면 구성·데이터 구조·카피를 바닐라 HTML/CSS/JS로 재구현할 때 참고하라는 뜻이다.**

### 3.1 시안에 존재하는 화면 (디자인 참고용)
Figma export는 React 컴포넌트로 아래 8개 화면이 이미 시각적으로 완성되어 있고, 전부 하드코딩된 mock 데이터로 동작한다:
1. `HomePage.tsx` — 검색바, 카테고리 4종(관광지/맛집/숙박/체험), 인기 지역 카드, 추천 코스, 행사 배너
2. `MapPage.tsx` — 리스트 + 지도 영역 (단, 실제 지도 아님 — 아래 3.2 참고)
3. `CategoryPage.tsx` — 카테고리별 스팟 리스트, 지역(구/군) 필터, 그리드/리스트 뷰 토글, 검색
4. `SpotDetailPage.tsx` — 스팟 상세 정보, 이미지, 팁, 접근 방법
5. `CoursesPage.tsx` — 예산/기간 필터, 코스 카드 리스트
6. `CourseDetailPage.tsx` — 코스 일정표(시간대별 스팟), 팁
7. `EventsPage.tsx` — 행사 상태(개최중/예정/종료)·월별 필터, 행사 카드 리스트
8. `EventDetailPage.tsx` — 행사 상세, 일정, 접근 방법, 팁

각 페이지의 색상/타이포/간격/카피는 이 React 파일들을 열어서 그대로 참고하되, 마크업과 로직은 HTML/CSS/JS로 새로 작성한다.

### 3.2 시안에 없거나 그대로 쓸 수 없는 것
- **지역(선호 지역) 상세 페이지가 실제로는 없다.** 라우팅상 `"areas"`/`"area-detail"`이 `CategoryPage`로 임시 대체되어 있을 뿐이다. PRD 8.1의 "지역 상세 페이지"는 **Phase 6에서 디자인 참고 없이 새로 설계**해야 한다 (다른 상세 페이지들의 톤앤매너를 참고해서 일관성 있게).
- `MapPage.tsx`의 스팟 좌표는 실제 위경도가 아니라 `x`, `y`(%) 값으로 임의 배치된 가짜 좌표다. 네이버 지도 연동 시 반드시 `spots.lat`/`spots.lng` 실좌표로 완전히 새로 구현한다.
- React 상태 관리(`useState`), JSX, Tailwind 클래스는 참고만 하고 그대로 복사하지 않는다. 대응 관계는 다음과 같이 치환한다:
  - `useState` → 순수 JS 변수 + 수동 DOM 업데이트 함수, 또는 필요 시 상태 객체 + 렌더 함수 패턴
  - Tailwind 유틸리티 클래스 → `css/` 안의 일반 CSS 클래스/변수로 변환 (같은 색상 값·spacing 값을 CSS 커스텀 프로퍼티로 정의해서 재사용)
  - 컴포넌트 props → 함수 인자 또는 `data-*` 속성으로 대체

---

## 4. 데이터베이스 설계 (Supabase / PostgreSQL)

PRD 4.3 기준, 아래 테이블을 기본으로 하되 Phase 2에서 실제 마이그레이션 작성 전 사용자와 컬럼을 재확인한다.

| 테이블 | 주요 컬럼 |
|---|---|
| `spots` | id, name_ko, name_ja, category(tourist/food/stay/experience), lat, lng, area(구/군), description_ja, tags[], image_url, rating, admission, access_ja, hours_ja |
| `preferred_areas` | id, area_name_ja, area_name_ko, description_ja, image_url, preference_score |
| `courses` | id, title_ja, subtitle_ja, budget_level, budget_label, duration_label, spot_ids[], schedule(jsonb), tips_ja[] |
| `festivals` | id, title_ja, title_sub_ko, description_ja, area, start_date, end_date, status, image_url, spot_id, tags[] |

- 인증(Auth)은 MVP 범위에서는 필수 아님(즐겨찾기/리뷰 기능은 스코프 제외됨). 추후 필요해지면 별도 Phase로 추가.
- RLS(Row Level Security)는 읽기 전용 공개 데이터이므로 `SELECT`는 anon 허용, `INSERT/UPDATE/DELETE`는 관리자만 허용하는 정책으로 설계한다.

---

## 5. 구현 순서 (Phase) — 반드시 순서대로, 한 번에 하나씩

### Phase 0. 프로젝트 초기 설정
- 순수 HTML/CSS/JS 정적 사이트 골격 생성 (2.1의 폴더 구조를 기준으로 사용자와 확정)
- `1차_시안.zip`을 `reference/figma-1차시안/`에 압축 해제해서 배치 (실행/빌드 대상 아님, 참고 전용)
- 로컬 개발 서버는 빌드 도구 없이 간단한 정적 서버(`npx serve`, `python -m http.server`, VSCode Live Server 등)로 띄우는 방식으로 정한다
- `.env`는 브라우저에서 직접 읽을 수 없으므로, `js/config.js`(또는 별도 설정 파일)에 공개 가능한 키(Supabase anon key, 네이버 지도 client id)만 두고, **TourAPI 키처럼 민감한 키는 Supabase Edge Function 프록시로 감출지** 사용자와 결정한다
- GitHub 저장소/브랜치 전략(`main`/`develop`/`feature/*`) 정리, `.gitignore` 정리
- **질문할 것**: 공통 헤더/하단 탭바를 각 HTML 파일에 중복 작성할지, JS로 주입하는 방식(`nav.js`)을 쓸지

### Phase 1. 홈 화면 (`index.html`) 구현
- Figma `HomePage.tsx`를 참고해 마크업/스타일을 HTML+CSS로 새로 작성 (이 시점에는 아직 실 데이터 연동 전, 정적 mock 데이터를 JS 객체로 두고 렌더링)
- 카테고리 4종 클릭 시 `pages/category.html?id=...`로, 지역 카드 클릭 시 `pages/area-detail.html?id=...`로, 행사 배너 클릭 시 `pages/event-detail.html?id=...`로 이동 (쿼리스트링 기반 라우팅)
- **질문할 것**: 페이지 간 이동을 쿼리스트링(`?id=`) 방식으로 통일할지, 별도 방식을 쓸지

### Phase 2. Supabase 프로젝트 연동 & 스키마 생성
- Supabase 프로젝트 생성 (사용자가 직접 만들고 URL/키 전달, 또는 CLI 마이그레이션 스크립트만 작성)
- 4장의 스키마대로 마이그레이션 SQL 작성 (`supabase/migrations/`)
- 목 데이터를 실제 테이블에 넣을 수 있는 seed SQL 작성 (`supabase/seed.sql`)
- `js/supabaseClient.js`에서 CDN ESM으로 Supabase 클라이언트 초기화
- **질문할 것**: Supabase 프로젝트를 사용자가 먼저 만들지, 스키마/시드 스크립트만 준비해두고 사용자가 나중에 실행할지

### Phase 3. 카테고리 상세 + 스팟 상세 페이지 실데이터 연동
- `pages/category.html` + `js/pages/category.js`: Supabase `spots` 테이블 쿼리로 카테고리/지역 필터 구현
- `pages/spot-detail.html` + `js/pages/spot-detail.js`: `spots` 테이블 단건 조회
- 로딩/에러 상태는 순수 CSS/JS로 스켈레톤·에러 메시지 표시
- **질문할 것**: 이미지 호스팅을 Supabase Storage로 옮길지, 당분간 외부 URL(Unsplash 등)을 유지할지

### Phase 4. 지역(선호 지역) 상세 페이지 신규 설계·구현
- `pages/area-detail.html` + `js/pages/area-detail.js` 신규 작성 (Figma 시안에 없는 화면)
- PRD 8.2 요구사항 반영: 지역 소개, 대표 이미지, 소속 스팟 리스트, 카테고리 필터(관광지/맛집/숙박), 정렬(추천순/거리순)
- 홈 화면의 "인기 지역 카드" 클릭 시 이 페이지로 연결
- **질문할 것**: 다른 상세 페이지와 톤앤매너를 맞추기 위한 레이아웃 방향 확인

### Phase 5. 지도 페이지 (`pages/map.html`) 네이버 지도 SDK 연동
- 네이버 지도 JavaScript API `<script>` 로드, client id는 `js/config.js`로 관리
- `spots.lat/lng` 기반 실제 마커로 구현 (Figma 시안의 %좌표 가짜 핀은 참고만 함)
- 카테고리 필터, 클러스터링, 현재 위치(Geolocation API) 버튼, 하단 리스트/바텀시트를 순수 JS/CSS로 구현
- **질문할 것**: 데스크톱(사이드바+지도)과 모바일(바텀시트) 레이아웃을 반응형 CSS(미디어쿼리)로 어떻게 나눌지

### Phase 6. 행사·축제 페이지 + TourAPI 연동
- TourAPI `searchFestival1`(일문 우선, 누락 시 국문 보완)로 데이터 수집 → Supabase `festivals` 테이블에 적재하는 스크립트 작성 (Node.js 순수 스크립트 또는 Supabase Edge Function)
- `pages/events.html`, `pages/event-detail.html`을 `festivals` 테이블 조회로 구현
- 진행상태(진행중/예정/종료)는 `start_date`/`end_date` 기준으로 JS에서 계산
- **질문할 것**: TourAPI 배치 수집을 로컬 스크립트로 수동 실행할지, Supabase Edge Function으로 주기 실행(cron)할지

### Phase 7. 코스 페이지 실데이터/추천 로직
- `pages/courses.html`, `pages/course-detail.html`을 `courses` 테이블 연동으로 구현, 예산대/기간 필터를 쿼리스트링으로 연결
- 코스별 스팟 순서(schedule)를 지도(Phase 5 결과물)와 연계해 동선 시각화
- **질문할 것**: 코스 데이터를 처음에는 수동 큐레이션(직접 입력)으로 할지, TourAPI `areaBasedList1` 조합으로 자동 생성할지

### Phase 8. TourAPI 전체 데이터 파이프라인 고도화
- `areaCode1`/`categoryCode1`/`areaBasedList1`/`locationBasedList1`/`searchKeyword1`/`searchStay1`/`detailCommon1`/`detailIntro1`/`detailInfo1`/`detailImage1` 활용해 `spots`, `preferred_areas` 데이터 규모 확장
- 일문 서비스 커버리지가 부족한 항목은 국문 서비스로 보완 후 필요한 필드만 번역 가공
- **질문할 것**: 데이터 수집 범위(부산 전체 구/군 전부 vs 우선순위 지역부터)

### Phase 9. 비기능 요구사항 점검
- 성능(이미지 lazy loading, 3초 이내 초기 로딩), 반응형(모바일/태블릿/PC), Supabase RLS 정책 재검토, API 키 노출 여부 점검
- **질문할 것**: Lighthouse 등으로 실측할지, 코드 리뷰 수준으로 점검할지

### Phase 10. 배포
- Vercel/Netlify/GitHub Pages 중 선택 (모두 정적 파일 배포로 충분), 환경변수/공개 키 설정, 빌드 없이 바로 배포되는지 확인
- **질문할 것**: 배포 플랫폼 선택, 커스텀 도메인 여부

---

## 6. 코드 컨벤션 (바닐라 HTML/CSS/JS 기준)
- 모든 페이지는 `.html` 파일 단위로 분리하고, 공통 CSS는 `css/common.css`(색상/타이포/spacing을 CSS 커스텀 프로퍼티로 정의), 페이지별 CSS는 `css/pages/*.css`로 분리한다
- JavaScript는 ES Modules(`type="module"`)로 작성하고, 페이지별 로직은 `js/pages/*.js`, 데이터 호출은 `js/api/*.js`로 역할을 나눈다
- `position: absolute`는 정말 필요한 경우(뱃지, 오버레이 등)에만 사용하고 기본은 flexbox/grid 기반 반응형 레이아웃 사용
- DOM 업데이트는 직접 `innerHTML`/`textContent`/`createElement`로 처리하며, 반복되는 카드/리스트 렌더링은 템플릿 문자열 또는 `<template>` 태그를 활용한다
- 전역 상태가 필요하면 간단한 JS 객체(모듈 스코프 변수)로 관리하고, 상태 변경 후에는 명시적으로 렌더 함수를 다시 호출한다 (React의 자동 리렌더링 없음에 유의)
- 커밋은 Phase/Step 단위로 작게 나눠서 진행, 커밋 메시지에 어떤 Phase인지 명시 (예: `feat(phase3): 카테고리 페이지 Supabase 연동`)
- PR 단위로 리뷰 요청, 형상관리는 GitHub 브랜치 전략(`feature/develop/main`) 준수

---

## 7. 요약: 다음에 할 일

지금 이 문서를 읽었다면, **Phase 0**부터 시작한다. 코드를 작성하기 전에 먼저 사용자에게 Phase 0 진행 계획(폴더 구조, 공통 헤더/탭 처리 방식)을 간단히 요약해서 보여주고 승인을 받을 것. React/Tailwind 등 프레임워크 코드는 어떤 Phase에서도 작성하지 않는다.
