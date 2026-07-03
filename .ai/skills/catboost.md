# 🧠 CatBoost Implementation Standards

## 1. Purpose
To establish performance standards and setup guidelines for CatBoost classifiers within the platform.

## 2. When to Use
- Building sports prediction models with complex, highly-cardinal categorical features (e.g. referee IDs, stadium names).

## 3. When NOT to Use
- Working with pure numeric timeseries datasets with zero categorical variables (prefer LightGBM or XGBoost).

## 4. Architecture
CatBoost uses symmetric trees to speed up CPU evaluation and handles categorical variables natively via target statistics:
```
[ Cat Features ] -> [ Ordered Boosting Target Statistics ] -> [ Symmetric Balanced Trees ]
```

## 5. Step-by-Step Implementation
1. **Initialize Data Pool**: Load data using CatBoost's optimized `Pool` structures.
2. **Define Categorical Keys**: Mark categorical indices explicitly inside Pool wrappers.
3. **Train with Overfit Detector**: Monitor out-of-sample log-loss and apply early stopping limits.

## 6. Repository Standards
- Always set random seeds globally to ensure training runs are reproducible.
- Keep validation metrics logs clear of trace noise.

## 7. Examples

### Standard CatBoost Training and Feature Mapping
```python
from catboost import CatBoostClassifier, Pool
import pandas as pd
from typing import List

def train_catboost_classifier(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    features: List[str],
    cat_features: List[str],
    target: str
) -> CatBoostClassifier:
    """Trains a symmetric CatBoost classifier with categorical features."""
    
    train_pool = Pool(train_df[features], train_df[target], cat_features=cat_features)
    val_pool = Pool(val_df[features], val_df[target], cat_features=cat_features)
    
    model = CatBoostClassifier(
        iterations=500,
        learning_rate=0.05,
        depth=6,
        loss_function="Logloss",
        eval_metric="Logloss",
        random_seed=42,
        od_type="Iter",  # Overfitting detector type
        od_wait=15,      # Wait epochs before early stopping
        verbose=False
    )
    
    model.fit(train_pool, eval_set=val_pool, use_best_model=True)
    return model
```

## 8. Best Practices
- Rely on CatBoost's native categorical encoding instead of applying manual label encoders.
- Keep tree depths at or below 6 to maintain fast inference speeds.

## 9. Anti-patterns
- Pre-encoding categorical features manually prior to passing datasets to CatBoost wrappers.

## 10. Security Considerations
- Validate all incoming categorical values against a whitelist schema before running inference.

## 11. Performance Considerations
- Save compiled model assets to raw serialized files to minimize loading latency.

## 12. Testing Strategy
- Verify that inference runs return valid probability distributions (summing to 1.0).

## 13. Review Checklist
- [ ] Are categorical indexes explicitly declared?
- [ ] Is the overfit detector configured with clear early stopping parameters?

## 14. Common Mistakes
- Leaving high cardinality features (like match IDs) inside pool definitions, causing slower training.

## 15. Future Improvements
- Implement GPU training sweeps for rapid hyperparameter optimizations on large datasets.

## 16. Revision History
- **v1.0.0**: Standardized CatBoost training configurations.

## 17. Related References
- Skills: [Machine Learning](machine-learning.md), [LightGBM](lightgbm.md)
