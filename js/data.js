const cache = new Map();

async function loadJSON(path) {
  if (cache.has(path)) return cache.get(path);

  const promise = fetch(path)
    .then((res) => {
      if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      cache.delete(path);
      throw err;
    });

  cache.set(path, promise);
  return promise;
}

export const getMarkets = () => loadJSON("/data/markets.json");
export const getProduce = () => loadJSON("/data/produce.json");
export const getChatbotData = () => loadJSON("/data/chatbot.json");
export const getSeasonalData = () => loadJSON("/data/seasonal.json");
export const getTeam = () => loadJSON("/data/team.json");
export const getSiteConfig = () => loadJSON("/data/site-config.json");
