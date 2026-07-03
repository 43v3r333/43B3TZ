# 🧠 XGBoost Implementation Standards

## 1. Purpose
To define the setup and tuning standards for XGBoost predictive classifiers in the platform.

## 2. When to Use
- Classifying binary or multi-class sports match outcomes using highly non-linear feature sets.

## 3. When NOT to Use
- Working with sparse text datasets or modeling simple, linear trend sequences.

## 4. Architecture
XGBoost forms an ensemble of weak trees sequentially, minimizing objective losses through gradient descent:
```
[ Features ] -> [ Tree 0 (Base) ] -> [ Tree 1 (Residuals) ] -> [ Ensemble Logits ]
```

## 5. Step-by-Step Implementation
1. **Format Input**: Convert Pandas dataframes to highly optimized XGBoost `DMatrix` structures.
2. **Configure Hyperparameters**: Set appropriate regularization (lambda, alpha) to prevent overfitting.
3. **Train with Early Stopping**: Monitor out-of-sample log-loss and halt training when validation progress stops.

## 6. Repository Standards
- Always log evaluation log-loss metrics at each training epoch.
- Set random seeds globally to ensure training runs are reproducible.

## 7. Examples

### Reproducible XGBoost Model Training with Early Stopping
```python
import xgboost as xgb
import pandas as pd
from typing import Dict, Any

def train_xgboost_classifier(
    train_df: pd.DataFrame, 
    val_df: pd.DataFrame, 
    features: list, 
    target: str
) -> xgb.Booster:
    """Trains an XGBoost model with early stopping and explicit regularization."""
    
    dtrain = xgb.DMatrix(train_df[features], label=train_df[target])
    dval = xgb.DMatrix(val_df[features], label=val_df[target])
    
    params: Dict[str, Any] = {
        "objective": "binary:logistic",
        "eval_metric": "logloss",
        "max_depth": 5,
        "eta": 0.05,
        "subsample": 0.8,
        "colsample_bytree": 0.8,
        "lambda": 1.5,  # L2 regularization
        "alpha": 0.1,    # L1 regularization
        "seed": 42
    }
    
    evallist = [(dtrain, "train"), (dval, "val")]
    
    # Train booster with early stopping limit of 10 epochs
    booster = xgb.train(
        params,
        dtrain,
        num_boost_round=500,
        evals=evallist,
        early_stopping_rounds=10,
        verbose_eval=False
    )
    
    return booster
```

## 8. Best Practices
- Limit maximum tree depths to 6 to prevent model overfitting.
- Always check feature importances to verify the model does not rely on leaked attributes.

## 9. Anti-patterns
- Setting high learning rates without early stopping limits, leading to rapid overfitting.

## 10. Security Considerations
- Sanitize and format data inputs before passing them to compiled model engines.

## 11. Performance Considerations
- Use CPU multi-threading parameters (`n_jobs=-1`) during hyperparameter optimization sweeps.

## 12. Testing Strategy
- Write regression tests confirming that identical feature inputs return matching predictions.

## 13. Review Checklist
- [ ] Are training limits backed by an early stopping condition?
- [ ] Is L1/L2 regularization configured in hyperparameter maps?

## 14. Common Mistakes
- Omitting validation evaluations during training, leading to unverified models.

## 15. Future Improvements
- Move inference loops to compiled TensorRT runtimes for faster prediction speeds.

## 16. Revision History
- **v1.0.0**: Defined baseline XGBoost training configurations.

## 17. Related References
- Skills: [Machine Learning](machine-learning.md), [LightGBM](lightgbm.md)
