export interface AppDetailsResponse {
  SLO: number;
  SLI: number;
  RTO_RPO_missed: number; // TODO: replace / with _
  antipatterns: number;
}

export interface AppDashboardRecommendTableResponse {
  componentName: string;
  cost: {
    amount: number;
    currency: string;
    frequency: string;
  };
  description: string;
  optimizationType: string;
  suggestedChanges: string[];
  environment: string;
  reliablity_score: number;
}

export interface AppReliabilityScoreResponse {
  env_name: string;
  env_id: number;
  data: {
    version: string;
    score: number;
  }[];
}

export interface AppReliabilityPostureResponse {
  env_name: string;
  env_id: number;
  actual_reliability_score: number;
  forecast_reliability_score: number;
}
