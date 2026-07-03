export type FeatureCategory = "sporting" | "market" | "contextual";

export interface FeatureMetadata {
  id: string;
  name: string;
  category: FeatureCategory;
  description: string;
  version: string;
  source: string;
  dependencies: string[];
  importance: number; // Importance score [0.0, 1.0]
  confidence: number; // Feature calculation confidence [0.0, 1.0]
  quality: number; // Data quality score [0.0, 1.0]
  freshness: number; // Data freshness score [0.0, 1.0]
  calculation: (rawTelemetry: Record<string, any>, context?: Record<string, any>) => any;
  validation: (value: any) => boolean;
  metadata?: Record<string, any>;
}

export interface FeatureValueSnapshot {
  value: any;
  confidence: number;
  quality: number;
  freshness: number;
  calculatedAt: Date;
}
