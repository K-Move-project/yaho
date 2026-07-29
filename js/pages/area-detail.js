import { supabase } from "../supabaseClient.js";
import { fetchAreaById, fetchSpotsByIds } from "../api/areas.js";
import { CATEGORY_META } from "../constants/categories.js";
import { spotCardHtml } from "../components/spot-card.js";

const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5 15 9l7 .9-5.1 4.7L18.2 21 12 17.3 5.8 21l1.3-6.4L2 9.9 9 9z"/></svg>',
};

const ALL_CATEGORIES = "すべて";

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/index.html";
  }
}

function topbarTemplate(title) {
  return `
    <div class="page-topbar">
      <button type="button" class="page-topbar__back" data-back aria-label="戻る">${ICONS.back}</button>
      <span class="page-topbar__title">${title}</span>
    </div>
  `;
}

function skeletonTemplate() {
  return `
    ${topbarTemplate("")}
    <div class="app-main__inner area-detail">
      <div class="skeleton" style="height:200px;border-radius:16px;"></div>
      <div class="skeleton" style="height:22px;width:50%;margin-top:16px;border-radius:6px;"></div>
      <div class="skeleton" style="height:14px;width:80%;margin-top:8px;border-radius:6px;"></div>
    </div>
  `;
}

function renderState(root, message, onRetry) {
  const main = root.querySelector(".app-main__inner") ?? root;
  main.innerHTML = `
    <div class="state-message">
      <p>${message}</p>
      ${onRetry ? `<button type="button" class="state-message__retry" data-retry>再試行</button>` : ""}
    </div>
  `;
  if (onRetry) {
    main.querySelector("[data-retry]").addEventListener("click", onRetry);
  }
}

export async function renderAreaDetailPage(root) {
  const params = new URLSearchParams(window.location.search);
  const areaId = params.get("id");

  root.innerHTML = skeletonTemplate();
  root.querySelector("[data-back]")?.addEventListener("click", goBack);

  if (!supabase) {
    renderState(root, "Supabase 설정이 필요합니다 (js/config.js).");
    return;
  }

  if (!areaId) {
    renderState(root, "地域が指定されていません。");
    return;
  }

  const { data: area, error: areaError } = await fetchAreaById(areaId);

  if (areaError) {
    renderState(root, "データの読み込みに失敗しました。", () => renderAreaDetailPage(root));
    return;
  }

  if (!area) {
    renderState(root, "地域が見つかりませんでした。");
    return;
  }

  document.title = `${area.area_name_ja} | 釜山やっほー`;

  const { data: spots, error: spotsError } = await fetchSpotsByIds(area.spot_ids ?? []);

  root.innerHTML = `
    ${topbarTemplate(area.area_name_ja)}
    <div class="app-main__inner area-detail">
      <div class="area-detail__hero">
        <img src="${area.image_url ?? ""}" alt="${area.area_name_ja}" />
      </div>

      <div class="area-detail__head">
        <div>
          <h1 class="area-detail__name">${area.area_name_ja}</h1>
          ${area.area_name_ko ? `<p class="area-detail__name-ko">${area.area_name_ko}</p>` : ""}
        </div>
        ${
          area.preference_score != null
            ? `<div class="area-detail__score">${ICONS.star}<span>${area.preference_score}</span></div>`
            : ""
        }
      </div>

      ${area.description_ja ? `<p class="area-detail__description">${area.description_ja}</p>` : ""}

      <h2 class="area-detail__section-title">エリア内のスポット</h2>
      <div class="category-area-filter" data-category-filter></div>
      <p class="category-count" data-count></p>
      <div class="category-results category-results--grid" data-results></div>
    </div>
  `;

  root.querySelector("[data-back]").addEventListener("click", goBack);

  const filterEl = root.querySelector("[data-category-filter]");
  const countEl = root.querySelector("[data-count]");
  const resultsEl = root.querySelector("[data-results]");

  if (spotsError) {
    resultsEl.innerHTML = `
      <div class="state-message">
        <p>スポット情報の読み込みに失敗しました。</p>
      </div>
    `;
    filterEl.remove();
    countEl.remove();
    return;
  }

  const allSpots = spots ?? [];
  let activeCategory = ALL_CATEGORIES;

  function renderFilter() {
    const categories = [ALL_CATEGORIES, ...new Set(allSpots.map((s) => s.category).filter(Boolean))];
    filterEl.innerHTML = categories
      .map((cat) => {
        const isActive = cat === activeCategory;
        const label = cat === ALL_CATEGORIES ? cat : CATEGORY_META[cat]?.label ?? cat;
        const style = isActive ? `background:var(--color-primary);color:#fff;border-color:var(--color-primary)` : "";
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-cat="${cat}" style="${style}">${label}</button>`;
      })
      .join("");
    filterEl.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        renderFilter();
        renderResults();
      });
    });
  }

  function renderResults() {
    const filtered =
      activeCategory === ALL_CATEGORIES ? allSpots : allSpots.filter((s) => s.category === activeCategory);
    countEl.textContent = `${filtered.length}件のスポット`;
    resultsEl.innerHTML = filtered.length
      ? filtered.map((spot) => spotCardHtml(spot, "grid")).join("")
      : `<p class="state-message">このエリアにはまだスポットが登録されていません。</p>`;
  }

  if (allSpots.length) {
    renderFilter();
  } else {
    filterEl.remove();
  }
  renderResults();
}
