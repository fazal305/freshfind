import { getTeam } from "../data.js";
import { setPageMeta } from "../utils/seo.js";
import { renderSectionHeading } from "../components/sectionHeading.js";

export async function renderAbout() {
  const team = await getTeam();

  setPageMeta({
    title: "FreshFind — About",
    description:
      "What FreshFind does, how the data works, and its limitations as a static dataset.",
    path: "/about",
  });

  const limitations = team.limitations
    .map((item) => `<li>${item}</li>`)
    .join("");

  $("#main-content").html(`
    <div class="container py-4">
      ${renderSectionHeading({ level: "h1", title: "About FreshFind", description: team.mission })}

      <div class="row g-4">
        <div class="col-lg-6">
          <h2 class="h5">What FreshFind does</h2>
          <p class="text-muted">
            FreshFind lets residents search and filter a directory of local farmers markets, check operating hours,
            browse a produce guide organized by season, and save favorites with personal notes for the current
            session — all without an account or backend.
          </p>

          <h2 class="h5 mt-4">How the data works</h2>
          <p class="text-muted">
            All market and produce information comes from static JSON files bundled with the site. Nothing is
            fetched from a live server, and the site cannot write data back anywhere — bookmarks and notes stay in
            your own browser's storage.
          </p>
        </div>
        <div class="col-lg-6">
          <h2 class="h5">Limitations</h2>
          <ul class="text-muted">${limitations}</ul>
        </div>
      </div>
    </div>
  `);
}
