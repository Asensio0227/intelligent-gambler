export interface ITicketLeg {
  predictionId: string;
  fixtureId: string;
  market: string;
  selection: string;
  confidence: number;
  outcome: boolean | null;
}

export interface ITicket {
  _id: string;
  createdBy: string;
  label: string;
  status: 'PENDING' | 'WON' | 'LOST' | 'PARTIAL';
  legs: ITicketLeg[];
  summary: {
    totalLegs: number;
    averageConfidence: number;
    legsWon: number | null;
    legsLost: number | null;
  };
  createdAt: string;
}

export interface ITicketProposal {
  label: string;
  totalLegs: number;
  averageConfidence: number;
  legs: {
    predictionId: string;
    fixtureId: string;
    homeTeam: string;
    awayTeam: string;
    league: string;
    kickoff: string;
    market: string;
    selection: string;
    confidence: number;
  }[];
}

export interface IAutoGenerateParams {
  numberOfTickets: number;
  legsPerTicket: number;
  minConfidence: number;
  diversify: boolean;
  preferredMarkets?: string[];
}
