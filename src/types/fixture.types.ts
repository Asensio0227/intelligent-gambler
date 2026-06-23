export interface IFixture {
  _id: string;
  fixtureId: string;
  homeTeam: { id: string; name: string; logo: string };
  awayTeam: { id: string; name: string; logo: string };
  league: { id: string; name: string; country: string; logo: string };
  kickoff: string;
  season: string;
  venue: string | null;
  status: 'NS' | 'LIVE' | 'FT' | 'PST' | 'CANC';
  result: {
    homeGoals: number | null;
    awayGoals: number | null;
    htHomeGoals: number | null;
    htAwayGoals: number | null;
    corners: { home: number | null; away: number | null };
    yellowCards: { home: number | null; away: number | null };
  };
  predictionGenerated: boolean;
  createdAt: string;
}

export interface IFixtureFilters {
  status?: string;
  league?: string;
  date?: string;
  search?: string;
  sort?: 'asc' | 'desc';
}
