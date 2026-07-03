# Models Subsystem Contract

## 1. Metadata
* **Purpose**: Manages serialized machine learning model inputs, output boundaries, registration schemas, and inference targets.
* **Version**: `v1.0.0`
* **Owner**: `Machine Learning Architect` & `Data Scientist`
* **Compatibility Policy**: Model versions must accept current production feature-store payloads. Deprecated features must be gracefully handled via model-specific default parameters.
* **Breaking-Change Policy**: Changing output shapes or modifying base feature mappings triggers a model namespace increment in the registry.
* **Migration Strategy**: Gradual shadow execution alongside active production models to verify predictive and calibration performance.

---

## 2. Model Structure & Schema Specifications

### 2.1 Inference Inputs Schema (Feature Payload)
Defines expected features for a standard match prediction request.

```json
{
  "type": "object",
  "required": ["home_form_index", "away_form_index", "bivariate_goal_expectation_home", "bivariate_goal_expectation_away"],
  "properties": {
    "home_form_index": { "type": "number", "minimum": -1.0, "maximum": 1.0 },
    "away_form_index": { "type": "number", "minimum": -1.0, "maximum": 1.0 },
    "bivariate_goal_expectation_home": { "type": "number", "minimum": 0.0 },
    "bivariate_goal_expectation_away": { "type": "number", "minimum": 0.0 }
  }
}
```

### 2.2 Prediction Outputs Schema
Calibrated model outputs representing mutual exclusive probabilities.

```json
{
  "type": "object",
  "required": ["probabilities", "model_metadata"],
  "properties": {
    "probabilities": {
      "type": "object",
      "required": ["home_win", "draw", "away_win"],
      "properties": {
        "home_win": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "draw": { "type": "number", "minimum": 0.0, "maximum": 1.0 },
        "away_win": { "type": "number", "minimum": 0.0, "maximum": 1.0 }
      }
    },
    "model_metadata": {
      "type": "object",
      "required": ["model_id", "version", "brier_calibration_score"],
      "properties": {
        "model_id": { "type": "string", "format": "uuid" },
        "version": { "type": "string" },
        "brier_calibration_score": { "type": "number" }
      }
    }
  }
}
```

---

## 3. Validation Rules
1. **Sum to Unity**: The sum of predicted probabilities (`home_win` + `draw` + `away_win`) must strictly equal `1.0` within a maximum tolerance limit of `1e-6`.
2. **Probability Bounds**: Individual model outputs are capped between `0.001` and `0.999` to prevent infinite log-loss penalties during optimization loops.
3. **Registration Bounds**: Only models with a documented Brier Calibration Score below `0.22` are eligible for production promotions.

---

## 4. Examples

### Typical Predictor Output JSON
```json
{
  "probabilities": {
    "home_win": 0.45,
    "draw": 0.30,
    "away_win": 0.25
  },
  "model_metadata": {
    "model_id": "f5b3a4c1-2290-4a7a-9cb8-a5b81a293c6f",
    "version": "v2.1.0",
    "brier_calibration_score": 0.185
  }
}
```
