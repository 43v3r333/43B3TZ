# 🎭 Frontend Playwright Testing Standards

## 1. Purpose
To verify user workflows, layout behaviors, and UI performance under standard browser operations.

## 2. When to Use
- Writing automated end-to-end tests for key customer paths (login, payment, bet tracking).

## 3. When NOT to Use
- Verifying isolated internal helper methods or individual unit-scoped functions.

## 4. Architecture
```
[ Playwright Runner ] ---> [ Headless Chromium / Firefox ] ---> [ Active Dashboard App ]
```

## 5. Step-by-Step Implementation
1. **Define Test Spec**: Write a clear, linear flow asserting user action outcomes.
2. **Select Locators**: Use accessible, text-based queries (e.g., `getByRole`) or test IDs.
3. **Execute Actions**: Type inputs, click action elements, and wait for async renders.
4. **Assert Renders**: Verify expected page navigations or alert elements appear correctly.

## 6. Repository Standards
- Never use fragile, hardcoded XPath references for element targeting.
- Enforce automated end-to-end runs as gates in production branch merges.

## 7. Examples

### Playwright E2E Test Workflow
```typescript
import { test, expect } from "@playwright/test";

test("User can successfully navigate predictions page", async ({ page }) => {
  // 1. Visit dashboard page
  await page.goto("/dashboard");

  // 2. Select and click predictions navigation link
  const link = page.getByRole("link", { name: "Predictions" });
  await expect(link).toBeVisible();
  await link.click();

  // 3. Assert target header is rendered correctly
  const header = page.getByRole("heading", { name: "Match Simulations" });
  await expect(header).toBeVisible();
});
```

## 8. Best Practices
- Utilize standard `testId` parameters as robust fallback selectors.
- Keep tests independent; seed specific, isolated test states before running.

## 9. Anti-patterns
- **Hardcoded Sleeps**: Using static waits (`await page.waitForTimeout(5000)`) instead of dynamic element selectors.

## 10. Security Considerations
- Store test credentials and staging user keys securely in environment variables.

## 11. Performance Considerations
- Run tests concurrently across workers to reduce total build time.

## 12. Testing Strategy
- Execute end-to-end scenarios automatically in the staging environment before releases.

## 13. Review Checklist
- [ ] Are selectors robust against layout styling refactors?
- [ ] Are there zero static waitForTimeout calls in the suite?

## 14. Common Mistakes
- Expecting animations to complete instantly without specifying flexible wait rules.

## 15. Future Improvements
- Set up automated visual regression tests to catch layout styling drift.

## 16. Revision History
- **v1.0.0**: Outlined Playwright end-to-end testing standards.

## 17. Related References
- Skills: [Frontend](frontend.md), [Testing](testing.md)
