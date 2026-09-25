import { renderHeader, highlightActiveNav } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { renderChatbot } from "./components/chatbot.js";
import { bindBookmarkButtons } from "./components/bookmarkButton.js";
import { parseQuery } from "./utils/queryParams.js";

function withNav(renderFn) {
  return async (params) => {
    const result = await renderFn(params);
    highlightActiveNav();
    return result;
  };
}

const routeDefs = [
  { pattern: "/", load: () => import("./pages/home.js").then((m) => m.renderHome) },
  { pattern: "/markets", load: () => import("./pages/marketDirectory.js").then((m) => m.renderMarketDirectory) },
  { pattern: "/markets/:marketSlug", load: () => import("./pages/marketDetail.js").then((m) => m.renderMarketDetail) },
  { pattern: "/produce", load: () => import("./pages/produceGuide.js").then((m) => m.renderProduceGuide) },
  { pattern: "/produce/:produceSlug", load: () => import("./pages/produceDetail.js").then((m) => m.renderProduceDetail) },
  { pattern: "/bookmarks", load: () => import("./pages/bookmarks.js").then((m) => m.renderBookmarks) },
  { pattern: "/contact", load: () => import("./pages/contact.js").then((m) => m.renderContact) },
  { pattern: "/about", load: () => import("./pages/about.js").then((m) => m.renderAbout) },
];

const routes = routeDefs.map(({ pattern, load }) => {
  const paramNames = [];
  const regex = new RegExp(
    "^" +
      pattern.replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return "([^/]+)";
      }) +
      "$"
  );
  return { regex, paramNames, load };
});

const loadNotFound = () => import("./pages/notFound.js").then((m) => m.renderNotFound);

let currentRoute = null;
let currentOnQueryChange = null;
let currentCleanup = null;

function currentPath() {
  return window.location.hash.slice(1) || "/";
}

function teardownCurrentRoute() {
  if (currentCleanup) currentCleanup();
  currentRoute = null;
  currentOnQueryChange = null;
  currentCleanup = null;
}

function showLoadingBar() {
  const bar = document.getElementById("page-loading-bar");
  if (!bar) return;
  bar.classList.remove("is-done");
  void bar.offsetWidth;
  bar.classList.add("is-loading");
}

function hideLoadingBar() {
  const bar = document.getElementById("page-loading-bar");
  if (!bar) return;
  bar.classList.remove("is-loading");
  bar.classList.add("is-done");
}

function replayPageAnimation() {
  const main = document.getElementById("main-content");
  if (!main) return;
  main.style.animation = "none";
  void main.offsetWidth;
  main.style.animation = "";
}

function renderRouteError() {
  const main = document.getElementById("main-content");
  if (!main) return;
  main.innerHTML = `
    <div class="container py-5">
      <div class="empty-state" role="alert">
        <h1>Something went wrong loading this page.</h1>
        <p>Try going back to the homepage and starting again.</p>
        <div class="d-flex justify-content-center mt-3">
          <a href="#/" class="btn btn-success">Back to FreshFind</a>
        </div>
      </div>
    </div>
  `;
}

async function handleRouteChange() {
  const [path] = currentPath().split("?");
  const match = routes.find((r) => r.regex.test(path));

  if (!match) {
    teardownCurrentRoute();
    showLoadingBar();
    try {
      const renderFn = await loadNotFound();
      await withNav(renderFn)({});
    } catch (error) {
      console.error("FreshFind route error:", error);
      renderRouteError();
    }
    hideLoadingBar();
    replayPageAnimation();
    return;
  }

  if (match === currentRoute && currentOnQueryChange) {
    currentOnQueryChange(parseQuery());
    return;
  }

  teardownCurrentRoute();
  window.scrollTo({ top: 0, behavior: "instant" });
  showLoadingBar();

  const values = match.regex.exec(path).slice(1);
  const params = Object.fromEntries(match.paramNames.map((name, i) => [name, values[i]]));

  try {
    const renderFn = await match.load();
    const result = await withNav(renderFn)(params);
    currentRoute = match;
    currentOnQueryChange = typeof result === "function" ? result : null;
    currentCleanup = result && typeof result === "object" ? (result.cleanup ?? null) : null;
  } catch (error) {
    console.error("FreshFind route error:", error);
    renderRouteError();
  }

  hideLoadingBar();
  replayPageAnimation();
}

function bindSkipLink() {
  document.getElementById("skip-link")?.addEventListener("click", (e) => {
    e.preventDefault();
    const main = document.getElementById("main-content");
    main?.focus();
    main?.scrollIntoView();
  });
}

async function bootstrap() {
  await Promise.all([renderHeader(), renderFooter()]);
  renderChatbot();
  bindBookmarkButtons("#main-content");
  bindSkipLink();

  window.addEventListener("hashchange", handleRouteChange);
  handleRouteChange();
}

bootstrap();
