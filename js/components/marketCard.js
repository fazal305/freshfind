import { formatTime12h } from "../utils/format.js";
import { getMarketStatus } from "../utils/marketStatus.js";
import { renderStatusPill } from "./statusPill.js";
import { haversineDistanceKm } from "../utils/distance.js";
import { renderBookmarkButton } from "./bookmarkButton.js";
import { renderMarketIllustration } from "./illustrations.js";

export function renderMarketCard(market, distanceKm) {
  const status = getMarketStatus(market);
  const hoursList = market.hours
    .map(
      (h) =>
        `<li>${h.day} · ${formatTime12h(h.open)}–${formatTime12h(h.close)}</li>`,
    )
    .join("");

  return `
    <div class="col-sm-6 col-lg-4">
      <article class="market-card card h-100">
        <a href="#/markets/${market.slug}" class="market-card__thumb" tabindex="-1" aria-hidden="true">
          ${renderMarketIllustration()}
        </a>
        <div class="card-body position-relative">
          ${renderBookmarkButton("market", market.id, { className: "market-card__bookmark" })}
          <p class="market-card__area mb-1">${market.area}${typeof distanceKm === "number" ? ` · ${distanceKm.toFixed(1)} km away` : ""}</p>
          <h3 class="h5"><a href="#/markets/${market.slug}">${market.name}</a></h3>
          <div class="mb-2">${renderStatusPill(status)}</div>
          <p class="text-muted small">${market.description}</p>
          <ul class="list-unstyled small mb-0">${hoursList}</ul>
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
