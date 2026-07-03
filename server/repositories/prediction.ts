import { IPredictionRepository } from "./types";
import { HistoricalPredictionRecord } from "../predictions/types";
import { predictionHistoryStore } from "../predictions/history/predictionHistory";

export class PredictionRepository implements IPredictionRepository {
  public getAllRecords(): HistoricalPredictionRecord[] {
    return predictionHistoryStore.getAllRecords();
  }

  public getRecordById(predictionId: string): HistoricalPredictionRecord | undefined {
    return predictionHistoryStore.getRecordById(predictionId);
  }

  public logPrediction(record: HistoricalPredictionRecord): void {
    predictionHistoryStore.logPrediction(record);
  }

  public resolvePrediction(predictionId: string, actualResult: string): HistoricalPredictionRecord {
    return predictionHistoryStore.resolvePrediction(predictionId, actualResult);
  }
}

export const predictionRepository = new PredictionRepository();
