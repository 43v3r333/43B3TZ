# 🔍 Code Review Standards & Gateways

## 1. Purpose
To define strict guidelines for human and AI code reviews, keeping standards high across the repository.

## 2. When to Use
- Evaluating pull requests, validating new features, or reviewing bug fix branches.

## 3. When NOT to Use
- Writing local code in private working branches.

## 4. Architecture
Our code review model uses automated checks as the first line of defense, followed by targeted manual reviews:
```
[ Code Commit ] -> [ Automated Linter & Compile ] -> [ Human / AI Review Gate ] -> [ Merge to Main ]
```

## 5. Step-by-Step Implementation
1. **Automate Checks**: Confirm all automated linters and compilation checks pass with zero errors.
2. **Review Architecture**: Check that layers are isolated and clean architectural boundaries are respected.
3. **Review Math/Logic**: Verify sports math calculations are correct and lookahead bias has been eliminated.
4. **Review Security**: Check for secrets leakage, input sanitization, and SQL injection risks.

## 6. Repository Standards
- Pull requests must not reduce current test coverage percentages.
- Rebase and merge with squashed commits to keep a clean, linear git history.

## 7. Examples

### Complete Pull Request Review Matrix
| Review Area | Target Checks | Code standard |
| :--- | :--- | :--- |
| **Architecture** | Do routers contain SQL queries? | Fails layer boundaries rule. Query logic must reside in repositories. |
| **Security** | Are there any hardcoded keys? | Fails secrets rule. Private keys must remain in env. |
| **Math / Stats** | Is Kelly sizing clamped? | Sizing must be clamped strictly below 5.0% threshold. |
| **Performance** | Are DB queries run in loops? | Fails loop lookup rule. Use composite indexes and pre-fetch arrays. |

## 8. Best Practices
- Prioritize objective criteria and standards over personal style preferences during reviews.
- Provide clear, actionable feedback with code examples when pointing out issues.

## 9. Anti-patterns
- **LGTM Approvals**: Approving pull requests quickly without reviewing mathematical logic or execution safety.

## 10. Security Considerations
- Check for OWASP Top 10 vulnerabilities (e.g. CSRF risk, improper authorization, unvalidated redirects).

## 11. Performance Considerations
- Ensure database modifications are backed by correct indexes to prevent table scans on high-frequency queries.

## 12. Testing Strategy
- Require automated CI passes for every branch before human review can begin.

## 13. Review Checklist
- [ ] Do all functions include type signatures?
- [ ] Are all database operations parameterized?

## 14. Common Mistakes
- Reviewing too much code at once; restrict pull requests to small, logical increments.

## 15. Future Improvements
- Deploy customized AI review assistants to automatically flag style issues and layer violations on commits.

## 16. Revision History
- **v1.0.0**: Standardized the code review guidelines.

## 17. Related References
- Skills: [Testing](testing.md)
- Rules: [Review Rules](../rules/review-rules.md)
