const ICONS = {
  camera:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1.2l1-1.6A1.5 1.5 0 0 1 9.5 3.7h5a1.5 1.5 0 0 1 1.3.7l1 1.6H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  utensils:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v7a2 2 0 0 0 2 2v9M6 3v7M9 3v7M12 3v18M20 3c-2.2 0-4 2.2-4 6.5S17.8 15 20 15V3Z"/></svg>',
  hotel:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V6a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v15M3 21h18M9 21v-5h6v5M14 6h6a1 1 0 0 1 1 1v14M6 9h.01M6 12h.01M6 15h.01"/></svg>',
  sparkles:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/></svg>',
};

export const CATEGORY_META = {
  tourist: { label: "観光地", labelKo: "관광지", color: "#2b9bf4", bg: "#ebf5ff", icon: ICONS.camera },
  food: { label: "グルメ", labelKo: "맛집", color: "#f47c2b", bg: "#fff3e8", icon: ICONS.utensils },
  stay: { label: "宿泊", labelKo: "숙박", color: "#2bbf8a", bg: "#e8fbf4", icon: ICONS.hotel },
  experience: { label: "体験", labelKo: "체험", color: "#a02bf4", bg: "#f4ebff", icon: ICONS.sparkles },
};

export function categoryMeta(id) {
  return CATEGORY_META[id] ?? CATEGORY_META.tourist;
}
