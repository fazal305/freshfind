import { getMarkets, getProduce } from "../data.js";
import { setPageMeta } from "../utils/seo.js";
import { renderSectionHeading } from "../components/sectionHeading.js";
import { renderEmptyState } from "../components/emptyState.js";
import {
  getBookmarks,
  removeBookmark,
  getNote,
  setNote,
  onBookmarksChanged,
} from "../utils/bookmarks.js";

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function buildExportText(entries) {
  const lines = [
    `FreshFind Bookmarks — exported ${new Date().toLocaleString()}`,
    "",
  ];

  for (const entry of entries) {
    lines.push(
      `${entry.type === "market" ? "Market" : "Produce"}: ${entry.item.name}`,
    );
    if (entry.type === "market") {
      lines.push(`  Area: ${entry.item.area}`);
      lines.push(`  Address: ${entry.item.address}`);
    } else {
      lines.push(`  Category: ${entry.item.category}`);
      lines.push(`  Typical season: ${entry.item.typicalSeason}`);
    }
    if (entry.note) lines.push(`  Note: ${entry.note}`);
    lines.push("");
  }

  return lines.join("\n");
}

function renderEntry(entry) {
  const link =
    entry.type === "market"
      ? `#/markets/${entry.item.slug}`
      : `#/produce/${entry.item.slug}`;
  const meta = entry.type === "market" ? entry.item.area : entry.item.category;

  return `
    <div class="bookmark-entry" data-entry-type="${entry.type}" data-entry-id="${entry.id}">
      <div class="d-flex justify-content-between align-items-start gap-3 mb-2">
        <div>
          <p class="text-muted small mb-1 text-uppercase">${entry.type} · ${meta}</p>
          <h3 class="h5 mb-0"><a href="${link}">${entry.item.name}</a></h3>
        </div>
        <button type="button" class="btn btn-outline-danger btn-sm" data-remove-bookmark>Remove</button>
      </div>
      <label class="form-label small" for="note-${entry.type}-${entry.id}">Personal note (this session only)</label>
      <textarea class="form-control bookmark-entry__note" id="note-${entry.type}-${entry.id}" data-note-field>${escapeHtml(entry.note)}</textarea>
    </div>
  `;
}

export async function renderBookmarks() {
  const [markets, produce] = await Promise.all([getMarkets(), getProduce()]);
  const marketsById = Object.fromEntries(markets.map((m) => [m.id, m]));
  const produceById = Object.fromEntries(produce.map((p) => [p.id, p]));

  setPageMeta({
    title: "FreshFind — Bookmarks",
    description: "Your saved markets and produce, with session-only notes.",
    path: "/bookmarks",
  });

  function getEntries() {
    return getBookmarks()
      .map((b) => {
        const item =
          b.type === "market" ? marketsById[b.id] : produceById[b.id];
        if (!item) return null;
        return { type: b.type, id: b.id, item, note: getNote(b.type, b.id) };
      })
      .filter(Boolean);
  }

  function renderList() {
    const entries = getEntries();

    if (!entries.length) {
      $("#bookmark-list").html(
        renderEmptyState({
          title: "No bookmarks yet.",
          message:
            "Bookmark a market or produce item to save it here for this session.",
          actionsHtml: `
            <a href="#/markets" class="btn btn-success">Browse Markets</a>
            <a href="#/produce" class="btn btn-outline-secondary">Browse Produce</a>
          `,
        }),
      );
      $("#bookmark-actions").addClass("d-none");
      return;
    }

    $("#bookmark-actions").removeClass("d-none");
    $("#bookmark-list").html(entries.map(renderEntry).join(""));
  }

  $("#main-content").html(`
    <div class="container py-4">
      ${renderSectionHeading({
        level: "h1",
        title: "Bookmarks",
        description: "Markets and produce you've saved for this session.",
        actionsHtml: `
          <div id="bookmark-actions" class="d-flex gap-2">
            <button type="button" class="btn btn-outline-secondary btn-sm" id="export-bookmarks">Export</button>
            <button type="button" class="btn btn-outline-secondary btn-sm" id="share-bookmarks">Share</button>
          </div>
        `,
      })}
      <p class="small text-muted" id="bookmark-feedback" aria-live="polite"></p>
      <div id="bookmark-list"></div>
    </div>
  `);

  renderList();

  $("#bookmark-list").on("click", "[data-remove-bookmark]", function () {
    const entry = $(this).closest("[data-entry-type]");
    removeBookmark(entry.data("entry-type"), String(entry.data("entry-id")));
  });

  $("#bookmark-list").on("change", "[data-note-field]", function () {
    const entry = $(this).closest("[data-entry-type]");
    setNote(
      entry.data("entry-type"),
      String(entry.data("entry-id")),
      $(this).val().trim(),
    );
  });

  $("#export-bookmarks").on("click", () => {
    const entries = getEntries();
    const blob = new Blob([buildExportText(entries)], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "freshfind-bookmarks.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  });

  $("#share-bookmarks").on("click", async () => {
    const entries = getEntries();
    const text = entries.map((e) => e.item.name).join(", ");
    const shareData = {
      title: "My FreshFind bookmarks",
      text: `Markets and produce I like: ${text}`,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        /* user cancelled the native share sheet */
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(shareData.text);
      $("#bookmark-feedback").text("Recommendation copied to clipboard.");
    } catch {
      $("#bookmark-feedback").text(shareData.text);
    }
  });

  return { cleanup: onBookmarksChanged(renderList) };
}
