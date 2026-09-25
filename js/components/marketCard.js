import { formatTime12h } from "../utils/format.js";
import { getMarketStatus } from "../utils/marketStatus.js";
import { renderStatusPill } from "./statusPill.js";
import { haversineDistanceKm } from "../utils/distance.js";
import { renderBookmarkButton } from "./bookmarkButton.js";

export function renderMarketCard(market, distanceKm) {
  const status = getMarketStatus(market);
  const hoursList = market.hours
    .map(
      (h) =>
        `<li>${h.day} · ${formatTime12h(h.open)}–${formatTime12h(h.close)}</li>`,
    )
    .join("");

  const imageWebp =
    market.image || "/assets/images/markets/clifton-kisan-bazaar.webp";
  const imageJpg = imageWebp.replace(".webp", ".jpg");

  return `
    <div class="col-sm-6 col-lg-4 reveal">
      <article class="market-card card h-100 shadow-sm border overflow-hidden">
        <div class="market-card__thumb position-relative skeleton-block">
          <a href="#/markets/${market.slug}" class="d-block w-100 h-100" aria-label="View details for ${market.name}">
            <picture>
              <source srcset="${imageWebp}" type="image/webp" />
              <img
                src="${imageJpg}"
                alt="${market.name} - Farmers Market in ${market.area}"
                loading="lazy"
                width="480"
                height="270"
                class="market-card__img w-100 h-100"
                onload="this.classList.add('is-loaded'); this.closest('.market-card__thumb').classList.remove('skeleton-block');"
              />
            </picture>
          </a>
          <button 
            type="button" 
            class="market-card__zoom-btn btn btn-sm btn-dark bg-opacity-75 position-absolute top-0 start-0 m-2 rounded-circle p-1" 
            data-lightbox-img="${imageJpg}" 
            data-lightbox-title="${market.name}" 
            data-lightbox-caption="${market.description} (${market.address})"
            aria-label="Enlarge photo of ${market.name}"
            title="Enlarge photo"
          >
            🔍
          </button>
          <span class="market-card__vendor-badge badge bg-dark bg-opacity-75 position-absolute bottom-0 start-0 m-2 px-2 py-1">
            ${market.vendorCount ? `${market.vendorCount} Stalls` : "Farmers Market"}
          </span>
          ${renderBookmarkButton("market", market.id, { className: "market-card__bookmark position-absolute top-0 end-0 m-2" })}
        </div>
        <div class="card-body position-relative d-flex flex-column">
          <p class="market-card__area mb-1">${market.area}${typeof distanceKm === "number" ? ` · ${distanceKm.toFixed(1)} km away` : ""}</p>
          <h3 class="h5 mb-2"><a href="#/markets/${market.slug}" class="text-decoration-none text-dark">${market.name}</a></h3>
          <div class="mb-2">${renderStatusPill(status)}</div>
          <p class="text-muted small mb-3 flex-grow-1">${market.description}</p>
          <div class="border-top pt-2 mt-auto">
            <p class="small fw-semibold text-muted mb-1">Market Hours:</p>
            <ul class="list-unstyled small mb-2 text-muted">${hoursList}</ul>
            <a href="#/markets/${market.slug}" class="btn btn-outline-success btn-sm w-100">
              View Schedule & Produce &rarr;
            </a>
          </div>
        </div>
      </article>
    </div>
  `;
}

export function renderMarketGrid(markets, userLocation) {
  if (!markets.length) return "";
  const cards = markets
    .map((market) => {
      const distanceKm =
        userLocation && market.coordinates
          ? haversineDistanceKm(userLocation, market.coordinates)
          : undefined;
      return renderMarketCard(market, distanceKm);
    })
    .join("");
  return `<div class="row g-4">${cards}</div>`;
}
