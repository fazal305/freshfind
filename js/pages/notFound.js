import { setPageMeta } from "../utils/seo.js";
import { renderEmptyState } from "../components/emptyState.js";

export async function renderNotFound() {
  setPageMeta({
    title: "FreshFind — Page Not Found",
    description: "That page doesn't exist on FreshFind.",
    path: "/404",
  });

  $("#main-content").html(`
    <div class="container py-5">
      ${renderEmptyState({
        level: "h1",
        title: "That market trail went cold.",
        message: "The page you're looking for doesn't exist or may have moved.",
        actionsHtml: `
          <a href="#/" class="btn btn-success">Back to FreshFind</a>
          <a href="#/markets" class="btn btn-outline-secondary">Browse Markets</a>
          <a href="#/produce" class="btn btn-outline-secondary">Explore Produce</a>
        `,
      })}
    </div>
  `);
}
