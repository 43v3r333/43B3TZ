# 🧠 Machine Learning Model Registry & Calibration History

## 📋 Governance & Control Metadata
- **Purpose**: Records training datasets, hyperparameters, evaluation metrics, and drift audits.
- **Update Policy**: Append new rows on champion model transition or weekly retraining run.
- **Owner**: Principal Machine Learning Engineer
- **Review Frequency**: Weekly
- **Cross References**: [Feature Store Rules](../rules/coding-rules.md), [Decisions](decisions.md)
- **Revision History**:
  - `v1.0.0` (2026-06-29): Production models baseline audit.

---

## 🏆 Current Champion Model Configuration

- **Registry ID**: `model-ens-20260625`
- **Algorithm**: Blended Ensemble: LightGBM (40%) + XGBoost (40%) + CatBoost (20%)
- **Target Variable**: Match Outcome ($H/D/A$ - Home Win, Draw, Away Win)
- **Training Set Range**: Soccer matches between 2021-08-01 and 2026-06-01 (18,450 fixtures).

### Hyperparameters

#### LightGBM
```json
{
  "n_estimators": 350,
  "learning_rate": 0.035,
  "max_depth": 6,
  "num_leaves": 31,
  "subsample": 0.85
}
```

#### XGBoost
```json
{
  "n_estimators": 400,
  "learning_rate": 0.025,
  "max_depth": 5,
  "subsample": 0.8,
  "colsample_bytree": 0.8
}
```

---

## 📈 Model Performance Log

| Date | Run ID | Algorithm | Brier Score | LogLoss | ECE (Calibrated) | Accuracy | Champion? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **2026-05-20** | `run-lgb-01` | LightGBM only | 0.201 | 0.942 | 0.065 (Uncalib) | 52.4% | No |
| **2026-06-10** | `run-ens-01` | LGBM + XGB | 0.189 | 0.902 | 0.048 | 54.8% | No |
| **2026-06-25** | `run-ens-02` | LGBM + XGB + CAT | **0.182** | **0.875** | **0.021** | **56.2%** | **YES** |

---

## 🔬 Calibration Metrics (Platt Scaling)
- **Expected Calibration Error (ECE)**: $0.021$
- **Calibration Curves**: Shows a highly linear fit between predicted probabilities and real outcomes.

---

## 🏗️ Sprint 3 Governance Frozen Status (July 2026)

In alignment with Sprint 3 directives, **all live production predictive channels have been frozen**. No production betting prediction endpoints exist. Instead, all model families are registered, retrained, calibrated, and evaluated strictly under the sandboxed Enterprise MLOps Control Plane.

### Model Families Supported in MLOps Registry:
1. **Logistic Regression (L1/L2)**: High-transparency baseline.
2. **LightGBM**: Extreme speed gradient boosted decision trees.
3. **XGBoost**: Highly robust regularized trees.
4. **CatBoost**: Categorical feature aware boosted ensembles.
5. **Random Forest**: Resilient bagged consensus tree grids.

All future model trainings must register under the MLOps `ModelRegistry` (ID prefixes: `model_*`), generating automatic point-in-time dataset hashes (`ds_*`) and auditable Experiment trackers (`exp_*`). Promotion to Champion requires manual admin verification of Brier Calibration Score and holdout validation F1. Rollback to older candidate models is supported via instant, reversible atomic pointers.
