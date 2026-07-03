# 📖 Technical Documentation Standards

## 1. Purpose
To ensure all mathematical formulas, architectural layers, and system rules are documented with absolute clarity and precision.

## 2. When to Use
- Writing Markdown guides, adding Architecture Decision Records (ADRs), or documenting complex codebase features.

## 3. When NOT to Use
- Writing short, self-documenting helper routines.

## 4. Architecture
Our documentation model tracks historical decisions, mathematical logic, and overall system layouts:
```
                              [ Start Here ]
                                   |
           +-----------------------+-----------------------+
           |                       |                       |
     [ System Rules ]        [ Tech Skills ]         [ Architecture ]
      (How we build)          (What we use)           (How it works)
```

## 5. Step-by-Step Implementation
1. **Identify Target**: Write architectural layout logs to `ARCHITECTURE.md` and local changes to `CHANGELOG.md`.
2. **Format Formulas**: Use clear LaTeX syntax for mathematical and financial formulas.
3. **Illustrate Flows**: Draw process paths and system states using native Mermaid diagrams.
4. **Remove Placeholders**: Ensure all sections are fully written and omit temporary TODO comments.

## 6. Repository Standards
- No handwritten text blocks without clear structured section headers.
- All markdown links must resolve cleanly to existing local files or schemas.

## 7. Examples

### Architecture Decision Record (ADR) Template
```markdown
# ADR 004: Adopting Platt Scaling for Calibration

## Context
Our raw LightGBM classifiers output uncalibrated sports prediction probabilities. To compute reliable Kelly Criterion stakes, we require mathematically calibrated probabilities.

## Decision
We will calibrate LightGBM outputs server-side using Platt Scaling (sigmoid calibration) inside `CalibratedClassifierCV`.

## Math Formulation
$$P_{\text{calibrated}}(y=1 | x) = \frac{1}{1 + e^{A f(x) + B}}$$

## Consequences
- Requires an additional cross-validation calibration step during training.
- Guarantees prediction log-loss remains stable below 0.62.
- Enables safe bankroll risk allocation calculations.
```

## 8. Best Practices
- Keep documentation up-to-date with code modifications.
- Focus on practical, scannable explanations with real code examples.

## 9. Anti-patterns
- **Stale Docs**: Leaving documentation outdated after updating database schemas or business logic.

## 10. Security Considerations
- Ensure documentation never contains private system URLs, access credentials, or production server logs.

## 11. Performance Considerations
- Render complex charts and diagrams with light, standard vector SVGs.

## 12. Testing Strategy
- Implement automated tools to scan and flag broken links or paths in markdown files.

## 13. Review Checklist
- [ ] Are all formulas formatted in valid LaTeX?
- [ ] Is the document free of placeholder text or TODO blocks?

## 14. Common Mistakes
- Writing long, verbose paragraphs of text instead of using structured, scannable lists and diagrams.

## 15. Future Improvements
- Set up an automated site build to compile all markdown docs into a searchable internal handbook.

## 16. Revision History
- **v1.0.0**: Established codebase documentation standards.

## 17. Related References
- Rules: [Documentation Rules](../rules/documentation-rules.md)
