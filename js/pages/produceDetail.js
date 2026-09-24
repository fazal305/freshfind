import { getProduce, getMarkets, getSeasonalData } from "../data.js";
import { renderBreadcrumbs } from "../components/breadcrumbs.js";
import { renderEmptyState } from "../components/emptyState.js";
import { renderStatusPill } from "../components/statusPill.js";
import { isInSeason } from "../utils/seasonal.js";
import { setPageMeta } from "../utils/seo.js";
import { renderBookmarkButton } from "../components/bookmarkButton.js";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function renderRelatedMarkets(item, markets) {
  const related = markets.filter((m) => item.marketIds.includes(m.id));
  if (!related.length)
    return `<p class="text-muted">No markets currently list this item.</p>`;

  return `
    <ul class="list-unstyled">
      ${related
        .map(
          (m) => `
        <li class="mb-2">
          <a href="#/markets/${m.slug}" class="fw-semibold text-decoration-none">${m.name}</a>
          <span class="text-muted small d-block">${m.area}</span>
        </li>`,
        )
        .join("")}
    </ul>
  `;
}

export async function renderProduceDetail({ produceSlug }) {
  const [produce, markets, seasonal] = await Promise.all([
    getProduce(),
    getMarkets(),
    getSeasonalData(),
  ]);
  const item = produce.find((p) => p.slug === produceSlug);

  setPageMeta({
    title: item ? `FreshFind — ${item.name}` : "FreshFind — Produce Not Found",
    description: item?.description ?? "This produce item could not be found.",
    path: `/produce/${produceSlug}`,
  });

  if (!item) {
    $("#main-content").html(`
      <div class="container py-4">
        ${renderEmptyState({
          level: "h1",
          title: "Produce not found",
          message: "We couldn't find that item in the produce guide.",
          actionsHtml: `<a href="#/produce" class="btn btn-success">Back to Produce Guide</a>`,
        })}
      </div>
    `);
    return;
  }

  const inSeason = isInSeason(item);
  const monthsText = item.availableMonths
    .map((m) => MONTH_NAMES[m - 1])
    .join(", ");
  const blurb = seasonal.categoryBlurbs?.[item.category];

  $("#main-content").html(`
    <div class="container py-4">
      ${renderBreadcrumbs([{ label: "Produce", path: "/produce" }, { label: item.name }])}

      <div class="d-flex justify-content-between align-items-start gap-3">
        <div>
          <p class="produce-card__category mb-1">${item.category}</p>
          <h1 class="mb-2">${item.name}</h1>
        </div>
        ${renderBookmarkButton("produce", item.id)}
      </div>
      <div class="mb-3">${renderStatusPill({ open: inSeason, label: inSeason ? "In season now" : "Out of season" })}</div>

      <p class="text-muted">${item.description}</p>

      <div class="row g-4 mt-1">
        <div class="col-lg-6">
          <h2 class="h4">Seasonal Availability</h2>
          <p><strong>Typical season:</strong> ${item.typicalSeason}</p>
          <p><strong>Available months:</strong> ${monthsText}</p>
          ${blurb ? `<p class="text-muted small">${blurb}</p>` : ""}
          <p class="text-muted small">
            Seasonal information reflects the FreshFind dataset and typical expectations, not guaranteed real-world availability.
          </p>
        </div>
        <div class="col-lg-6">
          <h2 class="h4">Where to Find It</h2>
          ${renderRelatedMarkets(item, markets)}
        </div>
      </div>
    </div>
  `);
}
