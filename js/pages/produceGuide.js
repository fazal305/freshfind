import { getProduce } from "../data.js";
import { setPageMeta } from "../utils/seo.js";
import { renderSectionHeading } from "../components/sectionHeading.js";
import { renderEmptyState } from "../components/emptyState.js";
import { renderProduceGrid } from "../components/produceCard.js";
import {
  getUniqueCategories,
  searchProduce,
  filterProduceByCategory,
  isInSeason,
} from "../utils/seasonal.js";
import { parseQuery, updateQuery } from "../utils/queryParams.js";
import { observeReveals } from "../utils/scrollReveal.js";

let produce = [];
let currentViewMode = "grid"; // "grid" or "matrix"

const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function renderSeasonalityMatrix(items) {
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const rows = items
    .map((item) => {
      const pImg = item.image || "/assets/images/produce/desi-tamatar.webp";
      const itemPayload = JSON.stringify({
        id: item.id,
        slug: item.slug,
        name: item.name,
        category: item.category,
        approxPrice: item.approxPrice || "Market rate",
        unit: item.unit || "kg",
        image: pImg,
        marketIds: item.marketIds || [],
      }).replace(/"/g, "&quot;");

      const monthCells = MONTH_SHORT.map((m, idx) => {
        const monthNum = idx + 1;
        const isAvail = item.availableMonths.includes(monthNum);
        const isCurrent = monthNum === currentMonth;

        return `
        <td class="text-center align-middle ${isCurrent ? "table-active border-start border-end border-success fw-bold" : ""}">
          ${
            isAvail
              ? `<span class="badge bg-success rounded-pill px-2 py-1" title="${item.name} in ${m}">✓</span>`
              : `<span class="text-muted opacity-25">·</span>`
          }
        </td>
      `;
      }).join("");

      return `
      <tr>
        <td class="align-middle">
          <div class="d-flex align-items-center gap-2">
            <img src="${pImg}" alt="${item.name}" width="40" height="40" class="rounded" style="object-fit: cover;" loading="lazy">
            <div>
              <a href="#/produce/${item.slug}" class="fw-semibold text-decoration-none text-dark d-block">${item.name}</a>
              <small class="text-muted">${item.category}</small>
            </div>
          </div>
        </td>
        <td class="align-middle small fw-semibold text-success">${item.approxPrice || "—"}</td>
        ${monthCells}
        <td class="align-middle text-end">
          <button type="button" class="btn btn-outline-success btn-sm btn-add-to-basket py-1 px-2" data-produce="${itemPayload}">
            + Basket
          </button>
        </td>
      </tr>
    `;
    })
    .join("");

  return `
    <div class="table-responsive bg-white rounded-3 shadow-sm border p-2 mb-4">
      <table class="table table-hover align-middle mb-0 matrix-table">
        <thead class="table-light">
          <tr>
            <th scope="col" style="min-width: 180px;">Produce</th>
            <th scope="col" style="min-width: 110px;">Est. Rate</th>
            ${MONTH_SHORT.map(
              (m, i) => `
              <th scope="col" class="text-center small ${i + 1 === currentMonth ? "bg-success text-white rounded-top" : ""}" style="width: 45px;">
                ${m}${i + 1 === currentMonth ? "<br><small>Now</small>" : ""}
              </th>
            `,
            ).join("")}
            <th scope="col" class="text-end" style="min-width: 90px;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

function applyAndRender(state) {
  let result = searchProduce(produce, state.q);
  result = filterProduceByCategory(result, state.category);

  $("#produce-results-count").text(
    `${result.length} item${result.length === 1 ? "" : "s"} found`,
  );

  if (!result.length) {
    $("#produce-results").html(
      renderEmptyState({
        title: "Nothing matched your search.",
        message:
          "Try a different category or search term — or clear your filters to see the full guide.",
        actionsHtml: `<button type="button" class="btn btn-success" id="clear-produce-filters">Clear filters</button>`,
      }),
    );
    return;
  }

  if (currentViewMode === "matrix") {
    $("#produce-results").html(renderSeasonalityMatrix(result));
  } else {
    $("#produce-results").html(renderProduceGrid(result));
    observeReveals(document.getElementById("produce-results"));
  }
}

function getState() {
  return parseQuery();
}

export async function renderProduceGuide() {
  produce = await getProduce();
  const categories = getUniqueCategories(produce);
  const state = getState();

  setPageMeta({
    title: "FreshFind — Produce Guide & Seasonality Calendar",
    description:
      "Browse the FreshFind produce catalogue, authentic prices, and month-by-month seasonality matrix.",
    path: "/produce",
  });

  $("#main-content").html(`
    <div class="container py-4">
      <div class="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-3">
        ${renderSectionHeading({
          level: "h1",
          title: "Produce Guide & Seasonality",
          description:
            "Browse seasonal local produce, market prices, and annual harvest cycles.",
        })}

        <div class="btn-group btn-group-sm mb-3" role="group" aria-label="View toggle">
          <button type="button" class="btn btn-outline-success ${currentViewMode === "grid" ? "active" : ""}" id="view-mode-grid">
            Grid View
          </button>
          <button type="button" class="btn btn-outline-success ${currentViewMode === "matrix" ? "active" : ""}" id="view-mode-matrix">
            📅 Annual Calendar Matrix
          </button>
        </div>
      </div>

      <form class="row g-3 align-items-end mb-4 p-3 bg-white border rounded-3 shadow-sm">
        <div class="col-md-6">
          <label class="form-label small fw-semibold" for="produce-search">Search Produce</label>
          <input type="search" class="form-control" id="produce-search" placeholder="Produce name or description…" value="${state.q ?? ""}">
        </div>
        <div class="col-md-4">
          <label class="form-label small fw-semibold" for="produce-category">Category</label>
          <select class="form-select" id="produce-category">
            <option value="">All categories</option>
            ${categories
              .map(
                (c) =>
                  `<option value="${c}" ${c === state.category ? "selected" : ""}>${c}</option>`,
              )
              .join("")}
          </select>
        </div>
        <div class="col-md-2">
          <button type="button" class="btn btn-outline-secondary w-100" id="reset-produce-filters">
            Reset
          </button>
        </div>
      </form>

      <div class="d-flex justify-content-between align-items-center mb-3">
        <p class="text-muted small mb-0" id="produce-results-count"></p>
        <div class="small text-muted">
          <span class="badge bg-success rounded-pill me-1">✓</span> In Season
        </div>
      </div>

      <div id="produce-results"></div>
    </div>
  `);

  applyAndRender(state);

  const updateFromForm = () => {
    updateQuery({
      q: $("#produce-search").val(),
      category: $("#produce-category").val(),
    });
  };

  $("#produce-search").on("input", updateFromForm);
  $("#produce-category").on("change", updateFromForm);
  $("#reset-produce-filters").on("click", () => updateQuery({}));
  $("#produce-results").on("click", "#clear-produce-filters", () =>
    updateQuery({}),
  );

  $("#view-mode-grid").on("click", function () {
    currentViewMode = "grid";
    $(this).addClass("active");
    $("#view-mode-matrix").removeClass("active");
    applyAndRender(getState());
  });

  $("#view-mode-matrix").on("click", function () {
    currentViewMode = "matrix";
    $(this).addClass("active");
    $("#view-mode-grid").removeClass("active");
    applyAndRender(getState());
  });

  return (nextState) => {
    if (document.activeElement?.id !== "produce-search") {
      $("#produce-search").val(nextState.q ?? "");
    }
    $("#produce-category").val(nextState.category ?? "");
    applyAndRender(nextState);
  };
}
