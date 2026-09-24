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
import { renderMarketIllustration } from "../components/illustrations.js";

function renderProduceLinks(market, produce) {
  const items = produce.filter((p) => market.produceIds.includes(p.id));
  if (!items.length)
    return `<p class="text-muted">No produce listed for this market yet.</p>`;

  return `
    <div class="row g-3">
      ${items
        .map(
          (p) => `
        <div class="col-6 col-md-4">
          <a href="#/produce/${p.slug}" class="card h-100 text-decoration-none produce-chip">
            <div class="card-body">
              <p class="mb-1 fw-semibold">${p.name}</p>
              <p class="mb-0 text-muted small">${p.category}</p>
            </div>
          </a>
        </div>`,
        )
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

  $("#main-content").html(`
    <div class="container py-4">
      ${renderBreadcrumbs([{ label: "Markets", path: "/markets" }, { label: market.name }])}

      <div class="market-detail__hero mb-3">${renderMarketIllustration()}</div>

      <div class="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-2">
        <div>
          <p class="market-card__area mb-1">${market.area}</p>
          <h1 class="mb-2">${market.name}</h1>
        </div>
        <div id="market-status-wrap"></div>
      </div>

      <p class="text-muted">${market.description}</p>
      <p class="mb-4">${market.address}</p>

      <div class="row g-4">
        <div class="col-lg-6">
          <h2 class="h4">Weekly Schedule</h2>
          ${renderMarketSchedule(market)}

          <h2 class="h4 mt-4">Typical Produce</h2>
          ${renderProduceLinks(market, produce)}
        </div>
        <div class="col-lg-6">
          <h2 class="h4">Location</h2>
          ${renderMapEmbed(market.coordinates, market.name)}

          <div class="d-flex align-items-center gap-2 mt-3">
            <button type="button" class="btn btn-outline-secondary btn-sm" id="share-market">Share this market</button>
            ${renderBookmarkButton("market", market.id)}
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
