# 🧠 Prompt Engineering & Agent Control Standards

## 1. Purpose
To establish templates and strategies for guiding LLM coding agents to work predictably.

## 2. When to Use
- Engineering prompt workflows, formatting instructions, and driving developer agent turns.

## 3. When NOT to Use
- Writing standard local code logic or simple configuration properties.

## 4. Architecture
```
[ System Prompt Template ] ---> [ Role Context Constraints ] ---> [ Expected Markdown Outputs ]
```

## 5. Step-by-Step Implementation
1. **Define Objective**: Keep instructions clear, direct, and well-scoped.
2. **Context Enclosures**: Embed raw variables or files within XML boundaries (e.g. `<file_context>`).
3. **Structured Formats**: Request predictable, structured JSON or Markdown outputs.

## 6. Repository Standards
- Maintain all custom, reusable agent templates inside the `.ai/prompts/` directory.
- Avoid loose, conversational prompts when instructing LLM coding agents in this repo.

## 7. Examples

### Modular System Instruction Template
```markdown
# Role Instruction
You are an expert developer assistant specialized in sports forecasting.

## Constraints
- Always use typing indicators.
- Return output strictly inside the following format:
```json
{
  "prediction": "home_win",
  "confidence": 0.85
}
```
```

## 8. Best Practices
- Frame problems sequentially using chain-of-thought instructions.
- Constrain model outputs with explicit, scannable schemas.

## 9. Anti-patterns
- **Amorphous Requests**: Asking general, unconstrained open-ended questions like "Fix any errors in the app."

## 10. Security Considerations
- Prevent prompt injection risks inside customer-facing AI features.

## 11. Performance Considerations
- Keep context windows clean and compact to reduce token latency and costs.

## 12. Testing Strategy
- Assert that model outputs conform to expected schemas using automated validation scripts.

## 13. Review Checklist
- [ ] Are all target rules clearly formatted?
- [ ] Are output restrictions backed by schema validations?

## 14. Common Mistakes
- Neglecting to provide negative constraints, resulting in unsolicited features or unwanted code changes.

## 15. Future Improvements
- Build automated evaluation loops to score and verify prompt effectiveness.

## 16. Revision History
- **v1.0.0**: Created initial prompt engineering guidelines.

## 17. Related References
- Rules: [Coding Rules](../rules/coding-rules.md)
