import { supabase } from "../supabaseClient.js";
import { fetchSpotsByCategory } from "../api/spots.js";
import { CATEGORY_META } from "../constants/categories.js";
import { BUSAN_DISTRICTS } from "../constants/districts.js";
import { spotCardHtml } from "../components/spot-card.js";

const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  emptySearch: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
};

const ALL_AREAS = "すべて";
const SORT_MODES = [
  { id: "name", label: "名前順" },
  { id: "popularity", label: "人気順" },
];

/**
 * 人気順は現時点では rating(暫定値、ほとんどの実データには未設定)を使う。
 * 将来レビューAPIと連携したら、この比較関数だけ差し替えれば良い。
 */
function sortSpots(spots, sortMode) {
  const sorted = [...spots];
  if (sortMode === "popularity") {
    sorted.sort((a, b) => {
      if (a.rating == null && b.rating == null) return a.name_ja.localeCompare(b.name_ja, "ja");
      if (a.rating == null) return 1;
      if (b.rating == null) return -1;
      return b.rating - a.rating;
    });
  } else {
    sorted.sort((a, b) => a.name_ja.localeCompare(b.name_ja, "ja"));
  }
  return sorted;
}

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "../index.html";
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
    sortMode: "name",
  };

  root.innerHTML = `
    ${topbarTemplate(meta)}
    <div class="app-main__inner category-page">
      <div class="category-search">
        <span class="category-search__icon">${ICONS.search}</span>
        <input type="search" class="category-search__input" placeholder="${meta.label}を検索..." value="${initialKeyword}" />
      </div>
      <div class="category-area-filter" data-area-filter></div>
      <div class="category-sort" data-sort-filter></div>
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
  const sortFilterEl = root.querySelector("[data-sort-filter]");
  const countEl = root.querySelector("[data-count]");
  const resultsEl = root.querySelector("[data-results]");

  function getFilteredSpots() {
    const keyword = state.keyword.toLowerCase();
    const filtered = state.allSpots.filter((spot) => {
      const areaOk = state.area === ALL_AREAS || spot.area === state.area;
      const haystack = [spot.name_ja, spot.name_ko, ...(spot.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
      const keywordOk = !keyword || haystack.includes(keyword);
      return areaOk && keywordOk;
    });
    return sortSpots(filtered, state.sortMode);
  }

  function renderSortFilter() {
    sortFilterEl.innerHTML = SORT_MODES.map(({ id, label }) => {
      const isActive = id === state.sortMode;
      const style = isActive ? `background:${meta.color};color:#fff;border-color:${meta.color}` : "";
      return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-sort="${id}" style="${style}">${label}</button>`;
    }).join("");
    sortFilterEl.querySelectorAll("[data-sort]").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.sortMode = btn.dataset.sort;
        renderSortFilter();
        renderResults();
      });
    });
  }

  function renderAreaFilter() {
    // 데이터에 있는 구/군만 보여주면 아직 스팟이 없는 구는 필터에서 계속 빠지므로,
    // 부산 16개 구/군 고정 목록을 항상 보여준다 (실제 행정구역 기준).
    const areas = [ALL_AREAS, ...BUSAN_DISTRICTS];
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
    const areaBadge =
      state.area !== ALL_AREAS
        ? `<span class="category-count__badge" style="background:${meta.color}20;color:${meta.color}">${state.area}</span>`
        : "";
    countEl.innerHTML = `${filtered.length}件のスポット${areaBadge}`;
    resultsEl.className = `category-results category-results--${state.viewMode}`;
    resultsEl.innerHTML = filtered.length
      ? filtered.map((spot) => spotCardHtml(spot, state.viewMode)).join("")
      : `
        <div class="category-empty">
          <span class="category-empty__icon">${ICONS.emptySearch}</span>
          <p>条件に一致するスポットが見つかりませんでした</p>
          <button type="button" class="category-empty__reset" data-reset-filter>フィルターをリセット</button>
        </div>
      `;

    const resetBtn = resultsEl.querySelector("[data-reset-filter]");
    resetBtn?.addEventListener("click", () => {
      state.area = ALL_AREAS;
      state.keyword = "";
      searchInput.value = "";
      renderAreaFilter();
      renderResults();
    });
  }

  renderSortFilter();

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
