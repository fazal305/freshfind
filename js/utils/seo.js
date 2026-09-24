function setMeta(name, content, attr = "name") {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function setPageMeta({ title, description, path }) {
  if (title) document.title = title;
  if (description) setMeta("description", description);
  if (title) setMeta("og:title", title, "property");
  if (description) setMeta("og:description", description, "property");
  setMeta("og:type", "website", "property");
  setMeta("twitter:card", "summary_large_image");
  if (title) setMeta("twitter:title", title);
  if (description) setMeta("twitter:description", description);
  if (path) setCanonical(`${window.location.origin}/#${path}`);
}
