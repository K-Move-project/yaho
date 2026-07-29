# 부산 야-호- (釜山 やっほー)

일본인 관광객을 대상으로, 일본어로 부산 여행 정보를 제공하는 모바일 퍼스트 정적 웹 서비스입니다.
팀: 1조 링고바코 · 기획/요구사항은 [docs/PRD.md](docs/PRD.md), 개발 작업 규칙은 [docs/CLAUDE.md](docs/CLAUDE.md) 참고.

## 기술 스택

- **Frontend**: 순수 HTML5 + CSS3 + JavaScript (ES2020+, Vanilla, 프레임워크/번들러 없음)
- **지도**: 네이버 지도 JavaScript API
- **관광 데이터**: 한국관광공사 TourAPI (`KorService2`/`JpnService2`, 일문 우선 + 국문 보완)
- **DB/BaaS**: Supabase (PostgreSQL, `@supabase/supabase-js` CDN ESM)
- **배포**: 정적 호스팅 예정 (Vercel/Netlify/GitHub Pages), 백엔드 서버 없음

## 로컬 실행

빌드 도구 없이 정적 파일을 그대로 서빙하면 됩니다.

```bash
python -m http.server 8791
# 또는
npx serve
```

`http://localhost:8791` 접속. Naver Maps 서비스 URL에 로컬 주소를 등록해야 지도가 뜹니다.

## 환경 설정 (`js/config.js`)

브라우저에 노출돼도 되는(RLS로 보호되는) 공개 키만 둡니다.

```js
export const CONFIG = {
  SUPABASE_URL: "...",
  SUPABASE_ANON_KEY: "...",       // Supabase anon/publishable key
  NAVER_MAP_CLIENT_ID: "...",     // NCP Maps Client ID (ncpKeyId)
};
```

TourAPI 인증키는 프론트에 두지 않고, `scripts/` 아래 배치 수집 스크립트를 로컬에서 실행할 때만 환경변수로 넘깁니다.

```bash
# PowerShell
$env:TOUR_API_KEY="..."; node scripts/collect-spots.mjs

# bash
TOUR_API_KEY="..." node scripts/collect-spots.mjs
```

## 폴더 구조

```
/
├── index.html                 홈
├── pages/                     카테고리/스팟상세/지역상세/지도/행사/코스 등 8개 페이지
├── css/
│   ├── common.css             공통 변수·헤더·탭바·상태 UI
│   └── pages/*.css            페이지별 스타일
├── js/
│   ├── config.js               공개 키 (Supabase URL/anon key, Naver Client ID)
│   ├── supabaseClient.js       Supabase 클라이언트 초기화
│   ├── nav.js                  공통 헤더/탭바 주입
│   ├── constants/               카테고리 메타, 부산 16개 구/군 목록
│   ├── components/              페이지 간 공용 마크업 (스팟 카드 등)
│   ├── api/                     Supabase 쿼리 함수 (spots/areas/courses/festivals)
│   ├── utils/                   행사 진행상태 계산 등
│   └── pages/*.js               페이지별 렌더 로직
├── scripts/                    TourAPI 배치 수집 스크립트 (Node, 관리자용)
├── supabase/
│   ├── migrations/              스키마 변경 이력 (순서대로 실행)
│   ├── seed.sql                 신규 설치용 목 데이터
│   └── generated/                수집 스크립트 산출물 (git 제외, 검토 후 수동 실행)
└── docs/                       PRD, 작업 지침
```

## 진행 상황 (Phase 0~8, `docs/CLAUDE.md` 기준)

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 정적 사이트 골격, 공통 헤더/탭바(`nav.js`) | ✅ |
| 1 | 홈 화면 (히어로/카테고리/인기 지역/행사·코스 미리보기) | ✅ |
| 2 | Supabase 스키마 설계 및 마이그레이션, mock 시드 | ✅ |
| 3 | 카테고리 목록 + 스팟 상세, Supabase 실데이터 연동 | ✅ |
| 4 | 지역(선호 지역) 상세 페이지 신규 설계 | ✅ |
| 5 | 지도 페이지, 네이버 지도 SDK 연동, 마커 클러스터링 | ✅ |
| 6 | 행사·축제 페이지 + TourAPI `searchFestival2` 수집 | ✅ |
| 7 | 코스 페이지 실데이터 연동 + 지도 동선 시각화 | ✅ |
| 8 | TourAPI 전체 파이프라인 고도화 (부산 전역 스팟 수집) | ✅ |
| 9 | 비기능 요구사항 점검 (성능/반응형/RLS) | ⏳ 예정 |
| 10 | 배포 | ⏳ 예정 |

### 데이터 현황

- `spots`: 693건 (수동 큐레이션 12건 + TourAPI 수집 681건, 부산 16개 구/군 전역, 사진 없는 항목은 제외)
- `preferred_areas`: 4건 (감천문화촌/해운대/영도/광안리)
- `courses`: 3건 (실사진·평점·태그·일정 좌표 포함)
- `festivals`: 36건 (수동 큐레이션 3건 + TourAPI `searchFestival2` 수집 33건)

### 데이터 수집 스크립트

- `scripts/collect-festivals.mjs` — TourAPI `searchFestival2`(일문 우선 + 국문 보완)로 부산 행사 수집
- `scripts/collect-spots.mjs` — TourAPI `areaBasedList2`로 부산 전역 관광지/맛집/숙박/체험 스팟 수집, `areaCode2` 기준 구/군 코드로 지역명 정규화

두 스크립트 모두 Supabase에 직접 쓰지 않고 `supabase/generated/*.sql`(upsert문)을 생성합니다 — anon key만 쓰는 프론트와 분리된 관리자 도구이며, 실제 반영은 사람이 검토 후 Supabase SQL Editor에서 직접 실행합니다.

### 진행 중

Figma 3차 시안 참고, 카테고리/코스/지도/행사 페이지 UI 디테일 개편 작업 중 (지역 필터 16개 구/군 고정 목록화, 코스 카드 실사진/평점/동선 미리보기, 지도 마커·리스트 카테고리 아이콘화 완료 / 행사·상세 페이지 폴리싱 진행 중).

## 형상 관리

- 브랜치: `main`(배포 기준) / `develop`(개발) — Phase/기능 단위로 작은 커밋
- 커밋 메시지 컨벤션: `feat(phaseN): ...`, `fix(스코프): ...`
