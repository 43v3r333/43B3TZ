import { CanonicalMarketDTO, MarketProvider } from "../markets/types";
import { resolveOdds } from "../odds";
import { marketHistoryStore } from "../history";
import { marketEventBus } from "../events";
import { ConsensusEngine } from "../consensus";
import { AnomalyEngine, MarketAnomaly } from "../anomalies";
import { SharpMoneyEngine } from "../sharp-money";
import { QualityEngine, ProviderQualityMetrics } from "../quality";
import { ArbitrageMonitor, ArbitrageOpportunity } from "../arbitrage-monitor";
import { createLogger } from "../../core/logger";

const logger = createLogger("MarketSimulationWorker");

export interface MockFixture {
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  kickoff: string;
}

export const MOCK_FIXTURES: MockFixture[] = [
  { fixtureId: "fix_cl_1", homeTeam: "Real Madrid", awayTeam: "Barcelona", kickoff: new Date(Date.now() + 180 * 60 * 1000).toISOString() },
  { fixtureId: "fix_pl_1", homeTeam: "Manchester City", awayTeam: "Arsenal", kickoff: new Date(Date.now() + 240 * 60 * 1000).toISOString() },
  { fixtureId: "fix_cl_2", homeTeam: "PSG", awayTeam: "Bayern Munich", kickoff: new Date(Date.now() + 360 * 60 * 1000).toISOString() }
];

export const MARKET_PROVIDERS: MarketProvider[] = [
  { providerId: "Sportradar", providerName: "Sportradar Global Feeds", reliabilityScore: 0.96, weight: 1.0 },
  { providerId: "ApiFootball", providerName: "API Football Odds", reliabilityScore: 0.88, weight: 0.75 },
  { providerId: "Pinnacle_Mock", providerName: "Pinnacle Enterprise Feed", reliabilityScore: 0.99, weight: 1.2 }
];

export class MarketSimulationWorker {
  private static intervalId: NodeJS.Timeout | null = null;
  private static sequenceNum = 0;

  // Track anomalies and active reports for visualization
  public static activeAnomalies: MarketAnomaly[] = [];
  public static activeQuality: Record<string, ProviderQualityMetrics> = {};
  public static activeArbitrage: ArbitrageOpportunity[] = [];

  /**
   * Generates a realistic set of initial market lines across providers.
   */
  public static initializeMarkets(): void {
    logger.info("Initializing baseline market lines...");
    
    MOCK_FIXTURES.forEach(fix => {
      // Create initial Match Outcome lines for all 3 providers
      MARKET_PROVIDERS.forEach(provider => {
        const baseOdds = this.getBaseOdds(fix.fixtureId);
        
        // Add a slight provider-specific overround / margin bias
        // Pinnacle has tight overround (~2.5%), ApiFootball has wide overround (~7.0%)
        let overroundFactor = 1.03; // Sportradar
        if (provider.providerId === "Pinnacle_Mock") overroundFactor = 1.025;
        if (provider.providerId === "ApiFootball") overroundFactor = 1.07;

        const homeOdds = baseOdds.home * overroundFactor;
        const drawOdds = baseOdds.draw * overroundFactor;
        const awayOdds = baseOdds.away * overroundFactor;

        const market: CanonicalMarketDTO = {
          marketId: `${fix.fixtureId}_match_outcome_${provider.providerId}`,
          fixtureId: fix.fixtureId,
          marketType: "match_outcome",
          providerId: provider.providerId,
          version: 1,
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
          status: "open",
          outcomes: [
            { outcomeId: "home", name: "Home", openingOdds: resolveOdds(homeOdds), currentOdds: resolveOdds(homeOdds) },
            { outcomeId: "draw", name: "Draw", openingOdds: resolveOdds(drawOdds), currentOdds: resolveOdds(drawOdds) },
            { outcomeId: "away", name: "Away", openingOdds: resolveOdds(awayOdds), currentOdds: resolveOdds(awayOdds) }
          ]
        };

        marketHistoryStore.logMarket(market);
        marketEventBus.publish("MarketOpened", market.marketId, market.fixtureId, {
          providerId: market.providerId,
          marketType: market.marketType
        });
      });
    });

    this.runPlatformPipeline();
  }

  /**
   * Boots the cron-style simulation loop to update market rates over time.
   */
  public static start(): void {
    if (this.intervalId) return;

    this.initializeMarkets();

    // Trigger update tick every 8 seconds
    this.intervalId = setInterval(() => {
      this.tick();
    }, 8000);

    logger.info("Market Simulation Worker successfully started on 8s intervals.");
  }

  public static stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info("Market Simulation Worker stopped.");
    }
  }

  /**
   * Simulates a new feed update tick, shifting market prices and re-running analyses.
   */
  private static tick(): void {
    this.sequenceNum++;

    // Select a random fixture and a random provider to update
    const randomFix = MOCK_FIXTURES[Math.floor(Math.random() * MOCK_FIXTURES.length)];
    const randomProvider = MARKET_PROVIDERS[Math.floor(Math.random() * MARKET_PROVIDERS.length)];
    const marketId = `${randomFix.fixtureId}_match_outcome_${randomProvider.providerId}`;

    const history = marketHistoryStore.getMarketHistory(marketId);
    if (history.length === 0) return;

    const latest = history[history.length - 1];
    
    // Increment version and update timestamp
    const nextVersion = latest.version + 1;
    const nextTimestamp = new Date().toISOString();

    // Apply a randomized drift to current odds
    // In some ticks, simulate a "steam move" or sharp money shift
    const isSpecialTick = this.sequenceNum % 7 === 0;
    const isAnomalyTick = this.sequenceNum % 13 === 0;

    const updatedOutcomes = latest.outcomes.map(out => {
      let drift = (Math.random() - 0.5) * 0.12; // default small jitter

      if (isSpecialTick && out.name === "Home") {
        drift = -0.32; // rapid shortening of Home odds (Steam move)
      }
      if (isAnomalyTick && randomProvider.providerId === "ApiFootball" && out.name === "Away") {
        drift = 0.85; // extreme positive outlier gap
      }

      const nextDecimal = Math.max(1.05, Math.min(15.0, out.currentOdds.decimal + drift));
      return {
        ...out,
        currentOdds: resolveOdds(nextDecimal)
      };
    });

    const updatedMarket: CanonicalMarketDTO = {
      ...latest,
      version: nextVersion,
      timestamp: nextTimestamp,
      outcomes: updatedOutcomes
    };

    // Log the updated market
    marketHistoryStore.logMarket(updatedMarket);

    // Trigger update event
    marketEventBus.publish("MarketUpdated", updatedMarket.marketId, updatedMarket.fixtureId, {
      providerId: updatedMarket.providerId,
      version: updatedMarket.version,
      odds: updatedOutcomes.map(o => `${o.name}:${o.currentOdds.decimal}`).join(", ")
    });

    // Run analyses
    this.runPlatformPipeline();
  }

  /**
   * Refreshes the active consensus, overround calculations, quality scores, and monitors.
   */
  public static runPlatformPipeline(): void {
    const allRecords = marketHistoryStore.getAllRecords();

    // Reconstruct latest state
    const latestMarketsMap: Record<string, CanonicalMarketDTO> = {};
    for (const rec of allRecords) {
      const existing = latestMarketsMap[rec.marketId];
      if (!existing || new Date(rec.timestamp).getTime() > new Date(existing.timestamp).getTime()) {
        latestMarketsMap[rec.marketId] = rec;
      }
    }
    const latestMarkets = Object.values(latestMarketsMap);

    // 1. Re-calculate Consensus & Overround across all fixtures
    MOCK_FIXTURES.forEach(fix => {
      const marketType = "match_outcome";
      const providersList = latestMarkets.filter(m => m.fixtureId === fix.fixtureId && m.marketType === marketType);
      
      const weights: Record<string, number> = {};
      MARKET_PROVIDERS.forEach(p => { weights[p.providerId] = p.weight; });

      const consensus = ConsensusEngine.computeConsensus(fix.fixtureId, marketType, providersList, weights);
      if (consensus) {
        marketEventBus.publish("ConsensusUpdated", `${fix.fixtureId}_consensus`, fix.fixtureId, {
          marketConfidence: consensus.marketConfidence,
          agreementScore: consensus.agreementScore,
          averageOdds: consensus.outcomes.map(o => `${o.name}:${o.averageOdds.decimal}`).join(", ")
        });
      }
    });

    // 2. Scan for Arbitrage opportunities across fixtures
    const arbList: ArbitrageOpportunity[] = [];
    MOCK_FIXTURES.forEach(fix => {
      const arb = ArbitrageMonitor.scanForArbitrage(fix.fixtureId, "match_outcome", latestMarkets);
      if (arb) {
        arbList.push(arb);
      }
    });
    this.activeArbitrage = arbList;

    // 3. Scan for Anomalies (sequential & cross-provider)
    let currentAnoms: MarketAnomaly[] = [];
    MOCK_FIXTURES.forEach(fix => {
      // Cross provider outliers
      const crossAnoms = AnomalyEngine.detectCrossProviderAnomalies(fix.fixtureId, "match_outcome", latestMarkets);
      currentAnoms.push(...crossAnoms);

      // Sequential updates
      MARKET_PROVIDERS.forEach(p => {
        const pId = `${fix.fixtureId}_match_outcome_${p.providerId}`;
        const hist = marketHistoryStore.getMarketHistory(pId);
        const seqAnoms = AnomalyEngine.detectSequentialAnomalies(hist);
        currentAnoms.push(...seqAnoms);
      });
    });

    // Keep unique active anomalies (by description or id) to prevent duplicate lists
    const uniqueAnomsMap: Record<string, MarketAnomaly> = {};
    currentAnoms.forEach(a => { uniqueAnomsMap[a.description] = a; });
    this.activeAnomalies = Object.values(uniqueAnomsMap).slice(-8); // keep latest 8

    // 4. Calculate Provider Quality Metrics
    MARKET_PROVIDERS.forEach(provider => {
      const pAnoms = this.activeAnomalies.filter(a => a.marketId.includes(provider.providerId)).length;
      const q = QualityEngine.calculateQuality(provider.providerId, latestMarkets, pAnoms);
      this.activeQuality[provider.providerId] = q;
    });
  }

  private static getBaseOdds(fixtureId: string): { home: number; draw: number; away: number } {
    if (fixtureId === "fix_cl_1") return { home: 1.85, draw: 3.50, away: 4.10 }; // El Clasico (Real Madrid favored)
    if (fixtureId === "fix_pl_1") return { home: 1.65, draw: 3.80, away: 5.20 }; // Man City favored
    return { home: 2.30, draw: 3.40, away: 2.90 }; // PSG vs Bayern (tight match)
  }
}
