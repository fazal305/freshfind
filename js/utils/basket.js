const STORAGE_KEY = "freshfind_green_basket";

function readStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeStorage(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage quota exceeded or disabled */
  }
  window.dispatchEvent(
    new CustomEvent("freshfind:basket-changed", { detail: { items } }),
  );
}

export function getBasket() {
  return readStorage();
}

export function getBasketCount() {
  return readStorage().reduce((sum, item) => sum + (item.quantity || 1), 0);
}

export function isInBasket(produceId) {
  return readStorage().some((item) => item.id === produceId);
}

export function addToBasket(produceItem, quantity = 1) {
  const items = readStorage();
  const existing = items.find((item) => item.id === produceItem.id);

  if (existing) {
    existing.quantity = (existing.quantity || 1) + quantity;
  } else {
    items.push({
      id: produceItem.id,
      slug: produceItem.slug,
      name: produceItem.name,
      category: produceItem.category,
      approxPrice: produceItem.approxPrice || "Market rate",
      unit: produceItem.unit || "unit",
      image: produceItem.image || "",
      marketIds: produceItem.marketIds || [],
      quantity: quantity,
      checked: false,
    });
  }

  writeStorage(items);
}

export function updateBasketItem(produceId, updates) {
  const items = readStorage();
  const item = items.find((i) => i.id === produceId);
  if (!item) return;

  Object.assign(item, updates);
  if (item.quantity <= 0) {
    removeFromBasket(produceId);
    return;
  }

  writeStorage(items);
}

export function removeFromBasket(produceId) {
  const items = readStorage().filter((item) => item.id !== produceId);
  writeStorage(items);
}

export function clearBasket() {
  writeStorage([]);
}

export function calculateEstimatedTotal(items) {
  let total = 0;
  for (const item of items) {
    if (!item.approxPrice) continue;
    const match = item.approxPrice.match(/Rs\.?\s*([\d,]+)/i);
    if (match) {
      const price = parseInt(match[1].replace(/,/g, ""), 10);
      if (!isNaN(price)) {
        total += price * (item.quantity || 1);
      }
    }
  }
  return total;
}

export function formatBasketExport(items, markets = []) {
  const dateStr = new Date().toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let text = `========================================\n`;
  text += `FRESHFIND — eGREEN BASKET SHOPPING LIST\n`;
  text += `Generated: ${dateStr}\n`;
  text += `========================================\n\n`;

  if (!items.length) {
    text += `Your basket is currently empty.\n`;
    return text;
  }

  text += `SHOPPING CHECKLIST:\n`;
  items.forEach((item, idx) => {
    const mark = item.checked ? "[x]" : "[ ]";
    text += `${mark} ${idx + 1}. ${item.name} — ${item.quantity} ${item.unit} (${item.approxPrice})\n`;
  });

  const estimatedTotal = calculateEstimatedTotal(items);
  if (estimatedTotal > 0) {
    text += `\nEstimated Basket Total: Rs. ${estimatedTotal.toLocaleString()}\n`;
  }

  if (markets.length) {
    text += `\nRECOMMENDED LOCAL MARKETS TO VISIT:\n`;
    markets.forEach((m) => {
      const matchingItems = items.filter((item) =>
        m.produceIds.includes(item.id),
      );
      if (matchingItems.length > 0) {
        text += `• ${m.name} (${m.area}) — Carries ${matchingItems.length}/${items.length} items on your list\n`;
        text += `  Hours: ${m.hours.map((h) => `${h.day} ${h.open}-${h.close}`).join(", ")}\n`;
      }
    });
  }

  text += `\nTip: Arrive early for freshest harvest.\n`;
  text += `FreshFind — Fresh All Along · https://freshfind-fz17.vercel.app\n`;
  return text;
}
