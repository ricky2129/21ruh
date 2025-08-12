export interface PortfolioGraphResponse {
  app_name: string;
  app_id: number;
  actual_reliability_score: number;
  forecast_reliability_score: number;
}

export interface PortfolioDetailsResponse {
  SLO: number;
  SLI: number;
  Remediation: number;
  applications: number;
}

export interface PortfolioRecommendationResponse {
  application: string;
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
