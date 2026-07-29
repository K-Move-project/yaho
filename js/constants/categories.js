export const CATEGORY_META = {
  tourist: { label: "観光地", labelKo: "관광지", color: "#2b9bf4", bg: "#ebf5ff" },
  food: { label: "グルメ", labelKo: "맛집", color: "#f47c2b", bg: "#fff3e8" },
  stay: { label: "宿泊", labelKo: "숙박", color: "#2bbf8a", bg: "#e8fbf4" },
  experience: { label: "体験", labelKo: "체험", color: "#a02bf4", bg: "#f4ebff" },
};

export function categoryMeta(id) {
  return CATEGORY_META[id] ?? CATEGORY_META.tourist;
}
