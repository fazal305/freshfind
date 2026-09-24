import { getProduce } from "../data.js";
import { setPageMeta } from "../utils/seo.js";
import { renderSectionHeading } from "../components/sectionHeading.js";
import { renderEmptyState } from "../components/emptyState.js";
import { renderProduceGrid } from "../components/produceCard.js";
import {
  getUniqueCategories,
  searchProduce,
  filterProduceByCategory,
} from "../utils/seasonal.js";
import { parseQuery, updateQuery } from "../utils/queryParams.js";

let produce = [];

function applyAndRender(state) {
  let result = searchProduce(produce, state.q);
  result = filterProduceByCategory(result, state.category);

  $("#produce-results-count").text(
    `${result.length} item${result.length === 1 ? "" : "s"} found`,
  );
  $("#produce-results").html(
    result.length
      ? renderProduceGrid(result)
      : renderEmptyState({
          title: "Nothing matched your search.",
          message:
            "Try a different category or search term — or clear your filters to see the full guide.",
          actionsHtml: `<button type="button" class="btn btn-success" id="clear-produce-filters">Clear filters</button>`,
        }),
  );
}

function getState() {
  return parseQuery();
}

export async function renderProduceGuide() {
  produce = await getProduce();
  const categories = getUniqueCategories(produce);
  const state = getState();

  setPageMeta({
    title: "FreshFind — Produce Guide",
    description:
      "Browse the FreshFind produce catalogue by category and season.",
    path: "/produce",
  });

  $("#main-content").html(`
    <div class="container py-4">
      ${renderSectionHeading({
        level: "h1",
        title: "Produce Guide",
        description: "Browse produce by category and typical season.",
      })}

      <form class="row g-3 align-items-end mb-3">
        <div class="col-md-6">
          <label class="form-label small" for="produce-search">Search</label>
          <input type="search" class="form-control" id="produce-search" placeholder="Produce name or description…" value="${state.q ?? ""}">
        </div>
        <div class="col-md-4">
          <label class="form-label small" for="produce-category">Category</label>
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
      </form>

      <p class="text-muted small" id="produce-results-count"></p>
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
  $("#produce-results").on("click", "#clear-produce-filters", () =>
    updateQuery({}),
  );

  return (nextState) => {
    if (document.activeElement?.id !== "produce-search") {
      $("#produce-search").val(nextState.q ?? "");
    }
    $("#produce-category").val(nextState.category ?? "");
    applyAndRender(nextState);
  };
}
