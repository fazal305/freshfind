export function parseQuery() {
  const [, queryString = ""] = window.location.hash.split("?");
  return Object.fromEntries(new URLSearchParams(queryString));
}

export function navigate(path) {
  window.location.hash = path;
}

export function updateQuery(params) {
  const [path] = window.location.hash.slice(1).split("?");
  const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v));
  const queryString = query.toString();
  window.location.hash = queryString ? `${path}?${queryString}` : path;
}
