const VISITS_KEY = "freshfind:visits";
const LAUNCH_DATE = new Date("2026-01-01T00:00:00Z");

function daysSinceLaunch() {
  return Math.max(
    0,
    Math.floor((Date.now() - LAUNCH_DATE.getTime()) / 86400000),
  );
}

function getPersonalVisitCount() {
  try {
    const count = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1;
    localStorage.setItem(VISITS_KEY, String(count));
    return count;
  } catch {
    return 1;
  }
}

export function getSimulatedVisitorCount(seed) {
  const dailyGrowth = daysSinceLaunch() * 7;
  const personal = getPersonalVisitCount();
  return seed + dailyGrowth + personal;
}
