export function renderEmptyState({ title, message = "", actionsHtml = "", level = "h3" }) {
  return `
    <div class="empty-state" role="status">
      <${level}>${title}</${level}>
      ${message ? `<p>${message}</p>` : ""}
      ${actionsHtml ? `<div class="d-flex justify-content-center gap-3 flex-wrap mt-3">${actionsHtml}</div>` : ""}
    </div>
  `;
}
