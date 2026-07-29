import { supabase } from "../supabaseClient.js";

export async function fetchAllCourses() {
  return supabase.from("courses").select("*").order("budget_level", { ascending: true });
}

/** @param {string} id */
export async function fetchCourseById(id) {
  return supabase.from("courses").select("*").eq("id", id).maybeSingle();
}
