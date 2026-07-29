#!/usr/bin/env node
/**
 * 한국관광공사 TourAPI(searchFestival2)로 부산 지역 행사를 수집해
 * supabase/generated/festivals_from_tourapi.sql (upsert 문) 을 생성한다.
 *
 * 이 스크립트는 Supabase에 직접 쓰지 않는다 — anon key만 쓰는 프론트와 분리된
 * 관리자용 배치 도구이고, DB 쓰기는 항상 사람이 SQL Editor에서 검토 후
 * 실행하는 것이 이 프로젝트의 일관된 흐름이기 때문이다 (마이그레이션/시드와 동일).
 *
 * 사용법 (PowerShell):
 *   $env:TOUR_API_KEY="발급받은 일반 인증키(Decoding)"; node scripts/collect-festivals.mjs
 * 사용법 (bash):
 *   TOUR_API_KEY="..." node scripts/collect-festivals.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";

const TOUR_API_KEY = process.env.TOUR_API_KEY;
if (!TOUR_API_KEY) {
  console.error("환경변수 TOUR_API_KEY가 필요합니다.");
  console.error('예 (PowerShell): $env:TOUR_API_KEY="..."; node scripts/collect-festivals.mjs');
  process.exit(1);
}

const BUSAN_AREA_CODE = "6";
const MOBILE_APP = "BusanYaho";
const REQUEST_INTERVAL_MS = 150;

// TourAPI의 실제 등록 데이터는 지자체가 미리 입력해두는 방식이라, 이 스크립트를
// 실행하는 시점의 시스템 시계보다 데이터가 앞서 있을 수도, 뒤처져 있을 수도 있다.
// eventStartDate를 "오늘 - N일"처럼 시스템 시계 기준으로 계산하면 실제 등록된
// 데이터 구간을 벗어나 0건이 나올 수 있어, 넉넉한 고정 과거 시점을 기준으로
// "현재 등록된 전체 데이터"를 가져온 뒤 상태(status)는 실행 시점 기준으로 계산한다.
const EVENT_SEARCH_FROM = "20240101";

function toIsoDate(yyyymmdd) {
  if (!yyyymmdd || yyyymmdd.length !== 8) return null;
  return `${yyyymmdd.slice(0, 4)}-${yyyymmdd.slice(4, 6)}-${yyyymmdd.slice(6, 8)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function computeStatus(startDate, endDate, todayStr = new Date().toISOString().slice(0, 10)) {
  if (todayStr < startDate) return "upcoming";
  if (todayStr > endDate) return "ended";
  return "ongoing";
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

async function fetchFestivalList(service) {
  const eventStartDate = EVENT_SEARCH_FROM;
  const numOfRows = 100;
  const items = [];
  let pageNo = 1;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const body = await callTourApi(service, "searchFestival2", {
      areaCode: BUSAN_AREA_CODE,
      eventStartDate,
      numOfRows,
      pageNo,
    });
    const pageItems = body.items?.item ?? [];
    items.push(...pageItems);
    await sleep(REQUEST_INTERVAL_MS);

    const totalCount = Number(body.totalCount ?? 0);
    if (items.length >= totalCount || pageItems.length === 0 || pageNo > 20) break;
    pageNo += 1;
  }
  return items;
}

async function fetchOverview(service, contentId) {
  const body = await callTourApi(service, "detailCommon2", { contentId });
  return body.items?.item?.[0]?.overview ?? null;
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlArray(values) {
  if (!values?.length) return "'{}'";
  return `ARRAY[${values.map(sqlString).join(", ")}]`;
}

async function main() {
  console.log("日本語(JpnService2) 행사 목록 조회 중...");
  const jpnItems = await fetchFestivalList("JpnService2");
  console.log(`  ${jpnItems.length}건`);

  console.log("국문(KorService2) 행사 목록 조회 중...");
  const korItems = await fetchFestivalList("KorService2");
  console.log(`  ${korItems.length}건`);

  const korByContentId = new Map(korItems.map((item) => [item.contentid, item]));
  const jpnContentIds = new Set(jpnItems.map((item) => item.contentid));

  const merged = [
    ...jpnItems.map((jpn) => ({ jpn, kor: korByContentId.get(jpn.contentid) ?? null })),
    ...korItems.filter((kor) => !jpnContentIds.has(kor.contentid)).map((kor) => ({ jpn: null, kor })),
  ];
  const koreanOnlyCount = merged.filter((e) => !e.jpn).length;
  console.log(
    `병합 결과: 총 ${merged.length}건 (일문 ${jpnItems.length}건 + 일문 미수록이라 국문으로 보완한 ${koreanOnlyCount}건)`
  );

  console.log("행사별 개요(overview) 조회 중...");
  const rows = [];
  for (const entry of merged) {
    const primary = entry.jpn ?? entry.kor;
    const service = entry.jpn ? "JpnService2" : "KorService2";

    const startDate = toIsoDate(primary.eventstartdate);
    const endDate = toIsoDate(primary.eventenddate) ?? startDate;
    if (!startDate) {
      console.warn(`  건너뜀 (시작일 없음, contentid=${primary.contentid})`);
      continue;
    }

    let overview = null;
    try {
      overview = await fetchOverview(service, primary.contentid);
    } catch (e) {
      console.warn(`  개요 조회 실패 (contentid=${primary.contentid}): ${e.message}`);
    }
    await sleep(REQUEST_INTERVAL_MS);

    rows.push({
      id: `tour-${primary.contentid}`,
      title_ja: primary.title,
      title_sub_ko: entry.kor?.title && entry.kor.title !== primary.title ? entry.kor.title : null,
      description_ja: overview ? overview.replace(/\s+/g, " ").trim() : null,
      area: [primary.addr1, primary.addr2].filter(Boolean).join(" ") || null,
      start_date: startDate,
      end_date: endDate,
      status: computeStatus(startDate, endDate),
      image_url: primary.firstimage || primary.firstimage2 || null,
      tags: [],
      isKoreanOnly: !entry.jpn,
    });
  }

  const valuesSql = rows
    .map((r) => {
      // 줄 끝(--) 주석 뒤에 다음 tuple을 잇는 쉼표를 붙이면 그 쉼표까지 주석 처리되어
      // 구문 오류가 나므로, 주석은 반드시 tuple보다 "앞" 줄에 둔다.
      const commentLine = r.isKoreanOnly ? "  -- 일문 데이터 없음: 제목/설명이 국문입니다. 번역 필요\n" : "";
      return `${commentLine}(
    ${sqlString(r.id)}, ${sqlString(r.title_ja)}, ${sqlString(r.title_sub_ko)},
    ${sqlString(r.description_ja)}, ${sqlString(r.area)},
    ${sqlString(r.start_date)}, ${sqlString(r.end_date)}, ${sqlString(r.status)},
    ${sqlString(r.image_url)}, null, ${sqlArray(r.tags)}
  )`;
    })
    .join(",\n");

  const sql = `-- TourAPI searchFestival2 수집 결과 (생성 시각: ${new Date().toISOString()})
-- 총 ${rows.length}건 — 일문 우선, 일문 미수록 ${rows.filter((r) => r.isKoreanOnly).length}건은 국문 제목/설명으로 보완 (번역 필요, "-- 일문 데이터 없음" 주석 참고)
-- 이 파일은 scripts/collect-festivals.mjs가 생성했다. 검토 후 Supabase SQL Editor에서 직접 실행할 것.
-- spot_id는 자동 연결하지 않았다 (주소 기반 매칭이 부정확할 수 있어 수동 확인 필요).

insert into festivals
  (id, title_ja, title_sub_ko, description_ja, area, start_date, end_date, status, image_url, spot_id, tags)
values
${valuesSql}
on conflict (id) do update set
  title_ja = excluded.title_ja,
  title_sub_ko = excluded.title_sub_ko,
  description_ja = excluded.description_ja,
  area = excluded.area,
  start_date = excluded.start_date,
  end_date = excluded.end_date,
  status = excluded.status,
  image_url = excluded.image_url,
  tags = excluded.tags;
`;

  await mkdir("supabase/generated", { recursive: true });
  const outPath = "supabase/generated/festivals_from_tourapi.sql";
  await writeFile(outPath, sql, "utf-8");
  console.log(`\n완료: ${outPath} (${rows.length}건)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
