import { isMarketOpen } from "../utils/marketStatus.js";
import { isInSeason } from "../utils/seasonal.js";
import { DAYS_OF_WEEK } from "../utils/filter.js";
import { findMentionedDay, findMentionedProduce } from "./engine.js";

function marketLinks(markets) {
  return markets
    .map((m) => `<a href="#/markets/${m.slug}">${m.name}</a>`)
    .join(", ");
}

function produceLinks(items) {
  return items
    .map((p) => `<a href="#/produce/${p.slug}">${p.name}</a>`)
    .join(", ");
}

export function buildResponse(intent, input, context) {
  const { markets, produce } = context;

  if (intent.category === "open-now") {
    const open = markets.filter((m) => isMarketOpen(m));
    if (!open.length) {
      return "No markets are open right now. Try asking about a specific day, or browse the full directory.";
    }
    return `${intent.response} ${marketLinks(open)}.`;
  }

  if (intent.category === "market-hours") {
    const day = findMentionedDay(input, DAYS_OF_WEEK);
    if (!day) {
      return "Which day did you mean? Try naming a day like Saturday or Sunday.";
    }
    const matches = markets.filter((m) => m.hours.some((h) => h.day === day));
    if (!matches.length) {
      return `No markets are listed as open on ${day} in the current dataset.`;
    }
    return `Markets open on ${day}: ${marketLinks(matches)}.`;
  }

  if (intent.category === "produce") {
    const matches = findMentionedProduce(input, produce);
    if (!matches.length) {
      return `${intent.response} Browse the full <a href="#/produce">Produce Guide</a> for everything available.`;
    }
    return `${intent.response} ${produceLinks(matches)}.`;
  }

  if (intent.category === "seasonal") {
    const inSeason = produce.filter((p) => isInSeason(p));
    if (!inSeason.length) {
      return 'Nothing in the dataset is marked in season this month. Check the <a href="#/produce">Produce Guide</a> for what\'s coming up.';
    }
    return `${intent.response} ${produceLinks(inSeason)}.`;
  }

  if (intent.category === "location") {
    return `${intent.response} Try the <a href="#/markets">Market Directory</a> and use "Find markets near me".`;
  }

  return intent.response;
}

export function buildFallback() {
  return "I'm not sure about that yet. Try asking what's open now, what's in season, or how to bookmark a market.";
}
