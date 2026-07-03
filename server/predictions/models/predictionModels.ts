import { PredictionMarketType, ModelMetadata, ModelProbabilityOutput, ModelConfidenceMetrics } from "../types";
import { CalibrationEngine } from "../calibration/calibrationEngine";
import { ConfidenceEngine } from "../confidence/confidenceEngine";
import { createLogger } from "../../core/logger";

const logger = createLogger("PredictionModels");

export interface MarketModelExecutionResult {
  probabilities: ModelProbabilityOutput;
  confidence: ModelConfidenceMetrics;
  featuresUsed: string[];
}

export abstract class BasePredictionModelPipeline {
  public abstract readonly marketType: PredictionMarketType;
  public abstract readonly outcomes: string[];
  public abstract readonly defaultFeatures: string[];

  /**
   * Executes prediction inference on a given input feature set.
   */
  public predict(features: Record<string, any>, modelMeta: ModelMetadata): MarketModelExecutionResult {
    // 1. Feature lookup validation
    const compiledFeatures: Record<string, any> = {};
    for (const feat of modelMeta.featuresUsed) {
      compiledFeatures[feat] = features[feat] ?? this.getFeatureDefaultValue(feat);
    }

    // 2. Compute raw prediction scores/logits based on features (e.g., ELO rating differential, expected goals)
    const rawProbs = this.computeRawProbabilities(compiledFeatures);

    // 3. Process calibration (Platt Scaling)
    const probabilities = CalibrationEngine.processProbabilityOutput(
      rawProbs,
      "platt_scaling",
      { slope: -1.02, intercept: 0.01 }
    );

    // 4. Calculate detailed multi-axis confidence
    const confidence = ConfidenceEngine.calculateConfidence(
      probabilities.calibratedProbabilities,
      modelMeta,
      compiledFeatures
    );

    return {
      probabilities,
      confidence,
      featuresUsed: modelMeta.featuresUsed
    };
  }

  /**
   * Mock-fitting or continuous validation fitting sequence to simulate offline or on-demand model training.
   */
  public train(datasetId: string, features: string[]): {
    newVersion: string;
    brierScore: number;
    logLoss: number;
    accuracy: number;
    f1Score: number;
  } {
    logger.info(`Triggered training pipeline for ${this.marketType} on dataset ${datasetId}`);
    return {
      newVersion: `v1.${Math.floor(Math.random() * 10) + 1}.0`,
      brierScore: 0.08 + Math.random() * 0.04,
      logLoss: 0.38 + Math.random() * 0.08,
      accuracy: 0.70 + Math.random() * 0.06,
      f1Score: 0.68 + Math.random() * 0.06
    };
  }

  protected abstract computeRawProbabilities(features: Record<string, any>): Record<string, number>;

  private getFeatureDefaultValue(featureId: string): any {
    if (featureId.includes("elo")) return 1500;
    if (featureId.includes("xg") || featureId.includes("goals")) return 1.5;
    if (featureId.includes("momentum")) return 0.5;
    if (featureId.includes("clv")) return 0.0;
    return 0.5;
  }
}

// 1. MATCH OUTCOME MODEL (Home / Draw / Away)
export class MatchOutcomeModel extends BasePredictionModelPipeline {
  public readonly marketType = "match_outcome";
  public readonly outcomes = ["Home", "Draw", "Away"];
  public readonly defaultFeatures = ["feat_elo_rating_diff", "feat_form_momentum", "feat_xg_differential"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const eloDiff = (features["feat_elo_rating_diff"] ?? 0) || 50; // standard Home ELO boost
    const formMom = (features["feat_form_momentum"] ?? 0.5);
    const xgDiff = (features["feat_xg_differential"] ?? 0);

    // Simplified Logistic Logistic-Style Multi-Class Logit
    const homeLogit = 0.3 + (eloDiff / 400) + (formMom * 0.5) + (xgDiff * 0.6);
    const drawLogit = -0.4 - Math.abs(eloDiff / 800);
    const awayLogit = -(eloDiff / 400) - (formMom * 0.5) - (xgDiff * 0.6);

    const expHome = Math.exp(homeLogit);
    const expDraw = Math.exp(drawLogit);
    const expAway = Math.exp(awayLogit);
    const sum = expHome + expDraw + expAway;

    return {
      Home: expHome / sum,
      Draw: expDraw / sum,
      Away: expAway / sum
    };
  }
}

// 2. OVER/UNDER GOALS 2.5
export class OverUnder25Model extends BasePredictionModelPipeline {
  public readonly marketType = "over_under_2_5";
  public readonly outcomes = ["Over", "Under"];
  public readonly defaultFeatures = ["feat_avg_team_goals_conceded", "feat_xg_differential"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const avgGoals = (features["feat_avg_team_goals_conceded"] ?? 2.8);
    const xgDiff = (features["feat_xg_differential"] ?? 0);
    
    // Poisson approximation threshold at 2.5
    const expectedGoals = avgGoals + xgDiff * 0.2;
    // P(Goals < 2.5) = Poisson(0, lambda) + Poisson(1, lambda) + Poisson(2, lambda)
    const lambda = Math.max(0.5, expectedGoals);
    const p0 = Math.exp(-lambda);
    const p1 = lambda * p0;
    const p2 = (Math.pow(lambda, 2) / 2) * p0;
    const pUnder = p0 + p1 + p2;
    const pOver = 1 - pUnder;

    return { Over: pOver, Under: pUnder };
  }
}

// 3. OVER/UNDER GOALS 3.5
export class OverUnder35Model extends BasePredictionModelPipeline {
  public readonly marketType = "over_under_3_5";
  public readonly outcomes = ["Over", "Under"];
  public readonly defaultFeatures = ["feat_avg_team_goals_conceded", "feat_xg_differential"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const avgGoals = (features["feat_avg_team_goals_conceded"] ?? 2.8);
    const lambda = Math.max(0.5, avgGoals);
    
    let pUnderSum = 0;
    for (let k = 0; k < 4; k++) {
      pUnderSum += (Math.pow(lambda, k) / this.factorial(k)) * Math.exp(-lambda);
    }
    return { Over: 1 - pUnderSum, Under: pUnderSum };
  }

  private factorial(n: number): number {
    if (n <= 1) return 1;
    return n * this.factorial(n - 1);
  }
}

// 4. OVER/UNDER GOALS 4.5
export class OverUnder45Model extends BasePredictionModelPipeline {
  public readonly marketType = "over_under_4_5";
  public readonly outcomes = ["Over", "Under"];
  public readonly defaultFeatures = ["feat_avg_team_goals_conceded"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const avgGoals = (features["feat_avg_team_goals_conceded"] ?? 2.8);
    const lambda = Math.max(0.5, avgGoals);
    
    let pUnderSum = 0;
    for (let k = 0; k < 5; k++) {
      let fact = 1;
      for (let j = 1; j <= k; j++) fact *= j;
      pUnderSum += (Math.pow(lambda, k) / fact) * Math.exp(-lambda);
    }
    return { Over: 1 - pUnderSum, Under: pUnderSum };
  }
}

// 5. BOTH TEAMS TO SCORE (Yes / No)
export class BothTeamsToScoreModel extends BasePredictionModelPipeline {
  public readonly marketType = "both_teams_to_score";
  public readonly outcomes = ["Yes", "No"];
  public readonly defaultFeatures = ["feat_team_clean_sheets_ratio", "feat_form_momentum"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const cleanSheetRatio = (features["feat_team_clean_sheets_ratio"] ?? 0.3);
    const formMom = (features["feat_form_momentum"] ?? 0.5);

    // clean sheets ratio reduces Both Teams to Score (No increases)
    const logit = 0.5 - (cleanSheetRatio * 2.0) + (formMom * 0.8);
    const pYes = 1 / (1 + Math.exp(-logit));
    return { Yes: pYes, No: 1 - pYes };
  }
}

// 6. CORRECT SCORE
export class CorrectScoreModel extends BasePredictionModelPipeline {
  public readonly marketType = "correct_score";
  public readonly outcomes = ["1-0", "2-0", "2-1", "0-0", "1-1", "0-1", "0-2", "1-2", "Other"];
  public readonly defaultFeatures = ["feat_elo_rating_diff", "feat_avg_team_goals_conceded"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const eloDiff = (features["feat_elo_rating_diff"] ?? 0);
    const avgGoals = (features["feat_avg_team_goals_conceded"] ?? 2.6);

    // Independent Poisson distribution for Home & Away goals
    const homeLambda = Math.max(0.1, (avgGoals / 2) + (eloDiff / 600));
    const awayLambda = Math.max(0.1, (avgGoals / 2) - (eloDiff / 600));

    const probs: Record<string, number> = {};
    let accountedSum = 0;

    const pairs = [
      { s: "1-0", h: 1, a: 0 },
      { s: "2-0", h: 2, a: 0 },
      { s: "2-1", h: 2, a: 1 },
      { s: "0-0", h: 0, a: 0 },
      { s: "1-1", h: 1, a: 1 },
      { s: "0-1", h: 0, a: 1 },
      { s: "0-2", h: 0, a: 2 },
      { s: "1-2", h: 1, a: 2 }
    ];

    pairs.forEach(pair => {
      const pH = (Math.pow(homeLambda, pair.h) / this.fact(pair.h)) * Math.exp(-homeLambda);
      const pA = (Math.pow(awayLambda, pair.a) / this.fact(pair.a)) * Math.exp(-awayLambda);
      const prob = pH * pA;
      probs[pair.s] = prob;
      accountedSum += prob;
    });

    probs["Other"] = Math.max(0.01, 1.0 - accountedSum);
    return probs;
  }

  private fact(n: number): number {
    return n <= 1 ? 1 : n * this.fact(n - 1);
  }
}

// 7. DOUBLE CHANCE
export class DoubleChanceModel extends BasePredictionModelPipeline {
  public readonly marketType = "double_chance";
  public readonly outcomes = ["HomeOrDraw", "AwayOrDraw", "HomeOrAway"];
  public readonly defaultFeatures = ["feat_elo_rating_diff"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const eloDiff = (features["feat_elo_rating_diff"] ?? 0);
    
    // Derive from simplified match outcome logits
    const pHome = 0.45 + (eloDiff / 800);
    const pDraw = 0.25;
    const pAway = 0.30 - (eloDiff / 800);

    return {
      HomeOrDraw: Math.min(0.99, pHome + pDraw),
      AwayOrDraw: Math.min(0.99, pAway + pDraw),
      HomeOrAway: Math.min(0.99, pHome + pAway)
    };
  }
}

// 8. DRAW NO BET
export class DrawNoBetModel extends BasePredictionModelPipeline {
  public readonly marketType = "draw_no_bet";
  public readonly outcomes = ["Home", "Away"];
  public readonly defaultFeatures = ["feat_elo_rating_diff"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const eloDiff = (features["feat_elo_rating_diff"] ?? 0);
    const pHome = 0.45 + (eloDiff / 800);
    const pAway = 0.30 - (eloDiff / 800);
    
    // Conditioned on no draw
    const sum = pHome + pAway;
    return {
      Home: pHome / sum,
      Away: pAway / sum
    };
  }
}

// 9. ASIAN HANDICAP (Architecture Only)
export class AsianHandicapModel extends BasePredictionModelPipeline {
  public readonly marketType = "asian_handicap";
  public readonly outcomes = ["Home AH -0.5", "Away AH +0.5"]; // Standard split AH structure
  public readonly defaultFeatures = ["feat_elo_rating_diff"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const eloDiff = (features["feat_elo_rating_diff"] ?? 0);
    // Home -0.5 is equivalent to Home Win; Away +0.5 is equivalent to Draw or Away Win
    const pHome = 0.45 + (eloDiff / 800);
    return {
      "Home AH -0.5": pHome,
      "Away AH +0.5": 1 - pHome
    };
  }
}

// 10. CORNERS
export class CornersModel extends BasePredictionModelPipeline {
  public readonly marketType = "corners";
  public readonly outcomes = ["Over 9.5", "Under 9.5"];
  public readonly defaultFeatures = ["feat_form_momentum"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const momentum = (features["feat_form_momentum"] ?? 0.5);
    const avgCorners = 9.8 + (momentum * 1.5); // offensive momentum increases corners

    // Poisson probability Under 9.5 (k < 10)
    let pUnder = 0;
    const lambda = avgCorners;
    for (let k = 0; k < 10; k++) {
      let fact = 1;
      for (let j = 1; j <= k; j++) fact *= j;
      pUnder += (Math.pow(lambda, k) / fact) * Math.exp(-lambda);
    }

    return {
      "Over 9.5": 1 - pUnder,
      "Under 9.5": pUnder
    };
  }
}

// 11. CARDS
export class CardsModel extends BasePredictionModelPipeline {
  public readonly marketType = "cards";
  public readonly outcomes = ["Over 4.5", "Under 4.5"];
  public readonly defaultFeatures = ["feat_form_momentum"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    // Highly aggressive team forms lead to more cards
    const momentum = (features["feat_form_momentum"] ?? 0.5);
    const avgCards = 3.8 + (momentum * 1.2);

    let pUnder = 0;
    const lambda = avgCards;
    for (let k = 0; k < 5; k++) {
      let fact = 1;
      for (let j = 1; j <= k; j++) fact *= j;
      pUnder += (Math.pow(lambda, k) / fact) * Math.exp(-lambda);
    }

    return {
      "Over 4.5": 1 - pUnder,
      "Under 4.5": pUnder
    };
  }
}

// 12. TEAM GOALS
export class TeamGoalsModel extends BasePredictionModelPipeline {
  public readonly marketType = "team_goals";
  public readonly outcomes = ["Over 1.5", "Under 1.5"];
  public readonly defaultFeatures = ["feat_avg_team_goals_conceded"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const teamAvg = (features["feat_avg_team_goals_conceded"] ?? 1.6);
    // Poisson Under 1.5 (0 or 1 goals)
    const p0 = Math.exp(-teamAvg);
    const p1 = teamAvg * p0;
    const pUnder = p0 + p1;

    return {
      "Over 1.5": 1 - pUnder,
      "Under 1.5": pUnder
    };
  }
}

// 13. PLAYER MARKETS (Future-Ready Placeholder)
export class PlayerMarketsModel extends BasePredictionModelPipeline {
  public readonly marketType = "player_markets";
  public readonly outcomes = ["Player To Score", "Player Not To Score"];
  public readonly defaultFeatures = ["feat_form_momentum"];

  protected computeRawProbabilities(features: Record<string, any>): Record<string, number> {
    const momentum = (features["feat_form_momentum"] ?? 0.5);
    const probScore = 0.25 + (momentum * 0.2);
    return {
      "Player To Score": probScore,
      "Player Not To Score": 1 - probScore
    };
  }
}

// EXPORT MAP OF PIPELINES
export const modelPipelines: Record<PredictionMarketType, BasePredictionModelPipeline> = {
  match_outcome: new MatchOutcomeModel(),
  over_under_2_5: new OverUnder25Model(),
  over_under_3_5: new OverUnder35Model(),
  over_under_4_5: new OverUnder45Model(),
  both_teams_to_score: new BothTeamsToScoreModel(),
  correct_score: new CorrectScoreModel(),
  double_chance: new DoubleChanceModel(),
  draw_no_bet: new DrawNoBetModel(),
  asian_handicap: new AsianHandicapModel(),
  corners: new CornersModel(),
  cards: new CardsModel(),
  team_goals: new TeamGoalsModel(),
  player_markets: new PlayerMarketsModel()
};

// Quick TS helper fix for the above line
modelPipelines["asian_handicap"] = modelPipelines["asian_handicap"] || new AsianHandicapModel();
