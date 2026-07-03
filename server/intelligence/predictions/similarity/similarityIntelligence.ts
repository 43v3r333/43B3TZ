import { PredictionFactoryResponse, HistoricalPredictionRecord } from "../../../predictions/types";
import { SimilarityIntelligence, NeighborMatch } from "../types";
import { predictionHistoryStore } from "../../../predictions/history/predictionHistory";

// Predefined set of high-fidelity historical match archetypes to seed similarity calculations if history is light
const MATCH_ARCHETYPES = [
  { entityId: "hist-arch-1", features: { feat_elo_rating_diff: 150, feat_form_momentum: 0.80, feat_xg_differential: 1.1 }, actualResult: "Home", outcomes: { Home: 0.72, Draw: 0.18, Away: 0.10 }, confidenceScore: 0.88 },
  { entityId: "hist-arch-2", features: { feat_elo_rating_diff: 80, feat_form_momentum: 0.65, feat_xg_differential: 0.5 }, actualResult: "Home", outcomes: { Home: 0.58, Draw: 0.25, Away: 0.17 }, confidenceScore: 0.78 },
  { entityId: "hist-arch-3", features: { feat_elo_rating_diff: -10, feat_form_momentum: 0.50, feat_xg_differential: 0.0 }, actualResult: "Draw", outcomes: { Home: 0.35, Draw: 0.32, Away: 0.33 }, confidenceScore: 0.65 },
  { entityId: "hist-arch-4", features: { feat_elo_rating_diff: -120, feat_form_momentum: 0.35, feat_xg_differential: -0.8 }, actualResult: "Away", outcomes: { Home: 0.18, Draw: 0.22, Away: 0.60 }, confidenceScore: 0.82 },
  { entityId: "hist-arch-5", features: { feat_elo_rating_diff: 40, feat_form_momentum: 0.70, feat_xg_differential: 0.3 }, actualResult: "Draw", outcomes: { Home: 0.45, Draw: 0.30, Away: 0.25 }, confidenceScore: 0.72 },
  { entityId: "hist-arch-6", features: { feat_elo_rating_diff: -60, feat_form_momentum: 0.45, feat_xg_differential: -0.2 }, actualResult: "Away", outcomes: { Home: 0.28, Draw: 0.28, Away: 0.44 }, confidenceScore: 0.70 }
];

export class SimilarityIntelligenceEngine {
  public static calculateSimilarity(prediction: PredictionFactoryResponse): SimilarityIntelligence {
    const curFeatures = prediction.featuresSnapshot ?? {};
    const curElo = curFeatures.feat_elo_rating_diff ?? 0;
    const curMom = curFeatures.feat_form_momentum ?? 0.5;
    const curXg = curFeatures.feat_xg_differential ?? 0.0;

    // Compile match list from history and seed archetypes
    const allCandidates: { entityId: string; features: Record<string, any>; outcomes: Record<string, number>; actualResult?: string; confidenceScore: number }[] = [];
    
    // 1. Add historical records
    const histRecords = predictionHistoryStore.getAllRecords().filter(r => r.entityId !== prediction.entityId);
    histRecords.forEach(r => {
      allCandidates.push({
        entityId: r.entityId,
        features: r.featuresSnapshot ?? {},
        outcomes: r.finalOutput?.calibratedProbabilities ?? { Home: 0.33, Draw: 0.33, Away: 0.34 },
        actualResult: r.actualResult,
        confidenceScore: r.finalConfidence?.compositeScore ?? 0.75
      });
    });

    // 2. Add baseline seeds
    MATCH_ARCHETYPES.forEach(arch => {
      // Ensure no duplicates
      if (!allCandidates.some(c => c.entityId === arch.entityId)) {
        allCandidates.push(arch);
      }
    });

    // Compute Euclidean distance for each candidate
    const neighbors: NeighborMatch[] = allCandidates.map(cand => {
      const candElo = cand.features.feat_elo_rating_diff ?? 0;
      const candMom = cand.features.feat_form_momentum ?? 0.5;
      const candXg = cand.features.feat_xg_differential ?? 0.0;

      // Normalize feature scales (Elo ranges [-250, 250], Momentum [0,1], xG [-2, 2])
      const dElo = (curElo - candElo) / 250;
      const dMom = curMom - candMom;
      const dXg = (curXg - candXg) / 2;

      const distance = Math.sqrt(dElo * dElo + dMom * dMom + dXg * dXg);
      // Gaussian kernel conversion: similarity score in [0, 1]
      const similarityScore = Math.exp(-distance * 2);

      return {
        entityId: cand.entityId,
        similarityScore,
        features: cand.features,
        outcomes: cand.outcomes,
        actualResult: cand.actualResult,
        confidenceScore: cand.confidenceScore
      };
    });

    // Sort by similarity descending
    neighbors.sort((a, b) => b.similarityScore - a.similarityScore);
    const nearestNeighbors = neighbors.slice(0, 4);

    // Aggregate neighbor outcomes
    const outcomeSums: Record<string, number> = {};
    let confidenceSum = 0;
    let avgSimilarity = 0;

    nearestNeighbors.forEach(n => {
      confidenceSum += n.confidenceScore;
      avgSimilarity += n.similarityScore;
      Object.entries(n.outcomes).forEach(([outcome, prob]) => {
        outcomeSums[outcome] = (outcomeSums[outcome] ?? 0) + prob;
      });
    });

    const count = nearestNeighbors.length;
    const historicalOutcomes: Record<string, number> = {};
    if (count > 0) {
      Object.entries(outcomeSums).forEach(([outcome, sum]) => {
        historicalOutcomes[outcome] = sum / count;
      });
    } else {
      historicalOutcomes["Home"] = 0.40;
      historicalOutcomes["Draw"] = 0.30;
      historicalOutcomes["Away"] = 0.30;
    }

    const confidenceComparison = count > 0 ? confidenceSum / count : 0.75;
    const similarityScore = count > 0 ? avgSimilarity / count : 1.0;

    // Cluster assignment based on Elo ratings differential
    let clusterAssignment = "Cluster 3: Standard Parity";
    if (curElo > 100) {
      clusterAssignment = "Cluster 1: Heavy Home Favorites";
    } else if (curElo < -100) {
      clusterAssignment = "Cluster 5: Dominant Road Underdogs";
    } else if (Math.abs(curElo) < 30 && curMom > 0.65) {
      clusterAssignment = "Cluster 2: In-Form Direct Contenders";
    } else if (Math.abs(curElo) < 30 && curMom < 0.35) {
      clusterAssignment = "Cluster 4: Out-of-Form Neutral Stalemate";
    }

    return {
      nearestNeighbors,
      historicalOutcomes,
      confidenceComparison,
      clusterAssignment,
      similarityScore
    };
  }
}
