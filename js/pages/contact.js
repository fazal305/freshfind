import { getTeam } from "../data.js";
import { setPageMeta } from "../utils/seo.js";
import { renderSectionHeading } from "../components/sectionHeading.js";
import { renderMapEmbed } from "../components/mapEmbed.js";
import { requestLocation } from "../utils/geolocation.js";
import { haversineDistanceKm } from "../utils/distance.js";

export async function renderContact() {
  const team = await getTeam();

  setPageMeta({
    title: "FreshFind — Contact",
    description: "Get in touch with the FreshFind team.",
    path: "/contact",
  });

  $("#main-content").html(`
    <div class="container py-4">
      ${renderSectionHeading({
        level: "h1",
        title: "Contact",
        description: "Static contact information for the FreshFind project.",
      })}

      <div class="row g-4">
        <div class="col-lg-6">
          <h2 class="h5">Get in touch</h2>
          <p class="mb-1">${team.contact.address}</p>
          <p><a href="mailto:${team.contact.email}">${team.contact.email}</a></p>

          <button type="button" class="btn btn-outline-success btn-sm mt-2" id="contact-distance-btn">
            How far am I from FreshFind HQ?
          </button>
          <p class="small text-muted mt-2" id="contact-distance-feedback" aria-live="polite"></p>
        </div>
        <div class="col-lg-6">
          <h2 class="h5">Location</h2>
          ${renderMapEmbed(team.contact.coordinates, "FreshFind HQ")}
        </div>
      </div>
    </div>
  `);

  $("#contact-distance-btn").on("click", async function () {
    const button = $(this);
    button.prop("disabled", true).text("Checking your location…");

    try {
      const userLocation = await requestLocation();
      const distanceKm = haversineDistanceKm(
        userLocation,
        team.contact.coordinates,
      );
      $("#contact-distance-feedback").text(
        `You're about ${distanceKm.toFixed(1)} km from FreshFind HQ.`,
      );
    } catch (error) {
      const messages = {
        denied:
          "Location access is unavailable. You can still reach us by email.",
        unsupported: "Your browser doesn't support location lookup.",
        unavailable: "We couldn't determine your location right now.",
      };
      $("#contact-distance-feedback").text(
        messages[error.code] ?? messages.unavailable,
      );
    } finally {
      button.prop("disabled", false).text("How far am I from FreshFind HQ?");
    }
  });
}
