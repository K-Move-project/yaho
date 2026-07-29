import { supabase } from "../supabaseClient.js";
import { fetchSpotById } from "../api/spots.js";
import { categoryMeta } from "../constants/categories.js";

const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5 15 9l7 .9-5.1 4.7L18.2 21 12 17.3 5.8 21l1.3-6.4L2 9.9 9 9z"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  navigation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 21 3 13 21 11 13 3 11"/></svg>',
  ticket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3Z"/></svg>',
};

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "../index.html";
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
    <div class="app-main__inner spot-detail">
      <div class="skeleton" style="height:240px;border-radius:16px;"></div>
      <div class="skeleton" style="height:24px;width:60%;margin-top:16px;border-radius:6px;"></div>
      <div class="skeleton" style="height:14px;width:40%;margin-top:8px;border-radius:6px;"></div>
      <div class="skeleton" style="height:80px;margin-top:16px;border-radius:12px;"></div>
    </div>
  `;
}

function infoRow(icon, label, value, color) {
  if (!value) return "";
  return `
    <div class="spot-info-row">
      <span class="spot-info-row__icon" style="color:${color}">${icon}</span>
      <div>
        <p class="spot-info-row__label">${label}</p>
        <p class="spot-info-row__value">${value}</p>
      </div>
    </div>
  `;
}

export async function renderSpotDetailPage(root) {
  const params = new URLSearchParams(window.location.search);
  const spotId = params.get("id");

  root.innerHTML = skeletonTemplate();
  root.querySelector("[data-back]")?.addEventListener("click", goBack);

  if (!supabase) {
    renderState(root, "Supabase 설정이 필요합니다 (js/config.js).");
    return;
  }

  if (!spotId) {
    renderState(root, "スポットが指定されていません。");
    return;
  }

  const { data: spot, error } = await fetchSpotById(spotId);

  if (error) {
    renderState(root, "データの読み込みに失敗しました。", () => renderSpotDetailPage(root));
    return;
  }

  if (!spot) {
    renderState(root, "スポットが見つかりませんでした。", null, goBack);
    return;
  }

  document.title = `${spot.name_ja} | 釜山やっほー`;
  const meta = categoryMeta(spot.category);
  const tags = spot.tags ?? [];

  root.innerHTML = `
    ${topbarTemplate(spot.name_ja)}
    <div class="app-main__inner spot-detail">
      <div class="spot-detail__hero">
        <img src="${spot.image_url ?? ""}" alt="${spot.name_ja}" onerror="this.closest('.spot-detail__hero').style.background='var(--color-surface)';this.remove()" />
      </div>

      <div class="spot-detail__head">
        <div>
          <h1 class="spot-detail__name">${spot.name_ja}</h1>
          ${spot.name_ko ? `<p class="spot-detail__name-ko">${spot.name_ko}</p>` : ""}
        </div>
        ${
          spot.rating != null
            ? `<div class="spot-detail__rating">${ICONS.star}<span>${spot.rating}</span></div>`
            : ""
        }
      </div>

      <div class="spot-detail__area">${ICONS.mapPin}<span>${spot.area ?? ""}</span></div>

      <div class="spot-detail__tags">
        <span class="spot-detail__category-badge" style="background:${meta.color}18;color:${meta.color}">${meta.label}</span>
        ${tags.map((tag) => `<span class="spot-detail__tag" style="background:${meta.color}18;color:${meta.color}">#${tag}</span>`).join("")}
      </div>

      ${spot.description_ja ? `<p class="spot-detail__description">${spot.description_ja}</p>` : ""}

      <div class="spot-detail__info-list">
        ${infoRow(ICONS.clock, "営業時間", spot.hours_ja, meta.color)}
        ${infoRow(ICONS.navigation, "アクセス", spot.access_ja, meta.color)}
        ${infoRow(ICONS.ticket, "入場料", spot.admission, meta.color)}
      </div>

      <a class="spot-detail__map-cta" href="map.html?spot=${encodeURIComponent(spot.id)}" style="background:linear-gradient(135deg, ${meta.color} 0%, ${meta.color}cc 100%)">
        ${ICONS.navigation}<span>地図で確認する</span>
      </a>
    </div>
  `;

  root.querySelector("[data-back]").addEventListener("click", goBack);
}

function renderState(root, message, onRetry, onBack) {
  const main = root.querySelector(".app-main__inner") ?? root;
  main.innerHTML = `
    <div class="state-message">
      <p>${message}</p>
      ${onRetry ? `<button type="button" class="state-message__retry" data-retry>再試行</button>` : ""}
      ${onBack ? `<button type="button" class="state-message__retry" data-state-back>戻る</button>` : ""}
    </div>
  `;
  if (onRetry) {
    main.querySelector("[data-retry]").addEventListener("click", onRetry);
  }
  if (onBack) {
    main.querySelector("[data-state-back]").addEventListener("click", onBack);
  }
}
