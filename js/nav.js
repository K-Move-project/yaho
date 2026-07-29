/**
 * 공통 헤더 / 하단 탭바(모바일) / 인라인 탭(데스크톱) 주입 모듈.
 * 각 페이지는 <div id="app-header"></div>, <div id="app-tabbar"></div>를
 * 마크업에 두고, 아래처럼 호출한다:
 *
 *   import { initNav } from '/js/nav.js';
 *   initNav('home');       // 홈 탭 활성화
 *   initNav(null);          // 탭에 속하지 않는 상세 페이지 (뒤로가기는 각 페이지에서 자체 구현)
 */

const ICONS = {
  logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 15c1.6 1.2 3.2 1.2 4.8 0 1.6-1.2 3.2-1.2 4.8 0 1.6 1.2 3.2 1.2 4.8 0 1.6-1.2 3.2-1.2 4.8 0"/><path d="M2 19c1.6 1.2 3.2 1.2 4.8 0 1.6-1.2 3.2-1.2 4.8 0 1.6 1.2 3.2 1.2 4.8 0 1.6-1.2 3.2-1.2 4.8 0"/><path d="M7 11c-1.5-1.7-1.5-4.3 0-6 1.8 1 3 2.8 3 5 2-2 2-5 0-7"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V20a1 1 0 0 0 1 1H9v-6h6v6h2.5a1 1 0 0 0 1-1V9.5"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.1 5.6a2 2 0 0 0 1.8 0l3.6-1.8A1 1 0 0 1 21 4.6v12.8a1 1 0 0 1-.6.9l-4.5 2.3a2 2 0 0 1-1.8 0l-4.2-2.1a2 2 0 0 0-1.8 0l-3.7 1.8A1 1 0 0 1 3 19.4V6.6a1 1 0 0 1 .6-.9l4.5-2.3a2 2 0 0 1 1.8 0z"/><path d="M15 5.8v15"/><path d="M9 3.2v15"/></svg>',
  events: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/></svg>',
  courses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 21 3 13 21 11 13 3 11"/></svg>',
};

const TABS = [
  { key: "home", label: "ホーム", href: "/index.html", icon: ICONS.home },
  { key: "map", label: "地図", href: "/pages/map.html", icon: ICONS.map },
  { key: "events", label: "行事・お祭り", href: "/pages/events.html", icon: ICONS.events },
  { key: "courses", label: "おすすめコース", href: "/pages/courses.html", icon: ICONS.courses },
];

function renderHeader(activePage) {
  const navItems = TABS.map((tab) => {
    const isActive = tab.key === activePage;
    return `
      <a class="app-header__nav-item${isActive ? " is-active" : ""}" href="${tab.href}">
        ${tab.icon}
        <span>${tab.label}</span>
      </a>
    `;
  }).join("");

  return `
    <header class="app-header">
      <a class="app-header__brand" href="/index.html">
        <span class="app-header__logo">${ICONS.logo}</span>
        <span>
          <span class="app-header__title">釜山 야-호-</span><br />
          <span class="app-header__subtitle">BUSAN TRAVEL GUIDE</span>
        </span>
      </a>
      <nav class="app-header__nav">${navItems}</nav>
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
 * @param {'home'|'map'|'events'|'courses'|null} activePage 활성 탭 (탭에 속하지 않는 상세 페이지는 null)
 */
export function initNav(activePage = null) {
  const headerEl = document.getElementById("app-header");
  const tabbarEl = document.getElementById("app-tabbar");

  if (headerEl) {
    headerEl.outerHTML = renderHeader(activePage);
  }
  if (tabbarEl) {
    tabbarEl.outerHTML = renderTabBar(activePage);
  }
}
