export const MARKET_LABELS: Record<string, string> = {
  result: 'Match Result',
  doubleChance: 'Double Chance',
  correctScore: 'Correct Score',
  goalsOverUnder: 'Goals Over/Under',
  bts: 'Both Teams to Score',
  cornersOverUnder: 'Corners Over/Under',
  yellowCards: 'Yellow Cards',
  highestScoringHalf: 'Highest Scoring Half',
};

export const MARKET_ICONS: Record<string, string> = {
  result: '⚽',
  doubleChance: '2️⃣',
  correctScore: '🎯',
  goalsOverUnder: '📊',
  bts: '🥅',
  cornersOverUnder: '🚩',
  yellowCards: '🟨',
  highestScoringHalf: '⏱️',
};

export const MARKET_KEYS = Object.keys(MARKET_LABELS);

export const PREFERRED_MARKET_OPTIONS = [
  { key: 'result', label: 'Result' },
  { key: 'doubleChance', label: 'Double' },
  { key: 'bts', label: 'BTS' },
  { key: 'goalsOverUnder', label: 'Goals' },
  { key: 'cornersOverUnder', label: 'Corners' },
  { key: 'yellowCards', label: 'Cards' },
  { key: 'highestScoringHalf', label: 'Half' },
];
