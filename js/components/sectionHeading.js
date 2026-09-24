export function renderSectionHeading({
  eyebrow,
  title,
  description,
  actionsHtml = "",
  level = "h2",
}) {
  return `
    <div class="section-heading d-flex flex-wrap align-items-end justify-content-between gap-4 mb-4">
      <div>
        ${eyebrow ? `<p class="section-heading__eyebrow mb-1">${eyebrow}</p>` : ""}
        <${level} class="mb-1">${title}</${level}>
        ${description ? `<p class="section-heading__description mb-0">${description}</p>` : ""}
      </div>
      ${actionsHtml ? `<div>${actionsHtml}</div>` : ""}
    </div>
  `;
}
