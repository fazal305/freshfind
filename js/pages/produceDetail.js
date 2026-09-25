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
        <li class="mb-3 p-3 border rounded-3 bg-white shadow-sm">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <a href="#/markets/${m.slug}" class="fw-semibold text-decoration-none text-dark fs-5">${m.name}</a>
              <span class="text-muted small d-block">📍 ${m.area} · ${m.address}</span>
            </div>
            <a href="#/markets/${m.slug}" class="btn btn-outline-success btn-sm">Visit &rarr;</a>
          </div>
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

  const imageWebp = item.image || "/assets/images/produce/desi-tamatar.webp";
  const imageJpg = imageWebp.replace(".webp", ".jpg");

  const itemPayload = JSON.stringify({
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: item.category,
    approxPrice: item.approxPrice || "Market rate",
    unit: item.unit || "kg",
    image: imageWebp,
    marketIds: item.marketIds || [],
  }).replace(/"/g, "&quot;");

  const culinaryList = (item.culinaryUses || [])
    .map((use) => `<li class="mb-1">🍳 ${use}</li>`)
    .join("");

  $("#main-content").html(`
    <div class="container py-4">
      ${renderBreadcrumbs([{ label: "Produce", path: "/produce" }, { label: item.name }])}

      <div class="row g-4 mb-4">
        <div class="col-lg-5">
          <div class="produce-detail__hero position-relative rounded-4 overflow-hidden shadow-sm bg-light" style="max-height: 380px;">
            <picture>
              <source srcset="${imageWebp}" type="image/webp" />
              <img src="${imageJpg}" alt="${item.name}" class="w-100 h-100" style="object-fit: cover; max-height: 380px;" />
            </picture>
            <button 
              type="button" 
              class="btn btn-sm btn-dark bg-opacity-75 position-absolute top-0 start-0 m-3 rounded-pill px-3" 
              data-lightbox-img="${imageJpg}" 
              data-lightbox-title="${item.name}" 
              data-lightbox-caption="${item.description}"
            >
              🔍 View Photo
            </button>
            ${item.approxPrice ? `<span class="badge bg-success position-absolute bottom-0 start-0 m-3 fs-6 px-3 py-2 shadow-sm">${item.approxPrice}</span>` : ""}
          </div>
        </div>

        <div class="col-lg-7 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex justify-content-between align-items-start gap-3">
              <div>
                <p class="produce-card__category mb-1">${item.category}</p>
                <h1 class="mb-2">${item.name}</h1>
              </div>
              ${renderBookmarkButton("produce", item.id)}
            </div>

            <div class="mb-3">
              ${renderStatusPill({ open: inSeason, label: inSeason ? "In season now" : "Out of season" })}
              ${item.nutritionalHighlight ? `<span class="badge bg-info bg-opacity-10 text-primary ms-2 p-2">🌿 ${item.nutritionalHighlight}</span>` : ""}
            </div>

            <p class="lead text-muted">${item.description}</p>
          </div>

          <div class="card p-3 bg-light border-0 rounded-3 mt-3">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <span class="text-muted small d-block">Estimated Mandi Rate</span>
                <span class="fs-4 fw-bold text-success">${item.approxPrice || "Market rate"}</span>
              </div>
              <button 
                type="button" 
                class="btn btn-success btn-lg px-4 btn-add-to-basket d-inline-flex align-items-center gap-2" 
                data-produce="${itemPayload}"
              >
                <span>🧺 Add to eGreen Basket</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-4 mt-2">
        <div class="col-lg-6">
          <div class="card h-100 p-4 border shadow-sm">
            <h2 class="h4 mb-3">Seasonal Availability</h2>
            <p><strong>Typical season:</strong> ${item.typicalSeason}</p>
            <p><strong>Available months:</strong> ${monthsText}</p>
            ${blurb ? `<div class="p-3 bg-light rounded-3 mb-3"><p class="text-muted small mb-0">${blurb}</p></div>` : ""}

            ${
              item.storageTip
                ? `
              <h3 class="h6 mt-3 text-success">🌿 Storage & Freshness Tips</h3>
              <p class="text-muted small mb-0">${item.storageTip}</p>
            `
                : ""
            }

            ${
              culinaryList
                ? `
              <h3 class="h6 mt-3 text-success">🍽 Culinary & Traditional Uses</h3>
              <ul class="list-unstyled text-muted small mb-0">${culinaryList}</ul>
            `
                : ""
            }
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card h-100 p-4 border shadow-sm">
            <h2 class="h4 mb-3">Where to Find in Karachi</h2>
            ${renderRelatedMarkets(item, markets)}
          </div>
        </div>
      </div>
    </div>
  `);
}
