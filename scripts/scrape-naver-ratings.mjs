#!/usr/bin/env node
/**
 * 네이버는 평점/리뷰수를 제공하는 공식 개발자 API가 없다. search.naver.com 검색
 * 결과 페이지에는 서버 렌더링된 Apollo 캐시 JSON에 방문자 리뷰 평점/리뷰수가
 * 그대로 들어있어서(비공식), 이를 파싱해 spots.rating/review_count를 채운다.
 *
 * 주의: 이건 네이버 서비스 약관상 회색지대인 비공식 스크래핑이다.
 * - 요청 사이 충분한 간격을 둔다 (기본 3~5초, 지터 포함).
 * - "과도한 접근 요청으로 서비스 이용이 제한되었습니다" 같은 차단 신호가 오면
 *   즉시 전체 실행을 중단한다 (더 세게 재시도하지 않는다).
 * - 학습/프로토타입 용도로만 사용할 것. 프로덕션에서 안정적으로 쓰려면
 *   Google Places API 같은 공식 API로 교체하는 걸 권장한다.
 *
 * name_ko가 있는 스팟만 대상으로 한다 (네이버는 한국어 서비스라 국문 이름이
 * 있어야 검색 매칭 정확도가 나온다). 검색 결과 중 이름이 일치하고 좌표가
 * 가까운(3km 이내) 후보만 채택해 오매칭을 줄인다.
 *
 * DB에 직접 쓰지 않는다. supabase/generated/spots_ratings.sql (update문)을
 * 생성하고, 사람이 검토 후 Supabase SQL Editor에서 직접 실행한다.
 *
 * 중단되어도 재실행하면 이미 처리된 id는 건너뛰고 이어서 진행한다.
 *
 * 사용법: node scripts/scrape-naver-ratings.mjs
 */

import { writeFile, readFile, mkdir } from "node:fs/promises";

const SUPABASE_URL = "https://jryzwztppwbixqohitvg.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_t7UiFnWifLq5g0FZgEJXWA_PD5oiwBn";
const OUT_PATH = "supabase/generated/spots_ratings.sql";
const CHECKPOINT_EVERY = 10;
const REQUEST_INTERVAL_MS = 3000;
const JITTER_MS = 1500;
const MAX_MATCH_DISTANCE_KM = 3;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function jitteredDelay() {
  return REQUEST_INTERVAL_MS + Math.floor(Math.random() * JITTER_MS);
}

/** "1,234" 같은 콤마 구분 숫자 문자열을 안전하게 숫자로 바꾼다. */
function toNumber(str) {
  if (!str) return null;
  const n = Number(str.replaceAll(",", ""));
  return Number.isFinite(n) ? n : null;
}

function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeName(name) {
  return name
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, "")
    .trim();
}

async function fetchAllSpots() {
  const url = new URL(`${SUPABASE_URL}/rest/v1/spots`);
  url.searchParams.set("select", "id,name_ko,name_ja,lat,lng");
  url.searchParams.set("name_ko", "not.is.null");
  url.searchParams.set("order", "id");
  url.searchParams.set("limit", "2000");
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
  });
  if (!res.ok) throw new Error(`Supabase REST 오류: ${res.status} ${await res.text()}`);
  return res.json();
}

/**
 * search.naver.com 검색 결과 HTML에서 후보들을 뽑아낸다. 검색어가 모호하면(예:
 * 카페/식당 이름) 목록형 "PlaceListBusinessesItem"이, 검색어가 특정 장소를
 * 명확히 가리키면(예: 랜드마크) 단일 상세형 "PlaceDetailBase"가 온다. 둘 다
 * 파싱해서 합친다. 필드명도 서로 다르다
 * (visitorReviewScore/Count vs visitorReviewsScore/Total).
 */
function extractCandidates(html) {
  const candidates = [];

  const listChunks = html.split('"PlaceListBusinessesItem:').slice(1);
  for (const chunk of listChunks) {
    const window = chunk.slice(0, 3000);
    const nameMatch = window.match(/"normalizedName":"([^"]*)"/);
    const xMatch = window.match(/"x":"([^"]*)"/);
    const yMatch = window.match(/"y":"([^"]*)"/);
    const scoreMatch = window.match(/"visitorReviewScore":"([^"]*)"/);
    const countMatch = window.match(/"visitorReviewCount":"([^"]*)"/);
    if (!nameMatch || !xMatch || !yMatch) continue;
    candidates.push({
      name: nameMatch[1],
      lng: Number(xMatch[1]),
      lat: Number(yMatch[1]),
      rating: toNumber(scoreMatch?.[1]),
      reviewCount: toNumber(countMatch?.[1]),
    });
  }

  const detailChunks = html.split('"PlaceDetailBase:').slice(1);
  for (const chunk of detailChunks) {
    const window = chunk.slice(0, 3000);
    const nameMatch = window.match(/"name":"([^"]*)"/);
    const xMatch = window.match(/"coordinate":\{"__typename":"Coordinate","x":"([^"]*)"/);
    const yMatch = window.match(/"y":"([^"]*)"/);
    const scoreMatch = window.match(/"visitorReviewsScore":"?([\d.]*)"?/);
    const countMatch = window.match(/"visitorReviewsTotal":(\d+)/);
    if (!nameMatch || !xMatch || !yMatch) continue;
    candidates.push({
      name: nameMatch[1],
      lng: Number(xMatch[1]),
      lat: Number(yMatch[1]),
      rating: toNumber(scoreMatch?.[1]),
      reviewCount: toNumber(countMatch?.[1]),
    });
  }

  return candidates;
}

async function searchNaver(query) {
  const url = new URL("https://search.naver.com/search.naver");
  url.searchParams.set("query", query);
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  const text = await res.text();
  if (res.status === 429 || text.includes("서비스 이용이 제한되었습니다") || text.includes("과도한 접근")) {
    throw new Error("BLOCKED");
  }
  return text;
}

function pickBestMatch(candidates, spot) {
  const targetName = normalizeName(spot.name_ko);
  let best = null;
  for (const c of candidates) {
    const candName = normalizeName(c.name);
    if (!candName.includes(targetName) && !targetName.includes(candName)) continue;
    if (spot.lat == null || spot.lng == null) continue;
    const dist = distanceKm(spot.lat, spot.lng, c.lat, c.lng);
    if (dist > MAX_MATCH_DISTANCE_KM) continue;
    if (!best || dist < best.dist) best = { ...c, dist };
  }
  return best;
}

function sqlString(value) {
  if (value === null || value === undefined) return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function buildFullSql(doneRows, newRows) {
  const doneStatements = doneRows.map((r) => r._raw);
  const newStatements = newRows.map(
    (r) => `update spots set rating = ${r.rating ?? "null"}, review_count = ${r.reviewCount ?? "null"} where id = ${sqlString(r.id)};`
  );
  const all = [...doneStatements, ...newStatements];
  return `-- 네이버 검색 결과 비공식 파싱으로 채운 평점/리뷰수 (마지막 갱신: ${new Date().toISOString()})
-- 총 ${all.length}건. scripts/scrape-naver-ratings.mjs가 생성했다.
-- 비공식 스크래핑 결과이니 검토 후 Supabase SQL Editor에서 직접 실행할 것.
-- 매칭 안 된 스팟(이름/좌표가 애매해 후보를 못 찾은 경우)은 이 파일에 없다.

${all.join("\n")}
`;
}

async function main() {
  await mkdir("supabase/generated", { recursive: true });

  let existingSql = "";
  try {
    existingSql = await readFile(OUT_PATH, "utf-8");
  } catch {
    // 첫 실행
  }
  const done = new Set([...existingSql.matchAll(/where id = '([^']+)'/g)].map((m) => m[1]));
  const doneRows = done.size
    ? existingSql
        .split("\n")
        .filter((line) => line.startsWith("update spots set"))
        .map((line) => ({ id: line.match(/where id = '([^']+)'/)[1], _raw: line }))
    : [];

  console.log("spots 테이블에서 name_ko 있는 스팟 목록 조회 중...");
  const allSpots = await fetchAllSpots();
  const todoSpots = allSpots.filter((s) => !done.has(s.id));
  console.log(`전체 ${allSpots.length}건 중 이미 처리된 ${done.size}건 제외, 이번에 ${todoSpots.length}건 시도`);

  const newRows = [];
  let processed = 0;
  let matched = 0;

  for (const spot of todoSpots) {
    let html;
    try {
      html = await searchNaver(spot.name_ko);
    } catch (e) {
      if (e.message === "BLOCKED") {
        console.error(`\n차단 신호 감지 (${processed}건 처리 후). 즉시 중단한다.`);
        break;
      }
      console.warn(`  검색 실패 (${spot.id}): ${e.message}`);
      processed += 1;
      await sleep(jitteredDelay());
      continue;
    }

    const candidates = extractCandidates(html);
    const best = pickBestMatch(candidates, spot);
    if (best) {
      newRows.push({ id: spot.id, rating: best.rating != null ? Math.round(best.rating * 10) / 10 : null, reviewCount: best.reviewCount });
      matched += 1;
    }

    processed += 1;
    if (processed % CHECKPOINT_EVERY === 0 || processed === todoSpots.length) {
      console.log(`  진행: ${processed}/${todoSpots.length} (매칭 ${matched}건)`);
      await writeFile(OUT_PATH, buildFullSql(doneRows, newRows), "utf-8");
    }
    await sleep(jitteredDelay());
  }

  console.log(`\n완료: ${OUT_PATH} (누적 ${doneRows.length + newRows.length}건, 이번 실행 매칭 ${matched}/${processed}건)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
