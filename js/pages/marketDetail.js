import { getMarkets, getProduce } from "../data.js";
import { renderBreadcrumbs } from "../components/breadcrumbs.js";
import { renderEmptyState } from "../components/emptyState.js";
import { renderStatusPill } from "../components/statusPill.js";
import { renderMarketSchedule } from "../components/marketSchedule.js";
import { renderMapEmbed } from "../components/mapEmbed.js";
import { getMarketStatus } from "../utils/marketStatus.js";
import { onEveryMinute } from "../utils/clock.js";
import { setPageMeta } from "../utils/seo.js";
import { renderBookmarkButton } from "../components/bookmarkButton.js";

function renderProduceLinks(market, produce) {
  const items = produce.filter((p) => market.produceIds.includes(p.id));
  if (!items.length)
    return `<p class="text-muted">No produce listed for this market yet.</p>`;

  return `
    <div class="row g-3">
      ${items
        .map((p) => {
          const itemPayload = JSON.stringify({
            id: p.id,
            slug: p.slug,
            name: p.name,
            category: p.category,
            approxPrice: p.approxPrice || "Market rate",
            unit: p.unit || "kg",
            image: p.image || "",
            marketIds: p.marketIds || [],
          }).replace(/"/g, "&quot;");

          const pImg = p.image || "/assets/images/produce/desi-tamatar.webp";
          return `
        <div class="col-sm-6">
          <div class="card h-100 border shadow-sm overflow-hidden">
            <div class="d-flex h-100">
              <a href="#/produce/${p.slug}" class="flex-shrink-0" style="width: 100px;">
                <img src="${pImg}" alt="${p.name}" class="w-100 h-100" style="object-fit: cover;" loading="lazy">
              </a>
              <div class="card-body p-2 d-flex flex-column justify-content-between min-w-0">
                <div>
                  <a href="#/produce/${p.slug}" class="fw-semibold text-decoration-none text-dark d-block text-truncate">${p.name}</a>
                  <span class="badge bg-success bg-opacity-10 text-success small">${p.approxPrice || p.category}</span>
                </div>
                <div class="mt-2">
                  <button type="button" class="btn btn-sm btn-outline-success py-0 px-2 btn-add-to-basket" data-produce="${itemPayload}">
                    + Basket
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>`;
        })
        .join("")}
    </div>
  `;
}

export async function renderMarketDetail({ marketSlug }) {
  const [markets, produce] = await Promise.all([getMarkets(), getProduce()]);
  const market = markets.find((m) => m.slug === marketSlug);

  setPageMeta({
    title: market
      ? `FreshFind — ${market.name}`
      : "FreshFind — Market Not Found",
    description:
      market?.description ??
      "This market could not be found in the FreshFind directory.",
    path: `/markets/${marketSlug}`,
  });

  if (!market) {
    $("#main-content").html(`
      <div class="container py-4">
        ${renderEmptyState({
          level: "h1",
          title: "Market not found",
          message: "We couldn't find a market with that address.",
          actionsHtml: `<a href="#/markets" class="btn btn-success">Back to Market Directory</a>`,
        })}
      </div>
    `);
    return;
  }

  const imageWebp =
    market.image || "/assets/images/markets/clifton-kisan-bazaar.webp";
  const imageJpg = imageWebp.replace(".webp", ".jpg");
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${market.coordinates.lat},${market.coordinates.lng}`;

  const featuresList = (market.features || [])
    .map(
      (feat) =>
        `<span class="badge bg-light text-dark border me-1 mb-1">${feat}</span>`,
    )
    .join("");

  $("#main-content").html(`
    <div class="container py-4">
      ${renderBreadcrumbs([{ label: "Markets", path: "/markets" }, { label: market.name }])}

      <div class="market-detail__hero position-relative mb-4 rounded-4 overflow-hidden shadow-sm skeleton-block">
        <picture>
          <source srcset="${imageWebp}" type="image/webp" />
          <img
            src="${imageJpg}"
            alt="${market.name}"
            class="market-detail__hero-img"
            onload="this.classList.add('is-loaded'); this.closest('.market-detail__hero').classList.remove('skeleton-block');"
          />
        </picture>
        <div class="market-detail__hero-overlay position-absolute bottom-0 start-0 end-0 p-3 p-md-4 text-white">
          <div class="d-flex flex-wrap align-items-center gap-2 mb-2">
            <span class="badge bg-success">${market.area}</span>
            ${market.weatherHint ? `<span class="badge bg-dark bg-opacity-75">🌤 ${market.weatherHint}</span>` : ""}
            <span class="badge bg-dark bg-opacity-75">${market.vendorCount ? `${market.vendorCount} Active Stalls` : "Local Mandi"}</span>
          </div>
          <button 
            type="button" 
            class="btn btn-sm btn-light bg-opacity-75 rounded-pill px-3" 
            data-lightbox-img="${imageJpg}" 
            data-lightbox-title="${market.name}" 
            data-lightbox-caption="${market.description} (${market.address})"
          >
            🔍 View Full Photo
          </button>
        </div>
      </div>

      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-2">
        <div>
          <p class="market-card__area mb-1">${market.area}</p>
          <h1 class="mb-2">${market.name}</h1>
        </div>
        <div id="market-status-wrap"></div>
      </div>

      <p class="lead text-muted">${market.description}</p>
      
      <div class="d-flex flex-wrap align-items-center gap-2 mb-4">
        <span class="text-muted"><i class="bi bi-geo-alt"></i> 📍 ${market.address}</span>
        <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-success">
          🗺 Get Directions
        </a>
      </div>

      ${
        market.bestTime
          ? `
        <div class="alert alert-success d-flex align-items-center gap-2 mb-4 py-2" role="alert">
          <span class="fs-5">⏰</span>
          <div>
            <strong>Best Time to Visit:</strong> ${market.bestTime}
          </div>
        </div>
      `
          : ""
      }

      ${featuresList ? `<div class="mb-4"><strong>Highlights:</strong> <div class="mt-1">${featuresList}</div></div>` : ""}

      <div class="row g-4">
        <div class="col-lg-6">
          <h2 class="h4">Weekly Schedule</h2>
          ${renderMarketSchedule(market)}

          <h2 class="h4 mt-4">Typical Produce Available</h2>
          ${renderProduceLinks(market, produce)}
        </div>
        <div class="col-lg-6">
          <h2 class="h4">Location Map</h2>
          ${renderMapEmbed(market.coordinates, market.name)}

          <div class="d-flex align-items-center gap-2 mt-3">
            <button type="button" class="btn btn-outline-secondary btn-sm" id="share-market">Share this market</button>
            ${renderBookmarkButton("market", market.id)}
            <a href="${directionsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-success btn-sm">
              Open in Maps &rarr;
            </a>
          </div>
          <p class="small text-muted mt-2" id="share-feedback" aria-live="polite"></p>
        </div>
      </div>
    </div>
  `);

  const stopClock = onEveryMinute(() => {
    const status = getMarketStatus(market);
    $("#market-status-wrap").html(renderStatusPill(status));
  });

  $("#share-market").on("click", async () => {
    const shareData = {
      title: market.name,
      text: `Check out ${market.name} on FreshFind`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled the native share sheet */
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      $("#share-feedback").text("Link copied to clipboard.");
    } catch {
      $("#share-feedback").text(window.location.href);
    }
  });

  return { cleanup: stopClock };
}
