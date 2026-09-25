let observer = null;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );
  return observer;
}

/** Fade+slide elements up as they scroll into view. No-ops harmlessly if IntersectionObserver is unavailable. */
export function observeReveals(root = document) {
  const els = root.querySelectorAll(".reveal:not(.is-visible)");
  if (!("IntersectionObserver" in window)) {
    els.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const obs = getObserver();
  els.forEach((el) => {
    obs.observe(el);
    // Safety net: never leave content permanently invisible if IO doesn't fire
    // (some embedded/older webviews support the API but never call back).
    setTimeout(() => el.classList.add("is-visible"), 1500);
  });
}
