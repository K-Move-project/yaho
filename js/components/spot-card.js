import { categoryMeta } from "../constants/categories.js";

const ICONS = {
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5 15 9l7 .9-5.1 4.7L18.2 21 12 17.3 5.8 21l1.3-6.4L2 9.9 9 9z"/></svg>',
};

/**
 * 스팟 카드 마크업. category.js(그리드/리스트)와 area-detail.js(그리드)에서 공용으로 쓴다.
 * @param {object} spot spots 테이블 행
 * @param {'grid'|'list'} viewMode
 */
export function spotCardHtml(spot, viewMode = "grid") {
  const meta = categoryMeta(spot.category);
  const tags = spot.tags ?? [];
  const shownTags = viewMode === "grid" ? tags.slice(0, 2) : tags.slice(0, 3);
  const tagHtml = shownTags
    .map((tag) => `<span class="category-card__tag" style="background:${meta.bg};color:${meta.color}">${tag}</span>`)
    .join("");
  const priceHtml = spot.admission ? `<span class="category-card__price">${spot.admission}</span>` : "";
  const ratingHtml =
    spot.rating != null
      ? `<span class="category-card__rating">${ICONS.star}<span>${spot.rating}</span></span>`
      : "";
  const imageHtml = spot.image_url
    ? `<img src="${spot.image_url}" alt="${spot.name_ja}" loading="lazy" />`
    : `<div class="category-card__image-placeholder" style="background:${meta.bg};color:${meta.color}">${meta.label}</div>`;

  return `
    <a class="category-card category-card--${viewMode}" href="/pages/spot-detail.html?id=${encodeURIComponent(spot.id)}">
      <div class="category-card__image">
        ${imageHtml}
      </div>
      <div class="category-card__body">
        <p class="category-card__name">${spot.name_ja}</p>
        <div class="category-card__area">${ICONS.mapPin}<span>${spot.area ?? ""}</span></div>
        <div class="category-card__tags">${tagHtml}</div>
        <div class="category-card__foot">${ratingHtml}${priceHtml}</div>
      </div>
    </a>
  `;
}
