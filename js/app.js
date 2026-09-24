import { renderHeader, highlightActiveNav } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { renderChatbot } from "./components/chatbot.js";
import { bindBookmarkButtons } from "./components/bookmarkButton.js";
import { parseQuery } from "./utils/queryParams.js";
import { renderHome } from "./pages/home.js";
import { renderMarketDirectory } from "./pages/marketDirectory.js";
import { renderMarketDetail } from "./pages/marketDetail.js";
import { renderProduceGuide } from "./pages/produceGuide.js";
import { renderProduceDetail } from "./pages/produceDetail.js";
import { renderBookmarks } from "./pages/bookmarks.js";
import { renderContact } from "./pages/contact.js";
import { renderAbout } from "./pages/about.js";
import { renderNotFound } from "./pages/notFound.js";

function withNav(renderFn) {
  return async (params) => {
    const result = await renderFn(params);
    highlightActiveNav();
    return result;
  };
}

const routes = [
  { pattern: "/", handler: withNav(renderHome) },
  { pattern: "/markets", handler: withNav(renderMarketDirectory) },
  { pattern: "/markets/:marketSlug", handler: withNav(renderMarketDetail) },
  { pattern: "/produce", handler: withNav(renderProduceGuide) },
  { pattern: "/produce/:produceSlug", handler: withNav(renderProduceDetail) },
  { pattern: "/bookmarks", handler: withNav(renderBookmarks) },
  { pattern: "/contact", handler: withNav(renderContact) },
  { pattern: "/about", handler: withNav(renderAbout) },
].map(({ pattern, handler }) => {
  const paramNames = [];
  const regex = new RegExp(
    "^" +
      pattern.replace(/:[^/]+/g, (match) => {
        paramNames.push(match.slice(1));
        return "([^/]+)";
      }) +
      "$"
  );
  return { regex, paramNames, handler };
});

const notFoundHandler = withNav(renderNotFound);

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
    await notFoundHandler({});
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
    const result = await match.handler(params);
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
