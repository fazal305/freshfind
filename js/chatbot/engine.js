function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function matchIntent(input, chatbotData) {
  const norm = normalize(input);
  if (!norm) return null;

  let best = null;
  let bestScore = 0;

  for (const intent of chatbotData) {
    let score = 0;

    for (const pattern of intent.patterns ?? []) {
      try {
        if (new RegExp(pattern, "i").test(norm)) score += 3;
      } catch {
        /* skip malformed pattern */
      }
    }

    for (const keyword of intent.keywords ?? []) {
      if (norm.includes(keyword.toLowerCase())) score += 1;
    }

    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  return bestScore > 0 ? best : null;
}

export function findMentionedDay(input, daysOfWeek) {
  const norm = normalize(input);
  return daysOfWeek.find((day) => norm.includes(day.toLowerCase())) ?? null;
}

export function findMentionedProduce(input, produce) {
  const norm = normalize(input);
  return produce.filter(
    (p) =>
      norm.includes(p.name.toLowerCase()) ||
      norm.includes(p.category.toLowerCase()),
  );
}
