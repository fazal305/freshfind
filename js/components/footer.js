import { getSiteConfig } from "../data.js";
import { getSimulatedVisitorCount } from "../utils/visitorCounter.js";

export async function renderFooter() {
  const config = await getSiteConfig();
  const navItems = [...config.nav.primary, ...config.nav.secondary];
  const visitorCount = getSimulatedVisitorCount(config.visitorCounter.seed);

  const links = navItems
    .map((item) => `<li><a href="#${item.path}">${item.label}</a></li>`)
    .join("");

  $("#site-footer").html(`
    <div class="site-footer">
      <div class="container d-flex flex-wrap justify-content-between gap-4">
        <div>
          <p class="site-footer__brand mb-2">${config.siteName}</p>
          <p class="site-footer__disclaimer mb-0">
            Market schedules and seasonal produce information are based on the current FreshFind dataset and may
            not reflect live, real-world availability.
          </p>
          <p class="site-footer__disclaimer mb-0 mt-2">
            Simulated visitor count (demo only): ${visitorCount.toLocaleString()}
          </p>
        </div>
        <nav aria-label="Footer">
          <ul class="list-unstyled d-flex flex-wrap gap-3 mb-0">
            ${links}
          </ul>
        </nav>
      </div>
    </div>
  `);
}
