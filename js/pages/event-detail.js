import { supabase } from "../supabaseClient.js";
import { fetchFestivalById } from "../api/festivals.js";
import { fetchSpotById } from "../api/spots.js";
import { FESTIVAL_STATUS_META, computeFestivalStatus } from "../utils/festival-status.js";

const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
};

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "/pages/events.html";
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
    <div class="app-main__inner event-detail">
      <div class="skeleton" style="height:220px;border-radius:16px;"></div>
      <div class="skeleton" style="height:22px;width:60%;margin-top:16px;border-radius:6px;"></div>
      <div class="skeleton" style="height:80px;margin-top:16px;border-radius:12px;"></div>
    </div>
  `;
}

function formatDateRange(start, end) {
  const fmt = (d) => {
    const [y, m, day] = d.split("-");
    return `${y}.${Number(m)}.${Number(day)}`;
  };
  return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
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

export async function renderEventDetailPage(root) {
  const params = new URLSearchParams(window.location.search);
  const eventId = params.get("id");

  root.innerHTML = skeletonTemplate();
  root.querySelector("[data-back]")?.addEventListener("click", goBack);

  if (!supabase) {
    renderState(root, "Supabase 설정이 필요합니다 (js/config.js).");
    return;
  }

  if (!eventId) {
    renderState(root, "イベントが指定されていません。");
    return;
  }

  const { data: festival, error } = await fetchFestivalById(eventId);

  if (error) {
    renderState(root, "データの読み込みに失敗しました。", () => renderEventDetailPage(root));
    return;
  }

  if (!festival) {
    renderState(root, "イベントが見つかりませんでした。");
    return;
  }

  document.title = `${festival.title_ja} | 釜山やっほー`;
  const status = computeFestivalStatus(festival.start_date, festival.end_date);
  const meta = FESTIVAL_STATUS_META[status];
  const tags = festival.tags ?? [];

  let relatedSpot = null;
  if (festival.spot_id) {
    const { data } = await fetchSpotById(festival.spot_id);
    relatedSpot = data;
  }

  root.innerHTML = `
    ${topbarTemplate(festival.title_ja)}
    <div class="app-main__inner event-detail">
      <div class="event-detail__hero">
        <img src="${festival.image_url ?? ""}" alt="${festival.title_ja}" />
      </div>

      <span class="event-detail__status" style="background:${meta.bg};color:${meta.color}">${meta.label}</span>
      <h1 class="event-detail__name">${festival.title_ja}</h1>
      ${festival.title_sub_ko ? `<p class="event-detail__name-ko">${festival.title_sub_ko}</p>` : ""}

      <div class="event-detail__meta">
        <span>${ICONS.clock}${formatDateRange(festival.start_date, festival.end_date)}</span>
        <span>${ICONS.mapPin}${festival.area ?? ""}</span>
      </div>

      ${
        tags.length
          ? `<div class="event-detail__tags">${tags.map((t) => `<span class="event-detail__tag">#${t}</span>`).join("")}</div>`
          : ""
      }

      ${festival.description_ja ? `<p class="event-detail__description">${festival.description_ja}</p>` : ""}

      ${
        relatedSpot
          ? `
        <h2 class="event-detail__section-title">関連スポット</h2>
        <a class="event-detail__related-spot" href="/pages/spot-detail.html?id=${encodeURIComponent(relatedSpot.id)}">
          <img src="${relatedSpot.image_url ?? ""}" alt="${relatedSpot.name_ja}" loading="lazy" />
          <div>
            <p class="event-detail__related-spot-name">${relatedSpot.name_ja}</p>
            <p class="event-detail__related-spot-area">${relatedSpot.area ?? ""}</p>
          </div>
        </a>
      `
          : ""
      }
    </div>
  `;

  root.querySelector("[data-back]").addEventListener("click", goBack);
}
