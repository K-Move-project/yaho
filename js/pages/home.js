/**
 * 홈 화면(index.html) 렌더링.
 * Phase 1 시점에는 실 데이터 연동 전이므로, Figma HomePage.tsx의 mock 데이터를
 * 그대로 이식하지 않고 동일한 내용을 이 파일의 정적 JS 객체로 새로 정의해 사용한다.
 * 실제 Supabase 연동은 Phase 2 이후에 이 mock 데이터를 대체한다.
 */

import { CATEGORY_META } from "../constants/categories.js";

const ICONS = {
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>',
  navigation: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 21 3 13 21 11 13 3 11"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-7.1-7-12a7 7 0 0 1 14 0c0 4.9-7 12-7 12Z"/><circle cx="12" cy="9" r="2.4"/></svg>',
  chevronRight: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2.5 15 9l7 .9-5.1 4.7L18.2 21 12 17.3 5.8 21l1.3-6.4L2 9.9 9 9z"/></svg>',
  trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="16" rx="2"/><path d="M3.5 9.5h17M8 3v3M16 3v3"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>',
};

const CATEGORIES = Object.entries(CATEGORY_META).map(([id, meta]) => ({ id, ...meta }));

const POPULAR_AREAS = [
  {
    id: "gamcheon",
    name: "甘川文化村",
    tag: "フォトスポット",
    image: "https://images.unsplash.com/photo-1672671187899-a10f547341f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    score: 4.8,
    desc: "カラフルな壁画と路地が有名",
  },
  {
    id: "haeundae",
    name: "海雲台",
    tag: "ビーチ",
    image: "https://images.unsplash.com/photo-1591520284162-8e64eceebacf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    score: 4.7,
    desc: "韓国最大の海水浴場",
  },
  {
    id: "yeongdo",
    name: "影島",
    tag: "ローカル",
    image: "https://images.unsplash.com/photo-1724618194655-c3c12254d61c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    score: 4.6,
    desc: "穴場の絶景スカイウォーク",
  },
  {
    id: "gwangalli",
    name: "広安里",
    tag: "夜景",
    image: "https://images.unsplash.com/photo-1719176373099-ef363272af49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600",
    score: 4.6,
    desc: "広安大橋の夜景が絶景",
  },
];

const EVENTS = [
  {
    id: "ocean-festival",
    title: "釜山海洋祭り",
    date: "7/25 – 8/3",
    location: "海雲台",
    image: "https://images.unsplash.com/photo-1601900245655-7719650f5b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    status: "開催中",
  },
  {
    id: "biff",
    title: "釜山国際映画祭",
    date: "10/1 – 10/10",
    location: "南浦洞",
    image: "https://images.unsplash.com/photo-1776439287079-f95b22f287b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    status: "予定",
  },
  {
    id: "fireworks",
    title: "釜山花火祭り",
    date: "10/25",
    location: "広安里",
    image: "https://images.unsplash.com/photo-1695730435725-861079fcf917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    status: "予定",
  },
];

const COURSES = [
  {
    id: "cospa",
    title: "1日 コスパコース",
    subtitle: "予算・日程ベース",
    budget: "¥5,000〜",
    duration: "1日",
    spots: 5,
    image: "https://images.unsplash.com/photo-1628532429788-c35922b5e6c1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    id: "coastal",
    title: "2日 海沿いコース",
    subtitle: "絶景スポット巡り",
    budget: "¥8,000〜",
    duration: "2日",
    spots: 8,
    image: "https://images.unsplash.com/photo-1591520284162-8e64eceebacf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
  {
    id: "food-tour",
    title: "グルメ集中コース",
    subtitle: "釜山B級グルメ食べ歩き",
    budget: "¥6,000〜",
    duration: "1日",
    spots: 7,
    image: "https://images.unsplash.com/photo-1549282138-86f0a2e1b8ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
  },
];

function heroSection() {
  return `
    <section class="home-hero">
      <div class="app-main__inner home-hero__inner">
        <div class="home-hero__text">
          <p class="home-hero__eyebrow">釜山をもっと身近に、もっと楽しく</p>
          <h1 class="home-hero__title">日本語で巡る、<br class="home-hero__br" />釜山旅行ガイド</h1>
          <p class="home-hero__desc">言語の壁なく、釜山の魅力をすべて発見しよう</p>
          <form class="home-search" role="search">
            <span class="home-search__icon">${ICONS.search}</span>
            <input
              class="home-search__input"
              type="search"
              name="keyword"
              placeholder="検索（スポット・グルメ・エリア）"
              aria-label="検索"
            />
          </form>
          <button type="button" class="home-hero__geo" disabled>
            ${ICONS.navigation}
            <span>現在地周辺を探す</span>
          </button>
        </div>
        <a class="home-hero__map-card" href="pages/map.html">
          <div class="home-hero__map-preview">
            <span class="home-hero__map-pin">${ICONS.mapPin}</span>
            <p>地図で探す</p>
          </div>
          <div class="home-hero__map-cta">
            ${ICONS.mapPin}<span>地図を開く</span>${ICONS.chevronRight}
          </div>
        </a>
      </div>
    </section>
  `;
}

function categoriesSection() {
  const items = CATEGORIES.map(
    (cat) => `
      <a class="home-category" href="pages/category.html?id=${cat.id}">
        <span class="home-category__icon" style="background:${cat.bg};color:${cat.color}">${cat.icon}</span>
        <span class="home-category__label">${cat.label}</span>
      </a>
    `
  ).join("");

  return `
    <section class="app-main__inner home-section">
      <div class="home-category-grid">${items}</div>
    </section>
  `;
}

function areasSection() {
  const cards = POPULAR_AREAS.map(
    (area) => `
      <a class="home-area-card" href="pages/area-detail.html?id=${area.id}">
        <div class="home-area-card__image">
          <img src="${area.image}" alt="${area.name}" loading="lazy" />
          <span class="home-area-card__tag">${area.tag}</span>
        </div>
        <div class="home-area-card__body">
          <p class="home-area-card__name">${area.name}</p>
          <p class="home-area-card__desc">${area.desc}</p>
          <div class="home-area-card__score">${ICONS.star}<span>${area.score}</span></div>
        </div>
      </a>
    `
  ).join("");

  return `
    <section class="app-main__inner home-section">
      <div class="home-section__head">
        <h2>${ICONS.trendingUp}<span>人気の高いエリア</span></h2>
      </div>
      <div class="home-area-scroller">${cards}</div>
    </section>
  `;
}

function eventCard(event) {
  const isOngoing = event.status === "開催中";
  return `
    <a class="home-list-card" href="pages/event-detail.html?id=${event.id}">
      <div class="home-list-card__image">
        <img src="${event.image}" alt="${event.title}" loading="lazy" />
      </div>
      <div class="home-list-card__body">
        <span class="home-list-card__badge${isOngoing ? " is-ongoing" : ""}">${event.status}</span>
        <p class="home-list-card__title">${event.title}</p>
        <div class="home-list-card__meta">
          <span>${ICONS.clock}${event.date}</span>
          <span>${ICONS.mapPin}${event.location}</span>
        </div>
      </div>
    </a>
  `;
}

function courseCard(course) {
  return `
    <a class="home-list-card" href="pages/course-detail.html?id=${course.id}">
      <div class="home-list-card__image">
        <img src="${course.image}" alt="${course.title}" loading="lazy" />
      </div>
      <div class="home-list-card__body">
        <p class="home-list-card__title">${course.title}</p>
        <p class="home-list-card__subtitle">${course.subtitle}</p>
        <div class="home-list-card__meta">
          <span class="home-list-card__pill">${course.duration}</span>
          <span>${course.budget}</span>
          <span>${course.spots}スポット</span>
        </div>
      </div>
    </a>
  `;
}

function eventsAndCoursesSection() {
  return `
    <section class="app-main__inner home-section home-two-col">
      <div>
        <div class="home-section__head">
          <h2>${ICONS.calendar}<span>開催中の行事・お祭り</span></h2>
          <a class="home-section__more" href="pages/events.html">もっと見る${ICONS.chevronRight}</a>
        </div>
        <div class="home-list">${EVENTS.map(eventCard).join("")}</div>
      </div>
      <div>
        <div class="home-section__head">
          <h2>${ICONS.navigation}<span>おすすめコース</span></h2>
          <a class="home-section__more" href="pages/courses.html">もっと見る${ICONS.chevronRight}</a>
        </div>
        <div class="home-list">${COURSES.map(courseCard).join("")}</div>
      </div>
    </section>
  `;
}

export function renderHome(root) {
  root.innerHTML = [
    heroSection(),
    categoriesSection(),
    areasSection(),
    eventsAndCoursesSection(),
  ].join("");

  const searchForm = root.querySelector(".home-search");
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const keyword = new FormData(searchForm).get("keyword")?.toString().trim();
    if (keyword) {
      window.location.href = `pages/category.html?keyword=${encodeURIComponent(keyword)}`;
    }
  });
}
