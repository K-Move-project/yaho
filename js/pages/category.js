import { supabase } from "../supabaseClient.js";
import { fetchSpotsByCategory } from "../api/spots.js";

const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5 15 9l7 .9-5.1 4.7L18.2 21 12 17.3 5.8 21l1.3-6.4L2 9.9 9 9z"/></svg>',
};

const CATEGORY_META = {
  tourist: { label: "観光地", labelKo: "관광지", color: "#2b9bf4", bg: "#ebf5ff" },
  food: { label: "グルメ", labelKo: "맛집", color: "#f47c2b", bg: "#fff3e8" },
  stay: { label: "宿泊", labelKo: "숙박", color: "#2bbf8a", bg: "#e8fbf4" },
  experience: { label: "体験", labelKo: "체험", color: "#a02bf4", bg: "#f4ebff" },
};

const ALL_AREAS = "すべて";

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/index.html";
  }
}

function topbarTemplate(meta) {
  return `
    <div class="page-topbar">
      <button type="button" class="page-topbar__back" data-back aria-label="戻る">${ICONS.back}</button>
      <span class="page-topbar__title">${meta.label}<span class="page-topbar__subtitle"> · ${meta.labelKo}</span></span>
      <div class="page-topbar__actions">
        <button type="button" class="page-topbar__action-btn" data-toggle-view aria-label="表示切り替え"></button>
      </div>
    </div>
  `;
}

function skeletonCards(count) {
  return Array.from({ length: count })
    .map(
      () => `
        <div class="category-card category-card--skeleton">
          <div class="skeleton" style="height:144px;border-radius:0;"></div>
          <div style="padding:12px;display:flex;flex-direction:column;gap:8px;">
            <div class="skeleton" style="height:14px;width:70%;"></div>
            <div class="skeleton" style="height:11px;width:40%;"></div>
            <div class="skeleton" style="height:11px;width:50%;"></div>
          </div>
        </div>
      `
    )
    .join("");
}

function spotCard(spot, meta, viewMode) {
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

  return `
    <a class="category-card category-card--${viewMode}" href="/pages/spot-detail.html?id=${encodeURIComponent(spot.id)}">
      <div class="category-card__image">
        <img src="${spot.image_url ?? ""}" alt="${spot.name_ja}" loading="lazy" />
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

export async function renderCategoryPage(root) {
  const params = new URLSearchParams(window.location.search);
  const categoryId = params.get("id") in CATEGORY_META ? params.get("id") : "tourist";
  const meta = CATEGORY_META[categoryId];
  const initialKeyword = params.get("keyword") ?? "";

  document.title = `${meta.label} | 釜山やっほー`;

  const state = {
    allSpots: [],
    area: ALL_AREAS,
    keyword: initialKeyword,
    viewMode: "grid",
  };

  root.innerHTML = `
    ${topbarTemplate(meta)}
    <div class="app-main__inner category-page">
      <div class="category-search">
        <span class="category-search__icon">${ICONS.search}</span>
        <input type="search" class="category-search__input" placeholder="${meta.label}を検索..." value="${initialKeyword}" />
      </div>
      <div class="category-area-filter" data-area-filter></div>
      <p class="category-count" data-count></p>
      <div class="category-results" data-results>${skeletonCards(6)}</div>
    </div>
  `;

  root.querySelector("[data-back]").addEventListener("click", goBack);

  const viewToggleBtn = root.querySelector("[data-toggle-view]");
  const renderViewIcon = () => {
    viewToggleBtn.innerHTML = state.viewMode === "grid" ? ICONS.list : ICONS.grid;
  };
  renderViewIcon();
  viewToggleBtn.addEventListener("click", () => {
    state.viewMode = state.viewMode === "grid" ? "list" : "grid";
    renderViewIcon();
    renderResults();
  });

  const searchInput = root.querySelector(".category-search__input");
  searchInput.addEventListener("input", () => {
    state.keyword = searchInput.value.trim();
    renderResults();
  });

  const areaFilterEl = root.querySelector("[data-area-filter]");
  const countEl = root.querySelector("[data-count]");
  const resultsEl = root.querySelector("[data-results]");

  function getFilteredSpots() {
    const keyword = state.keyword.toLowerCase();
    return state.allSpots.filter((spot) => {
      const areaOk = state.area === ALL_AREAS || spot.area === state.area;
      const haystack = [spot.name_ja, spot.name_ko, ...(spot.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
      const keywordOk = !keyword || haystack.includes(keyword);
      return areaOk && keywordOk;
    });
  }

  function renderAreaFilter() {
    const areas = [ALL_AREAS, ...new Set(state.allSpots.map((s) => s.area).filter(Boolean))];
    areaFilterEl.innerHTML = areas
      .map((area) => {
        const isActive = area === state.area;
        const style = isActive
          ? `background:${meta.color};color:#fff;border-color:${meta.color}`
          : "";
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-area="${area}" style="${style}">${area}</button>`;
      })
      .join("");
    areaFilterEl.querySelectorAll("[data-area]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.area = btn.dataset.area;
        renderAreaFilter();
        renderResults();
      });
    });
  }

  function renderResults() {
    const filtered = getFilteredSpots();
    countEl.textContent = `${filtered.length}件のスポット`;
    resultsEl.className = `category-results category-results--${state.viewMode}`;
    resultsEl.innerHTML = filtered.length
      ? filtered.map((spot) => spotCard(spot, meta, state.viewMode)).join("")
      : `<p class="state-message">条件に一致するスポットが見つかりませんでした。</p>`;
  }

  if (!supabase) {
    resultsEl.innerHTML = `
      <div class="state-message">
        <p>Supabase 설정이 필요합니다 (js/config.js).</p>
      </div>
    `;
    countEl.textContent = "";
    return;
  }

  const { data, error } = await fetchSpotsByCategory(categoryId);

  if (error) {
    resultsEl.innerHTML = `
      <div class="state-message">
        <p>データの読み込みに失敗しました。</p>
        <button type="button" class="state-message__retry" data-retry>再試行</button>
      </div>
    `;
    countEl.textContent = "";
    resultsEl.querySelector("[data-retry]").addEventListener("click", () => renderCategoryPage(root));
    return;
  }

  state.allSpots = data ?? [];
  renderAreaFilter();
  renderResults();
}
