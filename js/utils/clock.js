export function onEveryMinute(callback) {
  callback(new Date());
  const id = setInterval(() => callback(new Date()), 30000);
  return () => clearInterval(id);
}

export function formatClock(date = new Date()) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function formatDayDate(date = new Date()) {
  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
