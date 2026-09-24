export function renderBreadcrumbs(items) {
  const listItems = items
    .map((item, index) => {
      const isLast = index === items.length - 1;
      const inner =
        isLast || !item.path
          ? `<span aria-current="${isLast ? "page" : ""}">${item.label}</span>`
          : `<a href="#${item.path}">${item.label}</a>`;
      const sep = isLast ? "" : '<span aria-hidden="true">/</span>';
      return `<li>${inner}${sep}</li>`;
    })
    .join("");

  return `<nav aria-label="Breadcrumb" class="breadcrumbs"><ol>${listItems}</ol></nav>`;
}
