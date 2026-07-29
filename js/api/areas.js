import { supabase } from "../supabaseClient.js";

/** @param {string} id */
export async function fetchAreaById(id) {
  return supabase.from("preferred_areas").select("*").eq("id", id).maybeSingle();
}

/** @param {string[]} ids */
export async function fetchSpotsByIds(ids) {
  if (!ids?.length) return { data: [], error: null };
  return supabase.from("spots").select("*").in("id", ids);
}
