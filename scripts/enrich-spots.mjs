#!/usr/bin/env node
/**
 * 이미 DB에 있는 스팟(주로 collect-spots.mjs로 수집한 tour-* 681건)에 대해
 * TourAPI detailCommon2/detailIntro2를 항목별로 호출해 "가게 정보"
 * (description_ja/access_ja/hours_ja/admission)를 채운
 * supabase/generated/spots_enrich.sql (update문) 을 생성한다.
 *
 * collect-spots.mjs가 의도적으로 건너뛴 부분을 보강하는 스크립트로,
 * 호출량이 많아(스팟당 최대 2회 x 2단계 = 최대 4회) 시간이 오래 걸릴 수 있다.
 *
 * DB에 직접 쓰지 않는다 — 생성된 SQL은 사람이 검토 후 Supabase SQL Editor에서
 * 직접 실행한다 (이 프로젝트의 일관된 흐름).
 *
 * 중단되어도 재실행하면 이미 생성된 supabase/generated/spots_enrich.sql에
 * 있는 id는 건너뛰고 이어서 진행한다.
 *
 * 사용법 (PowerShell):
 *   $env:TOUR_API_KEY="..."; node scripts/enrich-spots.mjs
 * 사용법 (bash):
 *   TOUR_API_KEY="..." node scripts/enrich-spots.mjs
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";

const TOUR_API_KEY = process.env.TOUR_API_KEY;
if (!TOUR_API_KEY) {
  console.error("환경변수 TOUR_API_KEY가 필요합니다.");
  console.error('예 (PowerShell): $env:TOUR_API_KEY="..."; node scripts/enrich-spots.mjs');
  process.exit(1);
}

const SUPABASE_URL = "https://jryzwztppwbixqohitvg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_t7UiFnWifLq5g0FZgEJXWA_PD5oiwBn";
const MOBILE_APP = "BusanYaho";
const REQUEST_INTERVAL_MS = 150;
const OUT_PATH = "supabase/generated/spots_enrich.sql";
const CHECKPOINT_EVERY = 15;

// contentTypeId(jpn/kor 공용, detailCommon2 응답의 contenttypeid를 그대로 사용) 별로
// detailIntro2에서 영업시간/입장료에 해당하는 필드명이 다르다.
const INTRO_FIELD_MAP = {
  12: { hours: ["usetime"], admission: ["usefee"] },
  76: { hours: ["usetime"], admission: ["usefee"] },
  14: { hours: ["usetimeculture"], admission: ["usefee"] },
  78: { hours: ["usetimeculture"], admission: ["usefee"] },
  28: { hours: ["usetimeleports"], admission: ["usefeeleports"] },
  75: { hours: ["usetimeleports"], admission: ["usefeeleports"] },
  38: { hours: ["opentime"], admission: [] },
  79: { hours: ["opentime"], admission: [] },
  32: { hours: ["checkintime", "checkouttime"], admission: [] },
  80: { hours: ["checkintime", "checkouttime"], admission: [] },
  39: { hours: ["opentimefood"], admission: [] },
  82: { hours: ["opentimefood"], admission: [] },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanText(value) {
  if (!value) return null;
  const cleaned = String(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&middot;/g, "・")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned || null;
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
    return null;
  }
  return json.response.body;
}

async function fetchCommon(service, contentId) {
  const body = await callTourApi(service, "detailCommon2", { contentId });
  return body?.items?.item?.[0] ?? null;
}

async function fetchIntro(service, contentId, contentTypeId) {
  const body = await callTourApi(service, "detailIntro2", { contentId, contentTypeId });
  return body?.items?.item?.[0] ?? null;
}

async function fetchAllSpotIds() {
  const url = new URL(`${SUPABASE_URL}/rest/v1/spots`);
  url.searchParams.set("select", "id");
  url.searchParams.set("id", "like.tour-*");
  url.searchParams.set("order", "id");
  url.searchParams.set("limit", "2000");
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase REST 오류: ${res.status} ${await res.text()}`);
  const rows = await res.json();
  return rows.map((r) => r.id);
}

function sqlString(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function parseAlreadyDone(existingSql) {
  const ids = new Set();
  const re = /where id = '([^']+)'/g;
  let m;
  while ((m = re.exec(existingSql))) ids.add(m[1]);
  return ids;
}

async function main() {
  await mkdir("supabase/generated", { recursive: true });

  let existingSql = "";
  try {
    existingSql = await readFile(OUT_PATH, "utf-8");
  } catch {
    // 첫 실행이면 파일이 없는 게 정상
  }
  const done = parseAlreadyDone(existingSql);
  const doneRows = [];
  if (done.size) {
    const blocks = existingSql.split(/\n\n(?=update spots set)/);
    for (const block of blocks) {
      const idMatch = block.match(/where id = '([^']+)'/);
      if (!idMatch) continue;
      doneRows.push({ id: idMatch[1], _raw: block.trim() });
    }
  }

  console.log("spots 테이블에서 tour-* id 목록 조회 중...");
  const allIds = await fetchAllSpotIds();
  const todoIds = allIds.filter((id) => !done.has(id));
  console.log(`전체 ${allIds.length}건 중 이미 처리된 ${done.size}건 제외, 이번에 ${todoIds.length}건 처리`);

  const newRows = [];
  let processed = 0;

  for (const id of todoIds) {
    const contentId = id.replace(/^tour-/, "");

    let service = "JpnService2";
    let common = await fetchCommon(service, contentId);
    await sleep(REQUEST_INTERVAL_MS);
    if (!common) {
      service = "KorService2";
      common = await fetchCommon(service, contentId);
      await sleep(REQUEST_INTERVAL_MS);
    }

    if (!common) {
      console.warn(`  건너뜀 (detailCommon2 실패): ${id}`);
    } else {
      const contentTypeId = common.contenttypeid;
      const fieldMap = INTRO_FIELD_MAP[Number(contentTypeId)] ?? null;

      let hours_ja = null;
      let admission = null;
      if (fieldMap) {
        const intro = await fetchIntro(service, contentId, contentTypeId);
        await sleep(REQUEST_INTERVAL_MS);
        if (intro) {
          const hoursParts = fieldMap.hours.map((f) => cleanText(intro[f])).filter(Boolean);
          if (hoursParts.length === 2 && fieldMap.hours[0] === "checkintime") {
            hours_ja = `チェックイン ${hoursParts[0]} / チェックアウト ${hoursParts[1]}`;
          } else if (hoursParts.length) {
            hours_ja = hoursParts.join(" / ");
          }
          const admissionParts = fieldMap.admission.map((f) => cleanText(intro[f])).filter(Boolean);
          if (admissionParts.length) admission = admissionParts.join(" / ");
        }
      }

      newRows.push({
        id,
        description_ja: cleanText(common.overview),
        access_ja: cleanText([common.addr1, common.addr2].filter(Boolean).join(" ")),
        hours_ja,
        admission,
      });
    }

    processed += 1;
    if (processed % CHECKPOINT_EVERY === 0 || processed === todoIds.length) {
      console.log(`  진행: ${processed}/${todoIds.length}`);
      await writeFile(OUT_PATH, buildFullSql(doneRows, newRows), "utf-8");
    }
  }

  console.log(`\n완료: ${OUT_PATH} (누적 ${doneRows.length + newRows.length}건, 이번 실행 ${newRows.length}건)`);
}

function buildFullSql(doneRows, newRows) {
  const doneStatements = doneRows.map((r) => r._raw);
  const newStatements = newRows.map(
    (r) => `update spots set
  description_ja = ${sqlString(r.description_ja)},
  access_ja = ${sqlString(r.access_ja)},
  hours_ja = ${sqlString(r.hours_ja)},
  admission = ${sqlString(r.admission)}
where id = ${sqlString(r.id)};`
  );
  const all = [...doneStatements, ...newStatements];
  return `-- TourAPI detailCommon2/detailIntro2 보강 결과 (마지막 갱신: ${new Date().toISOString()})
-- 총 ${all.length}건. 이 파일은 scripts/enrich-spots.mjs가 생성했다.
-- 검토 후 Supabase SQL Editor에서 직접 실행할 것.
-- 국문 전용으로 수집된 스팟은 description_ja/access_ja/hours_ja도 국문 원문이 들어간다
-- (번역은 별도 작업 필요, spots.name_ja 번역 작업과 함께 처리 권장).

${all.join("\n\n")}
`;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
