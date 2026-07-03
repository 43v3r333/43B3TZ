# 🔌 Dependency Injection (DI) Standards

## 1. Purpose
To decouple system components, make testing easier, and keep systems flexible.

## 2. When to Use
- Managing database connections, service abstractions, and controller dependencies.

## 3. When NOT to Use
- Initializing simple, stateless utility helpers or pure domain entities.

## 4. Architecture
```
[ IoC Container / Router ] ---> [ Resolves Interface ] ---> [ Injects Concrete Instance ] ---> [ Client Class ]
```

## 5. Step-by-Step Implementation
1. **Define Interface**: Create clean, abstract classes or interface signatures.
2. **Implement concrete class**: Implement actual, production-ready class routines.
3. **Inject dependencies**: Inject dependencies via class constructors or system injection tools.

## 6. Repository Standards
- All route actions in FastAPI must use the standard `Depends` system.
- Never hardcode concrete helper instantiations inside domain use cases.

## 7. Examples

### Constructor Injection in TypeScript
```typescript
interface IAnalyticsService {
  trackEvent(event: string): void;
}

export class DashboardController {
  private analytics: IAnalyticsService;

  // Constructor-based dependency injection
  constructor(analytics: IAnalyticsService) {
    self.analytics = analytics;
  }

  public render(): void {
    self.analytics.trackEvent("dashboard_view");
  }
}
```

## 8. Best Practices
- Prefer constructor-based dependency injection over method or property injection.
- Keep dependencies explicit inside initialization routines.

## 9. Anti-patterns
- **Service Locator Abuse**: Fetching dependencies from a hidden central locator inside classes instead of utilizing constructor injection.

## 10. Security Considerations
- Validate injected mock systems inside test suites to ensure security states are preserved.

## 11. Performance Considerations
- Keep lifecycle scopes (singleton, scoped, transient) configured properly to prevent memory leaks.

## 12. Testing Strategy
- Easily mock interfaces inside unit tests to isolate classes and avoid testing complex database setups.

## 13. Review Checklist
- [ ] Are all external service resources injected via constructor signatures?
- [ ] Is lifecycle scope management configured properly inside route dependencies?

## 14. Common Mistakes
- Instantiating complex database adapter classes inside domain use case classes using the `new` keyword.

## 15. Future Improvements
- Automate dependencies mapping verification checks during compile steps.

## 16. Revision History
- **v1.0.0**: Established unified dependency injection guidelines.

## 17. Related References
- Skills: [Clean Architecture](clean-architecture.md), [Backend](backend.md)
