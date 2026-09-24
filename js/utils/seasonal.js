export function isInSeason(produceItem, date = new Date()) {
  return produceItem.availableMonths.includes(date.getMonth() + 1);
}

export function getUniqueCategories(produce) {
  return [...new Set(produce.map((p) => p.category))].sort();
}

export function searchProduce(produce, query) {
  const q = String(query ?? "")
    .toLowerCase()
    .trim();
  if (!q) return produce;
  return produce.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q),
  );
}

export function filterProduceByCategory(produce, category) {
  if (!category) return produce;
  return produce.filter((p) => p.category === category);
}
