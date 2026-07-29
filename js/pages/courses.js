import { supabase } from "../supabaseClient.js";
import { fetchAllCourses } from "../api/courses.js";

const ALL = "すべて";
const BUDGET_LEVEL_LABEL = { 1: "節約", 2: "標準", 3: "ゆったり" };

function extractDurationDays(durationLabel) {
  const match = durationLabel?.match(/^(\d+)日/);
  return match ? `${match[1]}日` : durationLabel ?? "";
}

// 코스 대표 이미지: courses 테이블에 image_url 컬럼이 없어(Phase 2 스키마 기준)
// 단색 그라디언트 플레이스홀더로 대체한다.
function coursePlaceholderStyle(seed) {
  const hues = [204, 24, 152, 280];
  const hue = hues[seed % hues.length];
  return `background:linear-gradient(135deg, hsl(${hue} 70% 55%) 0%, hsl(${hue} 70% 40%) 100%)`;
}

function courseCardHtml(course, index) {
  const durationDays = extractDurationDays(course.duration_label);
  const budgetLabel = BUDGET_LEVEL_LABEL[course.budget_level] ?? "";
  return `
    <a class="course-card" href="/pages/course-detail.html?id=${encodeURIComponent(course.id)}">
      <div class="course-card__image" style="${coursePlaceholderStyle(index)}">
        <span>${course.duration_label ?? ""}</span>
      </div>
      <div class="course-card__body">
        <p class="course-card__title">${course.title_ja}</p>
        ${course.subtitle_ja ? `<p class="course-card__subtitle">${course.subtitle_ja}</p>` : ""}
        <div class="course-card__meta">
          ${budgetLabel ? `<span class="course-card__pill">${budgetLabel}</span>` : ""}
          <span>${course.budget_label ?? ""}</span>
          <span>${(course.schedule ?? []).length}スポット</span>
        </div>
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
      ? filtered.map((c, i) => courseCardHtml(c, i)).join("")
      : `<p class="state-message">条件に一致するコースが見つかりませんでした。</p>`;
  }

  renderBudgetFilter();
  renderDurationFilter();
  renderResults();
}
