import {
  getBasket,
  getBasketCount,
  updateBasketItem,
  removeFromBasket,
  clearBasket,
  calculateEstimatedTotal,
  formatBasketExport,
} from "../utils/basket.js";
import { getMarkets } from "../data.js";

let marketsCache = [];

export function renderBasketDrawer() {
  const root = document.getElementById("basket-root") || createBasketRoot();

  root.innerHTML = `
    <div class="offcanvas offcanvas-end basket-drawer" tabindex="-1" id="greenBasketOffcanvas" aria-labelledby="greenBasketTitle">
      <div class="offcanvas-header border-bottom">
        <div>
          <h2 class="offcanvas-title h5 mb-0" id="greenBasketTitle">
            <span class="me-1">🧺</span> My eGreen Basket
          </h2>
          <small class="text-muted" id="basket-subtitle">Plan your local market visit</small>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>

      <div class="offcanvas-body d-flex flex-column" id="basket-drawer-body">
        <div id="basket-items-container" class="flex-grow-1 overflow-auto pe-1"></div>
        <div id="basket-drawer-footer" class="border-top pt-3 mt-auto"></div>
      </div>
    </div>
  `;

  bindBasketEvents();
  updateBasketView();
}

function createBasketRoot() {
  const el = document.createElement("div");
  el.id = "basket-root";
  document.body.appendChild(el);
  return el;
}

export async function updateBasketView() {
  const items = getBasket();
  const count = getBasketCount();
  const total = calculateEstimatedTotal(items);

  // Update header badges (desktop + mobile)
  const badges = $("#basket-badge-count, #basket-badge-count-mobile");
  const previousCount = badges.first().text();
  badges.text(count).toggle(count > 0);
  if (count > 0 && String(count) !== previousCount) {
    badges.removeClass("is-pop");
    void badges[0]?.offsetWidth;
    badges.addClass("is-pop");
  }

  const container = $("#basket-items-container");
  const footer = $("#basket-drawer-footer");

  if (!items.length) {
    container.html(`
      <div class="text-center py-5 text-muted">
        <div class="display-6 mb-3">🧺</div>
        <p class="h6 mb-2">Your eGreen Basket is empty</p>
        <p class="small text-muted mb-4">Browse our Produce Guide or Markets to add seasonal farm harvest to your visit plan.</p>
        <a href="#/produce" class="btn btn-success btn-sm" data-bs-dismiss="offcanvas">Browse Produce Guide</a>
      </div>
    `);
    footer.html("");
    return;
  }

  if (!marketsCache.length) {
    try {
      marketsCache = await getMarkets();
    } catch {
      marketsCache = [];
    }
  }

  // Render items
  const itemsHtml = items
    .map((item) => {
      const isChecked = item.checked ? "checked" : "";
      const textClass = item.checked
        ? "text-decoration-line-through text-muted"
        : "";

      return `
      <div class="basket-item card mb-2 p-2 border ${item.checked ? "bg-light" : ""}" data-item-id="${item.id}">
        <div class="d-flex align-items-center gap-2">
          <input type="checkbox" class="form-check-input mt-0 basket-item-check" ${isChecked} aria-label="Mark ${item.name} as purchased">
          
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" class="rounded basket-item-thumb" width="48" height="48" style="object-fit: cover;">`
              : ""
          }

          <div class="flex-grow-1 min-w-0">
            <h3 class="h6 mb-0 text-truncate ${textClass}">
              <a href="#/produce/${item.slug}" class="text-decoration-none text-dark" data-bs-dismiss="offcanvas">${item.name}</a>
            </h3>
            <span class="small text-success fw-semibold">${item.approxPrice}</span>
          </div>

          <div class="d-flex align-items-center gap-1">
            <div class="btn-group btn-group-sm" role="group" aria-label="Item quantity">
              <button type="button" class="btn btn-outline-secondary px-2 btn-qty-minus" aria-label="Decrease quantity">−</button>
              <span class="btn btn-outline-secondary px-2 disabled text-dark fw-bold">${item.quantity || 1}</span>
              <button type="button" class="btn btn-outline-secondary px-2 btn-qty-plus" aria-label="Increase quantity">+</button>
            </div>
            <button type="button" class="btn btn-outline-danger btn-sm p-1 ms-1 btn-item-remove" title="Remove from basket" aria-label="Remove ${item.name}">
              &times;
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");

  // Find markets carrying the items
  let marketMatchesHtml = "";
  if (marketsCache.length) {
    const marketScores = marketsCache
      .map((m) => {
        const matches = items.filter((it) => m.produceIds.includes(it.id));
        return { market: m, matchCount: matches.length };
      })
      .filter((s) => s.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

    if (marketScores.length) {
      marketMatchesHtml = `
        <div class="basket-market-matches mb-3 p-2 bg-success bg-opacity-10 rounded">
          <p class="small fw-bold text-success mb-1">Recommended Market Visit:</p>
          <ul class="list-unstyled mb-0 small">
            ${marketScores
              .slice(0, 2)
              .map(
                (s) => `
              <li class="mb-1">
                <strong><a href="#/markets/${s.market.slug}" class="text-success text-decoration-none" data-bs-dismiss="offcanvas">${s.market.name}</a></strong>
                <span class="text-muted">(${s.matchCount}/${items.length} items available)</span>
              </li>
            `,
              )
              .join("")}
          </ul>
        </div>
      `;
    }
  }

  container.html(itemsHtml);

  footer.html(`
    ${marketMatchesHtml}
    <div class="d-flex justify-content-between align-items-center mb-3">
      <span class="text-muted">Estimated Total:</span>
      <span class="h5 mb-0 text-success fw-bold">Rs. ${total.toLocaleString()}</span>
    </div>

    <div class="d-grid gap-2">
      <div class="btn-group w-100">
        <button type="button" class="btn btn-success btn-sm" id="btn-copy-basket">
          📋 Copy Checklist
        </button>
        <button type="button" class="btn btn-outline-success btn-sm" id="btn-download-basket">
          💾 Download
        </button>
      </div>
      <button type="button" class="btn btn-outline-secondary btn-sm" id="btn-clear-basket">
        Clear Basket
      </button>
    </div>
    <div id="basket-feedback" class="small text-center text-success mt-2" aria-live="polite"></div>
  `);
}

function bindBasketEvents() {
  window.addEventListener("freshfind:basket-changed", () => {
    updateBasketView();
  });

  $(document).on("click", "#open-green-basket-btn", () => {
    const el = document.getElementById("greenBasketOffcanvas");
    if (el) {
      bootstrap.Offcanvas.getOrCreateInstance(el).show();
    }
  });

  $(document).on("click", ".btn-add-to-basket", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const btn = $(this);
    const itemData = btn.data("produce");
    if (!itemData) return;

    import("../utils/basket.js").then((mod) => {
      mod.addToBasket(itemData, 1);
      btn.addClass("btn-success").removeClass("btn-outline-success");
      const originalText = btn.html();
      btn.html("✓ Added to Basket");
      setTimeout(() => {
        btn.html(originalText);
      }, 1500);

      // Show toast confirmation
      showBasketToast(`Added ${itemData.name} to your eGreen Basket!`);
    });
  });

  $(document).on("change", ".basket-item-check", function () {
    const card = $(this).closest(".basket-item");
    const id = card.data("item-id");
    const checked = $(this).is(":checked");
    updateBasketItem(id, { checked });
  });

  $(document).on("click", ".btn-qty-plus", function () {
    const card = $(this).closest(".basket-item");
    const id = card.data("item-id");
    const item = getBasket().find((i) => i.id === id);
    if (item) {
      updateBasketItem(id, { quantity: (item.quantity || 1) + 1 });
    }
  });

  $(document).on("click", ".btn-qty-minus", function () {
    const card = $(this).closest(".basket-item");
    const id = card.data("item-id");
    const item = getBasket().find((i) => i.id === id);
    if (item) {
      updateBasketItem(id, { quantity: (item.quantity || 1) - 1 });
    }
  });

  $(document).on("click", ".btn-item-remove", function () {
    const card = $(this).closest(".basket-item");
    const id = card.data("item-id");
    removeFromBasket(id);
  });

  $(document).on("click", "#btn-clear-basket", () => {
    if (confirm("Are you sure you want to empty your eGreen Basket?")) {
      clearBasket();
    }
  });

  $(document).on("click", "#btn-copy-basket", async () => {
    const items = getBasket();
    const text = formatBasketExport(items, marketsCache);
    try {
      await navigator.clipboard.writeText(text);
      $("#basket-feedback").text("Shopping checklist copied to clipboard!");
      setTimeout(() => $("#basket-feedback").text(""), 3000);
    } catch {
      $("#basket-feedback").text("Unable to copy automatically.");
    }
  });

  $(document).on("click", "#btn-download-basket", () => {
    const items = getBasket();
    const text = formatBasketExport(items, marketsCache);
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "freshfind-egreen-basket.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    $("#basket-feedback").text("Downloaded shopping checklist!");
    setTimeout(() => $("#basket-feedback").text(""), 3000);
  });
}

function showBasketToast(message) {
  const toastRoot = document.getElementById("toast-root");
  if (!toastRoot) return;

  const id = `toast-${Date.now()}`;
  const toastHtml = `
    <div id="${id}" class="toast align-items-center text-bg-success border-0 show mb-2 shadow" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <span>🧺</span>
          <span>${message}</span>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;
  $(toastRoot).append(toastHtml);
  setTimeout(() => {
    $(`#${id}`).fadeOut(300, function () {
      $(this).remove();
    });
  }, 2500);
}
