/**
 * 공통 헤더 / 하단 탭바 주입 모듈.
 * 각 페이지는 <div id="app-header"></div>, <div id="app-tabbar"></div>를
 * 마크업에 두고, 아래처럼 호출한다:
 *
 *   import { initNav } from '/js/nav.js';
 *   initNav({ page: 'home', title: '釜山やっほー' });
 *   initNav({ page: null, title: 'スポット詳細', showBack: true });
 */

const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1v-9"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
  events: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
  courses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M6 17V13a4 4 0 0 1 4-4h4a4 4 0 0 0 4-4"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>',
};

const TABS = [
  { key: "home", label: "ホーム", href: "/index.html", icon: ICONS.home },
  { key: "map", label: "地図", href: "/pages/map.html", icon: ICONS.map },
  { key: "events", label: "イベント", href: "/pages/events.html", icon: ICONS.events },
  { key: "courses", label: "コース", href: "/pages/courses.html", icon: ICONS.courses },
];

function renderHeader({ title, showBack }) {
  const backButton = showBack
    ? `<button type="button" class="app-header__back" data-nav-back aria-label="戻る">${ICONS.back}</button>`
    : "";
  return `
    <header class="app-header">
      ${backButton}
      <span class="app-header__title">${title}</span>
    </header>
  `;
}

function renderTabBar(activePage) {
  const items = TABS.map((tab) => {
    const isActive = tab.key === activePage;
    return `
      <a class="app-tabbar__item${isActive ? " is-active" : ""}" href="${tab.href}">
        ${tab.icon}
        <span>${tab.label}</span>
      </a>
    `;
  }).join("");
  return `<nav class="app-tabbar">${items}</nav>`;
}

/**
 * @param {Object} options
 * @param {string} options.title 헤더에 표시할 제목
 * @param {'home'|'map'|'events'|'courses'|null} [options.page] 활성 탭 (탭에 속하지 않는 상세 페이지는 null)
 * @param {boolean} [options.showBack] 뒤로가기 버튼 표시 여부
 */
export function initNav({ title, page = null, showBack = false }) {
  const headerEl = document.getElementById("app-header");
  const tabbarEl = document.getElementById("app-tabbar");

  if (headerEl) {
    headerEl.outerHTML = renderHeader({ title, showBack });
  }
  if (tabbarEl) {
    tabbarEl.outerHTML = renderTabBar(page);
  }

  if (showBack) {
    const backBtn = document.querySelector("[data-nav-back]");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.location.href = "/index.html";
        }
      });
    }
  }
}
