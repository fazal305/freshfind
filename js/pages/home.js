import { getMarkets, getProduce } from "../data.js";
import { setPageMeta } from "../utils/seo.js";
import { renderSectionHeading } from "../components/sectionHeading.js";
import { renderEmptyState } from "../components/emptyState.js";
import { renderMarketGrid } from "../components/marketCard.js";
import { renderProduceGrid } from "../components/produceCard.js";
import { isMarketOpen, getNextOpening } from "../utils/marketStatus.js";
import { isInSeason } from "../utils/seasonal.js";
import { getUniqueAreas, DAYS_OF_WEEK } from "../utils/filter.js";
import { onEveryMinute, formatClock, formatDayDate } from "../utils/clock.js";
import { navigate } from "../utils/queryParams.js";
import { observeReveals } from "../utils/scrollReveal.js";

function renderOpenNowSection(markets) {
  const open = markets.filter((m) => isMarketOpen(m));

  if (open.length) {
    return renderMarketGrid(open);
  }

  const soonest = [...markets].sort((a, b) => {
    const nextA = getNextOpening(a)?.daysFromNow ?? Infinity;
    const nextB = getNextOpening(b)?.daysFromNow ?? Infinity;
    return nextA - nextB;
  });

  return `
    ${renderEmptyState({
      title: "No markets are open right now.",
      message: "Here are the markets opening soonest across Karachi.",
    })}
    <div class="mt-4">${renderMarketGrid(soonest.slice(0, 3))}</div>
  `;
}

function renderSeasonalSection(produce) {
  const inSeason = produce.filter((p) => isInSeason(p));

  if (inSeason.length) {
    return renderProduceGrid(inSeason);
  }

  return renderEmptyState({
    title: "Nothing is marked in season this month.",
    message: "Browse the full produce guide to see what's coming up.",
    actionsHtml: `<a href="#/produce" class="btn btn-success">Browse Produce Guide</a>`,
  });
}

export async function renderHome() {
  const [markets, produce] = await Promise.all([getMarkets(), getProduce()]);
  const areas = getUniqueAreas(markets);

  setPageMeta({
    title: "FreshFind — Discover Local Farmers Markets in Karachi",
    description:
      "Find nearby farmers markets, check live hours, browse seasonal produce, and plan your visit with FreshFind.",
    path: "/",
  });

  $("#main-content").html(`
    <div class="container py-4">
      <div class="home-hero-banner position-relative rounded-4 overflow-hidden mb-5 text-white shadow">
        <picture>
          <source srcset="/assets/images/hero/hero-farmers-market.webp" type="image/webp" />
          <img 
            src="/assets/images/hero/hero-farmers-market.jpg" 
            alt="Abundant fresh farm harvest and farmers market" 
            class="home-hero-banner__img w-100 h-100 position-absolute inset-0"
            style="object-fit: cover;"
          />
        </picture>
        <div class="home-hero-banner__content position-relative p-4 p-md-5 d-flex flex-column justify-content-between h-100">
          <div>
            <span class="badge bg-warning text-dark fw-bold mb-2">eGreen Basket · Fresh All Along</span>
            <h1 class="display-5 fw-bold text-white mb-3">Discover Authentic Farmers Markets</h1>
            <p class="lead text-white-50 mb-4" style="max-width: 65ch;">
              Connect directly with local growers across Karachi. Check real-time market schedules, explore seasonal harvest, and build your visit checklist — all from a lightweight, private client-side application.
            </p>
          </div>

          <div class="d-flex flex-wrap align-items-center gap-3 text-white-50 small">
            <span class="badge bg-success bg-opacity-50 text-white p-2">📍 5 Local Bazaars</span>
            <span class="badge bg-success bg-opacity-50 text-white p-2">🥕 9 Seasonal Varieties</span>
            <span class="badge bg-success bg-opacity-50 text-white p-2">🧺 eGreen Trip Planner</span>
            <span class="ms-auto" id="home-clock"></span>
          </div>
        </div>
      </div>

      <div class="quick-find-box bg-white border rounded-4 p-4 shadow-sm mb-5">
        <h2 class="h5 mb-3 text-success">🔍 Find a Market Near You</h2>
        <form id="quick-find-form" class="row g-3 align-items-end">
          <div class="col-md-4">
            <label class="form-label small fw-semibold" for="quick-find-search">Search Keyword</label>
            <input type="search" class="form-control" id="quick-find-search" placeholder="Market name, area, or produce…">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold" for="quick-find-area">Area</label>
            <select class="form-select" id="quick-find-area">
              <option value="">All areas (Karachi)</option>
              ${areas.map((a) => `<option value="${a}">${a}</option>`).join("")}
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-semibold" for="quick-find-day">Day of Week</label>
            <select class="form-select" id="quick-find-day">
              <option value="">Any day</option>
              ${DAYS_OF_WEEK.map((d) => `<option value="${d}">${d}</option>`).join("")}
            </select>
          </div>
          <div class="col-md-2">
            <button type="submit" class="btn btn-success w-100">Find Markets</button>
          </div>
        </form>
      </div>

      ${renderSectionHeading({
        title: "Open Right Now",
        description:
          "Markets currently open, based on their listed hours and your browser's local time.",
        actionsHtml: `<a href="#/markets?openNow=true" class="btn btn-outline-secondary btn-sm">See all open markets</a>`,
      })}
      <div id="home-open-now" class="mb-5"></div>

      ${renderSectionHeading({
        title: "In Season This Month",
        description:
          "Fresh produce typically harvested and available right now at local markets.",
        actionsHtml: `<a href="#/produce" class="btn btn-outline-secondary btn-sm">Browse Produce Guide</a>`,
      })}
      <div id="home-seasonal" class="mb-5"></div>

      <div class="banner-cta card border-0 rounded-4 p-4 p-md-5 mb-4 text-white shadow-sm">
        <div class="row align-items-center g-4">
          <div class="col-md-8">
            <span class="badge bg-warning text-dark mb-2">New Feature</span>
            <h2 class="h3 text-white mb-2">Plan Your Visit with "eGreen Basket"</h2>
            <p class="text-white-50 mb-0">
              Add fresh produce to your basket, calculate estimated market costs in Pakistani Rupees, and generate an interactive market shopping checklist.
            </p>
          </div>
          <div class="col-md-4 text-md-end">
            <button type="button" class="btn btn-light btn-lg px-4" id="open-green-basket-btn-home">
              🧺 Open eGreen Basket
            </button>
          </div>
        </div>
      </div>
    </div>
  `);

  $("#home-open-now").html(renderOpenNowSection(markets));
  $("#home-seasonal").html(renderSeasonalSection(produce));
  observeReveals(document.getElementById("main-content"));

  const stopClock = onEveryMinute((now) => {
    $("#home-clock").text(
      `Local Time: ${formatClock(now)} (${formatDayDate(now)})`,
    );
  });

  $("#quick-find-form").on("submit", (e) => {
    e.preventDefault();
    const params = new URLSearchParams(
      Object.entries({
        q: $("#quick-find-search").val(),
        area: $("#quick-find-area").val(),
        day: $("#quick-find-day").val(),
      }).filter(([, v]) => v),
    );
    const queryString = params.toString();
    navigate(queryString ? `/markets?${queryString}` : "/markets");
  });

  $("#open-green-basket-btn-home").on("click", () => {
    const el = document.getElementById("greenBasketOffcanvas");
    if (el) {
      bootstrap.Offcanvas.getOrCreateInstance(el).show();
    }
  });

  return { cleanup: stopClock };
}
