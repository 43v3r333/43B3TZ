import { OddsValue } from "../odds";

export interface NormalizedOutcomeDTO {
  outcomeId: string;
  name: string;
  openingOdds: OddsValue;
  currentOdds: OddsValue;
  closingOdds?: OddsValue;
}

export interface CanonicalMarketDTO {
  marketId: string;         // compound unique ID (fixtureId + marketType + providerId)
  fixtureId: string;
  marketType: "match_outcome" | "over_under_2_5" | "both_teams_to_score" | "asian_handicap";
  providerId: string;       // identifier of the data source provider
  version: number;          // incremental updates
  timestamp: string;        // update time
  outcomes: NormalizedOutcomeDTO[];
  status: "open" | "suspended" | "closed";
}

export interface MarketProvider {
  providerId: string;
  providerName: string;
  reliabilityScore: number; // 0.0 - 1.0 based on historical latency, completeness
  weight: number;           // consensus weight factor
}
