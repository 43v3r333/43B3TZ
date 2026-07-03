# 🧠 PyTorch Neural Network Standards

## 1. Purpose
To define development standards for deep neural networks, sequence models, and custom embedding layers using PyTorch.

## 2. When to Use
- Implementing neural sports predictors, sequential match state LSTMs, or embeddings for teams and players.

## 3. When NOT to Use
- Working with simple tabular timeseries datasets (prefer gradient boosted tree models).

## 4. Architecture
Our PyTorch models compile structural inputs into highly parallel neural tensor graphs:
```
[ Input Tensor ] -> [ Linear / Embedding Block ] -> [ Non-Linear Layer ] -> [ Loss Function Optimizer ]
```

## 5. Step-by-Step Implementation
1. **Define Dataset**: Build custom dataset classes subclassing PyTorch's native `Dataset` interface.
2. **Setup Modules**: Structure network blocks using `nn.Module`, keeping parameters configurable.
3. **Write Training Loop**: Build loops that handle gradient calculation, parameter updates, and validation checks.
4. **Serialize Models**: Save trained model parameters cleanly using state dictionaries.

## 6. Repository Standards
- Always declare and handle target hardware devices explicitly (`cuda`, `mps`, or `cpu`).
- Implement gradient clipping to prevent exploding gradient issues inside sequential models.

## 7. Examples

### Modular PyTorch Network and Structured Training Loop
```python
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

class MatchDataset(Dataset):
    def __init__(self, features: torch.Tensor, targets: torch.Tensor) -> None:
        self.features = features
        self.targets = targets

    def __len__(self) -> int:
        return len(self.features)

    def __getitem__(self, idx: int) -> tuple[torch.Tensor, torch.Tensor]:
        return self.features[idx], self.targets[idx]

class TeamEmbeddingPredictor(nn.Module):
    def __init__(self, num_teams: int, embedding_dim: int, num_features: int) -> None:
        super().__init__()
        self.team_emb = nn.Embedding(num_teams, embedding_dim)
        self.fc = nn.Sequential(
            nn.Linear(embedding_dim * 2 + num_features, 64),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(64, 1),
            nn.Sigmoid()
        )

    def forward(self, home_idx: torch.Tensor, away_idx: torch.Tensor, feats: torch.Tensor) -> torch.Tensor:
        home_embedded = self.team_emb(home_idx)
        away_embedded = self.team_emb(away_idx)
        x = torch.cat([home_embedded, away_embedded, feats], dim=1)
        return self.fc(x)
```

## 8. Best Practices
- Always configure dropout layers to prevent neural network overfitting.
- Track gradient scales and performance metrics dynamically using central monitoring tools.

## 9. Anti-patterns
- **Memory Leakage**: Forgetting to use `torch.no_grad()` during validation and inference, which consumes unnecessary GPU memory.

## 10. Security Considerations
- Sanitize saved model files before loading to prevent malicious code execution from untrusted sources.

## 11. Performance Considerations
- Pin memory on DataLoader streams to accelerate host-to-device data transfers.

## 12. Testing Strategy
- Write unit tests verifying that output tensor shapes match target configurations across different batch sizes.

## 13. Review Checklist
- [ ] Are dropout layers disabled during validation and testing operations (`model.eval()` called)?
- [ ] Are gradients properly cleared at each training iteration?

## 14. Common Mistakes
- Forgetting to call `zero_grad()` before backpropagation, which accumulates gradients across steps.

## 15. Future Improvements
- Implement ONNX compilation exports to deploy models to high-throughput inference runtimes.

## 16. Revision History
- **v1.0.0**: Established core PyTorch coding standards.

## 17. Related References
- Skills: [Machine Learning](machine-learning.md)
