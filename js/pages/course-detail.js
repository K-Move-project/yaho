import { supabase } from "../supabaseClient.js";
import { fetchCourseById } from "../api/courses.js";
import { categoryMeta } from "../constants/categories.js";

const ICONS = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
  navigation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 21 3 13 21 11 13 3 11"/></svg>',
};

const BUDGET_LEVEL_LABEL = { 1: "節約", 2: "標準", 3: "ゆったり" };

function goBack() {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "courses.html";
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
    <div class="app-main__inner course-detail">
      <div class="skeleton" style="height:140px;border-radius:16px;"></div>
      <div class="skeleton" style="height:22px;width:60%;margin-top:16px;border-radius:6px;"></div>
      <div class="skeleton" style="height:120px;margin-top:16px;border-radius:12px;"></div>
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

function scheduleItemHtml(step) {
  const meta = categoryMeta(step.category);
  return `
    <li class="course-timeline__item">
      <div class="course-timeline__marker" style="background:${meta.color}"></div>
      <div class="course-timeline__content">
        <div class="course-timeline__head">
          <span class="course-timeline__time">${step.time ?? ""}</span>
          ${step.duration ? `<span class="course-timeline__duration">${step.duration}</span>` : ""}
        </div>
        <p class="course-timeline__spot">${step.spot ?? ""}</p>
        ${step.note ? `<p class="course-timeline__note">${step.note}</p>` : ""}
      </div>
    </li>
  `;
}

export async function renderCourseDetailPage(root) {
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("id");

  root.innerHTML = skeletonTemplate();
  root.querySelector("[data-back]")?.addEventListener("click", goBack);

  if (!supabase) {
    renderState(root, "Supabase 설정이 필요합니다 (js/config.js).");
    return;
  }

  if (!courseId) {
    renderState(root, "コースが指定されていません。");
    return;
  }

  const { data: course, error } = await fetchCourseById(courseId);

  if (error) {
    renderState(root, "データの読み込みに失敗しました。", () => renderCourseDetailPage(root));
    return;
  }

  if (!course) {
    renderState(root, "コースが見つかりませんでした。");
    return;
  }

  document.title = `${course.title_ja} | 釜山やっほー`;
  const budgetLabel = BUDGET_LEVEL_LABEL[course.budget_level] ?? "";
  const schedule = Array.isArray(course.schedule) ? course.schedule : [];
  const tips = course.tips_ja ?? [];

  root.innerHTML = `
    ${topbarTemplate(course.title_ja)}
    <div class="app-main__inner course-detail">
      <div class="course-detail__hero">
        <h1 class="course-detail__title">${course.title_ja}</h1>
        ${course.subtitle_ja ? `<p class="course-detail__subtitle">${course.subtitle_ja}</p>` : ""}
      </div>

      <div class="course-detail__badges">
        ${budgetLabel ? `<span class="course-detail__badge">${budgetLabel}</span>` : ""}
        ${course.duration_label ? `<span class="course-detail__badge">${course.duration_label}</span>` : ""}
        ${course.budget_label ? `<span class="course-detail__badge course-detail__badge--muted">${course.budget_label}</span>` : ""}
      </div>

      ${
        schedule.length
          ? `
        <h2 class="course-detail__section-title">スケジュール</h2>
        <ol class="course-timeline">${schedule.map(scheduleItemHtml).join("")}</ol>
      `
          : ""
      }

      ${
        tips.length
          ? `
        <h2 class="course-detail__section-title">旅のヒント</h2>
        <ul class="course-detail__tips">${tips.map((tip) => `<li>${tip}</li>`).join("")}</ul>
      `
          : ""
      }

      <a class="course-detail__map-cta" href="map.html?course=${encodeURIComponent(course.id)}">
        ${ICONS.navigation}<span>地図でルートを見る</span>
      </a>
    </div>
  `;

  root.querySelector("[data-back]").addEventListener("click", goBack);
}
