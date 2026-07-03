# Machine Learning Ingress and Pipelines

## 1. Feature Store Specification
The Feature Store serves as the single source of truth for both model training and real-time online inference features.

### Features Ingestion Schema
| Feature Name | Data Type | Interval | Description |
| :--- | :---: | :---: | :--- |
| **home_form_index** | FLOAT | Rolling 5 games | Average home team relative performance score. |
| **away_form_index** | FLOAT | Rolling 5 games | Average away team relative performance score. |
| **goal_exp_bivariate_home** | FLOAT | Season-to-date | Expected home goals scored under Bivariate Poisson. |
| **goal_exp_bivariate_away** | FLOAT | Season-to-date | Expected away team goals scored. |

---

## 2. Retraining & Validation Pipeline
Models are retrained weekly using chronological splits to protect against time-travel data leaks.

### Chronological Splits Scheme
\`\`\`
+-------------------------------------------------+
|   Train Split (80%)   |  Val (10%)  | Test (10%)|
+-------------------------------------------------+
[2021-2025 seasons]      [Early 2026]  [Active Q2]
\`\`\`

### Model Performance Gates
All retrained champion model candidates must undergo Platt Calibration and pass validation rules:
- **Brier Calibration Score**: Strictly below `0.22`.
- **Accuracy Outperformance**: Minimum `+1.0%` margin improvement over raw baseline bookmaker prices.
