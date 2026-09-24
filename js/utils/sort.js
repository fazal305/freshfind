import { getNextOpening } from "./marketStatus.js";
import { haversineDistanceKm } from "./distance.js";

export const SORT_OPTIONS = [
  { value: "alphabetical", label: "Alphabetical" },
  { value: "next-open", label: "Next open day" },
  { value: "distance", label: "Distance", requiresLocation: true },
];

export function sortMarkets(markets, sortBy, userLocation) {
  const list = [...markets];

  if (sortBy === "alphabetical") {
    return list.sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortBy === "next-open") {
    return list.sort((a, b) => {
      const nextA = getNextOpening(a);
      const nextB = getNextOpening(b);
      const daysA = nextA ? nextA.daysFromNow : Infinity;
      const daysB = nextB ? nextB.daysFromNow : Infinity;
      return daysA - daysB;
    });
  }

  if (sortBy === "distance" && userLocation) {
    return list.sort((a, b) => {
      const distA = a.coordinates
        ? haversineDistanceKm(userLocation, a.coordinates)
        : Infinity;
      const distB = b.coordinates
        ? haversineDistanceKm(userLocation, b.coordinates)
        : Infinity;
      return distA - distB;
    });
  }

  return list;
}
