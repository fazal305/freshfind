export function getUniqueAreas(markets) {
  return [...new Set(markets.map((m) => m.area))].sort();
}

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function filterMarkets(markets, { area, day, produceId } = {}) {
  return markets.filter((market) => {
    if (area && market.area !== area) return false;
    if (day && !market.hours.some((h) => h.day === day)) return false;
    if (produceId && !market.produceIds.includes(produceId)) return false;
    return true;
  });
}
