import { CanonicalMarketDTO } from "../markets/types";

export interface ArbitrageOpportunity {
  fixtureId: string;
  marketType: string;
  outcomes: Array<{
    name: string;
    bestOdds: number;
    bestProviderId: string;
  }>;
  arbitrageSum: number; // sum of 1 / bestOdds
  profitMargin: number;  // (1 - arbitrageSum) * 100
  isArbitragePresent: boolean;
}

export class ArbitrageMonitor {
  /**
   * Scans cross-provider odds for the same fixture & market to identify arbitrage spreads.
   */
  public static scanForArbitrage(
    fixtureId: string,
    marketType: string,
    allMarkets: CanonicalMarketDTO[]
  ): ArbitrageOpportunity | null {
    const relevant = allMarkets.filter(m => m.fixtureId === fixtureId && m.marketType === marketType && m.status === "open");
    if (relevant.length < 2) return null;

    // Get all outcome names
    const outcomesNames = Array.from(new Set(relevant.flatMap(m => m.outcomes.map(o => o.name))));
    
    const outcomesList: ArbitrageOpportunity["outcomes"] = [];
    let arbitrageSum = 0;

    for (const name of outcomesNames) {
      let bestOdds = 0;
      let bestProviderId = "";

      relevant.forEach(market => {
        const out = market.outcomes.find(o => o.name === name);
        if (out && out.currentOdds.decimal > bestOdds) {
          bestOdds = out.currentOdds.decimal;
          bestProviderId = market.providerId;
        }
      });

      if (bestOdds === 0) return null; // missing an outcome entirely

      outcomesList.push({
        name,
        bestOdds,
        bestProviderId
      });

      arbitrageSum += 1 / bestOdds;
    }

    const isArbitragePresent = arbitrageSum < 1.0;
    const profitMargin = isArbitragePresent ? (1.0 - arbitrageSum) * 100 : 0;

    return {
      fixtureId,
      marketType,
      outcomes: outcomesList,
      arbitrageSum,
      profitMargin,
      isArbitragePresent
    };
  }
}
