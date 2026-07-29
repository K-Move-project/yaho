import { supabase } from "../supabaseClient.js";
import { fetchAllCourses } from "../api/courses.js";

const ALL = "すべて";
const BUDGET_LEVEL_LABEL = { 1: "節約", 2: "標準", 3: "ゆったり" };
const DIFFICULTY = {
  easy: { label: "やさしい", color: "#2bbf8a" },
  normal: { label: "ふつう", color: "#f47c2b" },
};

const ICONS = {
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="16" cy="14.5" r="1"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5 15 9l7 .9-5.1 4.7L18.2 21 12 17.3 5.8 21l1.3-6.4L2 9.9 9 9z"/></svg>',
};

function extractDurationDays(durationLabel) {
  const match = durationLabel?.match(/^(\d+)日/);
  return match ? `${match[1]}日` : durationLabel ?? "";
}

function computeDifficulty(course) {
  const days = Number(extractDurationDays(course.duration_label)?.replace("日", "")) || 1;
  return days >= 2 ? DIFFICULTY.normal : DIFFICULTY.easy;
}

function routePreviewHtml(schedule) {
  if (!schedule.length) return "";
  const shown = schedule.slice(0, 4);
  const remaining = schedule.length - shown.length;
  const steps = shown
    .map(
      (step, i) =>
        `<span class="course-card__route-step"><span class="course-card__route-num">${i + 1}</span>${step.spot ?? ""}</span>`
    )
    .join(`<span class="course-card__route-arrow">›</span>`);
  const more = remaining > 0 ? `<span class="course-card__route-more">+${remaining}</span>` : "";
  return `<div class="course-card__route">${steps}${more}</div>`;
}

function courseCardHtml(course) {
  const durationDays = extractDurationDays(course.duration_label);
  const difficulty = computeDifficulty(course);
  const tags = course.tags ?? [];
  const schedule = course.schedule ?? [];

  const imageHtml = course.image_url
    ? `<img src="${course.image_url}" alt="${course.title_ja}" loading="lazy" onerror="this.style.display='none'" />`
    : "";
  const ratingHtml =
    course.rating != null ? `<span class="course-card__rating">${ICONS.star}<span>${course.rating}</span></span>` : "";
  const tagsOverlay = tags.length
    ? `<div class="course-card__tags-overlay">${tags
        .slice(0, 3)
        .map((t) => `<span>${t}</span>`)
        .join("")}</div>`
    : "";

  return `
    <a class="course-card" href="course-detail.html?id=${encodeURIComponent(course.id)}">
      <div class="course-card__image">
        ${imageHtml}
        ${ratingHtml}
        ${tagsOverlay}
      </div>
      <div class="course-card__body">
        <div class="course-card__head">
          <p class="course-card__title">${course.title_ja}</p>
          <span class="course-card__difficulty" style="background:${difficulty.color}20;color:${difficulty.color}">${difficulty.label}</span>
        </div>
        ${course.subtitle_ja ? `<p class="course-card__subtitle">${course.subtitle_ja}</p>` : ""}
        ${course.description_ja ? `<p class="course-card__desc">${course.description_ja}</p>` : ""}
        <div class="course-card__meta">
          <span>${ICONS.clock}${durationDays}</span>
          <span>${ICONS.wallet}${course.budget_label ?? ""}</span>
          <span>${ICONS.mapPin}${schedule.length}スポット</span>
        </div>
        ${routePreviewHtml(schedule)}
      </div>
    </a>
  `;
}

export async function renderCoursesPage(root) {
  root.innerHTML = `
    <div class="app-main__inner courses-page">
      <h1 class="courses-page__title">おすすめコース</h1>

      <div class="category-area-filter" data-budget-filter></div>
      <div class="category-area-filter" data-duration-filter></div>

      <p class="category-count" data-count></p>
      <div class="courses-list" data-results>
        ${Array.from({ length: 3 })
          .map(
            () => `
              <div class="course-card course-card--skeleton">
                <div class="skeleton" style="height:120px;"></div>
                <div style="padding:12px;display:flex;flex-direction:column;gap:8px;">
                  <div class="skeleton" style="height:14px;width:60%;"></div>
                  <div class="skeleton" style="height:11px;width:40%;"></div>
                </div>
              </div>
            `
          )
          .join("")}
      </div>
    </div>
  `;

  const budgetFilterEl = root.querySelector("[data-budget-filter]");
  const durationFilterEl = root.querySelector("[data-duration-filter]");
  const countEl = root.querySelector("[data-count]");
  const resultsEl = root.querySelector("[data-results]");

  if (!supabase) {
    resultsEl.innerHTML = `<div class="state-message"><p>Supabase 설정이 필요합니다 (js/config.js).</p></div>`;
    return;
  }

  const { data, error } = await fetchAllCourses();

  if (error) {
    resultsEl.innerHTML = `
      <div class="state-message">
        <p>データの読み込みに失敗しました。</p>
        <button type="button" class="state-message__retry" data-retry>再試行</button>
      </div>
    `;
    resultsEl.querySelector("[data-retry]").addEventListener("click", () => renderCoursesPage(root));
    return;
  }

  const allCourses = (data ?? []).map((c) => ({ ...c, _durationDays: extractDurationDays(c.duration_label) }));
  let activeBudget = ALL;
  let activeDuration = ALL;

  function renderBudgetFilter() {
    const levels = [ALL, ...new Set(allCourses.map((c) => c.budget_level).filter(Boolean))];
    budgetFilterEl.innerHTML = levels
      .map((level) => {
        const isActive = level === activeBudget;
        const label = level === ALL ? level : BUDGET_LEVEL_LABEL[level] ?? `Lv${level}`;
        const style = isActive ? `background:var(--color-primary);color:#fff;border-color:var(--color-primary)` : "";
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-budget="${level}" style="${style}">${label}</button>`;
      })
      .join("");
    budgetFilterEl.querySelectorAll("[data-budget]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeBudget = btn.dataset.budget === ALL ? ALL : Number(btn.dataset.budget);
        renderBudgetFilter();
        renderResults();
      });
    });
  }

  function renderDurationFilter() {
    const durations = [ALL, ...new Set(allCourses.map((c) => c._durationDays).filter(Boolean))];
    durationFilterEl.innerHTML = durations
      .map((d) => {
        const isActive = d === activeDuration;
        const style = isActive ? `background:var(--color-primary);color:#fff;border-color:var(--color-primary)` : "";
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-duration="${d}" style="${style}">${d}</button>`;
      })
      .join("");
    durationFilterEl.querySelectorAll("[data-duration]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeDuration = btn.dataset.duration;
        renderDurationFilter();
        renderResults();
      });
    });
  }

  function renderResults() {
    const filtered = allCourses.filter((c) => {
      const budgetOk = activeBudget === ALL || c.budget_level === activeBudget;
      const durationOk = activeDuration === ALL || c._durationDays === activeDuration;
      return budgetOk && durationOk;
    });
    countEl.textContent = `${filtered.length}件のコース`;
    resultsEl.className = "courses-list";
    resultsEl.innerHTML = filtered.length
      ? filtered.map((c) => courseCardHtml(c)).join("")
      : `
        <div class="category-empty">
          <p>条件に一致するコースが見つかりませんでした</p>
          <button type="button" class="category-empty__reset" data-reset-course-filter>フィルターをリセット</button>
        </div>
      `;

    const resetBtn = resultsEl.querySelector("[data-reset-course-filter]");
    resetBtn?.addEventListener("click", () => {
      activeBudget = ALL;
      activeDuration = ALL;
      renderBudgetFilter();
      renderDurationFilter();
      renderResults();
    });
  }

  renderBudgetFilter();
  renderDurationFilter();
  renderResults();
}
