# 🛡️ Exception & Error Handling Standards

## 1. Purpose
To ensure system failures are caught gracefully, keeping the platform secure and robust.

## 2. When to Use
- Managing database failures, API issues, validation errors, and runtime failures.

## 3. When NOT to Use
- Writing pure, non-risk logical paths with no potential failure cases.

## 4. Architecture
```
[ Exception Event ] ---> [ Error Handler Middleware ] ---> [ Log Event ] ---> [ Safe JSON Response ]
```

## 5. Step-by-Step Implementation
1. **Custom Exceptions**: Create custom exception hierarchies subclassing standard base errors.
2. **Middleware Catchers**: Set up global middleware catchers to capture untraced failures.
3. **Safe Responses**: Return clear, sanitized messages to frontend layers (no internal stack-traces).

## 6. Repository Standards
- Catch only the specific exceptions you intend to handle.
- Always provide descriptive, structured context details inside error handlers.

## 7. Examples

### Standard Error Response Builder in Python
```python
from fastapi import Request, status
from fastapi.responses import JSONResponse

class PlatformException(Exception):
    """Base exception class for platform errors."""
    def __init__(self, detail: str, code: str) -> None:
        self.detail = detail
        self.code = code

class InsufficientFundsException(PlatformException):
    """Exception raised when an account has insufficient funds."""
    pass

async def platform_exception_handler(request: Request, exc: PlatformException) -> JSONResponse:
    """Standard global exception handler for platform errors."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": exc.code,
            "message": exc.detail,
            "path": request.url.path
        }
    )
```

## 8. Best Practices
- Provide actionable, human-readable error messages for end users in client interfaces.
- Design custom exceptions with explicit, standardized system codes.

## 9. Anti-patterns
- **Generic Catch-Alls**: Using empty except blocks (`except:` or `catch(err) {}`) which hide critical bugs.

## 10. Security Considerations
- Never expose raw database tables, server configurations, or internal stack-traces inside public error responses.

## 11. Performance Considerations
- Avoid throwing exceptions on expected business paths (e.g. use standard conditional paths for normal flow).

## 12. Testing Strategy
- Write test scripts to confirm that specific system failures return their corresponding custom error codes.

## 13. Review Checklist
- [ ] Do custom exceptions inherit from the base platform error?
- [ ] Are public error responses free of sensitive internal information?

## 14. Common Mistakes
- Swallowing exceptions without logging them, making production support difficult.

## 15. Future Improvements
- Set up real-time alerting systems triggered automatically by critical error logs.

## 16. Revision History
- **v1.0.0**: Outlined platform error handling requirements.

## 17. Related References
- Skills: [Debugging](debugging.md), [Logging](logging.md)
