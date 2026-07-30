import { supabase } from "../supabaseClient.js";
import { fetchAllFestivals } from "../api/festivals.js";
import { FESTIVAL_STATUS_META, computeFestivalStatus } from "../utils/festival-status.js";

const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  externalLink: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/></svg>',
  emptyCalendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/></svg>',
};

const ALL = "すべて";
const STATUS_ORDER = ["ongoing", "upcoming", "ended"];
const VISITBUSAN_URL = "https://www.visitbusan.net";

function formatDateRange(start, end) {
  const fmt = (d) => {
    const [y, m, day] = d.split("-");
    return `${y}.${Number(m)}.${Number(day)}`;
  };
  return start === end ? fmt(start) : `${fmt(start)} – ${fmt(end)}`;
}

/**
 * start〜end区間が含む月(1〜12)の一覧。年をまたぐ長期イベントや、複数年の
 * データが混在していても「7月」のように月番号だけでシンプルにまとめる
 * (年ごとにタブが増殖しないように)。
 */
function monthsInRange(start, end) {
  const months = new Set();
  const cur = new Date(`${start.slice(0, 7)}-01T00:00:00`);
  const last = new Date(`${end.slice(0, 7)}-01T00:00:00`);
  let guard = 0;
  while (cur <= last && guard < 36) {
    months.add(cur.getMonth() + 1);
    cur.setMonth(cur.getMonth() + 1);
    guard += 1;
  }
  return [...months];
}

function eventCardHtml(festival) {
  const status = computeFestivalStatus(festival.start_date, festival.end_date);
  const meta = FESTIVAL_STATUS_META[status];
  const pulseDot = status === "ongoing" ? `<span class="event-card__badge-dot"></span>` : "";
  const isOfficial = festival.id.startsWith("visitbusan-");
  const tags = (festival.tags ?? []).slice(0, 3);

  return `
    <a class="event-card" href="event-detail.html?id=${encodeURIComponent(festival.id)}">
      <div class="event-card__image">
        <img src="${festival.image_url ?? ""}" alt="${festival.title_ja}" loading="lazy" onerror="this.style.display='none'" />
        <span class="event-card__status-badge" style="background:${meta.bg};color:${meta.color}">${pulseDot}${meta.label}</span>
        ${isOfficial ? `<span class="event-card__official-badge">公式情報</span>` : ""}
      </div>
      <div class="event-card__body">
        ${tags.length ? `<div class="event-card__tags">${tags.map((t) => `<span class="event-card__tag">#${t}</span>`).join("")}</div>` : ""}
        <p class="event-card__title">${festival.title_ja}</p>
        ${festival.title_sub_ko ? `<p class="event-card__subtitle">${festival.title_sub_ko}</p>` : ""}
        ${festival.description_ja ? `<p class="event-card__desc">${festival.description_ja}</p>` : ""}
        <div class="event-card__meta">
          <span>${ICONS.clock}${formatDateRange(festival.start_date, festival.end_date)}</span>
          ${festival.area ? `<span>${ICONS.mapPin}${festival.area}</span>` : ""}
        </div>
        <span class="event-card__more">詳細を見る${ICONS.chevronRight}</span>
      </div>
    </a>
  `;
}

export async function renderEventsPage(root) {
  root.innerHTML = `
    <div class="app-main__inner events-page">
      <div class="events-page__head">
        <h1 class="events-page__title">行事・お祭り</h1>
        <span class="events-page__ongoing" data-ongoing-badge hidden></span>
      </div>

      <div class="category-area-filter" data-month-filter></div>
      <div class="category-area-filter" data-status-filter></div>

      <div class="events-page__count-row">
        <p class="category-count" data-count></p>
        <a class="events-page__source-link" href="${VISITBUSAN_URL}" target="_blank" rel="noopener noreferrer">
          Visit Busan公式${ICONS.externalLink}
        </a>
      </div>

      <div class="events-list" data-results>
        ${Array.from({ length: 6 })
          .map(
            () => `
              <div class="event-card event-card--skeleton">
                <div class="skeleton" style="height:160px;"></div>
                <div style="padding:12px;display:flex;flex-direction:column;gap:8px;">
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

  const monthFilterEl = root.querySelector("[data-month-filter]");
  const statusFilterEl = root.querySelector("[data-status-filter]");
  const countEl = root.querySelector("[data-count]");
  const resultsEl = root.querySelector("[data-results]");
  const ongoingBadgeEl = root.querySelector("[data-ongoing-badge]");

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

  const allFestivals = (data ?? [])
    .map((f) => ({
      ...f,
      _status: computeFestivalStatus(f.start_date, f.end_date),
      _months: monthsInRange(f.start_date, f.end_date),
    }))
    .sort((a, b) => STATUS_ORDER.indexOf(a._status) - STATUS_ORDER.indexOf(b._status) || a.start_date.localeCompare(b.start_date));
  let activeMonth = ALL;
  let activeStatus = ALL;

  const ongoingCount = allFestivals.filter((f) => f._status === "ongoing").length;
  if (ongoingCount > 0) {
    ongoingBadgeEl.hidden = false;
    ongoingBadgeEl.innerHTML = `<span class="events-page__ongoing-dot"></span>${ongoingCount}件 開催中`;
  }

  function renderMonthFilter() {
    const months = [...new Set(allFestivals.flatMap((f) => f._months))].sort((a, b) => a - b);
    monthFilterEl.innerHTML = [ALL, ...months]
      .map((m) => {
        const isActive = m === activeMonth;
        const label = m === ALL ? m : `${m}月`;
        const style = isActive ? `background:var(--color-primary);color:#fff;border-color:var(--color-primary)` : "";
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-month="${m}" style="${style}">${label}</button>`;
      })
      .join("");
    monthFilterEl.querySelectorAll("[data-month]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeMonth = btn.dataset.month === ALL ? ALL : Number(btn.dataset.month);
        renderMonthFilter();
        renderResults();
      });
    });
  }

  function renderStatusFilter() {
    const statuses = [ALL, ...STATUS_ORDER.filter((s) => allFestivals.some((f) => f._status === s))];
    statusFilterEl.innerHTML = statuses
      .map((s) => {
        const isActive = s === activeStatus;
        const label = s === ALL ? s : FESTIVAL_STATUS_META[s].label;
        const color = s === ALL ? "var(--color-primary)" : FESTIVAL_STATUS_META[s].color;
        const style = isActive ? `background:${color};color:#fff;border-color:${color}` : "";
        const dot = s === ALL ? "" : `<span class="category-chip__dot" style="background:${isActive ? "#fff" : color}"></span>`;
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-status="${s}" style="${style}">${dot}${label}</button>`;
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

  function renderResults() {
    const filtered = allFestivals.filter((f) => {
      const monthOk = activeMonth === ALL || f._months.includes(activeMonth);
      const statusOk = activeStatus === ALL || f._status === activeStatus;
      return monthOk && statusOk;
    });
    const monthLabel = activeMonth === ALL ? "" : `・${activeMonth}月`;
    countEl.textContent = `${filtered.length}件のイベント${monthLabel}`;
    resultsEl.innerHTML = filtered.length
      ? filtered.map(eventCardHtml).join("")
      : `
        <div class="category-empty">
          <span class="category-empty__icon">${ICONS.emptyCalendar}</span>
          <p>条件に一致するイベントが見つかりませんでした</p>
          <button type="button" class="category-empty__reset" data-reset-event-filter>フィルターをリセット</button>
        </div>
      `;

    const resetBtn = resultsEl.querySelector("[data-reset-event-filter]");
    resetBtn?.addEventListener("click", () => {
      activeMonth = ALL;
      activeStatus = ALL;
      renderMonthFilter();
      renderStatusFilter();
      renderResults();
    });
  }

  renderMonthFilter();
  renderStatusFilter();
  renderResults();
}
