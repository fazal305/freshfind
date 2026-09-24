import { DAYS_OF_WEEK } from "./filter.js";
import { formatTime12h } from "./format.js";

function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isMarketOpen(market, date = new Date()) {
  const day = DAYS_OF_WEEK[date.getDay()];
  const minutesNow = date.getHours() * 60 + date.getMinutes();
  return market.hours.some(
    (h) =>
      h.day === day &&
      minutesNow >= timeToMinutes(h.open) &&
      minutesNow < timeToMinutes(h.close),
  );
}

export function getMarketStatus(market, date = new Date()) {
  if (isMarketOpen(market, date)) return { open: true, label: "Open now" };
  const next = getNextOpening(market, date);
  return {
    open: false,
    label: next
      ? `Opens ${next.day} at ${formatTime12h(next.open)}`
      : "Hours not available",
  };
}

export function getNextOpening(market, date = new Date()) {
  if (!market.hours.length) return null;
  const todayIndex = date.getDay();
  const minutesNow = date.getHours() * 60 + date.getMinutes();

  for (let offset = 0; offset < 7; offset++) {
    const dayIndex = (todayIndex + offset) % 7;
    const dayName = DAYS_OF_WEEK[dayIndex];
    const slots = market.hours
      .filter((h) => h.day === dayName)
      .sort((a, b) => timeToMinutes(a.open) - timeToMinutes(b.open));

    for (const slot of slots) {
      if (offset > 0 || timeToMinutes(slot.open) > minutesNow) {
        return { day: dayName, open: slot.open, daysFromNow: offset };
      }
    }
  }
  return null;
}
