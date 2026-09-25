import { isInSeason } from "../utils/seasonal.js";
import { renderBookmarkButton } from "./bookmarkButton.js";

export function renderProduceCard(item) {
  const inSeason = isInSeason(item);
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

  return `
    <div class="col-sm-6 col-lg-4 reveal">
      <article class="produce-card card h-100 shadow-sm border overflow-hidden">
        <div class="produce-card__thumb position-relative skeleton-block">
          <a href="#/produce/${item.slug}" class="d-block w-100 h-100" aria-label="View details for ${item.name}">
            <picture>
              <source srcset="${imageWebp}" type="image/webp" />
              <img
                src="${imageJpg}"
                alt="${item.name} - ${item.category}"
                loading="lazy"
                width="400"
                height="260"
                class="produce-card__img w-100 h-100"
                onload="this.classList.add('is-loaded'); this.closest('.produce-card__thumb').classList.remove('skeleton-block');"
              />
            </picture>
          </a>
          <button 
            type="button" 
            class="produce-card__zoom-btn btn btn-sm btn-dark bg-opacity-75 position-absolute top-0 start-0 m-2 rounded-circle p-1" 
            data-lightbox-img="${imageJpg}" 
            data-lightbox-title="${item.name}" 
            data-lightbox-caption="${item.description} (${item.approxPrice || ""})"
            aria-label="Enlarge photo of ${item.name}"
            title="Enlarge photo"
          >
            🔍
          </button>
          ${item.approxPrice ? `<span class="produce-card__price-badge badge bg-success position-absolute bottom-0 start-0 m-2 px-2 py-1 shadow-sm">${item.approxPrice}</span>` : ""}
          ${renderBookmarkButton("produce", item.id, { className: "market-card__bookmark position-absolute top-0 end-0 m-2" })}
        </div>
        <div class="card-body position-relative d-flex flex-column">
          <p class="produce-card__category mb-1">${item.category}</p>
          <h3 class="h5 mb-1"><a href="#/produce/${item.slug}" class="text-decoration-none text-dark">${item.name}</a></h3>
          <div class="mb-2">
            <span class="status-pill ${inSeason ? "is-open" : "is-closed"}">${inSeason ? "In season now" : "Out of season"}</span>
          </div>
          <p class="text-muted small mb-3 flex-grow-1">${item.description}</p>
          <div class="d-flex gap-2 pt-2 border-top mt-auto">
            <a href="#/produce/${item.slug}" class="btn btn-outline-secondary btn-sm flex-grow-1">
              Details
            </a>
            <button 
              type="button" 
              class="btn btn-outline-success btn-sm btn-add-to-basket flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1" 
              data-produce="${itemPayload}"
              aria-label="Add ${item.name} to eGreen Basket"
            >
              <span>🧺 Add</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  `;
}

export function renderProduceGrid(produce) {
  if (!produce.length) return "";
  return `<div class="row g-4">${produce.map(renderProduceCard).join("")}</div>`;
}
