import { getSiteConfig } from "../data.js";
import { getBasketCount } from "../utils/basket.js";

export async function renderHeader() {
  const config = await getSiteConfig();
  const navItems = [...config.nav.primary, ...config.nav.secondary];

  const navLinks = navItems
    .map(
      (item) =>
        `<li class="nav-item"><a class="nav-link" data-path="${item.path}" href="#${item.path}">${item.label}</a></li>`,
    )
    .join("");

  const basketCount = getBasketCount();

  $("#site-header").html(`
    <nav class="navbar navbar-expand-lg site-header">
      <div class="container py-2">
        <a class="navbar-brand brand" href="#/">
          <span class="brand__name">${config.siteName}</span>
          <span class="brand__tagline">${config.tagline}</span>
        </a>
        <div class="d-flex align-items-center gap-2 d-lg-none">
          <button type="button" class="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1" id="open-green-basket-btn-mobile" aria-label="Open eGreen Basket">
            <span>🧺</span>
            <span class="badge bg-success rounded-pill" id="basket-badge-count-mobile" style="${basketCount > 0 ? "" : "display:none;"}">${basketCount}</span>
          </button>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
          </button>
        </div>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            ${navLinks}
            <li class="nav-item">
              <button type="button" class="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1 ms-lg-2" id="open-green-basket-btn" aria-label="Open eGreen Basket">
                <span>🧺 eGreen Basket</span>
                <span class="badge bg-success rounded-pill ms-1" id="basket-badge-count" style="${basketCount > 0 ? "" : "display:none;"}">${basketCount}</span>
              </button>
            </li>
            <li class="nav-item">
              <button type="button" class="btn btn-outline-secondary btn-sm ms-lg-2" disabled title="Demonstration only — no real authentication">Log in</button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  `);

  highlightActiveNav();

  $("#open-green-basket-btn-mobile").on("click", () => {
    const el = document.getElementById("greenBasketOffcanvas");
    if (el) {
      bootstrap.Offcanvas.getOrCreateInstance(el).show();
    }
  });
}

export function highlightActiveNav() {
  const path = window.location.hash.slice(1).split("?")[0] || "/";
  $("#site-header .nav-link").each(function () {
    const linkPath = $(this).data("path");
    const isActive =
      linkPath === "/" ? path === "/" : path.startsWith(linkPath);
    $(this).toggleClass("active", isActive);
  });

  const collapse = document.getElementById("mainNav");
  if (collapse?.classList.contains("show")) {
    bootstrap.Collapse.getOrCreateInstance(collapse).hide();
  }
}
