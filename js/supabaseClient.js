/**
 * Supabase 클라이언트 초기화 (Phase 2에서 CONFIG 값 채운 뒤 사용 시작).
 * CDN ESM으로 로드하므로 별도 번들러가 필요 없다.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CONFIG } from "./config.js";

export const supabase = CONFIG.SUPABASE_URL
  ? createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY)
  : null;
