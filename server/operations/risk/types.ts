
export interface RiskMetrics {
  systemRiskScore: number; // 0-100
  operationalRiskScore: number; // 0-100
  dataQualityRisk: number; // 0-100
  modelHealthRisk: number; // 0-100
}

export interface ScenarioResult {
  scenarioName: string;
  impactScore: number;
  probability: number;
}
