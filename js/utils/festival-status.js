/**
 * festivals.status 컬럼은 seed 시점의 참고값일 뿐, 실제 진행상태는 항상
 * start_date/end_date 기준으로 화면에서 다시 계산한다 (CLAUDE.md Phase 6).
 */
export const FESTIVAL_STATUS_META = {
  ongoing: { label: "開催中", color: "#2b9bf4", bg: "#ebf5ff" },
  upcoming: { label: "予定", color: "#2bbf8a", bg: "#f0fff4" },
  ended: { label: "終了", color: "#9ca3af", bg: "#f5f5f5" },
};

/**
 * @param {string} startDate YYYY-MM-DD
 * @param {string} endDate YYYY-MM-DD
 * @param {string} [todayStr] YYYY-MM-DD, 테스트/기본값은 오늘
 */
export function computeFestivalStatus(startDate, endDate, todayStr = new Date().toISOString().slice(0, 10)) {
  if (todayStr < startDate) return "upcoming";
  if (todayStr > endDate) return "ended";
  return "ongoing";
}
