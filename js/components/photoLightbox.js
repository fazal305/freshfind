export function renderLightboxModal() {
  const root = document.getElementById("lightbox-root") || createLightboxRoot();

  root.innerHTML = `
    <div class="modal fade photo-lightbox-modal" id="photoLightboxModal" tabindex="-1" aria-labelledby="lightboxTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content overflow-hidden border-0 shadow-lg">
          <div class="modal-header border-0 pb-0">
            <h2 class="modal-title h5" id="lightboxTitle"></h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body text-center p-3">
            <div class="lightbox-image-wrap mb-3 rounded overflow-hidden bg-black position-relative" style="max-height: 70vh;">
              <img id="lightboxImage" src="" alt="" class="img-fluid" style="max-height: 70vh; object-fit: contain;">
            </div>
            <p id="lightboxCaption" class="text-muted small mb-0"></p>
          </div>
        </div>
      </div>
    </div>
  `;

  bindLightboxEvents();
}

function createLightboxRoot() {
  const el = document.createElement("div");
  el.id = "lightbox-root";
  document.body.appendChild(el);
  return el;
}

function bindLightboxEvents() {
  $(document).on("click", "[data-lightbox-img]", function (e) {
    e.preventDefault();
    e.stopPropagation();

    const imgUrl = $(this).attr("data-lightbox-img");
    const title = $(this).attr("data-lightbox-title") || "FreshFind Photo";
    const caption = $(this).attr("data-lightbox-caption") || "";

    $("#lightboxImage").attr("src", imgUrl).attr("alt", title);
    $("#lightboxTitle").text(title);
    $("#lightboxCaption").text(caption);

    const modalEl = document.getElementById("photoLightboxModal");
    if (modalEl) {
      bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }
  });
}
