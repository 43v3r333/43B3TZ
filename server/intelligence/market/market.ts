import { MarketIntelligenceMetrics } from "../types";
import { intelligenceStorage } from "../storage/storage";
import { intelligenceEventBus } from "../events/events";
import { IntelligenceEventType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("MarketIntelligence");

export class MarketIntelligenceEngine {
  /**
   * Evaluates the movements and patterns of betting odds for a fixture.
   */
  public analyzeMarket(
    fixtureId: string,
    oddsHistory: Array<{
      timestamp: string;
      home: number;
      draw: number;
      away: number;
    }>
  ): MarketIntelligenceMetrics {
    logger.info(`Analyzing market movements for fixture ID ${fixtureId}`);

    if (oddsHistory.length === 0) {
      // Default placeholder
      const fallbackOdds = { home: 2.0, draw: 3.2, away: 3.5 };
      const overround = parseFloat(((1 / 2.0) + (1 / 3.2) + (1 / 3.5) - 1.0).toFixed(4));
      return {
        fixtureId,
        openingOdds: fallbackOdds,
        closingOdds: fallbackOdds,
        oddsMovement: { home: "stable", away: "stable" },
        marketConsensus: "unclear",
        impliedProbability: { home: 0.5, draw: 0.3125, away: 0.2857 },
        overround,
        closingLineValue: 0.0,
        sharpMovement: false,
        steamMoves: false
      };
    }

    // Sort history by timestamp ascending
    const sorted = [...oddsHistory].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const opening = sorted[0];
    const closing = sorted[sorted.length - 1];

    // Odds movement direction
    let homeMove: "up" | "down" | "stable" = "stable";
    if (closing.home < opening.home * 0.97) homeMove = "down";
    else if (closing.home > opening.home * 1.03) homeMove = "up";

    let awayMove: "up" | "down" | "stable" = "stable";
    if (closing.away < opening.away * 0.97) awayMove = "down";
    else if (closing.away > opening.away * 1.03) awayMove = "up";

    // Implied probabilities of closing odds
    const pHome = 1 / closing.home;
    const pDraw = 1 / closing.draw;
    const pAway = 1 / closing.away;

    // Overround margin
    const rawOverround = pHome + pDraw + pAway - 1.0;
    const overround = parseFloat(rawOverround.toFixed(4));

    // Normalized implied probabilities (excluding bookmaker margin)
    const sumProb = pHome + pDraw + pAway;
    const impliedProbability = {
      home: parseFloat((pHome / sumProb).toFixed(4)),
      draw: parseFloat((pDraw / sumProb).toFixed(4)),
      away: parseFloat((pAway / sumProb).toFixed(4))
    };

    // Market Consensus
    let marketConsensus: MarketIntelligenceMetrics["marketConsensus"] = "unclear";
    if (impliedProbability.home > 0.5) marketConsensus = "home";
    else if (impliedProbability.away > 0.5) marketConsensus = "away";
    else if (impliedProbability.draw > 0.4) marketConsensus = "draw";

    // Closing Line Value (CLV): ratio of opening odds vs closing odds minus margin
    // If opening was 2.20 and closing was 1.95, CLV is positive (beating the line)
    const closingLineValue = parseFloat((opening.home / (closing.home * (1 + overround)) - 1.0).toFixed(4));

    // Sharp Movement: flag if odds changed by more than 15% in a single step
    let sharpMovement = false;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];
      const homeDelta = Math.abs(curr.home - prev.home) / prev.home;
      const awayDelta = Math.abs(curr.away - prev.away) / prev.away;
      if (homeDelta > 0.15 || awayDelta > 0.15) {
        sharpMovement = true;
        break;
      }
    }

    // Steam Moves: rapid drop of odds across the board (more than 3 successive drops)
    let steamMoves = false;
    let consecutiveHomeDrops = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].home < sorted[i - 1].home) {
        consecutiveHomeDrops++;
      } else {
        consecutiveHomeDrops = 0;
      }
      if (consecutiveHomeDrops >= 3) {
        steamMoves = true;
        break;
      }
    }

    const metrics: MarketIntelligenceMetrics = {
      fixtureId,
      openingOdds: { home: opening.home, draw: opening.draw, away: opening.away },
      closingOdds: { home: closing.home, draw: closing.draw, away: closing.away },
      oddsMovement: { home: homeMove, away: awayMove },
      marketConsensus,
      impliedProbability,
      overround,
      closingLineValue,
      sharpMovement,
      steamMoves
    };

    intelligenceStorage.setMarket(fixtureId, metrics);
    logger.debug(`Market analysis saved for fixture ${fixtureId}. Overround: ${(overround * 100).toFixed(2)}%, CLV: ${closingLineValue}`);

    // Publish event
    intelligenceEventBus.publish(IntelligenceEventType.MarketUpdated, fixtureId, metrics);

    return metrics;
  }
}

export const marketIntelligenceEngine = new MarketIntelligenceEngine();
