import { isBookmarked, toggleBookmark } from "../utils/bookmarks.js";

export function renderBookmarkButton(type, id, { className = "" } = {}) {
  const active = isBookmarked(type, id);
  return `
    <button
      type="button"
      class="bookmark-btn ${active ? "is-active" : ""} ${className}"
      data-bookmark-type="${type}"
      data-bookmark-id="${id}"
      aria-pressed="${active}"
      aria-label="${active ? "Remove bookmark" : "Add bookmark"}"
      title="${active ? "Remove bookmark" : "Add bookmark"}"
    >${active ? "★" : "☆"}</button>
  `;
}

export function bindBookmarkButtons(container = document) {
  $(container).on("click", "[data-bookmark-type]", function () {
    const type = $(this).data("bookmark-type");
    const id = String($(this).data("bookmark-id"));
    const active = toggleBookmark(type, id);
    $(this)
      .toggleClass("is-active", active)
      .attr("aria-pressed", active)
      .attr("aria-label", active ? "Remove bookmark" : "Add bookmark")
      .attr("title", active ? "Remove bookmark" : "Add bookmark")
      .text(active ? "★" : "☆");
  });
}
