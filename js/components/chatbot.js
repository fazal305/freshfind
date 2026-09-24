import { getMarkets, getProduce, getChatbotData } from "../data.js";
import { matchIntent } from "../chatbot/engine.js";
import { buildResponse, buildFallback } from "../chatbot/responses.js";

const messages = [];
let chatbotData = null;
let markets = null;
let produce = null;
let isOpen = false;

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

function renderMessages() {
  const html = messages
    .map(
      (m) => `
        <div class="chatbot-message chatbot-message--${m.role}">
          <div class="chatbot-message__bubble">${m.html}</div>
        </div>`,
    )
    .join("");
  $("#chatbot-messages").html(html);
  const el = document.getElementById("chatbot-messages");
  if (el) el.scrollTop = el.scrollHeight;
}

function addMessage(role, html) {
  messages.push({ role, html });
  renderMessages();
}

function renderSuggestions(suggestions) {
  if (!suggestions?.length) {
    $("#chatbot-suggestions").empty();
    return;
  }
  $("#chatbot-suggestions").html(
    suggestions
      .map(
        (s) =>
          `<button type="button" class="btn btn-sm btn-outline-success" data-suggestion="${escapeAttr(s)}">${escapeHtml(s)}</button>`,
      )
      .join(""),
  );
}

async function ensureData() {
  if (!chatbotData) {
    [chatbotData, markets, produce] = await Promise.all([
      getChatbotData(),
      getMarkets(),
      getProduce(),
    ]);
  }
}

async function handleUserMessage(text) {
  const trimmed = text.trim();
  if (!trimmed) return;

  addMessage("user", escapeHtml(trimmed));
  $("#chatbot-input").val("");
  renderSuggestions([]);

  $("#chatbot-typing").removeClass("d-none");

  await ensureData();
  const intent = matchIntent(trimmed, chatbotData);

  setTimeout(() => {
    $("#chatbot-typing").addClass("d-none");
    if (!intent) {
      addMessage("bot", buildFallback());
      renderSuggestions([
        "What's open right now?",
        "What's in season?",
        "How do I bookmark a market?",
      ]);
      return;
    }
    addMessage("bot", buildResponse(intent, trimmed, { markets, produce }));
    renderSuggestions(intent.suggestedFollowups);
  }, 500);
}

function openPanel() {
  isOpen = true;
  $("#chatbot-panel").removeClass("d-none");
  $("#chatbot-launcher").attr("aria-expanded", "true");
  document.getElementById("chatbot-input")?.focus();

  if (!messages.length) {
    addMessage(
      "bot",
      "Hi! I'm the FreshFind assistant. Ask me about market hours, produce, or what's open right now.",
    );
    renderSuggestions([
      "What's open right now?",
      "What vegetables are available?",
      "What's in season?",
    ]);
  }
}

function closePanel() {
  isOpen = false;
  $("#chatbot-panel").addClass("d-none");
  $("#chatbot-launcher").attr("aria-expanded", "false").trigger("focus");
}

export function renderChatbot() {
  $("#chatbot-root").html(`
    <button type="button" id="chatbot-launcher" class="chatbot-launcher" aria-expanded="false" aria-controls="chatbot-panel" aria-label="Open FreshFind assistant">
      💬
    </button>
    <div id="chatbot-panel" class="chatbot-panel d-none" role="dialog" aria-modal="false" aria-label="FreshFind assistant">
      <div class="chatbot-panel__header">
        <p class="mb-0 fw-semibold">FreshFind Assistant</p>
        <button type="button" id="chatbot-close" class="btn-close" aria-label="Close assistant"></button>
      </div>
      <div id="chatbot-messages" class="chatbot-panel__messages" aria-live="polite"></div>
      <div id="chatbot-typing" class="chatbot-panel__typing d-none">FreshFind assistant is typing…</div>
      <div id="chatbot-suggestions" class="chatbot-panel__suggestions"></div>
      <form id="chatbot-form" class="chatbot-panel__form">
        <label for="chatbot-input" class="visually-hidden">Ask FreshFind a question</label>
        <input type="text" id="chatbot-input" class="form-control" placeholder="Ask a question…" autocomplete="off">
        <button type="submit" class="btn btn-success">Send</button>
      </form>
    </div>
  `);

  $("#chatbot-launcher").on("click", () =>
    isOpen ? closePanel() : openPanel(),
  );
  $("#chatbot-close").on("click", closePanel);

  $("#chatbot-form").on("submit", (e) => {
    e.preventDefault();
    handleUserMessage($("#chatbot-input").val());
  });

  $("#chatbot-suggestions").on("click", "[data-suggestion]", function () {
    handleUserMessage($(this).data("suggestion"));
  });

  $(document).on("keydown", (e) => {
    if (e.key === "Escape" && isOpen) closePanel();
  });
}
