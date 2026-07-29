import { supabase } from "../supabaseClient.js";

/** @param {string} id */
export async function fetchAreaById(id) {
  return supabase.from("preferred_areas").select("*").eq("id", id).maybeSingle();
}
