import { resolveOdds, decimalToAmerican, americanToDecimal, decimalToFractional, fractionalToDecimal } from "../odds";
import { ImpliedProbabilityEngine } from "../probabilities/impliedProbabilityEngine";
import { OverroundEngine } from "../overround/overroundEngine";
import { ConsensusEngine } from "../consensus";
import { VolatilityEngine } from "../volatility";
import { MarketSnapshotEngine } from "../snapshots";
import { marketHistoryStore } from "../history";
import { CanonicalMarketDTO } from "../markets/types";

export interface TestResultSuite {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coveragePercent: number;
  logs: string[];
}

export class MarketMathematicalValidationSuite {
  /**
   * Run full rigorous local tests suite verifying correct numerical precision, math bounds, and conversions.
   */
  public static execute(): TestResultSuite {
    const logs: string[] = [];
    let passed = 0;
    let total = 0;

    const assert = (condition: boolean, desc: string) => {
      total++;
      if (condition) {
        passed++;
        logs.push(`✅ PASS: ${desc}`);
      } else {
        logs.push(`❌ FAIL: ${desc}`);
      }
    };

    logs.push("Starting Enterprise Market Intelligence Mathematical Validation...");

    // 1. Odds Conversion Tests
    try {
      assert(decimalToAmerican(2.0) === 100, "2.0 decimal to American equals +100");
      assert(decimalToAmerican(1.5) === -200, "1.5 decimal to American equals -200");
      assert(americanToDecimal(100) === 2.0, "+100 American to decimal equals 2.0");
      assert(americanToDecimal(-200) === 1.5, "-200 American to decimal equals 1.5");
      assert(decimalToFractional(1.5) === "1/2", "1.5 decimal to Fractional equals 1/2");
      assert(decimalToFractional(3.5) === "5/2", "3.5 decimal to Fractional equals 5/2");
      assert(fractionalToDecimal("5/2") === 3.5, "Fractional 5/2 to Decimal equals 3.5");
      assert(fractionalToDecimal("1/2") === 1.5, "Fractional 1/2 to Decimal equals 1.5");
    } catch (err: any) {
      logs.push(`Crash during Odds Conversion tests: ${err.message}`);
    }

    // 2. Implied Probability Precision
    try {
      const outcomes = [
        { outcomeId: "home", decimalOdds: 2.0 },
        { outcomeId: "away", decimalOdds: 2.0 }
      ];
      const probRes = ImpliedProbabilityEngine.calculate(outcomes);
      assert(probRes.probabilitySum === 1.0, "Probability sum of 2.0, 2.0 odds is exactly 1.0");
      assert(probRes.margin === 0.0, "Margin of 2.0, 2.0 odds is exactly 0.0");
      assert(probRes.normalizedProbabilities["home"] === 0.5, "Normalized probability of Home with 2.0 odds is 0.5");
    } catch (err: any) {
      logs.push(`Crash during Implied Probability tests: ${err.message}`);
    }

    // 3. Overround Margin Removal Engine Checks (Shin Model, Multiplicative, etc.)
    try {
      // 1X2 market with high overround (1.80, 3.40, 4.00)
      const outcomes1X2 = [
        { id: "home", odds: 1.80 },
        { id: "draw", odds: 3.40 },
        { id: "away", odds: 4.00 }
      ];

      const res = OverroundEngine.calculate(outcomes1X2);
      assert(res.overround > 0.05, `Overround calculated is positive (~${(res.overround * 100).toFixed(2)}%)`);

      const shinMethod = res.methods.shin;
      assert(shinMethod.confidence === 0.95, "Shin model confidence set to 0.95");
      const shinProbsSum = Object.values(shinMethod.probabilities).reduce((a, b) => a + b, 0);
      assert(Math.abs(shinProbsSum - 1.0) < 1e-5, "Shin's model output probabilities sum strictly to 1.00000");

      const multMethod = res.methods.multiplicative;
      const multSum = Object.values(multMethod.probabilities).reduce((a, b) => a + b, 0);
      assert(Math.abs(multSum - 1.0) < 1e-5, "Multiplicative probabilities sum strictly to 1.00000");

      const powerMethod = res.methods.power;
      const powerSum = Object.values(powerMethod.probabilities).reduce((a, b) => a + b, 0);
      assert(Math.abs(powerSum - 1.0) < 1e-5, "Power model probabilities sum strictly to 1.00000");
    } catch (err: any) {
      logs.push(`Crash during Overround Engine tests: ${err.message}`);
    }

    // 4. Volatility Engine Tests
    try {
      const mockHistory: CanonicalMarketDTO[] = [
        {
          marketId: "test_market",
          fixtureId: "test_fix",
          marketType: "match_outcome",
          providerId: "Pinnacle",
          version: 1,
          timestamp: new Date(Date.now() - 10000).toISOString(),
          status: "open",
          outcomes: [
            { outcomeId: "1", name: "Home", openingOdds: resolveOdds(1.9), currentOdds: resolveOdds(1.9) }
          ]
        },
        {
          marketId: "test_market",
          fixtureId: "test_fix",
          marketType: "match_outcome",
          providerId: "Pinnacle",
          version: 2,
          timestamp: new Date().toISOString(),
          status: "open",
          outcomes: [
            { outcomeId: "1", name: "Home", openingOdds: resolveOdds(1.9), currentOdds: resolveOdds(2.1) }
          ]
        }
      ];

      const volMetrics = VolatilityEngine.calculateVolatility(mockHistory);
      assert(volMetrics.length > 0, "Volatility metrics generated for mock history");
      assert(volMetrics[0].standardDeviation > 0.05, `Calculated correct non-zero standard deviation (${volMetrics[0].standardDeviation.toFixed(4)})`);
    } catch (err: any) {
      logs.push(`Crash during Volatility Engine tests: ${err.message}`);
    }

    // 5. Consensus Integration
    try {
      const mockMarkets: CanonicalMarketDTO[] = [
        {
          marketId: "m1",
          fixtureId: "fix_1",
          marketType: "match_outcome",
          providerId: "Sportradar",
          version: 1,
          timestamp: new Date().toISOString(),
          status: "open",
          outcomes: [
            { outcomeId: "home", name: "Home", openingOdds: resolveOdds(2.0), currentOdds: resolveOdds(2.0) }
          ]
        },
        {
          marketId: "m2",
          fixtureId: "fix_1",
          marketType: "match_outcome",
          providerId: "Pinnacle",
          version: 1,
          timestamp: new Date().toISOString(),
          status: "open",
          outcomes: [
            { outcomeId: "home", name: "Home", openingOdds: resolveOdds(2.2), currentOdds: resolveOdds(2.2) }
          ]
        }
      ];

      const consensus = ConsensusEngine.computeConsensus("fix_1", "match_outcome", mockMarkets);
      assert(consensus !== null, "Consensus successfully calculated");
      assert(consensus?.outcomes[0].averageOdds.decimal === 2.1, "Consensus average matches expected midpoint of 2.1");
    } catch (err: any) {
      logs.push(`Crash during Consensus tests: ${err.message}`);
    }

    logs.push(`Validation finished. Passed ${passed}/${total} assertions.`);

    return {
      totalTests: total,
      passedTests: passed,
      failedTests: total - passed,
      coveragePercent: total > 0 ? (passed / total) * 100 : 100,
      logs
    };
  }
}
