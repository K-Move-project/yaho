#!/usr/bin/env node
/**
 * 한국관광공사 TourAPI(areaBasedList2)로 부산 전체 관광지/맛집/숙박/체험 스팟을
 * 수집해 supabase/generated/spots_from_tourapi.sql (upsert문) 을 생성한다.
 *
 * Phase 6의 collect-festivals.mjs와 동일한 설계:
 *  - anon key만 쓰는 프론트와 분리된 관리자 도구, DB에 직접 쓰지 않음
 *  - 일문(JpnService2) 우선, 일문 미수록분은 국문(KorService2)으로 보완
 *  - 생성된 SQL은 사람이 검토 후 Supabase SQL Editor에서 직접 실행
 *
 * 부산 전체 규모(약 700건)라 detailCommon2로 항목별 설명까지 받아오면 API
 * 호출이 너무 많아지므로, 이번 수집은 목록 정보(이름/좌표/주소/이미지/카테고리)
 * 위주로만 수집한다. 설명/영업시간/입장료는 비워두고 필요할 때 개별 보강한다.
 *
 * 사용법 (PowerShell):
 *   $env:TOUR_API_KEY="..."; node scripts/collect-spots.mjs
 * 사용법 (bash):
 *   TOUR_API_KEY="..." node scripts/collect-spots.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";

const TOUR_API_KEY = process.env.TOUR_API_KEY;
if (!TOUR_API_KEY) {
  console.error("환경변수 TOUR_API_KEY가 필요합니다.");
  console.error('예 (PowerShell): $env:TOUR_API_KEY="..."; node scripts/collect-spots.mjs');
  process.exit(1);
}

const BUSAN_AREA_CODE = "6";
const MOBILE_APP = "BusanYaho";
const REQUEST_INTERVAL_MS = 150;

// contentTypeId → 우리 스키마 category. 일문/국문 서비스가 서로 다른 번호 체계를 쓴다.
// (TourAPI 실제 응답으로 직접 확인한 값: 76=観光地, 78=文化施設, 75=レジャースポーツ,
//  79=ショッピング, 80=宿泊, 82=飲食店 / 국문 12=관광지, 14=문화시설, 28=레포츠,
//  38=쇼핑, 32=숙박, 39=음식점. 15=축제는 Phase 6에서 이미 별도 수집했으므로 제외)
const JPN_TYPE_TO_CATEGORY = { 76: "tourist", 78: "tourist", 75: "experience", 79: "experience", 80: "stay", 82: "food" };
const KOR_TYPE_TO_CATEGORY = { 12: "tourist", 14: "tourist", 28: "experience", 38: "experience", 32: "stay", 39: "food" };

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callTourApi(service, endpoint, params) {
  const url = new URL(`https://apis.data.go.kr/B551011/${service}/${endpoint}`);
  url.searchParams.set("serviceKey", TOUR_API_KEY);
  url.searchParams.set("MobileOS", "ETC");
  url.searchParams.set("MobileApp", MOBILE_APP);
  url.searchParams.set("_type", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url);
  const json = await res.json();
  const header = json.response?.header;
  if (!header || header.resultCode !== "0000") {
    throw new Error(`TourAPI error (${service}/${endpoint}): ${header?.resultMsg ?? JSON.stringify(json).slice(0, 300)}`);
  }
  return json.response.body;
}

async function fetchAllByContentType(service, contentTypeId) {
  const numOfRows = 100;
  const items = [];
  let pageNo = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const body = await callTourApi(service, "areaBasedList2", {
      areaCode: BUSAN_AREA_CODE,
      contentTypeId,
      numOfRows,
      pageNo,
      arrange: "A",
    });
    const pageItems = body.items?.item ?? [];
    items.push(...pageItems);
    await sleep(REQUEST_INTERVAL_MS);

    const totalCount = Number(body.totalCount ?? 0);
    if (items.length >= totalCount || pageItems.length === 0 || pageNo > 10) break;
    pageNo += 1;
  }
  return items;
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlArray(values) {
  if (!values?.length) return "'{}'";
  return `ARRAY[${values.map(sqlString).join(", ")}]`;
}

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) && v !== "" ? n : null;
}

// area는 부산 16개 구/군의 정식 한자 표기로 통일한다. addr1을 정규식으로
// 파싱하면(구 버전) 일문 서비스가 지명을 가타카나 음역으로 주는 경우(例: ヘウンデ区)
// 국문 큐레이션 스팟의 한자 표기(海雲台区)와 어긋난다. TourAPI areaCode2로 조회한
// sigungucode(구/군 코드, 언어와 무관하게 동일)를 그대로 기준으로 삼는다.
const SIGUNGU_TO_DISTRICT_JA = {
  1: "江西区",
  2: "金井区",
  3: "機張郡",
  4: "南区",
  5: "東区",
  6: "東莱区",
  7: "釜山鎮区",
  8: "北区",
  9: "沙上区",
  10: "沙下区",
  11: "西区",
  12: "水営区",
  13: "蓮堤区",
  14: "影島区",
  15: "中区",
  16: "海雲台区",
};

function sigunguToDistrict(sigungucode) {
  return SIGUNGU_TO_DISTRICT_JA[Number(sigungucode)] ?? null;
}

async function main() {
  console.log("日本語(JpnService2) 목록 수집 중...");
  const jpnByContentId = new Map();
  for (const [typeId, category] of Object.entries(JPN_TYPE_TO_CATEGORY)) {
    const items = await fetchAllByContentType("JpnService2", typeId);
    console.log(`  contentTypeId=${typeId}(${category}): ${items.length}건`);
    items.forEach((item) => jpnByContentId.set(item.contentid, { item, category }));
  }

  console.log("국문(KorService2) 목록 수집 중...");
  const korByContentId = new Map();
  for (const [typeId, category] of Object.entries(KOR_TYPE_TO_CATEGORY)) {
    const items = await fetchAllByContentType("KorService2", typeId);
    console.log(`  contentTypeId=${typeId}(${category}): ${items.length}건`);
    items.forEach((item) => korByContentId.set(item.contentid, { item, category }));
  }

  const merged = [];
  for (const [contentId, { item, category }] of jpnByContentId) {
    merged.push({ contentId, category, jpn: item, kor: korByContentId.get(contentId)?.item ?? null });
  }
  for (const [contentId, { item, category }] of korByContentId) {
    if (!jpnByContentId.has(contentId)) {
      merged.push({ contentId, category, jpn: null, kor: item });
    }
  }
  const koreanOnlyCount = merged.filter((e) => !e.jpn).length;
  console.log(
    `\n병합 결과: 총 ${merged.length}건 (일문 ${jpnByContentId.size}건 + 일문 미수록이라 국문으로 보완한 ${koreanOnlyCount}건)`
  );

  const rows = merged
    .map(({ contentId, category, jpn, kor }) => {
      const primary = jpn ?? kor;
      const lat = toNumberOrNull(primary.mapy);
      const lng = toNumberOrNull(primary.mapx);
      if (!lat || !lng) return null; // 좌표 없는 항목은 지도에 못 띄우므로 제외

      const image_url = primary.firstimage || primary.firstimage2 || null;
      if (!image_url) return null; // 사진 없는 항목은 추천 목록에서 볼거리가 없으므로 제외

      return {
        id: `tour-${contentId}`,
        name_ko: kor?.title && kor.title !== primary.title ? kor.title : null,
        name_ja: primary.title,
        category,
        lat,
        lng,
        area: sigunguToDistrict(primary.sigungucode),
        image_url,
        isKoreanOnly: !jpn,
      };
    })
    .filter(Boolean);

  console.log(`좌표 없는 항목 제외 후 최종: ${rows.length}건`);

  const valuesSql = rows
    .map((r) => {
      const commentLine = r.isKoreanOnly ? "  -- 일문 데이터 없음: 이름이 국문입니다. 번역 필요\n" : "";
      return `${commentLine}(
    ${sqlString(r.id)}, ${sqlString(r.name_ko)}, ${sqlString(r.name_ja)}, ${sqlString(r.category)},
    ${r.lat}, ${r.lng}, ${sqlString(r.area)},
    null, ${sqlArray([])},
    ${sqlString(r.image_url)}, null, null, null, null
  )`;
    })
    .join(",\n");

  const sql = `-- TourAPI areaBasedList2 수집 결과 (생성 시각: ${new Date().toISOString()})
-- 총 ${rows.length}건 — 일문 우선, 일문 미수록 ${rows.filter((r) => r.isKoreanOnly).length}건은 국문 이름으로 보완 (번역 필요, "-- 일문 데이터 없음" 주석 참고)
-- 이 파일은 scripts/collect-spots.mjs가 생성했다. 검토 후 Supabase SQL Editor에서 직접 실행할 것.
-- 목록 정보만 수집했으므로 description_ja/admission/access_ja/hours_ja/rating/tags는
-- 비어 있다. 필요한 스팟만 나중에 detailCommon2/detailIntro2로 개별 보강 권장.

insert into spots
  (id, name_ko, name_ja, category, lat, lng, area, description_ja, tags, image_url, rating, admission, access_ja, hours_ja)
values
${valuesSql}
on conflict (id) do update set
  name_ko = excluded.name_ko,
  name_ja = excluded.name_ja,
  category = excluded.category,
  lat = excluded.lat,
  lng = excluded.lng,
  area = excluded.area,
  image_url = excluded.image_url;
`;

  await mkdir("supabase/generated", { recursive: true });
  const outPath = "supabase/generated/spots_from_tourapi.sql";
  await writeFile(outPath, sql, "utf-8");
  console.log(`\n완료: ${outPath} (${rows.length}건)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
