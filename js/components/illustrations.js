export function renderMarketIllustration() {
  return `
    <svg viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
      <rect width="200" height="120" fill="#1f4a30" />
      <path d="M20 55 L45 25 H155 L180 55 Z" fill="#2f6b45" />
      <rect x="20" y="55" width="160" height="8" fill="#16351f" />
      <path d="M30 30 L45 25 L52 55 H23 Z" fill="#d97b3f" />
      <path d="M74 25 L90 25 L86 55 H60 Z" fill="#f2ede1" />
      <path d="M112 25 L128 25 L124 55 H98 Z" fill="#d97b3f" />
      <path d="M150 25 L170 25 L177 55 H139 Z" fill="#f2ede1" />
      <rect x="45" y="63" width="20" height="35" fill="#6fae52" />
      <rect x="90" y="63" width="20" height="35" fill="#9c5223" />
      <rect x="135" y="63" width="20" height="35" fill="#6fae52" />
      <line x1="20" y1="98" x2="180" y2="98" stroke="#f2ede1" stroke-width="2" />
    </svg>
  `;
}

const PRODUCE_ICONS = {
  p1: `<circle cx="50" cy="55" r="30" fill="#c1442c"/><path d="M40 30 Q50 18 60 30" stroke="#4a7c3f" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  p2: `<circle cx="35" cy="45" r="16" fill="#d9678c"/><circle cx="65" cy="45" r="16" fill="#e0a12e"/><circle cx="50" cy="65" r="16" fill="#d9678c"/><circle cx="50" cy="50" r="10" fill="#f2ede1"/>`,
  p3: `<ellipse cx="38" cy="60" rx="16" ry="20" fill="#f2ede1" stroke="#c9bfa5" stroke-width="1.5"/><ellipse cx="66" cy="55" rx="14" ry="18" fill="#f5e6c8" stroke="#c9bfa5" stroke-width="1.5"/>`,
  p4: `<path d="M35 35 h30 l6 50 a6 6 0 0 1 -6 6 h-30 a6 6 0 0 1 -6 -6 z" fill="#e0a12e"/><rect x="42" y="25" width="16" height="12" rx="2" fill="#9c5223"/>`,
  p5: `<path d="M38 30 h24 l4 14 v36 a4 4 0 0 1 -4 4 h-24 a4 4 0 0 1 -4 -4 v-36 z" fill="#f2ede1" stroke="#c9bfa5" stroke-width="1.5"/><rect x="38" y="44" width="24" height="6" fill="#6fae52"/>`,
  p6: `<ellipse cx="50" cy="58" rx="32" ry="22" fill="#d9a05b"/><ellipse cx="50" cy="54" rx="26" ry="17" fill="#e8bd82"/><circle cx="40" cy="52" r="2.5" fill="#9c5223"/><circle cx="58" cy="48" r="2.5" fill="#9c5223"/><circle cx="52" cy="62" r="2.5" fill="#9c5223"/>`,
  p7: `<path d="M50 80 C20 70 20 30 50 20 C80 30 80 70 50 80 Z" fill="#4a7c3f"/><path d="M50 78 V22" stroke="#2f5723" stroke-width="2"/>`,
  p8: `<path d="M30 55 C30 30 45 20 62 25 C78 30 78 50 65 65 C52 80 30 78 30 55 Z" fill="#e0a12e"/><path d="M62 25 C68 20 76 20 80 24" stroke="#4a7c3f" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  p9: `<path d="M42 20 h16 v14 l6 6 v38 a4 4 0 0 1 -4 4 h-20 a4 4 0 0 1 -4 -4 v-38 l6 -6 z" fill="#e9d18a" stroke="#9c5223" stroke-width="1.5"/><rect x="44" y="46" width="12" height="22" fill="#c8952f"/>`,
};

export function renderProduceIllustration(produceId) {
  const inner =
    PRODUCE_ICONS[produceId] ??
    `<circle cx="50" cy="50" r="30" fill="#9c5223"/>`;
  return `
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="presentation" aria-hidden="true">
      <rect width="100" height="100" fill="#f2ede1" />
      ${inner}
    </svg>
  `;
}
