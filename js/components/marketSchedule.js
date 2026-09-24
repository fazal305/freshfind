import { DAYS_OF_WEEK } from "../utils/filter.js";
import { formatTime12h } from "../utils/format.js";

export function renderMarketSchedule(
  market,
  today = DAYS_OF_WEEK[new Date().getDay()],
) {
  const rows = DAYS_OF_WEEK.map((day) => {
    const slots = market.hours.filter((h) => h.day === day);
    const isToday = day === today;
    const hoursText = slots.length
      ? slots
          .map((s) => `${formatTime12h(s.open)}–${formatTime12h(s.close)}`)
          .join(", ")
      : "Closed";

    return `
      <tr class="${isToday ? "table-active" : ""}">
        <th scope="row">${day}${isToday ? ' <span class="badge text-bg-success ms-1">Today</span>' : ""}</th>
        <td>${hoursText}</td>
      </tr>
    `;
  }).join("");

  return `
    <table class="table market-schedule-table">
      <caption class="visually-hidden">Weekly operating schedule</caption>
      <thead>
        <tr><th scope="col">Day</th><th scope="col">Hours</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}
