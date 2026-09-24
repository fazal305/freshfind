import { getMarkets, getProduce } from "../data.js";
import { renderSectionHeading } from "../components/sectionHeading.js";
import { renderEmptyState } from "../components/emptyState.js";
import { renderMarketGrid } from "../components/marketCard.js";
import { searchMarkets } from "../utils/search.js";
import {
  filterMarkets,
  getUniqueAreas,
  DAYS_OF_WEEK,
} from "../utils/filter.js";
import { sortMarkets, SORT_OPTIONS } from "../utils/sort.js";
import { isMarketOpen } from "../utils/marketStatus.js";
import { setPageMeta } from "../utils/seo.js";
import { parseQuery, updateQuery } from "../utils/queryParams.js";
import { requestLocation } from "../utils/geolocation.js";

let markets = [];
let produce = [];
let produceById = {};
let userLocation = null;

function optionsHtml(values, selected, labelFn = (v) => v) {
  return values
    .map(
      (v) =>
        `<option value="${v}" ${v === selected ? "selected" : ""}>${labelFn(v)}</option>`,
    )
    .join("");
}

function applyAndRender(state) {
  const produceMap = produceById;
  let result = searchMarkets(markets, state.q, produceMap);
  result = filterMarkets(result, {
    area: state.area,
    day: state.day,
    produceId: state.produce,
  });
  if (state.openNow === "true") {
    result = result.filter((m) => isMarketOpen(m));
  }
  result = sortMarkets(result, state.sort || "alphabetical", userLocation);

  const activeFilters = [];
  if (state.area)
    activeFilters.push({ key: "area", label: `Area: ${state.area}` });
  if (state.day) activeFilters.push({ key: "day", label: `Day: ${state.day}` });
  if (state.produce)
    activeFilters.push({
      key: "produce",
      label: `Produce: ${produceMap[state.produce]?.name ?? state.produce}`,
    });
  if (state.openNow === "true")
    activeFilters.push({ key: "openNow", label: "Open now" });

  const chips = activeFilters
    .map(
      (f) =>
        `<button type="button" class="btn btn-sm btn-outline-secondary me-2 mb-2" data-clear="${f.key}">${f.label} &times;</button>`,
    )
    .join("");

  $("#market-results-count").text(
    `${result.length} market${result.length === 1 ? "" : "s"} found`,
  );
  $("#market-active-filters").html(chips);
  $("#market-results").html(
    result.length
      ? renderMarketGrid(result, userLocation)
      : renderEmptyState({
          title: "Nothing matched your search.",
          message:
            "Try a different area, day, or produce type — or clear your filters to see every market.",
          actionsHtml: `<button type="button" class="btn btn-success" id="clear-all-filters">Clear filters</button>`,
        }),
  );
}

function getState() {
  return parseQuery();
}

function setDistanceOptionEnabled(enabled) {
  const option = $('#sort-by option[value="distance"]');
  option.prop("disabled", !enabled);
  option.text(enabled ? "Distance" : "Distance (needs location)");
}

export async function renderMarketDirectory() {
  [markets, produce] = await Promise.all([getMarkets(), getProduce()]);
  produceById = Object.fromEntries(produce.map((p) => [p.id, p]));
  userLocation = null;

  setPageMeta({
    title: "FreshFind — Market Directory",
    description:
      "Browse, search, and filter every farmers market in the FreshFind directory.",
    path: "/markets",
  });

  const areas = getUniqueAreas(markets);
  const state = getState();

  $("#main-content").html(`
    <div class="container py-4">
      ${renderSectionHeading({
        level: "h1",
        title: "Market Directory",
        description: "Search and filter markets by area, day, and produce.",
        actionsHtml: `<button type="button" class="btn btn-outline-success btn-sm" id="use-location">Find markets near me</button>`,
      })}

      <p class="small text-muted" id="location-feedback" aria-live="polite"></p>

      <form class="row g-3 align-items-end mb-3" id="market-filters">
        <div class="col-md-4">
          <label class="form-label small" for="market-search">Search</label>
          <input type="search" class="form-control" id="market-search" placeholder="Market name, area, produce…" value="${state.q ?? ""}">
        </div>
        <div class="col-md-2">
          <label class="form-label small" for="filter-area">Area</label>
          <select class="form-select" id="filter-area">
            <option value="">All areas</option>
            ${optionsHtml(areas, state.area)}
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small" for="filter-day">Day</label>
          <select class="form-select" id="filter-day">
            <option value="">Any day</option>
            ${optionsHtml(DAYS_OF_WEEK, state.day)}
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small" for="filter-produce">Produce</label>
          <select class="form-select" id="filter-produce">
            <option value="">Any produce</option>
            ${optionsHtml(
              produce.map((p) => p.id),
              state.produce,
              (id) => produceById[id].name,
            )}
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small" for="sort-by">Sort by</label>
          <select class="form-select" id="sort-by">
            ${SORT_OPTIONS.filter((o) => !o.requiresLocation)
              .map(
                (o) =>
                  `<option value="${o.value}" ${o.value === (state.sort || "alphabetical") ? "selected" : ""}>${o.label}</option>`,
              )
              .join("")}
            <option value="distance" disabled>Distance (needs location)</option>
          </select>
        </div>
        <div class="col-12">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="filter-open-now" ${state.openNow === "true" ? "checked" : ""}>
            <label class="form-check-label small" for="filter-open-now">Open right now only</label>
          </div>
        </div>
      </form>

      <h2 class="visually-hidden">Search results</h2>
      <div id="market-active-filters" class="mb-2"></div>
      <p class="text-muted small" id="market-results-count"></p>
      <div id="market-results"></div>
    </div>
  `);

  applyAndRender(state);

  const updateFromForm = () => {
    updateQuery({
      q: $("#market-search").val(),
      area: $("#filter-area").val(),
      day: $("#filter-day").val(),
      produce: $("#filter-produce").val(),
      sort: $("#sort-by").val(),
      openNow: $("#filter-open-now").is(":checked") ? "true" : "",
    });
  };

  $("#market-search").on("input", updateFromForm);
  $(
    "#filter-area, #filter-day, #filter-produce, #sort-by, #filter-open-now",
  ).on("change", updateFromForm);

  $("#market-results").on("click", "#clear-all-filters", () => updateQuery({}));
  $("#market-active-filters").on("click", "[data-clear]", function () {
    const key = $(this).data("clear");
    const next = { ...getState() };
    delete next[key];
    updateQuery(next);
  });

  $("#use-location").on("click", async function () {
    const button = $(this);
    button.prop("disabled", true).text("Finding your location…");
    $("#location-feedback").text("");

    try {
      userLocation = await requestLocation();
      setDistanceOptionEnabled(true);
      $("#sort-by").val("distance");
      updateFromForm();
      $("#location-feedback").text(
        "Showing distance from your current location.",
      );
    } catch (error) {
      const messages = {
        denied:
          "Location access is unavailable. You can still search markets by area.",
        unsupported:
          "Your browser doesn't support location lookup. You can still search markets by area.",
        unavailable:
          "We couldn't determine your location right now. You can still search markets by area.",
      };
      $("#location-feedback").text(
        messages[error.code] ?? messages.unavailable,
      );
    } finally {
      button.prop("disabled", false).text("Find markets near me");
    }
  });

  return (nextState) => {
    if (document.activeElement?.id !== "market-search") {
      $("#market-search").val(nextState.q ?? "");
    }
    $("#filter-area").val(nextState.area ?? "");
    $("#filter-day").val(nextState.day ?? "");
    $("#filter-produce").val(nextState.produce ?? "");
    $("#sort-by").val(nextState.sort ?? "alphabetical");
    $("#filter-open-now").prop("checked", nextState.openNow === "true");
    setDistanceOptionEnabled(Boolean(userLocation));
    applyAndRender(nextState);
  };
}
