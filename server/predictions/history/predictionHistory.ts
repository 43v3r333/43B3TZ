import { HistoricalPredictionRecord, PredictionMarketType } from "../types";
import { createLogger } from "../../core/logger";

const logger = createLogger("PredictionHistory");

class PredictionHistoryStore {
  private records: Map<string, HistoricalPredictionRecord> = new Map();

  constructor() {
    this.seedHistoricalData();
  }

  public getAllRecords(): HistoricalPredictionRecord[] {
    return Array.from(this.records.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public getRecordById(predictionId: string): HistoricalPredictionRecord | undefined {
    return this.records.get(predictionId);
  }

  public logPrediction(record: HistoricalPredictionRecord): void {
    this.records.set(record.predictionId, record);
    logger.info(`Logged prediction ${record.predictionId} for market ${record.marketType}`);
  }

  /**
   * Evaluates historical prediction results once the actual ground truth becomes known.
   */
  public resolvePrediction(predictionId: string, actualResult: string): HistoricalPredictionRecord {
    const record = this.records.get(predictionId);
    if (!record) {
      throw new Error(`Prediction ID ${predictionId} not found.`);
    }

    // 1. Calculate accuracy (1 if the predicted outcome with highest probability matches actual, 0 otherwise)
    const probMap = record.finalOutput.calibratedProbabilities;
    const predictedOutcome = Object.entries(probMap).reduce(
      (a, b) => (a[1] > b[1] ? a : b)
    )[0];
    const isCorrect = predictedOutcome === actualResult;

    // 2. Calculate Brier Score: 1/N * sum((p_i - y_i)^2)
    // where y_i = 1 for the correct class and 0 for others
    let brierSum = 0;
    const keys = Object.keys(probMap);
    for (const key of keys) {
      const p = probMap[key] || 0;
      const y = key === actualResult ? 1.0 : 0.0;
      brierSum += Math.pow(p - y, 2);
    }
    const brierScore = brierSum; // For single multi-class prediction, Brier is sum((p_i - y_i)^2)

    // 3. Calculate Log Loss: -ln(p_correct)
    const correctProb = probMap[actualResult] ?? 0.0001;
    const logLoss = -Math.log(Math.max(0.0001, correctProb));

    record.actualResult = actualResult;
    record.accuracyResult = isCorrect ? 1 : 0;
    record.brierScoreResult = brierScore;
    record.logLossResult = logLoss;

    logger.info(`Resolved prediction ${predictionId} with actual result ${actualResult}. Brier: ${brierScore.toFixed(4)}, Correct: ${isCorrect}`);
    return record;
  }

  /**
   * Calculates comprehensive evaluation aggregates across historical data.
   */
  public calculatePerformanceMetrics(filters: {
    marketType?: PredictionMarketType;
    leagueId?: string;
  } = {}): {
    totalPredictions: number;
    resolvedPredictions: number;
    accuracy: number;
    meanBrierScore: number;
    meanLogLoss: number;
    meanLatencyMs: number;
    historicalAccuracy: number;
    leagueAccuracy: Record<string, number>;
    competitionAccuracy: Record<string, number>;
    seasonAccuracy: Record<string, number>;
  } {
    const records = this.getAllRecords().filter(r => {
      if (filters.marketType && r.marketType !== filters.marketType) return false;
      return true;
    });

    const resolved = records.filter(r => r.actualResult !== undefined);

    let correctCount = 0;
    let brierSum = 0;
    let logLossSum = 0;
    const latencies: number[] = [];

    const leagueCorrect: Record<string, { correct: number; total: number }> = {};
    const competitionCorrect: Record<string, { correct: number; total: number }> = {};
    const seasonCorrect: Record<string, { correct: number; total: number }> = {};

    records.forEach(r => latencies.push(r.inferenceDurationMs));

    resolved.forEach(r => {
      const isCorrect = r.accuracyResult === 1;
      if (isCorrect) correctCount++;
      
      brierSum += r.brierScoreResult ?? 0;
      logLossSum += r.logLossResult ?? 0;

      // Extract details from features snapshot (mimicking structured logs)
      const league = r.featuresSnapshot.leagueId || "Default League";
      const competition = r.featuresSnapshot.competitionId || "Default Competition";
      const season = r.featuresSnapshot.season || "2026";

      if (!leagueCorrect[league]) leagueCorrect[league] = { correct: 0, total: 0 };
      if (!competitionCorrect[competition]) competitionCorrect[competition] = { correct: 0, total: 0 };
      if (!seasonCorrect[season]) seasonCorrect[season] = { correct: 0, total: 0 };

      leagueCorrect[league].total++;
      competitionCorrect[competition].total++;
      seasonCorrect[season].total++;

      if (isCorrect) {
        leagueCorrect[league].correct++;
        competitionCorrect[competition].correct++;
        seasonCorrect[season].correct++;
      }
    });

    const meanLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const resolvedCount = resolved.length;

    // Build outputs
    const leagueAccuracy: Record<string, number> = {};
    Object.keys(leagueCorrect).forEach(k => {
      leagueAccuracy[k] = leagueCorrect[k].total > 0 ? leagueCorrect[k].correct / leagueCorrect[k].total : 0;
    });

    const competitionAccuracy: Record<string, number> = {};
    Object.keys(competitionCorrect).forEach(k => {
      competitionAccuracy[k] = competitionCorrect[k].total > 0 ? competitionCorrect[k].correct / competitionCorrect[k].total : 0;
    });

    const seasonAccuracy: Record<string, number> = {};
    Object.keys(seasonCorrect).forEach(k => {
      seasonAccuracy[k] = seasonCorrect[k].total > 0 ? seasonCorrect[k].correct / seasonCorrect[k].total : 0;
    });

    return {
      totalPredictions: records.length,
      resolvedPredictions: resolvedCount,
      accuracy: resolvedCount > 0 ? correctCount / resolvedCount : 0.0,
      meanBrierScore: resolvedCount > 0 ? brierSum / resolvedCount : 0.0,
      meanLogLoss: resolvedCount > 0 ? logLossSum / resolvedCount : 0.0,
      meanLatencyMs: meanLatency,
      historicalAccuracy: resolvedCount > 0 ? correctCount / resolvedCount : 0.0,
      leagueAccuracy,
      competitionAccuracy,
      seasonAccuracy
    };
  }

  private seedHistoricalData(): void {
    const markets: PredictionMarketType[] = [
      "match_outcome",
      "over_under_2_5",
      "both_teams_to_score",
      "correct_score",
      "double_chance",
      "draw_no_bet",
      "corners",
      "cards",
      "team_goals"
    ];

    const outcomes: Record<PredictionMarketType, string[]> = {
      match_outcome: ["Home", "Draw", "Away"],
      over_under_2_5: ["Over", "Under"],
      over_under_3_5: ["Over", "Under"],
      over_under_4_5: ["Over", "Under"],
      both_teams_to_score: ["Yes", "No"],
      correct_score: ["1-0", "2-1", "1-1", "0-0", "0-1", "0-2", "2-0", "1-2", "Other"],
      double_chance: ["HomeOrDraw", "AwayOrDraw", "HomeOrAway"],
      draw_no_bet: ["Home", "Away"],
      asian_handicap: ["Home", "Away"],
      corners: ["Over 9.5", "Under 9.5"],
      cards: ["Over 4.5", "Under 4.5"],
      team_goals: ["Over 1.5", "Under 1.5"],
      player_markets: ["To Score", "Not To Score"]
    };

    const leagues = ["Premier League", "Bundesliga", "La Liga", "Serie A"];
    const dates = [
      "2026-06-30T20:00:00Z",
      "2026-06-29T18:30:00Z",
      "2026-06-28T15:00:00Z",
      "2026-06-27T19:45:00Z"
    ];

    let count = 0;
    for (const market of markets) {
      const possOutcomes = outcomes[market];
      
      for (let i = 0; i < 4; i++) {
        const id = `pred_hist_${count++}`;
        const league = leagues[i % leagues.length];
        const date = dates[i % dates.length];
        
        // Generate mock probability outputs for seeding
        const rawProbs: Record<string, number> = {};
        let total = 0;
        possOutcomes.forEach(out => {
          const r = Math.random() + 0.1;
          rawProbs[out] = r;
          total += r;
        });
        Object.keys(rawProbs).forEach(k => rawProbs[k] /= total);

        const calibratedProbs: Record<string, number> = { ...rawProbs };
        const confidenceIntervals: Record<string, { lower: number; upper: number }> = {};
        Object.keys(calibratedProbs).forEach(k => {
          const p = calibratedProbs[k];
          confidenceIntervals[k] = { lower: Math.max(0, p - 0.08), upper: Math.min(1, p + 0.08) };
        });

        const actualIndex = Math.floor(Math.random() * possOutcomes.length);
        const actual = possOutcomes[actualIndex];

        const record: HistoricalPredictionRecord = {
          predictionId: id,
          marketType: market,
          entityId: `fixture-${100 + i}`,
          finalOutput: {
            rawProbabilities: rawProbs,
            calibratedProbabilities: calibratedProbs,
            confidenceIntervals,
            entropy: 0.8,
            expectedUncertainty: 0.35,
            reliability: 0.88
          },
          finalConfidence: {
            predictionConfidence: 0.72,
            calibrationConfidence: 0.94,
            featureConfidence: 1.0,
            dataFreshnessScore: 0.9,
            marketConfidence: 0.8,
            agreementScore: 0.85,
            modelConsensus: 0.8,
            historicalReliability: 0.76,
            compositeScore: 0.82
          },
          featuresSnapshot: {
            leagueId: league,
            competitionId: "League Season",
            season: "2026",
            feat_elo_rating: 1540 + (i * 20),
            feat_form_momentum: 0.65,
            feat_xg_differential: 0.42
          },
          selectedChampionId: `mod_champ_${market}_v1`,
          modelInferenceBreakdown: {},
          datasetVersion: "ds_default_temporal_v1",
          experimentId: `exp_tr_${market}_baseline`,
          calibrationVersion: "cal_platt_v1",
          inferenceDurationMs: 4 + i,
          timestamp: date
        };

        this.logPrediction(record);
        this.resolvePrediction(id, actual);
      }
    }
  }
}

export const predictionHistoryStore = new PredictionHistoryStore();
