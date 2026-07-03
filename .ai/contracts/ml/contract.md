# Machine Learning Subsystem Contract

## 1. Metadata
* **Purpose**: Regulates model retraining loops, features calculations, data partitions, calibration benchmarks, and shadow testing rules.
* **Version**: `v1.0.0`
* **Owner**: `Lead ML Engineer` & `Data Scientist`
* **Compatibility Policy**: Model pipelines must accept standard feature store matrices. Older feature parameters must be backward-compatible or fall back gracefully.
* **Breaking-Change Policy**: Changing training database schemas or changing feature definitions triggers a complete model retraining cycle and registry update.
* **Migration Strategy**: Staged model shadow-execution in production alongside active models for a minimum of 1,000 fixtures before final promotion.

---

## 2. ML Pipeline Specifications

### 2.1 Training Data Partitioning Standard
Training pipelines must strictly partition historic match data using the following split bounds:
```json
{
  "train_split": 0.80,
  "validation_split": 0.10,
  "test_split": 0.10,
  "method": "Chronological split (no random time-travel leaks)"
}
```

### 2.2 Model Performance and Calibration Gates
Models must pass these strict gates before they can be considered for shadow deployment:
```json
{
  "metrics": {
    "brier_score": { "maximum": 0.22, "description": "Measures probability calibration accuracy" },
    "accuracy_margin_improvement": { "minimum": 0.01, "description": "Improvement margin over baseline odds probabilities" }
  }
}
```

---

## 3. Validation Rules
1. **Time-Travel Leak Protection**: Training pipelines must utilize strictly chronological splitting, ensuring a model is never trained on features or outcomes that occur after the model evaluation timestamp.
2. **Feature Scale Boundaries**: All computed input variables (e.g. form indices) must be scaled to bounded matrices between `-1.0` and `1.0` using robust min-max or z-score scalars.
3. **Weekly Calibration Audit**: Models currently serving live predictions must undergo automated weekly calibration checks. If the rolling 30-day Brier Score rises above `0.22`, the model must automatically be flagged for retraining.

---

## 4. Examples

### MLflow Run Log Schema
```json
{
  "run_name": " kaizer-pirates-xgboost-v2.1",
  "parameters": {
    "max_depth": 5,
    "learning_rate": 0.05,
    "n_estimators": 500,
    "subsample": 0.8
  },
  "metrics": {
    "train_logloss": 0.584,
    "val_logloss": 0.612,
    "test_brier_score": 0.182
  }
}
```
