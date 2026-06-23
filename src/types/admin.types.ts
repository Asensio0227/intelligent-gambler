export interface IAdminStats {
  totalUsers: number;
  totalPredictions: number;
  totalTickets: number;
  fixturesSynced: number;
  lastSyncTime?: string;
}

export interface IUsageStats {
  predictionsGenerated: number;
  tokensUsed: number;
  estimatedCost: number;
  month: string;
}
