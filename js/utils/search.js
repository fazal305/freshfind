export function normalizeText(text) {
  return String(text ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function searchMarkets(markets, query, produceById) {
  const q = normalizeText(query);
  if (!q) return markets;

  const ranked = [];
  for (const market of markets) {
    const name = normalizeText(market.name);
    const area = normalizeText(market.area);
    const description = normalizeText(market.description);
    const produceNames = (market.produceIds ?? [])
      .map((id) => produceById?.[id]?.name)
      .filter(Boolean)
      .map(normalizeText);

    let rank = null;
    if (name === q) rank = 0;
    else if (name.includes(q)) rank = 1;
    else if (area.includes(q)) rank = 2;
    else if (produceNames.some((p) => p.includes(q))) rank = 3;
    else if (description.includes(q)) rank = 4;

    if (rank !== null) ranked.push({ market, rank });
  }

  ranked.sort((a, b) => a.rank - b.rank);
  return ranked.map((r) => r.market);
}
