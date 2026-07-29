import { supabase } from "../supabaseClient.js";

export async function fetchAllFestivals() {
  return supabase.from("festivals").select("*").order("start_date", { ascending: true });
}

/** @param {string} id */
export async function fetchFestivalById(id) {
  return supabase.from("festivals").select("*").eq("id", id).maybeSingle();
}
