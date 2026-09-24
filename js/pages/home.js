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
      message: "Here are the markets opening soonest.",
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
    title: "FreshFind — Discover Local Farmers Markets",
    description:
      "Find nearby farmers markets, check hours, browse produce, and plan your visit with FreshFind.",
    path: "/",
  });

  $("#main-content").html(`
    <div class="container py-4">
      <div class="home-intro mb-5">
        <p class="section-heading__eyebrow mb-1">Fresh All Along</p>
        <h1 class="mb-2">Find a farmers market near you</h1>
        <p class="text-muted mb-0" style="max-width: 60ch;">
          FreshFind helps you discover local markets, see what's open right now, and know what's typically in season —
          all from a single static dataset. <span id="home-clock"></span>
        </p>
      </div>

      <form id="quick-find-form" class="row g-3 align-items-end mb-5 p-3 bg-white border rounded-4">
        <div class="col-md-4">
          <label class="form-label small" for="quick-find-search">Find a market near you</label>
          <input type="search" class="form-control" id="quick-find-search" placeholder="Market name, area, produce…">
        </div>
        <div class="col-md-3">
          <label class="form-label small" for="quick-find-area">Area</label>
          <select class="form-select" id="quick-find-area">
            <option value="">All areas</option>
            ${areas.map((a) => `<option value="${a}">${a}</option>`).join("")}
          </select>
        </div>
        <div class="col-md-3">
          <label class="form-label small" for="quick-find-day">Day</label>
          <select class="form-select" id="quick-find-day">
            <option value="">Any day</option>
            ${DAYS_OF_WEEK.map((d) => `<option value="${d}">${d}</option>`).join("")}
          </select>
        </div>
        <div class="col-md-2">
          <button type="submit" class="btn btn-success w-100">Search</button>
        </div>
      </form>

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
          "Produce typically available right now, according to the FreshFind dataset.",
        actionsHtml: `<a href="#/produce" class="btn btn-outline-secondary btn-sm">Browse Produce Guide</a>`,
      })}
      <div id="home-seasonal"></div>
    </div>
  `);

  $("#home-open-now").html(renderOpenNowSection(markets));
  $("#home-seasonal").html(renderSeasonalSection(produce));

  const stopClock = onEveryMinute((now) => {
    $("#home-clock").text(
      `Right now it's ${formatClock(now)} on ${formatDayDate(now)}.`,
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

  return { cleanup: stopClock };
}
