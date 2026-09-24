export function renderMapEmbed({ lat, lng }, label = "Market location") {
  if (typeof lat !== "number" || typeof lng !== "number") {
    return `<p class="text-muted small">Map location is not available for this entry.</p>`;
  }

  const delta = 0.01;
  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const externalLink = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

  return `
    <div class="map-embed">
      <div class="map-embed__frame">
        <div class="map-embed__skeleton">Loading map…</div>
        <iframe
          title="${label}"
          src="${src}"
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade"
          onload="this.previousElementSibling.style.display='none'"
        ></iframe>
      </div>
      <a href="${externalLink}" target="_blank" rel="noopener noreferrer" class="small">Open in Google Maps</a>
    </div>
  `;
}
