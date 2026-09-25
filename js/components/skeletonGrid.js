function skeletonCard() {
  return `
    <div class="col-sm-6 col-lg-4">
      <div class="skeleton-card">
        <div class="skeleton-block"></div>
        <div class="skeleton-card__body">
          <div class="skeleton-block"></div>
          <div class="skeleton-block"></div>
          <div class="skeleton-block"></div>
        </div>
      </div>
    </div>
  `;
}

export function renderSkeletonGrid(count = 6) {
  return `<div class="row g-4" aria-hidden="true">${Array.from({ length: count }, skeletonCard).join("")}</div>`;
}
