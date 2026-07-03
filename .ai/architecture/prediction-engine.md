# 🦾 Enterprise Architecture: Prediction Engine Architecture

## 📋 Governance & Control Metadata
- **Status**: APPROVED (Enterprise Standard)
- **Review Frequency**: Bi-annual
- **Owner**: Principal Software Architect
- **Cross References**: ml-pipeline, value-betting-engine, simulation-engine
- **Revision History**:
- `v1.0.0` (2026-06-29): Initial baseline Prediction Engine blueprint.

---

## 🎯 1. Purpose & Objectives
Exposes how the system scores matches using an ensemble of classifiers and exports calibrated probability vectors.

---

## 🔍 2. Scope & Applicability
Mandatory guide for core backend and ML engineers.

---

## 🏢 3. Structural Responsibilities
- **Responsibility**: Generate Home-Draw-Away (H/D/A) match probabilities given rolling feature vectors.
- **Responsibility**: Combine models via structured voting or weighted averaging schemes.
- **Responsibility**: Expose a model confidence metric indicating the reliability of the calculated probability.

---

## 🎨 4. Core Design Principles
- **Design Principle**: Rigorous Calibration: Probabilities must represent true historical frequencies.
- **Design Principle**: Defensive Inference: Fail gracefully by emitting standard baseline distributions if inputs are missing.
- **Design Principle**: Deterministic Execution: Identical inputs must yield identical output arrays.

---

## 🛠️ 5. Architectural Decisions (ADR Alignment)
- **Architectural Decision**: Construct ensembles combining LightGBM, XGBoost, and CatBoost models.
- **Architectural Decision**: Use Platt Scaling (logistic calibration) to map raw decision function scores to real probabilities.

---



## ⚙️ 7. Core Technical Deep Dive

### 🧠 Calibrated Ensemble Scoring Mechanism
For a given match feature vector $x$, we evaluate:
1. **Model Outputs**:
   $$ P_{\text{LGBM}}(y|x), \quad P_{\text{XGB}}(y|x), \quad P_{\text{CAT}}(y|x) $$
2. **Weighted Ensemble**:
   $$ P_{\text{raw}}(y|x) = w_1 P_{\text{LGBM}} + w_2 P_{\text{XGB}} + w_3 P_{\text{CAT}} $$
3. **Platt Calibration Mapping**:
   $$ P_{\text{calibrated}}(y|x) = \frac{1}{1 + e^{A P_{\text{raw}} + B}} $$
   *(Where $A$ and $B$ are scaling parameters trained on validation datasets)*


---


## 💡 8. Implementation Best Practices
- **Best Practice**: Evaluate Brier Scores continually across predictions to ensure calibration holds.
- **Best Practice**: Cache prediction results under match IDs to avoid repetitive computational evaluations.

---

## ❌ 9. Architectural Anti-patterns
- **Anti-Pattern**: Outputting un-normalized probabilities that do not sum to 1.0.
- **Anti-Pattern**: Allowing predictions to run without asserting input features shape compatibility.

---

## 🔒 10. Security & Threat Considerations
- **Boundary Controls**: Strict ingress-egress filtering and validation on all interaction pathways.
- **Identity & Access**: Zero-trust approach to internal calls and API authentication.
- **Security Posture**: Prediction services are locked, restricting access strictly to authenticated internally routed API tokens.

---

## ⚡ 11. Performance Considerations
- **Execution Budget**: Low-latency benchmarks targeting p95 boundaries.
- **Caching & Caching Strategy**: Read-aside cache patterns combined with transactional isolation.
- **Performance Details**: Inference uses fast, multi-threaded C implementations, executing in milliseconds.

---

## 📈 12. Scalability Considerations
- **Horizontal Scaling**: Stateless execution nodes capable of elastic growth.
- **Data Scaling**: TimescaleDB partitioning and query-read-replica isolation.
- **Scalability Details**: Horizontally scalable container workers handle huge match card surges concurrently without degradation.

---

## 🧪 13. Comprehensive Testing Strategy
- **Unit Boundary Verification**: 100% logic coverage of calculations and data formats.
- **Integration & Validation Paths**: End-to-end sandbox simulations validating pipeline integrity.
- **Testing Approach**: Verified using static test beds, asserting prediction consistency over fixed match profiles.

---

## 🔧 14. Operational Considerations
- **Logging & Visibility**: Structured JSON logs emitted directly to log aggregation collectors.
- **Alerting thresholds**: SRE metrics integrated with Slack/Telegram escalation schedules.
- **Operational Details**: Fires analytical triggers tracking average prediction confidence and calibration drift over time.

---

## ⚠️ 15. Common Architectural Mistakes
- **Execution Mistake**: Over-relying on a single model during league adjustments, bypassing ensemble protections.
- **Execution Mistake**: Failing to handle blank features, leading to model scoring crashes.

---

## 🚀 16. Continuous Future Improvements
- **Future Improvement**: Deploy custom neural network layers predicting dynamic odds changes over time.
- **Future Improvement**: Introduce real-time probability streaming pipelines via WebSockets.

---

## 🕵️ 17. Architecture Review Checklist
- [ ] **Verify**: Verify that all probability predictions sum exactly to 1.0 (with low floating tolerance).
- [ ] **Verify**: Confirm that the Brier score remains within the target threshold (< 0.60).

---

## 🔗 18. References & Linked Resources
- [ml-pipeline](ml-pipeline.md)
- [value-betting-engine](value-betting-engine.md)
- [simulation-engine](simulation-engine.md)
