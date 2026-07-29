import { supabase } from "../supabaseClient.js";
import { CONFIG } from "../config.js";
import { fetchMappableSpots } from "../api/spots.js";
import { fetchCourseById } from "../api/courses.js";
import { CATEGORY_META } from "../constants/categories.js";

const ICONS = {
  locate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" width="11" height="11"><path d="M12 2.5 15 9l7 .9-5.1 4.7L18.2 21 12 17.3 5.8 21l1.3-6.4L2 9.9 9 9z"/></svg>',
};

const ALL_CATEGORIES = "すべて";
const BUSAN_CENTER = { lat: 35.1796, lng: 129.0756 };
const MOBILE_BREAKPOINT = 768;

function loadNaverMapsSdk(clientId) {
  return new Promise((resolve, reject) => {
    if (window.naver?.maps) {
      resolve(window.naver);
      return;
    }
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${encodeURIComponent(clientId)}`;
    script.onload = () => resolve(window.naver);
    script.onerror = () => reject(new Error("failed to load naver maps sdk"));
    document.head.appendChild(script);
  });
}

function markerIconHtml(color) {
  return {
    content: `<div style="width:22px;height:22px;border-radius:50% 50% 50% 0;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);transform:rotate(-45deg);"></div>`,
    size: new window.naver.maps.Size(22, 22),
    anchor: new window.naver.maps.Point(11, 22),
  };
}

function numberedMarkerIcon(naver, number) {
  return {
    content: `<div style="width:26px;height:26px;border-radius:50%;background:#2b9bf4;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#fff;font-size:12px;font-weight:700;">${number}</div>`,
    size: new naver.maps.Size(26, 26),
    anchor: new naver.maps.Point(13, 13),
  };
}

function infoWindowHtml(spot, meta) {
  return `
    <div class="map-infowindow">
      <span class="map-infowindow__badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span>
      <p class="map-infowindow__name">${spot.name_ja}</p>
      <p class="map-infowindow__area">${spot.area ?? ""}</p>
      <a class="map-infowindow__link" href="/pages/spot-detail.html?id=${encodeURIComponent(spot.id)}">詳細を見る →</a>
    </div>
  `;
}

function routeStepInfoWindowHtml(step) {
  const link = step.spot_id
    ? `<a class="map-infowindow__link" href="/pages/spot-detail.html?id=${encodeURIComponent(step.spot_id)}">詳細を見る →</a>`
    : "";
  return `
    <div class="map-infowindow">
      <span class="map-infowindow__badge" style="background:var(--color-primary-soft);color:var(--color-primary)">${step.time ?? ""}</span>
      <p class="map-infowindow__name">${step.spot ?? ""}</p>
      ${step.note ? `<p class="map-infowindow__area">${step.note}</p>` : ""}
      ${link}
    </div>
  `;
}

function listItemHtml(spot, meta) {
  const ratingHtml = spot.rating != null ? `<span class="map-list-item__rating">${ICONS.star}${spot.rating}</span>` : "";
  return `
    <button type="button" class="map-list-item" data-spot-id="${spot.id}">
      <img class="map-list-item__thumb" src="${spot.image_url ?? ""}" alt="" loading="lazy" />
      <div class="map-list-item__body">
        <p class="map-list-item__name">${spot.name_ja}</p>
        <div class="map-list-item__meta">
          <span class="map-list-item__badge" style="background:${meta.bg};color:${meta.color}">${meta.label}</span>
          <span>${spot.area ?? ""}</span>
        </div>
      </div>
      ${ratingHtml}
    </button>
  `;
}

export async function renderMapPage(root) {
  root.innerHTML = `
    <div class="map-page">
      <div class="map-panel" data-panel>
        <button type="button" class="map-panel__handle" data-sheet-handle aria-label="リストの表示切り替え"></button>
        <div class="map-route-banner" data-route-banner hidden></div>
        <div class="category-area-filter map-panel__filter" data-filter></div>
        <p class="category-count" data-count></p>
        <div class="map-panel__list" data-list></div>
      </div>
      <div class="map-canvas-wrap">
        <div id="naver-map" class="map-canvas"></div>
        <button type="button" class="map-locate-btn" data-locate aria-label="現在地">${ICONS.locate}</button>
      </div>
    </div>
  `;

  const filterEl = root.querySelector("[data-filter]");
  const countEl = root.querySelector("[data-count]");
  const listEl = root.querySelector("[data-list]");
  const canvasWrap = root.querySelector(".map-canvas-wrap");
  const panelEl = root.querySelector("[data-panel]");

  if (!CONFIG.NAVER_MAP_CLIENT_ID) {
    canvasWrap.innerHTML = `<div class="state-message">地図を表示するには js/config.js に NAVER_MAP_CLIENT_ID の設定が必要です。</div>`;
    return;
  }

  if (!supabase) {
    canvasWrap.innerHTML = `<div class="state-message">Supabase 설정이 필요합니다 (js/config.js).</div>`;
    return;
  }

  let naver;
  try {
    naver = await loadNaverMapsSdk(CONFIG.NAVER_MAP_CLIENT_ID);
  } catch {
    canvasWrap.innerHTML = `<div class="state-message">地図の読み込みに失敗しました。Client IDやサービスURL設定をご確認ください。</div>`;
    return;
  }

  const map = new naver.maps.Map("naver-map", {
    center: new naver.maps.LatLng(BUSAN_CENTER.lat, BUSAN_CENTER.lng),
    zoom: 12,
    zoomControl: true,
    zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
  });

  const infoWindow = new naver.maps.InfoWindow({ anchorSkew: true });
  let currentLocationMarker = null;
  const markersBySpotId = new Map();

  const { data: spots, error } = await fetchMappableSpots();

  if (error) {
    listEl.innerHTML = `<p class="state-message">スポット情報の読み込みに失敗しました。</p>`;
    return;
  }

  const allSpots = spots ?? [];
  let activeCategory = ALL_CATEGORIES;

  allSpots.forEach((spot) => {
    const meta = CATEGORY_META[spot.category] ?? CATEGORY_META.tourist;
    const marker = new naver.maps.Marker({
      position: new naver.maps.LatLng(spot.lat, spot.lng),
      map,
      icon: markerIconHtml(meta.color),
      title: spot.name_ja,
    });
    naver.maps.Event.addListener(marker, "click", () => focusSpot(spot, marker));
    markersBySpotId.set(spot.id, marker);
  });

  function focusSpot(spot, marker) {
    const meta = CATEGORY_META[spot.category] ?? CATEGORY_META.tourist;
    map.panTo(marker.getPosition());
    infoWindow.setContent(infoWindowHtml(spot, meta));
    infoWindow.open(map, marker);
    collapseSheet();
  }

  function renderFilter() {
    const categories = [ALL_CATEGORIES, ...new Set(allSpots.map((s) => s.category).filter(Boolean))];
    filterEl.innerHTML = categories
      .map((cat) => {
        const isActive = cat === activeCategory;
        const label = cat === ALL_CATEGORIES ? cat : CATEGORY_META[cat]?.label ?? cat;
        const style = isActive ? `background:var(--color-primary);color:#fff;border-color:var(--color-primary)` : "";
        return `<button type="button" class="category-chip${isActive ? " is-active" : ""}" data-cat="${cat}" style="${style}">${label}</button>`;
      })
      .join("");
    filterEl.querySelectorAll("[data-cat]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.dataset.cat;
        renderFilter();
        applyFilter();
      });
    });
  }

  function applyFilter() {
    const filtered =
      activeCategory === ALL_CATEGORIES ? allSpots : allSpots.filter((s) => s.category === activeCategory);
    countEl.textContent = `${filtered.length}件のスポット`;

    markersBySpotId.forEach((marker, id) => {
      const visible = activeCategory === ALL_CATEGORIES || allSpots.find((s) => s.id === id)?.category === activeCategory;
      marker.setVisible(visible);
    });

    listEl.innerHTML = filtered.length
      ? filtered.map((spot) => listItemHtml(spot, CATEGORY_META[spot.category] ?? CATEGORY_META.tourist)).join("")
      : `<p class="state-message">該当するスポットがありません。</p>`;

    listEl.querySelectorAll("[data-spot-id]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const spot = allSpots.find((s) => s.id === btn.dataset.spotId);
        const marker = markersBySpotId.get(btn.dataset.spotId);
        if (spot && marker) focusSpot(spot, marker);
      });
    });
  }

  renderFilter();
  applyFilter();

  // ---- 現在地ボタン ----
  root.querySelector("[data-locate]").addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("この端末では現在地取得に対応していません。");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const latlng = new naver.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
        map.setCenter(latlng);
        map.setZoom(15);
        if (currentLocationMarker) currentLocationMarker.setMap(null);
        currentLocationMarker = new naver.maps.Marker({
          position: latlng,
          map,
          icon: {
            content:
              '<div style="width:16px;height:16px;border-radius:50%;background:#2b9bf4;border:3px solid #fff;box-shadow:0 0 0 4px rgba(43,155,244,.3)"></div>',
            size: new naver.maps.Size(16, 16),
            anchor: new naver.maps.Point(8, 8),
          },
        });
      },
      () => alert("現在地を取得できませんでした。位置情報の利用を許可してください。"),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  });

  // ---- モバイル用ボトムシート drag ----
  const handle = root.querySelector("[data-sheet-handle]");
  let dragStartY = 0;
  let dragging = false;

  function isMobile() {
    return window.innerWidth < MOBILE_BREAKPOINT;
  }

  function expandSheet() {
    if (isMobile()) panelEl.classList.add("is-expanded");
  }

  function collapseSheet() {
    if (isMobile()) panelEl.classList.remove("is-expanded");
  }

  handle.addEventListener("click", () => {
    panelEl.classList.toggle("is-expanded");
  });

  handle.addEventListener("pointerdown", (e) => {
    if (!isMobile()) return;
    dragging = true;
    dragStartY = e.clientY;
    panelEl.style.transition = "none";
    handle.setPointerCapture(e.pointerId);
  });

  handle.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const delta = e.clientY - dragStartY;
    const isExpanded = panelEl.classList.contains("is-expanded");
    const base = isExpanded ? 0 : panelEl.offsetHeight - 96;
    const next = Math.min(Math.max(base + delta, 0), panelEl.offsetHeight - 96);
    panelEl.style.transform = `translateY(${next}px)`;
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    panelEl.style.transition = "";
    panelEl.style.transform = "";
    const delta = e.clientY - dragStartY;
    if (delta < -40) expandSheet();
    else if (delta > 40) collapseSheet();
  }

  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);

  // ---- コースの動線表示 ----
  let routeMarkers = [];
  let routePolyline = null;
  const routeBannerEl = root.querySelector("[data-route-banner]");

  function clearRoute() {
    routeMarkers.forEach((m) => m.setMap(null));
    routeMarkers = [];
    routePolyline?.setMap(null);
    routePolyline = null;
    routeBannerEl.hidden = true;
    routeBannerEl.innerHTML = "";
    // ルート表示中に隠していた通常のカテゴリマーカーを、現在のフィルター状態に合わせて戻す
    applyFilter();
  }

  async function showCourseRoute(courseId) {
    const { data: course } = await fetchCourseById(courseId);
    if (!course) return;

    // spot_ids 같은 별도 배열이 아니라 schedule에 직접 들어있는 좌표를 그대로 쓴다.
    // (spots 테이블에 등록되지 않은 경유지도 문제없이 표시된다)
    const steps = (course.schedule ?? []).filter((s) => s.lat != null && s.lng != null);
    if (!steps.length) return;

    clearRoute();

    // 番号マーカーと通常のカテゴリマーカーが同じ座標で重なって見えるため、
    // ルート表示中は通常マーカーを全部隠す(スポットは左のリストで確認できる)。
    markersBySpotId.forEach((marker) => marker.setVisible(false));

    routeMarkers = steps.map((step, i) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(step.lat, step.lng),
        map,
        icon: numberedMarkerIcon(naver, i + 1),
        zIndex: 200,
      });
      naver.maps.Event.addListener(marker, "click", () => {
        infoWindow.setContent(routeStepInfoWindowHtml(step));
        infoWindow.open(map, marker);
      });
      return marker;
    });

    const path = steps.map((step) => new naver.maps.LatLng(step.lat, step.lng));
    routePolyline = new naver.maps.Polyline({
      map,
      path,
      strokeColor: "#2b9bf4",
      strokeWeight: 4,
      strokeStyle: "shortdash",
      strokeLineCap: "round",
    });

    const bounds = new naver.maps.LatLngBounds(path[0], path[0]);
    path.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

    routeBannerEl.hidden = false;
    routeBannerEl.innerHTML = `
      <span>${course.title_ja} のルート（${steps.length}カ所）</span>
      <button type="button" data-clear-route aria-label="ルート表示を閉じる">×</button>
    `;
    routeBannerEl.querySelector("[data-clear-route]").addEventListener("click", clearRoute);
    expandSheet();
  }

  // ---- spot-detail/course-detail에서 넘어온 경우 ----
  const params = new URLSearchParams(window.location.search);
  const courseId = params.get("course");
  const focusId = params.get("spot");

  if (courseId) {
    showCourseRoute(courseId);
  } else if (focusId) {
    const spot = allSpots.find((s) => s.id === focusId);
    const marker = markersBySpotId.get(focusId);
    if (spot && marker) {
      map.setCenter(marker.getPosition());
      map.setZoom(15);
      naver.maps.Event.once(map, "idle", () => focusSpot(spot, marker));
    }
  }
}
