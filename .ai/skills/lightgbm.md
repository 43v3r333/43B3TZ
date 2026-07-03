# 🧠 LightGBM Implementation Standards

## 1. Purpose
To define the setup and tuning standards for LightGBM models in our analytics platform.

## 2. When to Use
- Training predictive models on tabular data with categorical variables.

## 3. When NOT to Use
- Working with small datasets (under 1,000 rows) where simpler algorithms are more stable.

## 4. Architecture
LightGBM uses leaf-wise (best-first) tree growth, accelerating training compared to level-wise approaches:
```
   [ Leaf Growth Style ]
       /           \
 [ Splitting ]     [ Splitting ]  (Deeper on high-gradient leaves)
```

## 5. Step-by-Step Implementation
1. **Initialize Dataset**: Wrap inputs in LightGBM's optimized `Dataset` structures.
2. **Handle Categorical Fields**: Identify categorical columns explicitly to leverage LightGBM's native encoding.
3. **Train with Validation**: Monitor training progress and halt early if log-loss performance flattens.

## 6. Repository Standards
- Always declare categorical column names explicitly in model setups.
- Set random seeds globally to ensure reproducible results.

## 7. Examples

### Standard LightGBM Training Configuration
```python
import lightgbm as lgb
import pandas as pd
from typing import List

def train_lightgbm_model(
    train_df: pd.DataFrame,
    val_df: pd.DataFrame,
    features: List[str],
    categorical_features: List[str],
    target: str
) -> lgb.Booster:
    """Trains a LightGBM booster with categorical feature mapping."""
    
    train_data = lgb.Dataset(
        train_df[features], 
        label=train_df[target],
        categorical_feature=categorical_features
    )
    val_data = lgb.Dataset(
        val_df[features], 
        label=val_df[target],
        reference=train_data
    )
    
    params = {
        "objective": "binary",
        "metric": "binary_logloss",
        "boosting_type": "gbdt",
        "learning_rate": 0.03,
        "num_leaves": 31,
        "min_data_in_leaf": 20,
        "feature_fraction": 0.8,
        "bagging_fraction": 0.8,
        "bagging_freq": 5,
        "seed": 42,
        "verbose": -1
    }
    
    # Train with early stopping limit of 15 epochs
    booster = lgb.train(
        params,
        train_data,
        num_boost_round=1000,
        valid_sets=[train_data, val_data],
        callbacks=[lgb.early_stopping(stopping_rounds=15, verbose=False)]
    )
    
    return booster
```

## 8. Best Practices
- Use categorical attributes natively rather than applying manual one-hot encoding schemes.
- Clip learning rates to a range between 0.01 and 0.05 for optimal convergence.

## 9. Anti-patterns
- **Level-wise over-parameterization**: Setting very deep leaf boundaries on small datasets, causing rapid overfitting.

## 10. Security Considerations
- Sanitize incoming inputs before processing them inside compiled model libraries.

## 11. Performance Considerations
- Save datasets to binary files to speed up reloading of large timeseries structures.

## 12. Testing Strategy
- Assert that validation loss decreases sequentially over the first 5 epochs of training.

## 13. Review Checklist
- [ ] Are categorical columns explicitly declared inside dataset loaders?
- [ ] Do learning rate and leaf parameters align with recommended limits?

## 14. Common Mistakes
- Passing unstructured string variables to dataset constructors without declaring them as categorical fields.

## 15. Future Improvements
- Move feature generation pipelines to compiled C++ wrappers to speed up high-frequency processing.

## 16. Revision History
- **v1.0.0**: Baseline LightGBM configurations defined.

## 17. Related References
- Skills: [Machine Learning](machine-learning.md), [XGBoost](xgboost.md)
