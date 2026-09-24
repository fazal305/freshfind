export function renderStatusPill(status) {
  return `<span class="status-pill ${status.open ? "is-open" : "is-closed"}">${status.label}</span>`;
}
