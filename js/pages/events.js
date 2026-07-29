import { supabase } from "../supabaseClient.js";
import { fetchAllFestivals } from "../api/festivals.js";
import { FESTIVAL_STATUS_META, computeFestivalStatus } from "../utils/festival-status.js";

const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
};

const ALL = "すべて";
const STATUS_ORDER = ["ongoing", "upcoming", "ended"];

function formatDateRange(start, end) {
  const fmt = (d) => {
    const [y, m, day] = d.split("-");
    return `${y}.${Number(m)}.${Number(day)}`;
  };
  return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
}

function eventCardHtml(festival) {
  const status = computeFestivalStatus(festival.start_date, festival.end_date);
  const meta = FESTIVAL_STATUS_META[status];
  return `
    <a class="event-card" href="/pages/event-detail.html?id=${encodeURIComponent(festival.id)}">
      <div class="event-card__image">
        <img src="${festival.image_url ?? ""}" alt="${festival.title_ja}" loading="lazy" />
      </div>
      <div class="event-card__body">
        <span class="event-card__badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span>
        <p class="event-card__title">${festival.title_ja}</p>
        <div class="event-card__meta">
          <span>${ICONS.clock}${formatDateRange(festival.start_date, festival.end_date)}</span>
          <span>${ICONS.mapPin}${festival.area ?? ""}</span>
        </div>
      </div>
    </a>
  `;
}

export async function renderEventsPage(root) {
  root.innerHTML = `
    <div class="app-main__inner events-page">
      <h1 class="events-page__title">行事・お祭り</h1>

      <div class="category-area-filter" data-status-filter></div>
      <div class="category-area-filter" data-area-filter></div>

      <p class="category-count" data-count></p>
      <div class="events-list" data-results>
        ${Array.from({ length: 3 })
          .map(
            () => `
              <div class="event-card event-card--skeleton">
                <div class="skeleton" style="width:80px;height:80px;"></div>
                <div style="flex:1;padding:12px;display:flex;flex-direction:column;gap:8px;">
                  <div class="skeleton" style="height:12px;width:50%;"></div>
                  <div class="skeleton" style="height:14px;width:70%;"></div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  const statusFilterEl = root.querySelector("[data-status-filter]");
  const areaFilterEl = root.querySelector("[data-area-filter]");
  const countEl = root.querySelector("[data-count]");
  const resultsEl = root.querySelector("[data-results]");

  if (!supabase) {
    resultsEl.innerHTML = `<div class="state-message"><p>Supabase 설정이 필요합니다 (js/config.js).</p></div>`;
    return;
  }

  const { data, error } = await fetchAllFestivals();

  if (error) {
    resultsEl.innerHTML = `
      <div class="state-message">
        <p>データの読み込みに失敗しました。</p>
        <button type="button" class="state-message__retry" data-retry>再試行</button>
      </div>
    `;
    resultsEl.querySelector("[data-retry]").addEventListener("click", () => renderEventsPage(root));
    return;
  }

  const allFestivals = (data ?? []).map((f) => ({ ...f, _status: computeFestivalStatus(f.start_date, f.end_date) }));
  let activeStatus = ALL;
  let activeArea = ALL;

  function renderStatusFilter() {
    const statuses = [ALL, ...STATUS_ORDER.filter((s) => allFestivals.some((f) => f._status === s))];
    statusFilterEl.innerHTML = statuses
      .map((s) => {
        const isActive = s === activeStatus;
        const label = s === ALL ? s : FESTIVAL_STATUS_META[s].label;
        const color = s === ALL ? "var(--color-primary)" : FESTIVAL_STATUS_META[s].color;
        const style = isActive ? `background:${color};color:#fff;border-color:${color}` : "";
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-status="${s}" style="${style}">${label}</button>`;
      })
      .join("");
    statusFilterEl.querySelectorAll("[data-status]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeStatus = btn.dataset.status;
        renderStatusFilter();
        renderResults();
      });
    });
  }

  function renderAreaFilter() {
    const areas = [ALL, ...new Set(allFestivals.map((f) => f.area).filter(Boolean))];
    areaFilterEl.innerHTML = areas
      .map((area) => {
        const isActive = area === activeArea;
        const style = isActive ? `background:var(--color-primary);color:#fff;border-color:var(--color-primary)` : "";
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-area="${area}" style="${style}">${area}</button>`;
      })
      .join("");
    areaFilterEl.querySelectorAll("[data-area]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeArea = btn.dataset.area;
        renderAreaFilter();
        renderResults();
      });
    });
  }

  function renderResults() {
    const filtered = allFestivals.filter((f) => {
      const statusOk = activeStatus === ALL || f._status === activeStatus;
      const areaOk = activeArea === ALL || f.area === activeArea;
      return statusOk && areaOk;
    });
    countEl.textContent = `${filtered.length}件のイベント`;
    resultsEl.innerHTML = filtered.length
      ? filtered.map(eventCardHtml).join("")
      : `<p class="state-message">条件に一致するイベントが見つかりませんでした。</p>`;
  }

  renderStatusFilter();
  renderAreaFilter();
  renderResults();
}
