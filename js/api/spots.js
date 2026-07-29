import { supabase } from "../supabaseClient.js";

/**
 * 카테고리에 속한 스팟 전체를 가져온다. 지역/검색/정렬은 데이터 규모가 작으므로
 * (Phase 8 이전 기준) 클라이언트에서 처리한다 — round-trip을 줄이고 검색어를
 * PostgREST 필터 문자열에 직접 끼워 넣지 않아도 되므로 더 안전하다.
 * @param {'tourist'|'food'|'stay'|'experience'} category
 */
export async function fetchSpotsByCategory(category) {
  return supabase
    .from("spots")
    .select("*")
    .eq("category", category)
    .order("rating", { ascending: false, nullsFirst: false });
}

/** @param {string} id */
export async function fetchSpotById(id) {
  return supabase.from("spots").select("*").eq("id", id).maybeSingle();
}

/** 지도 페이지용: lat/lng이 있는 스팟 전체 (카테고리 필터는 클라이언트에서 처리) */
export async function fetchMappableSpots() {
  return supabase.from("spots").select("*").not("lat", "is", null).not("lng", "is", null);
}

/** @param {string[]} ids */
export async function fetchSpotsByIds(ids) {
  if (!ids?.length) return { data: [], error: null };
  return supabase.from("spots").select("*").in("id", ids);
}
