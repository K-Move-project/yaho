/**
 * 브라우저에서 직접 읽을 수 있는(공개해도 되는) 설정 값만 둔다.
 * - Supabase anon key는 RLS로 보호되는 공개 키이므로 여기 둬도 된다.
 * - TourAPI 키처럼 민감한 키는 여기 두지 않고, Supabase Edge Function 프록시
 *   경유 여부를 Phase 2/6에서 결정한다.
 *
 * Phase 2에서 실제 Supabase 프로젝트 URL/anon key로 채운다.
 */
export const CONFIG = {
  SUPABASE_URL: "https://jryzwztppwbixqohitvg.supabase.co",
  SUPABASE_ANON_KEY: "sb_publishable_t7UiFnWifLq5g0FZgEJXWA_PD5oiwBn",
  NAVER_MAP_CLIENT_ID: "",
};
