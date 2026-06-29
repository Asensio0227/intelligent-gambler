export interface IMarket {
  prediction: string | boolean;
  confidence: number;
  line?: number;
}

export interface IPrediction {
  _id: string;
  fixtureId: string;
  generatedBy: string;
  userId: string | null;
  mode: 'shared' | 'personal';
  markets: {
    result: IMarket;
    doubleChance: IMarket;
    correctScore: IMarket;
    goalsOverUnder: IMarket;
    bts: IMarket;
    cornersOverUnder: IMarket;
    yellowCards: IMarket;
    highestScoringHalf: IMarket;
  };
  reasoning: {
    summary: string;
    perMarket: Record<string, string>;
  };
  tokensUsed: {
    input: number;
    output: number;
    totalCost: number;
  };
  outcome: {
    resolved: boolean;
    resolvedAt: string | null;
    accuracy: Record<string, boolean | null>;
  };
  createdAt: string;
}

export interface ISimilarMatch {
  predictionId: string;
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  score: string;
  date: string;
  similarityScore: number;
  markets: Record<string, IMarket>;
  reasoning: string;
}
