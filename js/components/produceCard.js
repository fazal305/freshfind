import { isInSeason } from "../utils/seasonal.js";
import { renderBookmarkButton } from "./bookmarkButton.js";
import { renderProduceIllustration } from "./illustrations.js";

export function renderProduceCard(item) {
  const inSeason = isInSeason(item);

  return `
    <div class="col-sm-6 col-lg-4">
      <article class="produce-card card h-100">
        <div class="produce-card__thumb">${renderProduceIllustration(item.id)}</div>
        <div class="card-body position-relative">
          ${renderBookmarkButton("produce", item.id, { className: "market-card__bookmark" })}
          <p class="produce-card__category mb-1">${item.category}</p>
          <h3 class="h5 mb-1"><a href="#/produce/${item.slug}" class="stretched-link">${item.name}</a></h3>
          <span class="status-pill ${inSeason ? "is-open" : "is-closed"} mb-2">${inSeason ? "In season now" : "Out of season"}</span>
          <p class="text-muted small mb-0">${item.description}</p>
        </div>
      </article>
    </div>
  `;
}

export function renderProduceGrid(produce) {
  if (!produce.length) return "";
  return `<div class="row g-4">${produce.map(renderProduceCard).join("")}</div>`;
}
