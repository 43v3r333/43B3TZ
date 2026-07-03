# 🦾 Sprint Retrospective Insights Prompt

## 📋 Governance & Control Metadata
- **Purpose**: Unified operational guidelines for the system.
- **Update Policy**: Evolve continuously through systematic peer-review and post-deployment learnings.
- **Owner**: AI Platform Coordinator
- **Review Frequency**: Bi-weekly
- **Cross References**: AI Agent Profiles, Workflows, Checklists
- **Revision History**:
  - `v1.0.0` (2026-06-29): Unified baseline release under Phase 6.

---

## 🎯 1. Purpose
Provides a reusable, deterministic prompt template to trigger optimized, zero-leak AI assistant executions for Sprint Retrospective Insights Prompt.

---

## 🔍 2. Scope
Intended for copy-pasting or system loading during complex development phases to maintain strict operational continuity.

---

## 🛠️ 3. Concrete Production Examples & Specifications

### Structured Prompt Template
```markdown
# CONTEXT: You are executing a Sprint Retrospective Insights Prompt task.
# OBJECTIVE: Complete the implementation with pristine alignment and zero regression.

## INSTRUCTIONS:
1. Inspect corresponding specifications inside .ai/rules/ and .ai/skills/.
2. Run targeted diagnostic commands (e.g., compile, lint) before making any code modifications.
3. Minimize non-essential script additions; perform clean, surgical insertions.
4. Complete all corresponding verification protocols and record findings in the appropriate memory registers.
```


---

## 💡 4. Best Practices
- **Best Practice**: Always pass the full workspace file context as raw markdown inputs to the model.
- **Best Practice**: Instruct the agent to detail its design plans before applying surgical file edits.

---

## ❌ 5. Anti-patterns to Avoid
- **Anti-Pattern**: Using generic, non-specific prompts that lead to variable or inconsistent code generation styles.
- **Anti-Pattern**: Allowing the agent to write speculative features not specified in the active sprint.

---

## 🕵️ 6. Automated Quality Gate Review Checklist
- [ ] **Verify**: Confirm the prompt specifies target input structures and expected output models explicitly.
- [ ] **Verify**: Ensure the prompt guides the model to run validation and verification processes on every execution step.

---

## ⚠️ 7. Common Execution Mistakes
- **Mistake**: Omitting context dependencies (e.g., forgetting to reference active database schemas).
- **Mistake**: Using relaxed syntax that allows the model to output shortened snippets rather than production-ready code.

---

## 📈 8. Continuous Future Improvements
- **Planned Improvement**: Implement automatic prompt evaluation models tracking accuracy across successive runs.
- **Planned Improvement**: Refine instruction strings dynamically based on historical postmortem incident summaries.

---

## 🔗 9. Cross References & Linked Resources
- [AI Agent Profiles](ai-agent-profiles.md)
- [Workflows](workflows.md)
- [Checklists](checklists.md)
